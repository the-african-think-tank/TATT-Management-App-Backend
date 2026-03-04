-- Migration script to add user settings fields
-- Run this as a superuser (e.g. postgres) on your tatt_db

-- 1. Create the connection_preference enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_connectionPreference') THEN
        CREATE TYPE "enum_users_connectionPreference" AS ENUM ('OPEN', 'CHAPTER_ONLY', 'NO_CONNECTIONS');
    END IF;
END
$$;

-- 2. Add columns to the users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "connectionPreference" "enum_users_connectionPreference" DEFAULT 'OPEN';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "expertise" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessName" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessRole" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessProfileLink" VARCHAR(255);

-- Update existing users to have the default preference if they already exist
UPDATE "users" SET "connectionPreference" = 'OPEN' WHERE "connectionPreference" IS NULL;
