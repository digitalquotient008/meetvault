-- CreateEnum
CREATE TYPE "CancellationFeeType" AS ENUM ('NONE', 'DEPOSIT_FORFEIT', 'FIXED_FEE', 'PERCENT_OF_TOTAL');

-- CreateEnum
CREATE TYPE "CancellationActor" AS ENUM ('CUSTOMER', 'STAFF');

-- AlterTable: Shop — add structured cancellation policy fields
ALTER TABLE "Shop" ADD COLUMN "cancellationWindowHours" INTEGER;
ALTER TABLE "Shop" ADD COLUMN "cancellationFeeType" "CancellationFeeType";
ALTER TABLE "Shop" ADD COLUMN "cancellationFeeValue" DECIMAL(10,2);

-- AlterTable: Appointment — add cancellation tracking fields
ALTER TABLE "Appointment" ADD COLUMN "canceledAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN "canceledByRole" "CancellationActor";
ALTER TABLE "Appointment" ADD COLUMN "cancellationFeeCharged" BOOLEAN NOT NULL DEFAULT false;
