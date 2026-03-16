import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { requireStripeSecretKey } from '@/lib/env';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = requireStripeSecretKey();
    stripeClient = new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' });
  }
  return stripeClient;
}

export async function createConnectAccount(
  shopId: string,
  email: string,
): Promise<{ accountId: string }> {
  const stripe = getStripe();

  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { shopId },
  });

  await prisma.shop.update({
    where: { id: shopId },
    data: { stripeConnectAccountId: account.id, stripeConnectOnboarded: false },
  });

  return { accountId: account.id };
}

export async function createAccountOnboardingLink(
  shopId: string,
  baseUrl: string,
): Promise<{ url: string }> {
  const stripe = getStripe();

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeConnectAccountId: true },
  });
  if (!shop?.stripeConnectAccountId) {
    throw new Error('Shop does not have a Stripe Connect account');
  }

  const accountLink = await stripe.accountLinks.create({
    account: shop.stripeConnectAccountId,
    refresh_url: `${baseUrl}/app/connect/refresh`,
    return_url: `${baseUrl}/app/connect/return`,
    type: 'account_onboarding',
  });

  return { url: accountLink.url };
}

export async function getAccountBalance(
  stripeConnectAccountId: string,
): Promise<{ available: number; pending: number; currency: string }> {
  const stripe = getStripe();

  const balance = await stripe.balance.retrieve({
    stripeAccount: stripeConnectAccountId,
  });

  const available = balance.available.reduce((sum, b) => sum + b.amount, 0);
  const pending = balance.pending.reduce((sum, b) => sum + b.amount, 0);
  const currency = balance.available[0]?.currency ?? 'usd';

  return { available, pending, currency };
}

export async function createInstantPayout(
  shopId: string,
  amountCents: number,
): Promise<Stripe.Payout> {
  const stripe = getStripe();

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeConnectAccountId: true },
  });
  if (!shop?.stripeConnectAccountId) {
    throw new Error('Shop does not have a Stripe Connect account');
  }

  try {
    return await stripe.payouts.create(
      { amount: amountCents, currency: 'usd', method: 'instant' },
      { stripeAccount: shop.stripeConnectAccountId },
    );
  } catch (err) {
    // Instant payouts not supported by bank — fall back to standard
    if (err instanceof Stripe.errors.StripeInvalidRequestError) {
      return await stripe.payouts.create(
        { amount: amountCents, currency: 'usd', method: 'standard' },
        { stripeAccount: shop.stripeConnectAccountId },
      );
    }
    throw err;
  }
}

export async function getPayoutHistory(
  stripeConnectAccountId: string,
): Promise<Stripe.Payout[]> {
  const stripe = getStripe();

  const payouts = await stripe.payouts.list(
    { limit: 20, expand: ['data.destination'] },
    { stripeAccount: stripeConnectAccountId },
  );

  return payouts.data;
}

export async function createStripeDashboardLink(
  stripeConnectAccountId: string,
): Promise<{ url: string }> {
  const stripe = getStripe();
  const loginLink = await stripe.accounts.createLoginLink(stripeConnectAccountId);
  return { url: loginLink.url };
}

export async function markShopOnboarded(shopId: string): Promise<void> {
  await prisma.shop.update({
    where: { id: shopId },
    data: { stripeConnectOnboarded: true },
  });
}

export async function clearShopConnectAccount(shopId: string): Promise<void> {
  await prisma.shop.update({
    where: { id: shopId },
    data: { stripeConnectAccountId: null, stripeConnectOnboarded: false },
  });
}

export async function getConnectAccountStatus(
  stripeConnectAccountId: string,
): Promise<{ chargesEnabled: boolean; detailsSubmitted: boolean }> {
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(stripeConnectAccountId);
  return {
    chargesEnabled: account.charges_enabled,
    detailsSubmitted: account.details_submitted,
  };
}

