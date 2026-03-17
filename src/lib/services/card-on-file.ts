import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { requireStripeSecretKey } from '@/lib/env';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = requireStripeSecretKey();
    stripeClient = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' });
  }
  return stripeClient;
}

/**
 * Creates a Stripe SetupIntent on the platform account so the customer can
 * save a card for future no-show charges. Creates a platform-side Stripe
 * Customer if one doesn't exist yet and links it to our Customer record.
 */
export async function createCardSetupIntent(params: {
  customerId: string; // MeetVault DB customer ID
  shopId: string;
}): Promise<{ clientSecret: string }> {
  const stripe = getStripe();

  const customer = await prisma.customer.findFirst({
    where: { id: params.customerId, shopId: params.shopId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      platformStripeCustomerId: true,
    },
  });
  if (!customer) throw new Error('Customer not found');

  let platformStripeCustomerId = customer.platformStripeCustomerId;

  if (!platformStripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({
      email: customer.email ?? undefined,
      name:
        [customer.firstName, customer.lastName].filter(Boolean).join(' ') || undefined,
      metadata: { meetingVaultCustomerId: customer.id, shopId: params.shopId },
    });
    platformStripeCustomerId = stripeCustomer.id;
    await prisma.customer.update({
      where: { id: customer.id },
      data: { platformStripeCustomerId },
    });
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: platformStripeCustomerId,
    payment_method_types: ['card'],
    usage: 'off_session',
    metadata: { meetingVaultCustomerId: customer.id, shopId: params.shopId },
  });

  return { clientSecret: setupIntent.client_secret! };
}

/**
 * After the customer confirms the SetupIntent on the client, call this to
 * retrieve the PaymentMethod details and save them to our Customer record.
 */
export async function saveCardFromSetupIntent(params: {
  customerId: string;
  shopId: string;
  setupIntentId: string;
}): Promise<void> {
  const stripe = getStripe();

  const si = await stripe.setupIntents.retrieve(params.setupIntentId, {
    expand: ['payment_method'],
  });

  if (si.status !== 'succeeded') {
    throw new Error(`Card setup did not complete (status: ${si.status})`);
  }

  const pm = si.payment_method;
  if (!pm || typeof pm === 'string') return;

  const card = (pm as Stripe.PaymentMethod).card;

  await prisma.customer.update({
    where: { id: params.customerId },
    data: {
      stripePaymentMethodId: pm.id,
      cardLastFour: card?.last4 ?? null,
      cardBrand: card?.brand ?? null,
    },
  });
}

/**
 * Charges the customer's card on file for a no-show fee.
 * Uses a destination charge (platform → shop's Connect account).
 */
export async function chargeNoShowFee(params: {
  appointmentId: string;
  shopId: string;
}): Promise<{ paymentIntentId: string }> {
  const stripe = getStripe();

  const [appointment, shop] = await Promise.all([
    prisma.appointment.findFirst({
      where: { id: params.appointmentId, shopId: params.shopId },
      include: { customer: true },
    }),
    prisma.shop.findUnique({ where: { id: params.shopId } }),
  ]);

  if (!appointment) throw new Error('Appointment not found');
  if (!shop) throw new Error('Shop not found');
  if (!shop.noShowFeeAmount) throw new Error('No no-show fee configured');
  if (appointment.noShowFeeCharged) throw new Error('No-show fee has already been charged');

  const { customer } = appointment;
  if (!customer.stripePaymentMethodId) throw new Error('No card on file for this customer');
  if (!customer.platformStripeCustomerId) throw new Error('No Stripe customer record found');

  const amountCents = Math.round(Number(shop.noShowFeeAmount) * 100);
  if (amountCents < 50) throw new Error('No-show fee is too small (minimum $0.50)');

  const piParams: Stripe.PaymentIntentCreateParams = {
    amount: amountCents,
    currency: 'usd',
    customer: customer.platformStripeCustomerId,
    payment_method: customer.stripePaymentMethodId,
    confirm: true,
    off_session: true,
    automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
    description: `No-show fee for appointment ${appointment.id}`,
    metadata: {
      appointmentId: appointment.id,
      customerId: customer.id,
      shopId: params.shopId,
      type: 'NO_SHOW_FEE',
    },
  };

  // Route funds to the shop's connected account if onboarded
  if (shop.stripeConnectAccountId && shop.stripeConnectOnboarded) {
    const platformFee = Math.round(
      amountCents * (Number(shop.platformFeePercent ?? 0) / 100),
    );
    piParams.application_fee_amount = platformFee > 0 ? platformFee : undefined;
    piParams.transfer_data = { destination: shop.stripeConnectAccountId };
  }

  const pi = await stripe.paymentIntents.create(piParams);

  // Record payment + mark appointment so it can't be charged again
  await prisma.$transaction([
    prisma.payment.create({
      data: {
        shopId: params.shopId,
        appointmentId: params.appointmentId,
        customerId: customer.id,
        stripePaymentIntentId: pi.id,
        amount: amountCents / 100,
        currency: 'usd',
        type: 'FULL',
        status: pi.status === 'succeeded' ? 'SUCCEEDED' : 'PENDING',
      },
    }),
    // Mark appointment so UI shows "already charged" and prevents double charge
    prisma.appointment.update({
      where: { id: params.appointmentId },
      data: { noShowFeeCharged: true },
    }),
    // noShowCount was already incremented by markNoShowAppointment — do not increment again
  ]);

  return { paymentIntentId: pi.id };
}
