'use server';

import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createPaymentIntent } from '@/lib/services/payments';
import { completeAppointment } from '@/lib/services/appointment';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Creates a PaymentIntent for the remaining balance + tip.
 * Accounts for any deposit already paid.
 * Returns the clientSecret so the client can confirm with Stripe.js.
 */
export async function createCheckoutPaymentIntentAction(params: {
  appointmentId: string;
  tipCents: number;
}): Promise<{ clientSecret: string; amountCents: number }> {
  const { shopId } = await requireShopAccess();
  const { appointmentId, tipCents } = params;

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, shopId },
    include: {
      payments: { where: { status: 'SUCCEEDED', NOT: { type: 'TIP' } } },
    },
  });
  if (!appointment) throw new Error('Appointment not found');
  if (!['CONFIRMED', 'IN_PROGRESS'].includes(appointment.status)) {
    throw new Error('Appointment cannot be checked out in its current state');
  }

  const subtotalCents = Math.round(Number(appointment.totalAmount ?? 0) * 100);
  const depositPaidCents = appointment.payments.reduce(
    (s, p) => s + Math.round(Number(p.amount) * 100),
    0,
  );
  const balanceDueCents = Math.max(0, subtotalCents - depositPaidCents);
  const safeTipCents = Math.max(0, tipCents);
  const totalChargeCents = balanceDueCents + safeTipCents;

  if (totalChargeCents < 50) {
    throw new Error('Charge amount is too small (minimum $0.50)');
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeConnectAccountId: true, stripeConnectOnboarded: true, platformFeePercent: true },
  });

  const paymentType = balanceDueCents === 0 ? 'TIP' : 'BALANCE';

  // Stable idempotency key — tip is included so different amounts get different PIs
  const idempotencyKey = `checkout-${appointmentId}-${safeTipCents}`;

  const { paymentIntent } = await createPaymentIntent({
    shopId,
    appointmentId,
    customerId: appointment.customerId,
    amountCents: totalChargeCents,
    type: paymentType,
    idempotencyKey,
    ...(shop?.stripeConnectAccountId && shop.stripeConnectOnboarded
      ? {
          stripeConnectAccountId: shop.stripeConnectAccountId,
          platformFeePercent: Number(shop.platformFeePercent ?? 0),
        }
      : {}),
  });

  return { clientSecret: paymentIntent.client_secret!, amountCents: totalChargeCents };
}

/**
 * After the client confirms payment with Stripe.js, call this to update the
 * appointment amounts and mark it COMPLETED.
 */
export async function completeCheckoutAction(params: {
  appointmentId: string;
  tipCents: number;
}): Promise<void> {
  const { shopId } = await requireShopAccess();
  const { appointmentId, tipCents } = params;

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, shopId },
  });
  if (!appointment) throw new Error('Appointment not found');

  const tipAmount = Math.max(0, tipCents) / 100;
  const subtotal = Number(appointment.subtotal ?? appointment.totalAmount ?? 0);

  // Update tip and final total before completing (completeAppointment uses totalAmount for totalSpend)
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      tipAmount: tipAmount > 0 ? new Decimal(tipAmount) : undefined,
      totalAmount: new Decimal(subtotal + tipAmount),
      balanceDue: new Decimal(0),
    },
  });

  await completeAppointment(shopId, appointmentId);
}

/**
 * Complete an appointment without charging (e.g. already fully paid, or owner override).
 */
export async function completeWithoutPaymentAction(appointmentId: string): Promise<void> {
  const { shopId } = await requireShopAccess();
  await completeAppointment(shopId, appointmentId);
}
