-- Migration script to add linkedInProfileUrl to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "linkedInProfileUrl" VARCHAR(255);
