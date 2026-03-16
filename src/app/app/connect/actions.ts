'use server';

import { requireShopAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { env } from '@/lib/env';
import {
  createConnectAccount,
  createAccountOnboardingLink,
  getAccountBalance,
  getPayoutHistory,
  createInstantPayout,
  markShopOnboarded,
  getConnectAccountStatus,
} from '@/lib/services/stripe-connect';
import type Stripe from 'stripe';

export async function createConnectAccountAction(): Promise<{ onboardingUrl: string }> {
  const { shopId } = await requireShopAccess(['OWNER']);

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      stripeConnectAccountId: true,
      stripeConnectOnboarded: true,
      email: true,
    },
  });
  if (!shop) throw new Error('Shop not found');

  const baseUrl = env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // If already onboarded, just return the onboarding link for re-auth
  if (!shop.stripeConnectAccountId) {
    const ownerEmail = shop.email ?? '';
    await createConnectAccount(shopId, ownerEmail);
  }

  const { url } = await createAccountOnboardingLink(shopId, baseUrl);
  return { onboardingUrl: url };
}

export async function getConnectStatusAction(): Promise<{
  accountId: string | null;
  onboarded: boolean;
  balance: { available: number; pending: number; currency: string } | null;
  payouts: Stripe.Payout[];
}> {
  const { shopId } = await requireShopAccess();

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeConnectAccountId: true, stripeConnectOnboarded: true },
  });
  if (!shop) throw new Error('Shop not found');

  if (!shop.stripeConnectAccountId) {
    return { accountId: null, onboarded: false, balance: null, payouts: [] };
  }

  // If DB says not onboarded, check live with Stripe
  if (!shop.stripeConnectOnboarded) {
    const { chargesEnabled } = await getConnectAccountStatus(shop.stripeConnectAccountId);
    if (chargesEnabled) {
      await markShopOnboarded(shopId);
    }
  }

  const freshShop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeConnectOnboarded: true },
  });
  const onboarded = freshShop?.stripeConnectOnboarded ?? false;

  if (!onboarded) {
    return { accountId: shop.stripeConnectAccountId, onboarded: false, balance: null, payouts: [] };
  }

  const [balance, payouts] = await Promise.all([
    getAccountBalance(shop.stripeConnectAccountId),
    getPayoutHistory(shop.stripeConnectAccountId),
  ]);

  return { accountId: shop.stripeConnectAccountId, onboarded: true, balance, payouts };
}

export async function createInstantPayoutAction(amountCents: number): Promise<void> {
  const { shopId } = await requireShopAccess(['OWNER']);

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeConnectAccountId: true, stripeConnectOnboarded: true },
  });
  if (!shop?.stripeConnectAccountId || !shop.stripeConnectOnboarded) {
    throw new Error('Stripe Connect account not ready');
  }
  if (amountCents < 100) throw new Error('Minimum payout is $1.00');

  await createInstantPayout(shopId, amountCents);
}
