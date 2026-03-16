'use server';

import { requireShopAccess } from '@/lib/auth';
import { addWalkInQueueEntry, updateWalkInStatus } from '@/lib/services/queue';

export async function addWalkInAction(guestName: string) {
  const { shopId } = await requireShopAccess();
  return addWalkInQueueEntry(shopId, { guestName });
}

export async function updateQueueStatusAction(entryId: string, status: 'WAITING' | 'ASSIGNED' | 'IN_SERVICE' | 'DONE' | 'LEFT') {
  const { shopId } = await requireShopAccess();
  return updateWalkInStatus(shopId, entryId, status);
}
