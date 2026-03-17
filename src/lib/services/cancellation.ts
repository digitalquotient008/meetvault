import { prisma } from '@/lib/db';
import { refundPayment } from '@/lib/services/payments';
import { cancelAppointment } from '@/lib/services/appointment';

type CancellationPolicy = {
  cancellationWindowHours: number | null;
  cancellationFeeType: string | null;
  cancellationFeeValue: number | null;
};

type SucceededPayment = { id: string; amount: number; type: string };

export type RefundPreview = {
  refundAmount: number;    // dollars
  forfeitAmount: number;   // dollars kept by shop
  reason: string;          // human-readable explanation
  withinWindow: boolean;
};

/**
 * Pure function — computes how much to refund given current policy.
 * Does NOT touch the database.
 */
export function computeRefundPreview(params: {
  appointmentStart: Date;
  policy: CancellationPolicy;
  succeededPayments: SucceededPayment[];
  actor: 'CUSTOMER' | 'STAFF';
}): RefundPreview {
  const { appointmentStart, policy, succeededPayments, actor } = params;

  const totalPaid = succeededPayments.reduce((s, p) => s + p.amount, 0);
  const depositPaid = succeededPayments
    .filter((p) => p.type === 'DEPOSIT')
    .reduce((s, p) => s + p.amount, 0);

  // Staff always get full refund authority
  if (actor === 'STAFF') {
    return {
      refundAmount: totalPaid,
      forfeitAmount: 0,
      reason: 'Canceled by staff — full refund applied.',
      withinWindow: true,
    };
  }

  if (totalPaid === 0) {
    return {
      refundAmount: 0,
      forfeitAmount: 0,
      reason: 'No charge — canceled at no cost.',
      withinWindow: true,
    };
  }

  const hoursUntil =
    (appointmentStart.getTime() - Date.now()) / (1000 * 60 * 60);
  const windowHours = policy.cancellationWindowHours ?? 0;
  const outsideWindow = hoursUntil >= windowHours;

  if (outsideWindow || windowHours === 0) {
    return {
      refundAmount: totalPaid,
      forfeitAmount: 0,
      reason:
        windowHours > 0
          ? `Canceled more than ${windowHours}h before appointment — full refund of $${totalPaid.toFixed(2)}.`
          : `Full refund of $${totalPaid.toFixed(2)}.`,
      withinWindow: false,
    };
  }

  // Inside window — apply fee policy
  const feeType = policy.cancellationFeeType ?? 'NONE';

  if (feeType === 'NONE') {
    return {
      refundAmount: totalPaid,
      forfeitAmount: 0,
      reason: `Canceled within ${windowHours}h — no fee configured, full refund.`,
      withinWindow: true,
    };
  }

  if (feeType === 'DEPOSIT_FORFEIT') {
    const refund = totalPaid - depositPaid;
    return {
      refundAmount: refund,
      forfeitAmount: depositPaid,
      reason:
        depositPaid > 0
          ? `Canceled within ${windowHours}h — deposit of $${depositPaid.toFixed(2)} is forfeited. Remaining $${refund.toFixed(2)} refunded.`
          : `Canceled within ${windowHours}h — no deposit to forfeit, full refund.`,
      withinWindow: true,
    };
  }

  if (feeType === 'FIXED_FEE') {
    const fee = Math.min(policy.cancellationFeeValue ?? 0, totalPaid);
    const refund = totalPaid - fee;
    return {
      refundAmount: refund,
      forfeitAmount: fee,
      reason: `Canceled within ${windowHours}h — $${fee.toFixed(2)} cancellation fee applied. $${refund.toFixed(2)} refunded.`,
      withinWindow: true,
    };
  }

  if (feeType === 'PERCENT_OF_TOTAL') {
    const pct = Math.min(policy.cancellationFeeValue ?? 0, 100);
    const fee = Math.min((totalPaid * pct) / 100, totalPaid);
    const refund = totalPaid - fee;
    return {
      refundAmount: refund,
      forfeitAmount: fee,
      reason: `Canceled within ${windowHours}h — ${pct}% fee of $${fee.toFixed(2)} applied. $${refund.toFixed(2)} refunded.`,
      withinWindow: true,
    };
  }

  return { refundAmount: totalPaid, forfeitAmount: 0, reason: 'Full refund.', withinWindow: false };
}

/**
 * Cancel an appointment and apply refund logic.
 * Returns the refund preview that was applied.
 */
export async function cancelWithRefund(params: {
  shopId: string;
  appointmentId: string;
  confirmationCode?: string; // required when actor is CUSTOMER
  actor: 'CUSTOMER' | 'STAFF';
}): Promise<RefundPreview> {
  const { shopId, appointmentId, confirmationCode, actor } = params;

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, shopId },
    include: { payments: true },
  });
  if (!appointment) throw new Error('Appointment not found');
  if (appointment.status === 'CANCELED') throw new Error('Already canceled');
  if (appointment.status === 'COMPLETED') throw new Error('Cannot cancel a completed appointment');

  // Validate confirmation code for customer-initiated cancellations
  if (actor === 'CUSTOMER') {
    if (!confirmationCode || appointment.confirmationCode !== confirmationCode) {
      throw new Error('Invalid cancellation code');
    }
  }

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      cancellationWindowHours: true,
      cancellationFeeType: true,
      cancellationFeeValue: true,
    },
  });

  const succeededPayments = appointment.payments
    .filter((p) => p.status === 'SUCCEEDED' && p.type !== 'TIP')
    .map((p) => ({ id: p.id, amount: Number(p.amount), type: p.type }));

  const preview = computeRefundPreview({
    appointmentStart: appointment.startDateTime,
    policy: {
      cancellationWindowHours: shop?.cancellationWindowHours ?? null,
      cancellationFeeType: shop?.cancellationFeeType ?? null,
      cancellationFeeValue: shop?.cancellationFeeValue
        ? Number(shop.cancellationFeeValue)
        : null,
    },
    succeededPayments,
    actor,
  });

  // Cancel the appointment (sends cancellation emails)
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
      canceledByRole: actor,
    },
  });

  // Issue refunds
  if (preview.refundAmount > 0) {
    for (const payment of succeededPayments) {
      // Skip deposit if DEPOSIT_FORFEIT
      if (
        shop?.cancellationFeeType === 'DEPOSIT_FORFEIT' &&
        payment.type === 'DEPOSIT' &&
        actor === 'CUSTOMER'
      ) {
        continue;
      }
      // For partial refunds, only refund what remains after fee
      const paymentRefundAmount =
        preview.forfeitAmount > 0 && shop?.cancellationFeeType !== 'DEPOSIT_FORFEIT'
          ? Math.max(0, payment.amount - preview.forfeitAmount)
          : payment.amount;

      if (paymentRefundAmount > 0) {
        await refundPayment({
          paymentId: payment.id,
          amountCents: Math.round(paymentRefundAmount * 100),
          reason: 'cancellation',
        });
      }
    }
  }

  return preview;
}
