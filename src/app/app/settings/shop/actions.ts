'use server';

import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';

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
