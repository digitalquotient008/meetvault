-- Deduplicate customers with same shopId + email (keep earliest)
DELETE FROM "Customer" a
USING "Customer" b
WHERE a."id" > b."id"
  AND a."shopId" = b."shopId"
  AND a."email" = b."email"
  AND a."email" IS NOT NULL;

-- Drop the old non-unique index
DROP INDEX IF EXISTS "Customer_shopId_email_idx";

-- Add unique constraint (replaces the old index)
CREATE UNIQUE INDEX "Customer_shopId_email_key" ON "Customer"("shopId", "email");
