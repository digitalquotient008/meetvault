-- AlterTable: Add trial lifecycle timestamps to Shop
ALTER TABLE "Shop" ADD COLUMN "trialStartedAt" TIMESTAMP(3);
ALTER TABLE "Shop" ADD COLUMN "trialConvertedAt" TIMESTAMP(3);
ALTER TABLE "Shop" ADD COLUMN "trialExpiredAt" TIMESTAMP(3);

-- CreateIndex: Add unique constraint on NotificationLog (shopId, templateKey)
-- First, remove any duplicates (keep the earliest)
DELETE FROM "NotificationLog" a
USING "NotificationLog" b
WHERE a."id" > b."id"
  AND a."shopId" = b."shopId"
  AND a."templateKey" = b."templateKey";

CREATE UNIQUE INDEX "NotificationLog_shopId_templateKey_key" ON "NotificationLog"("shopId", "templateKey");
