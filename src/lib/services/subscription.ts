import Stripe from 'stripe';
import { prisma } from '@/lib/db';
import { requireStripeSecretKey } from '@/lib/env';
import { APP_URL } from '@/lib/constants';
import { sendTrialStartedEmail, sendSubscriptionActiveEmail } from '@/lib/services/lifecycle-emails';

const TRIAL_DAYS = 14;
const PLAN_PRICE_MONTHLY_CENTS = 2500; // $25/mo

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(requireStripeSecretKey(), {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripeClient;
}

/**
 * Create a Stripe Checkout Session for a 14-day trial subscription.
 * Card is collected upfront, first charge happens after trial ends.
 */
export async function createSubscriptionCheckout(params: {
  shopId: string;
  shopName: string;
  ownerEmail: string;
}): Promise<{ url: string }> {
  const stripe = getStripe();
  const { shopId, shopName, ownerEmail } = params;

  // Find or create a Stripe price for $25/mo
  const priceId = await getOrCreatePrice(stripe);

  // Create Stripe customer
  let shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeCustomerId: true },
  });

  let stripeCustomerId = shop?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: ownerEmail,
      metadata: { shopId, shopName },
    });
    stripeCustomerId = customer.id;
    await prisma.shop.update({
      where: { id: shopId },
      data: { stripeCustomerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { shopId },
    },
    success_url: `${APP_URL}/app/onboarding/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/app/onboarding/subscribe`,
    metadata: { shopId },
  });

  return { url: session.url! };
}

/**
 * After Checkout completes, sync the subscription to our DB.
 */
export async function syncSubscriptionFromCheckout(sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  });

  const sub = session.subscription as Stripe.Subscription | null;
  if (!sub) return;

  const shopId = session.metadata?.shopId ?? sub.metadata?.shopId;
  if (!shopId) return;

  const trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      stripeSubscriptionId: sub.id,
      subscriptionStatus: sub.status,
      trialEndsAt,
      trialStartedAt: sub.status === 'trialing' ? new Date() : undefined,
    },
  });

  // Send trial started email
  if (sub.status === 'trialing' && trialEndsAt) {
    const owner = await prisma.membership.findFirst({
      where: { shopId, role: 'OWNER', isActive: true },
      include: { user: true },
    });
    if (owner?.user?.email) {
      sendTrialStartedEmail(shopId, owner.user.email, owner.user.firstName || 'there', trialEndsAt).catch(() => {});
    }
  }
}

/**
 * Handle subscription lifecycle events from Stripe webhook.
 */
export async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const shopId = sub.metadata?.shopId;
  if (!shopId) return;

  // Check previous status to detect trial → active conversion
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { subscriptionStatus: true },
  });
  const previousStatus = shop?.subscriptionStatus;

  const isConversion = sub.status === 'active' && previousStatus === 'trialing';

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      stripeSubscriptionId: sub.id,
      subscriptionStatus: sub.status,
      trialEndsAt: sub.trial_end
        ? new Date(sub.trial_end * 1000)
        : null,
      ...(isConversion ? { trialConvertedAt: new Date() } : {}),
    },
  });

  // Send "subscription active" email when trial converts to paid
  if (isConversion) {
    const owner = await prisma.membership.findFirst({
      where: { shopId, role: 'OWNER', isActive: true },
      include: { user: true },
    });
    if (owner?.user?.email) {
      sendSubscriptionActiveEmail(shopId, owner.user.email, owner.user.firstName || 'there').catch(() => {});
    }
  }
}

export async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const shopId = sub.metadata?.shopId;
  if (!shopId) return;

  // Check if this was a trial that never converted
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { trialConvertedAt: true },
  });

  await prisma.shop.update({
    where: { id: shopId },
    data: {
      subscriptionStatus: 'canceled',
      // Only set trialExpiredAt if the trial never converted to paid
      ...(!shop?.trialConvertedAt ? { trialExpiredAt: new Date() } : {}),
    },
  });
}

/**
 * Cancel the subscription at period end (customer keeps access until then).
 */
export async function cancelSubscription(shopId: string) {
  const stripe = getStripe();
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeSubscriptionId: true },
  });
  if (!shop?.stripeSubscriptionId) throw new Error('No active subscription');

  const sub = await stripe.subscriptions.update(shop.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.shop.update({
    where: { id: shopId },
    data: { subscriptionStatus: sub.status },
  });

  return sub;
}

/**
 * Resume a subscription that was set to cancel at period end.
 */
export async function resumeSubscription(shopId: string) {
  const stripe = getStripe();
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeSubscriptionId: true },
  });
  if (!shop?.stripeSubscriptionId) throw new Error('No subscription found');

  const sub = await stripe.subscriptions.update(shop.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  await prisma.shop.update({
    where: { id: shopId },
    data: { subscriptionStatus: sub.status },
  });

  return sub;
}

/**
 * Create a Stripe billing portal session so the customer can manage
 * their payment method, view invoices, etc.
 */
export async function createBillingPortalSession(shopId: string): Promise<{ url: string }> {
  const stripe = getStripe();
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { stripeCustomerId: true },
  });
  if (!shop?.stripeCustomerId) throw new Error('No Stripe customer');

  const session = await stripe.billingPortal.sessions.create({
    customer: shop.stripeCustomerId,
    return_url: `${APP_URL}/app/settings/billing`,
  });

  return { url: session.url };
}

/**
 * Check if a shop has an active or trialing subscription.
 */
export function isSubscriptionActive(
  status: string | null | undefined,
): boolean {
  if (!status) return false;
  return ['trialing', 'active'].includes(status);
}

/**
 * Get or create the $25/mo recurring price.
 * Searches for an existing product named "MeetVault Starter" first.
 */
async function getOrCreatePrice(stripe: Stripe): Promise<string> {
  // Check env for a pre-configured price ID
  const envPriceId = process.env.STRIPE_PRICE_ID;
  if (envPriceId) return envPriceId;

  // Search for existing product
  const products = await stripe.products.list({ limit: 10, active: true });
  const existing = products.data.find((p) => p.name === 'MeetVault Starter');

  if (existing) {
    const prices = await stripe.prices.list({
      product: existing.id,
      active: true,
      type: 'recurring',
      limit: 1,
    });
    if (prices.data[0]) return prices.data[0].id;
  }

  // Create product + price
  const product = await stripe.products.create({
    name: 'MeetVault Starter',
    description: 'Full barbershop management toolkit — $25/month',
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: PLAN_PRICE_MONTHLY_CENTS,
    currency: 'usd',
    recurring: { interval: 'month' },
  });

  return price.id;
}
