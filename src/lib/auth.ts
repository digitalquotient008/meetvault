import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { isSubscriptionActive } from '@/lib/services/subscription';

export type TenantRole = 'OWNER' | 'MANAGER' | 'BARBER' | 'RECEPTIONIST';

export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function getOrCreateUser(
  clerkUserId: string,
  data: { email?: string; firstName?: string; lastName?: string }
) {
  const user = await prisma.user.upsert({
    where: { authProviderId: clerkUserId },
    create: {
      authProviderId: clerkUserId,
      email: data.email ?? '',
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
    },
    update: {},
  });
  return user;
}

export async function getMembershipForUser(userId: string): Promise<{ shopId: string; role: TenantRole } | null> {
  const membership = await prisma.membership.findFirst({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'asc' },
  });
  if (!membership) return null;
  return { shopId: membership.shopId, role: membership.role as TenantRole };
}

export async function requireAuth() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

export async function requireShopAccess(allowedRoles?: TenantRole[]) {
  const clerkAuth = await auth();
  const clerkUserId = clerkAuth.userId;
  if (!clerkUserId) throw new Error('Unauthorized');

  const clerkUser = await currentUser();
  const user = await getOrCreateUser(clerkUserId, {
    email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? '',
    firstName: clerkUser?.firstName ?? undefined,
    lastName: clerkUser?.lastName ?? undefined,
  });

  const membership = await getMembershipForUser(user.id);
  if (!membership) throw new Error('No shop access');

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
    throw new Error('Forbidden');
  }

  return { userId: user.id, shopId: membership.shopId, role: membership.role };
}

/**
 * Check if the shop's subscription is active or trialing.
 * Returns null if active, or the subscription status string if not.
 */
export async function checkSubscriptionStatus(shopId: string): Promise<string | null> {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { subscriptionStatus: true },
  });
  if (!shop) return 'no_shop';
  if (isSubscriptionActive(shop.subscriptionStatus)) return null;
  return shop.subscriptionStatus ?? 'none';
}
