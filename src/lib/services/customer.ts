import { prisma } from '@/lib/db';

export async function createOrFindCustomer(
  shopId: string,
  data: { firstName: string; lastName: string; email?: string; phone?: string }
) {
  const normalizedEmail = data.email?.trim() || null;
  const normalizedPhone = data.phone?.trim() || null;

  if (normalizedEmail) {
    const existing = await prisma.customer.findFirst({
      where: { shopId, email: normalizedEmail },
    });
    if (existing) {
      await prisma.customer.update({
        where: { id: existing.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: normalizedPhone ?? existing.phone,
        },
      });
      return existing;
    }
  }

  if (normalizedPhone) {
    const existing = await prisma.customer.findFirst({
      where: { shopId, phone: normalizedPhone },
    });
    if (existing) {
      await prisma.customer.update({
        where: { id: existing.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: normalizedEmail ?? existing.email,
        },
      });
      return existing;
    }
  }

  return prisma.customer.create({
    data: {
      shopId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: normalizedEmail,
      phone: normalizedPhone,
    },
  });
}
