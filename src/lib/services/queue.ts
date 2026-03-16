import { prisma } from '@/lib/db';
import type { WalkInStatus } from '@prisma/client';

export async function addWalkInQueueEntry(
  shopId: string,
  data: {
    guestName: string;
    customerId?: string | null;
    requestedServiceId?: string | null;
    requestedBarberProfileId?: string | null;
    estimatedWaitMin?: number | null;
  }
) {
  return prisma.walkInQueueEntry.create({
    data: {
      shopId,
      guestName: data.guestName,
      customerId: data.customerId ?? null,
      requestedServiceId: data.requestedServiceId ?? null,
      requestedBarberProfileId: data.requestedBarberProfileId ?? null,
      estimatedWaitMin: data.estimatedWaitMin ?? null,
      status: 'WAITING',
    },
  });
}

export async function updateWalkInStatus(
  shopId: string,
  entryId: string,
  status: WalkInStatus
) {
  const entry = await prisma.walkInQueueEntry.findFirst({
    where: { id: entryId, shopId },
  });
  if (!entry) throw new Error('Queue entry not found');
  return prisma.walkInQueueEntry.update({
    where: { id: entryId },
    data: { status },
  });
}

export async function assignWalkInToBarber(
  shopId: string,
  entryId: string,
  barberProfileId: string
) {
  const entry = await prisma.walkInQueueEntry.findFirst({
    where: { id: entryId, shopId },
  });
  if (!entry) throw new Error('Queue entry not found');
  return prisma.walkInQueueEntry.update({
    where: { id: entryId },
    data: { status: 'ASSIGNED', requestedBarberProfileId: barberProfileId },
  });
}

export async function listQueueEntries(shopId: string) {
  return prisma.walkInQueueEntry.findMany({
    where: { shopId, status: { in: ['WAITING', 'ASSIGNED', 'IN_SERVICE'] } },
    orderBy: { arrivedAt: 'asc' },
    include: { customer: true },
  });
}
