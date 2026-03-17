-- Remove the default 'trialing' so new shops must go through Stripe Checkout.
-- Existing shops that never subscribed will be set to NULL (triggers subscribe gate).
ALTER TABLE "Shop" ALTER COLUMN "subscriptionStatus" DROP DEFAULT;

-- Clear any shops that got the auto-default 'trialing' without a real Stripe subscription
UPDATE "Shop" SET "subscriptionStatus" = NULL WHERE "stripeSubscriptionId" IS NULL AND "subscriptionStatus" = 'trialing';
