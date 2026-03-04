-- Migration: Create chapter_activities table
-- Run: psql -U postgres -d tatt_db -f scripts/migrate-chapter-activities.sql

-- Create ActivityType enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_chapter_activities_type') THEN
        CREATE TYPE "public"."enum_chapter_activities_type" AS ENUM('ANNOUNCEMENT', 'EVENT', 'INITIATIVE', 'NEWS');
    END IF;
END$$;

-- Create chapter_activities table
CREATE TABLE IF NOT EXISTS "chapter_activities" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "chapterId" UUID NOT NULL REFERENCES "chapters"("id") ON DELETE CASCADE,
    "authorId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" "public"."enum_chapter_activities_type" NOT NULL DEFAULT 'ANNOUNCEMENT',
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" VARCHAR(255),
    "eventDate" TIMESTAMP WITH TIME ZONE,
    "eventLocation" VARCHAR(255),
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "deletedAt" TIMESTAMP WITH TIME ZONE
);

-- Grant permissions to app user if tatt_user exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'tatt_user') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.chapter_activities TO tatt_user;
    GRANT USAGE ON TYPE public.enum_chapter_activities_type TO tatt_user;
  END IF;
END;
$$;
