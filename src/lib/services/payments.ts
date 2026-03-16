import Stripe from 'stripe';
import { PaymentStatus, PaymentType } from '@prisma/client';
import { prisma } from '@/lib/db';
import { requireStripeSecretKey } from '@/lib/env';
import { createAuditLog } from '@/lib/audit';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = requireStripeSecretKey();
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripeClient;
}

type CreatePaymentIntentParams = {
  shopId: string;
  appointmentId?: string | null;
  customerId?: string | null;
  amountCents: number;
  currency?: string;
  type: PaymentType;
  idempotencyKey?: string;
  // Stripe Connect fields (optional — omit for platform-account payments)
  stripeConnectAccountId?: string;
  platformFeePercent?: number;
  // Card-on-file fields (only used when stripeConnectAccountId is set)
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
};

export async function createPaymentIntent(params: CreatePaymentIntentParams) {
  const stripe = getStripe();

  const {
    shopId,
    appointmentId = null,
    customerId = null,
    amountCents,
    currency = 'usd',
    type,
    idempotencyKey,
    stripeConnectAccountId,
    platformFeePercent = 0,
    stripeCustomerId,
    stripePaymentMethodId,
  } = params;

  const isConnect = Boolean(stripeConnectAccountId);
  const applicationFeeAmount = isConnect
    ? Math.round(amountCents * (platformFeePercent / 100))
    : 0;

  const piParams: Stripe.PaymentIntentCreateParams = {
    amount: amountCents,
    currency,
    metadata: {
      shopId,
      ...(appointmentId ? { appointmentId } : {}),
      ...(customerId ? { customerId } : {}),
      type,
    },
  };

  if (isConnect) {
    piParams.application_fee_amount = applicationFeeAmount;
    piParams.transfer_data = { destination: stripeConnectAccountId! };

    if (stripePaymentMethodId && stripeCustomerId) {
      // Charge card on file — confirm immediately
      piParams.customer = stripeCustomerId;
      piParams.payment_method = stripePaymentMethodId;
      piParams.confirm = true;
      piParams.off_session = false;
      piParams.automatic_payment_methods = { enabled: true, allow_redirects: 'never' };
    } else {
      piParams.automatic_payment_methods = { enabled: true };
    }
  } else {
    piParams.automatic_payment_methods = { enabled: true };
  }

  const requestOptions: Stripe.RequestOptions = idempotencyKey
    ? { idempotencyKey }
    : {};

  const paymentIntent = await stripe.paymentIntents.create(piParams, requestOptions);

  const payment = await prisma.payment.create({
    data: {
      shopId,
      appointmentId: appointmentId ?? null,
      customerId: customerId ?? null,
      stripePaymentIntentId: paymentIntent.id,
      idempotencyKey: idempotencyKey ?? null,
      amount: amountCents / 100,
      currency,
      type,
      status: PaymentStatus.PENDING,
      ...(applicationFeeAmount > 0
        ? { platformFeeAmount: applicationFeeAmount / 100 }
        : {}),
    },
  });

  return { paymentIntent, payment };
}

export async function markPaymentAsSucceeded(
  stripePaymentIntentId: string,
  stripeConnectAccountId?: string,
) {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId },
  });
  if (!payment) {
    return null;
  }

  const stripe = getStripe();
  const retrieveOptions: Stripe.RequestOptions = stripeConnectAccountId
    ? { stripeAccount: stripeConnectAccountId }
    : {};

  const pi = await stripe.paymentIntents.retrieve(
    stripePaymentIntentId,
    { expand: ['latest_charge', 'latest_charge.transfer'] },
    retrieveOptions,
  );

  const latestCharge =
    pi.latest_charge && typeof pi.latest_charge !== 'string'
      ? pi.latest_charge
      : null;

  const receiptUrl =
    latestCharge && latestCharge.receipt_url ? latestCharge.receipt_url : null;
  const methodBrand =
    latestCharge &&
    latestCharge.payment_method_details &&
    typeof latestCharge.payment_method_details === 'object' &&
    'card' in latestCharge.payment_method_details &&
    latestCharge.payment_method_details.card &&
    typeof latestCharge.payment_method_details.card === 'object' &&
    'brand' in latestCharge.payment_method_details.card
      ? (latestCharge.payment_method_details.card as { brand?: string }).brand
      : undefined;

  // Extract transfer ID if this was a Connect payment
  const transfer = latestCharge?.transfer;
  const transferId =
    transfer && typeof transfer !== 'string' ? transfer.id : undefined;

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.SUCCEEDED,
      receiptUrl: receiptUrl ?? undefined,
      methodBrand: methodBrand ?? undefined,
      ...(transferId ? { transferId } : {}),
    },
  });

  await createAuditLog({
    shopId: payment.shopId,
    entityType: 'Payment',
    entityId: payment.id,
    action: 'succeeded',
    afterJson: JSON.stringify({ status: 'SUCCEEDED', amount: Number(payment.amount) }),
  });
  return updated;
}

