import { prisma } from '@/lib/db';

export async function createBarberProfile(
  shopId: string,
  userId: string,
  data: { displayName: string; bio?: string; photoUrl?: string }
) {
  const barber = await prisma.$transaction(async (tx) => {
    const b = await tx.barberProfile.create({
      data: {
        shopId,
        userId,
        displayName: data.displayName,
        bio: data.bio ?? null,
        photoUrl: data.photoUrl ?? null,
        isBookable: true,
      },
    });
    await tx.membership.upsert({
      where: { shopId_userId: { shopId, userId } },
      create: { shopId, userId, role: 'BARBER' },
      update: { role: 'BARBER' },
    });
    return b;
  });
  return barber;
}

export async function listBarberProfiles(shopId: string) {
  return prisma.barberProfile.findMany({
    where: { shopId },
    include: { user: true },
    orderBy: { displayName: 'asc' },
  });
}
