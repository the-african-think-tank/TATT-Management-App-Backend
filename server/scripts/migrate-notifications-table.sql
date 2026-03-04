-- Migration script for Notifications
-- Run this as a superuser (e.g. postgres) on your tatt_db

-- 1. Create the notification_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_notifications_type') THEN
        CREATE TYPE "enum_notifications_type" AS ENUM (
            'CONNECTION_REQUEST',
            'CONNECTION_ACCEPTED',
            'NEW_MESSAGE',
            'SUBSCRIPTION_RENEWAL',
            'SUBSCRIPTION_EXPIRING',
            'SUBSCRIPTION_DOWNGRADE',
            'EVENT_REMINDER',
            'SYSTEM_ALERT'
        );
    END IF;
END
$$;

-- 2. Create the notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" "enum_notifications_type" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "readAt" TIMESTAMP WITH TIME ZONE,
    "dismissedAt" TIMESTAMP WITH TIME ZONE,
    "isEmailSent" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "deletedAt" TIMESTAMP WITH TIME ZONE
);

-- 3. Index for performance
CREATE INDEX IF NOT EXISTS "idx_notifications_userId" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "idx_notifications_createdAt" ON "notifications"("createdAt" DESC);

-- 4. Grant permissions to tatt_user if applicable
-- GRANT ALL PRIVILEGES ON TABLE "notifications" TO tatt_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tatt_user;
