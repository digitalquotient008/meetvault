'use server';

import { prisma } from '@/lib/db';
import { cancelWithRefund } from '@/lib/services/cancellation';
import { computeRefundPreview } from '@/lib/services/cancellation';
import type { RefundPreview } from '@/lib/services/cancellation';

export async function cancelAppointmentAsCustomerAction(
  appointmentId: string,
  confirmationCode: string,
): Promise<RefundPreview> {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { shopId: true },
  });
  if (!appointment) throw new Error('Appointment not found');

  return cancelWithRefund({
    shopId: appointment.shopId,
    appointmentId,
    confirmationCode,
    actor: 'CUSTOMER',
  });
}

export async function getRefundPreviewAction(
  appointmentId: string,
  confirmationCode: string,
): Promise<RefundPreview & { valid: boolean }> {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, confirmationCode },
    include: { payments: true },
  });
  if (!appointment) return { valid: false, refundAmount: 0, forfeitAmount: 0, reason: '', withinWindow: false };

  const shop = await prisma.shop.findUnique({
    where: { id: appointment.shopId },
    select: { cancellationWindowHours: true, cancellationFeeType: true, cancellationFeeValue: true },
  });

  const preview = computeRefundPreview({
    appointmentStart: appointment.startDateTime,
    policy: {
      cancellationWindowHours: shop?.cancellationWindowHours ?? null,
      cancellationFeeType: shop?.cancellationFeeType ?? null,
      cancellationFeeValue: shop?.cancellationFeeValue ? Number(shop.cancellationFeeValue) : null,
    },
    succeededPayments: appointment.payments
      .filter((p) => p.status === 'SUCCEEDED' && p.type !== 'TIP')
      .map((p) => ({ id: p.id, amount: Number(p.amount), type: p.type })),
    actor: 'CUSTOMER',
  });
  return { ...preview, valid: true };
}
