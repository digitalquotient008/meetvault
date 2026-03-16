'use server';

import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createPaymentIntent } from '@/lib/services/payments';
import { completeAppointment } from '@/lib/services/appointment';
import { createAuditLog } from '@/lib/audit';
import { PaymentType } from '@prisma/client';

export async function prepareCheckoutAction(appointmentId: string): Promise<{
  clientSecret: string;
  paymentId: string;
  totalCents: number;
  tipCents: number;
} | null> {
  // This action is not used directly — checkoutAppointmentAction handles both paths.
  return null;
}

export async function checkoutAppointmentAction(params: {
  appointmentId: string;
  tipCents: number;
  paymentMethodId?: string; // provided after client-side Stripe Elements confirmation
}): Promise<{ receiptUrl: string | null; redirectUrl: string }> {
  const { appointmentId, tipCents, paymentMethodId } = params;
  const { shopId } = await requireShopAccess();

  const [appointment, shop] = await Promise.all([
    prisma.appointment.findFirst({
      where: { id: appointmentId, shopId },
      include: { customer: true, appointmentServices: true, payments: true },
    }),
    prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
        platformFeePercent: true,
      },
    }),
  ]);

  if (!appointment) throw new Error('Appointment not found');
  if (['COMPLETED', 'CANCELED', 'NO_SHOW'].includes(appointment.status)) {
    throw new Error('Appointment cannot be checked out');
  }
  if (!shop?.stripeConnectAccountId || !shop.stripeConnectOnboarded) {
    throw new Error('Stripe Connect not configured for this shop');
  }

  const subtotalCents = Math.round(Number(appointment.subtotal ?? appointment.totalAmount ?? 0) * 100);
  const totalCents = subtotalCents + tipCents;

  if (totalCents < 50) throw new Error('Amount too small for Stripe');

  // Check if a FULL or BALANCE payment already succeeded (e.g. pre-paid deposit)
  const existingSucceeded = appointment.payments.find(
    (p) => p.status === 'SUCCEEDED' && (p.type === 'FULL' || p.type === 'BALANCE'),
  );

  const chargeType: PaymentType = existingSucceeded
    ? tipCents > 0
      ? PaymentType.TIP
      : PaymentType.BALANCE
    : PaymentType.FULL;

  const chargeAmountCents = chargeType === PaymentType.TIP ? tipCents : totalCents;

  const customer = appointment.customer;
  const stripeConnectAccountId = shop.stripeConnectAccountId;
  const platformFeePercent = Number(shop.platformFeePercent ?? 0);

  let receiptUrl: string | null = null;

  if (paymentMethodId) {
    // New card was confirmed client-side via Stripe Elements — just record the payment
    const { payment } = await createPaymentIntent({
      shopId,
      appointmentId,
      customerId: customer.id,
      amountCents: chargeAmountCents,
      type: chargeType,
      idempotencyKey: `checkout-${appointmentId}-${Date.now()}`,
      stripeConnectAccountId,
      platformFeePercent,
    });
    receiptUrl = null; // will be updated by webhook
    // Update appointment amounts
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        tipAmount: tipCents / 100,
        totalAmount: totalCents / 100,
        balanceDue: 0,
      },
    });
    // Mark the payment as pending — webhook will mark it succeeded
    void payment; // suppress unused warning
  } else {
    // Card on file — charge immediately
    const stripePaymentMethodId = customer.stripeCustomerId
      ? (
          await import('@/lib/services/customer-stripe').then((m) =>
            m.getCustomerDefaultPaymentMethod(
              customer.stripeCustomerId!,
              stripeConnectAccountId,
            ),
          )
        )?.id
      : undefined;

    if (!stripePaymentMethodId) {
      throw new Error('No card on file. Please use a new card.');
    }

    const { paymentIntent, payment } = await createPaymentIntent({
      shopId,
      appointmentId,
      customerId: customer.id,
      amountCents: chargeAmountCents,
      type: chargeType,
      idempotencyKey: `checkout-${appointmentId}-${Date.now()}`,
      stripeConnectAccountId,
      platformFeePercent,
      stripeCustomerId: customer.stripeCustomerId!,
      stripePaymentMethodId,
    });

    // Update appointment amounts
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        tipAmount: tipCents / 100,
        totalAmount: totalCents / 100,
        balanceDue: 0,
      },
    });

    // Mark payment succeeded if PI status is succeeded (card-on-file charges are synchronous)
    if (paymentIntent.status === 'succeeded') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCEEDED' },
      });
      receiptUrl = null;
    }

    await createAuditLog({
      shopId,
      entityType: 'Appointment',
      entityId: appointmentId,
      action: 'checkout',
      afterJson: JSON.stringify({ totalCents, tipCents, chargeType }),
    });
  }

  // Complete the appointment
  await completeAppointment(shopId, appointmentId);

  return {
    receiptUrl,
    redirectUrl: `/app/appointments/${appointmentId}`,
  };
}

export async function getCheckoutDataAction(appointmentId: string) {
  const { shopId } = await requireShopAccess();

  const [appointment, shop] = await Promise.all([
    prisma.appointment.findFirst({
      where: { id: appointmentId, shopId },
      include: { customer: true, barberProfile: true, appointmentServices: true, payments: true },
    }),
    prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
        tippingEnabled: true,
        platformFeePercent: true,
      },
    }),
  ]);

  if (!appointment || !shop) return null;

  // Get card on file if available
  let cardOnFile: { brand: string; last4: string; id: string } | null = null;
  if (
    appointment.customer.stripeCustomerId &&
    shop.stripeConnectAccountId &&
    shop.stripeConnectOnboarded
  ) {
    const pm = await import('@/lib/services/customer-stripe').then((m) =>
      m.getCustomerDefaultPaymentMethod(
        appointment.customer.stripeCustomerId!,
        shop.stripeConnectAccountId!,
      ),
    );
    if (pm?.card) {
      cardOnFile = {
        brand: pm.card.brand,
        last4: pm.card.last4,
        id: pm.id,
      };
    }
  }

  return { appointment, shop, cardOnFile };
}

export async function createCheckoutPaymentIntentAction(
  appointmentId: string,
  totalCents: number,
): Promise<{ clientSecret: string }> {
  const { shopId } = await requireShopAccess();

  const [appointment, shop] = await Promise.all([
    prisma.appointment.findFirst({ where: { id: appointmentId, shopId } }),
    prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        stripeConnectAccountId: true,
        stripeConnectOnboarded: true,
        platformFeePercent: true,
      },
    }),
  ]);

  if (!appointment || !shop) throw new Error('Not found');
  if (!shop.stripeConnectAccountId || !shop.stripeConnectOnboarded) {
    throw new Error('Stripe Connect not configured');
  }
  if (totalCents < 50) throw new Error('Amount too small');

  const { paymentIntent } = await createPaymentIntent({
    shopId,
    appointmentId,
    customerId: appointment.customerId,
    amountCents: totalCents,
    type: PaymentType.FULL,
    idempotencyKey: `checkout-new-card-${appointmentId}-${Date.now()}`,
    stripeConnectAccountId: shop.stripeConnectAccountId,
    platformFeePercent: Number(shop.platformFeePercent ?? 0),
  });

  return { clientSecret: paymentIntent.client_secret! };
}
