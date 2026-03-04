-- Migration script for account deletion functionality
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletionRequestedAt" TIMESTAMP WITH TIME ZONE;
