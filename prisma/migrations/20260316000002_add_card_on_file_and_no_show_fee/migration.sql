-- AlterTable: Shop — add no-show fee config
ALTER TABLE "Shop" ADD COLUMN "noShowFeeAmount" DECIMAL(10,2);
ALTER TABLE "Shop" ADD COLUMN "cardRequiredForBooking" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Customer — add card-on-file fields
ALTER TABLE "Customer" ADD COLUMN "platformStripeCustomerId" TEXT;
ALTER TABLE "Customer" ADD COLUMN "stripePaymentMethodId" TEXT;
ALTER TABLE "Customer" ADD COLUMN "cardLastFour" TEXT;
ALTER TABLE "Customer" ADD COLUMN "cardBrand" TEXT;
