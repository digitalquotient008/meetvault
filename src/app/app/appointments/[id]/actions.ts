'use server';

import { requireShopAccess } from '@/lib/auth';
import { refundPayment } from '@/lib/services/payments';
import { prisma } from '@/lib/db';

export async function refundPaymentAction(paymentId: string, amountCents?: number, reason?: string) {
  const { shopId } = await requireShopAccess();
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, shopId },
  });
  if (!payment) throw new Error('Payment not found');
  return refundPayment({ paymentId, amountCents, reason });
}
