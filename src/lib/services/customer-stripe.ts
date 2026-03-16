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
 * After a payment succeeds on a connected account, attach the PaymentMethod to
 * a Stripe Customer scoped to that connected account, then save stripeCustomerId
 * on the MeetingVault Customer record.
 *
 * NOTE: Stripe Customers are scoped per connected account. A customer visiting
 * two shops gets a separate Stripe Customer per shop's Connect account.
 */
export async function attachPaymentMethodToCustomer(params: {
  shopId: string;
  customerId: string;
  stripePaymentIntentId: string;
  stripeConnectAccountId: string;
}): Promise<void> {
  const { shopId, customerId, stripePaymentIntentId, stripeConnectAccountId } = params;
  const stripe = getStripe();

  // Retrieve the PI on the connected account to get the PaymentMethod
  const pi = await stripe.paymentIntents.retrieve(
    stripePaymentIntentId,
    { expand: ['payment_method'] },
    { stripeAccount: stripeConnectAccountId },
  );

  const pm = pi.payment_method;
  if (!pm || typeof pm === 'string') return; // no PM to save

  // Look up the MeetingVault customer
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, shopId },
    select: { id: true, stripeCustomerId: true, email: true, firstName: true, lastName: true },
  });
  if (!customer) return;

  let stripeCustomerId = customer.stripeCustomerId;

  if (!stripeCustomerId) {
    // Create a Stripe Customer on the connected account
    const stripeCustomer = await stripe.customers.create(
      {
        email: customer.email ?? undefined,
        name: [customer.firstName, customer.lastName].filter(Boolean).join(' ') || undefined,
        metadata: { meetingVaultCustomerId: customer.id, shopId },
      },
      { stripeAccount: stripeConnectAccountId },
    );
    stripeCustomerId = stripeCustomer.id;

    await prisma.customer.update({
      where: { id: customer.id },
      data: { stripeCustomerId },
    });
  }

  // Attach the PaymentMethod to the Stripe Customer (idempotent — no-op if already attached)
  try {
    await stripe.paymentMethods.attach(
      pm.id,
      { customer: stripeCustomerId },
      { stripeAccount: stripeConnectAccountId },
    );
    // Set as default payment method
    await stripe.customers.update(
      stripeCustomerId,
      { invoice_settings: { default_payment_method: pm.id } },
      { stripeAccount: stripeConnectAccountId },
    );
  } catch (err) {
    // PaymentMethod already attached — safe to ignore
    if (
      err instanceof Stripe.errors.StripeInvalidRequestError &&
      err.message.includes('already been attached')
    ) {
      return;
    }
    throw err;
  }
}

/**
 * Returns the default PaymentMethod for a Stripe Customer on a connected account,
 * or null if none exists.
 */
export async function getCustomerDefaultPaymentMethod(
  stripeCustomerId: string,
  stripeConnectAccountId: string,
): Promise<Stripe.PaymentMethod | null> {
  const stripe = getStripe();

  try {
    const customer = await stripe.customers.retrieve(
      stripeCustomerId,
      { expand: ['invoice_settings.default_payment_method'] },
      { stripeAccount: stripeConnectAccountId },
    );

    if (customer.deleted) return null;

    const defaultPm = customer.invoice_settings?.default_payment_method;
    if (!defaultPm || typeof defaultPm === 'string') return null;

    return defaultPm as Stripe.PaymentMethod;
  } catch {
    return null;
  }
}