export async function markPaymentAsFailed(stripePaymentIntentId: string) {
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId },
  });
  if (!payment) return null;

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.FAILED },
  });

  await createAuditLog({
    shopId: payment.shopId,
    entityType: 'Payment',
    entityId: payment.id,
    action: 'failed',
    afterJson: JSON.stringify({ status: 'FAILED' }),
  });
  return updated;
}

export async function refundPayment(params: {
  paymentId: string;
  amountCents?: number;
  reason?: string;
}) {
  const stripe = getStripe();

  const payment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
  });
  if (!payment || !payment.stripePaymentIntentId) {
    throw new Error('Payment not found or not linked to Stripe');
  }

  const amount =
    typeof params.amountCents === 'number' ? params.amountCents : undefined;

  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
    amount,
    metadata: {
      paymentId: payment.id,
      shopId: payment.shopId,
    },
  });

  const refundAmount = refund.amount != null ? refund.amount / 100 : Number(payment.amount);
  const isFullRefund = refundAmount >= Number(payment.amount) - 0.01;

  await prisma.refund.create({
    data: {
      shopId: payment.shopId,
      paymentId: payment.id,
      amount: refundAmount,
      reason: params.reason ?? refund.reason ?? null,
      status: refund.status ?? 'pending',
      stripeRefundId: refund.id,
    },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status:
        refund.status === 'succeeded' && isFullRefund
          ? PaymentStatus.REFUNDED
          : PaymentStatus.PARTIAL_REFUNDED,
    },
  });

  await createAuditLog({
    shopId: payment.shopId,
    entityType: 'Payment',
    entityId: payment.id,
    action: isFullRefund ? 'refunded' : 'partial_refunded',
    afterJson: JSON.stringify({ refundAmount }),
  });
  return refund;
}

export async function createPaymentIntentForAppointment(params: {
  shopId: string;
  appointmentId: string;
  type: 'DEPOSIT' | 'FULL';
}) {
  const { shopId, appointmentId, type } = params;
  const [appointment, shop] = await Promise.all([
    prisma.appointment.findFirst({
      where: { id: appointmentId, shopId },
      include: { appointmentServices: true },
    }),
    prisma.shop.findUnique({ where: { id: shopId } }),
  ]);
  if (!appointment || !shop) throw new Error('Appointment or shop not found');
  if (appointment.status === 'CANCELED') throw new Error('Appointment is canceled');

  const totalCents = Math.round(Number(appointment.totalAmount ?? 0) * 100);
  let amountCents: number;
  if (type === 'FULL') {
    amountCents = totalCents;
  } else {
    if (!shop.depositRequired || !shop.depositValue) {
      amountCents = Math.min(
        totalCents,
        Math.round(Number(appointment.subtotal ?? 0) * 100 * 0.2),
      );
    } else if (shop.depositType === 'PERCENT') {
      amountCents = Math.round(
        (Number(appointment.subtotal ?? 0) * 100 * Number(shop.depositValue)) / 100,
      );
    } else {
      amountCents = Math.round(Number(shop.depositValue) * 100);
    }
    amountCents = Math.min(amountCents, totalCents);
  }
  if (amountCents < 50) throw new Error('Amount too small for Stripe');

  const idempotencyKey = `apt-${appointmentId}-${type}-${Date.now()}`;
  const { paymentIntent, payment } = await createPaymentIntent({
    shopId,
    appointmentId,
    customerId: appointment.customerId,
    amountCents,
    type: type === 'DEPOSIT' ? 'DEPOSIT' : 'FULL',
    idempotencyKey,
    // Pass Connect params if shop is onboarded
    ...(shop.stripeConnectAccountId && shop.stripeConnectOnboarded
      ? {
          stripeConnectAccountId: shop.stripeConnectAccountId,
          platformFeePercent: Number(shop.platformFeePercent ?? 0),
        }
      : {}),
  });
  return { clientSecret: paymentIntent.client_secret!, paymentId: payment.id };
}
