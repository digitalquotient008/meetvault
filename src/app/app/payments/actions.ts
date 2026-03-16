'use server';

import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createStripeDashboardLink } from '@/lib/services/stripe-connect';

export async function createStripeDashboardLinkAction(): Promise<{ url: string }> {
  const { shopId } = await requireShopAccess(['OWNER']);

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeConnectAccountId: true, stripeConnectOnboarded: true },
  });
  if (!shop?.stripeConnectAccountId || !shop.stripeConnectOnboarded) {
    throw new Error('Stripe Connect account not ready');
  }

  return createStripeDashboardLink(shop.stripeConnectAccountId);
}
