-- Migration: Create volunteer_roles, volunteer_applications, volunteer_activities, volunteer_stats, volunteer_training_resources
-- Run once with a DB user that can create types and tables (e.g. postgres).
-- Example: psql -U postgres -d tatt_db -f server/scripts/migrate-volunteers.sql
-- Or from server folder: psql -U postgres -d tatt_db -f scripts/migrate-volunteers.sql

-- Application status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_volunteer_applications_status') THEN
        CREATE TYPE "public"."enum_volunteer_applications_status" AS ENUM(
            'PENDING', 'INTERVIEW_SCHEDULED', 'APPROVED', 'REJECTED', 'WITHDRAWN'
        );
    END IF;
END$$;

-- Activity status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_volunteer_activities_status') THEN
        CREATE TYPE "public"."enum_volunteer_activities_status" AS ENUM(
            'ASSIGNED', 'COMPLETED', 'DECLINED', 'CANCELLED'
        );
    END IF;
END$$;

-- Volunteer grade enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_volunteer_stats_grade') THEN
        CREATE TYPE "public"."enum_volunteer_stats_grade" AS ENUM('SILVER', 'BRONZE', 'GOLD');
    END IF;
END$$;

-- Volunteer roles (depends on chapters, users)
CREATE TABLE IF NOT EXISTS "volunteer_roles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "chapterId" UUID NOT NULL REFERENCES "chapters"("id") ON DELETE CASCADE,
    "weeklyHours" INTEGER NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" VARCHAR(255)[] NOT NULL DEFAULT '{}',
    "requiredSkills" VARCHAR(255)[] NOT NULL DEFAULT '{}',
    "spotsNeeded" INTEGER NOT NULL DEFAULT 1,
    "openUntil" TIMESTAMP WITH TIME ZONE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "deletedAt" TIMESTAMP WITH TIME ZONE
);

-- Volunteer applications
CREATE TABLE IF NOT EXISTS "volunteer_applications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "roleId" UUID REFERENCES "volunteer_roles"("id") ON DELETE SET NULL,
    "interestsAndSkills" VARCHAR(255)[] NOT NULL DEFAULT '{}',
    "weeklyAvailability" JSONB NOT NULL,
    "hoursAvailablePerWeek" INTEGER NOT NULL,
    "reasonForApplying" TEXT NOT NULL,
    "questionsForAdmin" TEXT,
    "status" "public"."enum_volunteer_applications_status" NOT NULL DEFAULT 'PENDING',
    "interviewTime" TIMESTAMP WITH TIME ZONE,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Volunteer activities
CREATE TABLE IF NOT EXISTS "volunteer_activities" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "chapterId" UUID NOT NULL REFERENCES "chapters"("id") ON DELETE CASCADE,
    "assignedToId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "estimatedHours" INTEGER NOT NULL DEFAULT 0,
    "impactPoints" INTEGER NOT NULL DEFAULT 10,
    "status" "public"."enum_volunteer_activities_status" NOT NULL DEFAULT 'ASSIGNED',
    "declineReason" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Volunteer stats
CREATE TABLE IF NOT EXISTS "volunteer_stats" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "totalHours" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "impactPoints" INTEGER NOT NULL DEFAULT 0,
    "grade" "public"."enum_volunteer_stats_grade" NOT NULL DEFAULT 'SILVER',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Volunteer training resources
CREATE TABLE IF NOT EXISTS "volunteer_training_resources" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrls" VARCHAR(255)[] NOT NULL DEFAULT '{}',
    "createdBy" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Grant permissions to the app user (if tatt_user exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tatt_user') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.volunteer_roles TO tatt_user;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.volunteer_applications TO tatt_user;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.volunteer_activities TO tatt_user;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.volunteer_stats TO tatt_user;
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.volunteer_training_resources TO tatt_user;
    GRANT USAGE ON TYPE public.enum_volunteer_applications_status TO tatt_user;
    GRANT USAGE ON TYPE public.enum_volunteer_activities_status TO tatt_user;
    GRANT USAGE ON TYPE public.enum_volunteer_stats_grade TO tatt_user;
  END IF;
END;
$$;
