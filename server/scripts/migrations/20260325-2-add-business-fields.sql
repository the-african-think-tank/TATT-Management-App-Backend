-- TATT Production Migrations: Business Field Enhancements (Phone & Admin Notes)
-- Created: 2026-03-25

-- 1. Add Phone and Notes columns to Business Partners
ALTER TABLE "business_partners" 
ADD COLUMN IF NOT EXISTS "contactPhone" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;

-- 2. Audit Log Entry
INSERT INTO "system_settings" ("key", "value", "createdAt", "updatedAt")
VALUES ('last_migration_applied', '20260325-2-add-business-fields', NOW(), NOW())
ON CONFLICT ("key") DO UPDATE SET "value" = '20260325-2-add-business-fields', "updatedAt" = NOW();
