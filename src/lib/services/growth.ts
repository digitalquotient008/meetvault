import { prisma } from '@/lib/db';
import { addDays, endOfDay, subDays } from 'date-fns';

export async function getDueForRebooking(shopId: string, withinDays = 7) {
  const cutoff = endOfDay(addDays(new Date(), withinDays));
  return prisma.customer.findMany({
    where: {
      shopId,
      nextSuggestedAt: { lte: cutoff, not: null },
      totalVisits: { gte: 1 },
    },
    orderBy: { nextSuggestedAt: 'asc' },
    take: 50,
  });
}

export async function getDormantCustomers(shopId: string, olderThanDays = 60) {
  const cutoff = subDays(new Date(), olderThanDays);
  return prisma.customer.findMany({
    where: {
      shopId,
      lastVisitAt: { lt: cutoff },
      totalVisits: { gte: 1 },
    },
    orderBy: { lastVisitAt: 'asc' },
    take: 100,
  });
}
