-- TATT Production Migrations: Business Directory & Feed Enhancements
-- Created: 2026-03-25

-- 1. Create Business Partners Table
CREATE TABLE IF NOT EXISTS "business_partners" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "foundingYear" INTEGER,
    "website" VARCHAR(255),
    "locationText" VARCHAR(255) NOT NULL,
    "chapterId" UUID REFERENCES "chapters"("id") ON DELETE SET NULL,
    "missionAlignment" TEXT NOT NULL,
    "perkOffer" TEXT NOT NULL,
    "logoUrl" VARCHAR(255),
    "status" TEXT DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'APPROVED', 'DECLINED', 'INACTIVE')),
    "tierRequested" VARCHAR(255),
    "contactEmail" VARCHAR(255) NOT NULL,
    "contactName" VARCHAR(255),
    "submittedById" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "clickCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Update Notification Type Enum
-- Note: In Postgres, adding values to an ENUM type must be done outside transactions
-- so we use a check to avoid errors.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_notifications_type' AND e.enumlabel = 'NEW_POST') THEN
        ALTER TYPE "enum_notifications_type" ADD VALUE 'NEW_POST';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'enum_notifications_type' AND e.enumlabel = 'NEW_COMMENT') THEN
        ALTER TYPE "enum_notifications_type" ADD VALUE 'NEW_COMMENT';
    END IF;
EXCEPTION
    WHEN undefined_object THEN
        -- If the type doesn't exist yet (first run), Sequelize will create it.
        NULL;
END $$;

-- 3. Add any missing columns to Posts if they were recently added
-- (e.g. topicId, eventType, etc. if not already there)
-- These are usually handled by sequelize.sync({alter:true}), but let's be safe.

-- 4. Audit Log Entry
INSERT INTO "system_settings" ("key", "value", "createdAt", "updatedAt")
VALUES ('last_migration_applied', '20260325-business-directory', NOW(), NOW())
ON CONFLICT ("key") DO UPDATE SET "value" = '20260325-business-directory', "updatedAt" = NOW();
