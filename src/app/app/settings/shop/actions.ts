'use server';

import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import type { CancellationFeeType } from '@prisma/client';

export async function updateNoShowFeeAction(
  shopId: string,
  data: { noShowFeeAmount: number | null; cardRequiredForBooking: boolean },
) {
  const { shopId: authShopId } = await requireShopAccess();
  if (authShopId !== shopId) throw new Error('Forbidden');

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      noShowFeeAmount:
        data.noShowFeeAmount != null ? new Decimal(data.noShowFeeAmount) : null,
      cardRequiredForBooking: data.cardRequiredForBooking,
    },
  });
}

export async function updateCancellationPolicyAction(
  shopId: string,
  data: {
    cancellationWindowHours: number | null;
    cancellationFeeType: CancellationFeeType;
    cancellationFeeValue: number | null;
    cancellationPolicy: string | null;
  },
) {
  const { shopId: authShopId } = await requireShopAccess();
  if (authShopId !== shopId) throw new Error('Forbidden');

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      cancellationWindowHours: data.cancellationWindowHours,
      cancellationFeeType: data.cancellationFeeType,
      cancellationFeeValue:
        data.cancellationFeeValue != null ? new Decimal(data.cancellationFeeValue) : null,
      cancellationPolicy: data.cancellationPolicy,
    },
  });
}
