import { prisma } from '@/lib/db';

export async function addCustomerNote(params: {
  shopId: string;
  customerId: string;
  content: string;
  createdByUserId?: string | null;
}) {
  const { shopId, customerId, content, createdByUserId } = params;
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, shopId },
  });
  if (!customer) throw new Error('Customer not found');
  return prisma.customerNote.create({
    data: { shopId, customerId, content, createdByUserId: createdByUserId ?? null },
  });
}

export async function listCustomerNotes(shopId: string, customerId: string) {
  return prisma.customerNote.findMany({
    where: { shopId, customerId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}
