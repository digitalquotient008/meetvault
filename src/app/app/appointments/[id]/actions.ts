'use server';

import { requireShopAccess } from '@/lib/auth';
import { refundPayment } from '@/lib/services/payments';
import { chargeNoShowFee } from '@/lib/services/card-on-file';
import { cancelWithRefund } from '@/lib/services/cancellation';
import { cancelAppointment } from '@/lib/services/appointment';
import { prisma } from '@/lib/db';

export async function refundPaymentAction(paymentId: string, amountCents?: number, reason?: string) {
  const { shopId } = await requireShopAccess();
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, shopId },
  });
  if (!payment) throw new Error('Payment not found');
  return refundPayment({ paymentId, amountCents, reason });
}

export async function chargeNoShowFeeAction(appointmentId: string) {
  const { shopId } = await requireShopAccess();
  return chargeNoShowFee({ appointmentId, shopId });
}

export async function cancelAppointmentByStaffAction(
  appointmentId: string,
  refundPayments: boolean,
) {
  const { shopId } = await requireShopAccess();

  if (refundPayments) {
    // cancelWithRefund as STAFF always issues full refund + sends emails + audit log
    await cancelWithRefund({ shopId, appointmentId, actor: 'STAFF' });
  } else {
    // Cancel without refund — use cancelAppointment so emails + audit log still fire
    await cancelAppointment(shopId, appointmentId);
  }
}
