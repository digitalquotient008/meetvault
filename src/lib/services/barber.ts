import { prisma } from '@/lib/db';

// Starter plan: 1 staff member (the owner). Team plan (future): unlimited.
const STARTER_STAFF_LIMIT = 1;

export async function createBarberProfile(
  shopId: string,
  userId: string,
  data: { displayName: string; bio?: string; photoUrl?: string }
) {
  // Enforce staff limit based on plan
  const [existingCount, shop] = await Promise.all([
    prisma.barberProfile.count({ where: { shopId } }),
    prisma.shop.findUnique({ where: { id: shopId }, select: { subscriptionStatus: true } }),
  ]);

  // For now, Starter plan = 1 staff. Skip check during onboarding (no subscription yet)
  // or if they haven't subscribed. Only enforce for active/trialing subscriptions.
  const hasSubscription = shop?.subscriptionStatus === 'active' || shop?.subscriptionStatus === 'trialing';
  if (hasSubscription && existingCount >= STARTER_STAFF_LIMIT) {
    throw new Error(`Starter plan allows ${STARTER_STAFF_LIMIT} staff member. Upgrade to Team to add more.`);
  }

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
