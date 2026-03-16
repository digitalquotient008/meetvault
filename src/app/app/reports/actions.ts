'use server';

import { requireShopAccess } from '@/lib/auth';
import { getBarberEarnings, toEarningsCsv } from '@/lib/services/reports';

export async function getBarberEarningsAction(from: Date, to: Date) {
  const { shopId } = await requireShopAccess();
  return getBarberEarnings(shopId, from, to);
}

export async function getBarberEarningsCsvAction(from: Date, to: Date) {
  const { shopId } = await requireShopAccess();
  const rows = await getBarberEarnings(shopId, from, to);
  return toEarningsCsv(rows);
}
