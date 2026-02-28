-- Migration: Create job_listings, job_applications, saved_jobs tables
-- Run once with a DB user that can create tables (e.g. postgres).
-- Example: psql -U postgres -d tatt_db -f server/scripts/migrate-jobs.sql

CREATE TABLE IF NOT EXISTS "job_listings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "companyLogoUrl" VARCHAR(512),
    "location" VARCHAR(255) NOT NULL,
    "salaryLabel" VARCHAR(255),
    "salaryMin" DECIMAL(12, 2),
    "salaryMax" DECIMAL(12, 2),
    "type" VARCHAR(64) NOT NULL,
    "category" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "isNew" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "deletedAt" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS "job_applications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "jobId" UUID NOT NULL REFERENCES "job_listings"("id") ON DELETE CASCADE,
    "fullName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(64),
    "resumeUrl" VARCHAR(512),
    "coverLetter" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS "job_applications_user_job" ON "job_applications" ("userId", "jobId");

CREATE TABLE IF NOT EXISTS "saved_jobs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "jobId" UUID NOT NULL REFERENCES "job_listings"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE("userId", "jobId")
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tatt_user') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.job_listings TO tatt_user;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.job_applications TO tatt_user;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.saved_jobs TO tatt_user;
  END IF;
END;
$$;
