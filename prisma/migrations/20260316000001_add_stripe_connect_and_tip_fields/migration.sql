-- AlterTable: Shop — Stripe Connect fields
ALTER TABLE "Shop" ADD COLUMN "stripeConnectAccountId" TEXT,
                   ADD COLUMN "stripeConnectOnboarded" BOOLEAN NOT NULL DEFAULT false,
                   ADD COLUMN "platformFeePercent" DECIMAL(5,2);

-- AlterTable: Customer — card-on-file Stripe Customer ID
ALTER TABLE "Customer" ADD COLUMN "stripeCustomerId" TEXT;

-- AlterTable: Payment — Connect platform fee and transfer tracking
ALTER TABLE "Payment" ADD COLUMN "platformFeeAmount" DECIMAL(10,2),
                      ADD COLUMN "transferId" TEXT;
