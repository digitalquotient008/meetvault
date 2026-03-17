-- Add subscription billing fields to Shop
ALTER TABLE "Shop" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "Shop" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "Shop" ADD COLUMN "subscriptionStatus" TEXT DEFAULT 'trialing';
ALTER TABLE "Shop" ADD COLUMN "trialEndsAt" TIMESTAMP(3);
