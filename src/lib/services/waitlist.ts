import { prisma } from '@/lib/db';

export async function addWaitlistEntry(
  shopId: string,
  customerId: string,
  data: {
    preferredBarberProfileId?: string | null;
    preferredServiceId?: string | null;
    preferredDate?: Date | null;
    preferredTimeWindow?: string | null;
    notes?: string | null;
  }
) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, shopId },
  });
  if (!customer) throw new Error('Customer not found');
  return prisma.waitlistEntry.create({
    data: {
      shopId,
      customerId,
      preferredBarberProfileId: data.preferredBarberProfileId ?? null,
      preferredServiceId: data.preferredServiceId ?? null,
      preferredDate: data.preferredDate ?? null,
      preferredTimeWindow: data.preferredTimeWindow ?? null,
      notes: data.notes ?? null,
      status: 'ACTIVE',
    },
  });
}

export async function listWaitlistEntries(shopId: string) {
  return prisma.waitlistEntry.findMany({
    where: { shopId, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: { customer: true },
  });
}
