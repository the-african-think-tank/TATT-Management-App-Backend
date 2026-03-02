-- Migration: Create resources and resource_interactions tables for Knowledge & Resource Hub
-- Run once with a DB user that can create types and tables (e.g. postgres).
-- Database: tatt_db (or your DB_NAME from .env)
-- Safe to re-run: creates types and tables only if they don't exist.

-- 1) Enums for resources (create only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_resources_type') THEN
    CREATE TYPE public.enum_resources_type AS ENUM ('GUIDE', 'DOCUMENT', 'VIDEO', 'PARTNERSHIP');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_resources_visibility') THEN
    CREATE TYPE public.enum_resources_visibility AS ENUM ('PUBLIC', 'RESTRICTED');
  END IF;
END$$;

-- minTier: use a dedicated enum for resources (same values as community tier) to avoid dependency on users table enum name/casing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_resources_minTier') THEN
    CREATE TYPE public.enum_resources_minTier AS ENUM ('FREE', 'UBUNTU', 'IMANI', 'KIONGOZI');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_resource_interactions_action') THEN
    CREATE TYPE public.enum_resource_interactions_action AS ENUM ('VIEW', 'READ', 'ACTIVATE');
  END IF;
END$$;

-- 2) resources table (chapters and users must already exist)
CREATE TABLE IF NOT EXISTS public.resources (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(255) NOT NULL,
  type              public.enum_resources_type NOT NULL,
  description       TEXT,
  "contentUrl"      VARCHAR(255),
  "thumbnailUrl"    VARCHAR(255),
  "chapterId"       UUID REFERENCES public.chapters(id) ON DELETE SET NULL,
  visibility        public.enum_resources_visibility NOT NULL DEFAULT 'PUBLIC',
  "minTier"         public.enum_resources_minTier NOT NULL DEFAULT 'FREE',
  tags              TEXT[] NOT NULL DEFAULT '{}',
  metadata          JSONB,
  "createdAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "deletedAt"       TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_resources_deleted_at ON public.resources ("deletedAt");
CREATE INDEX IF NOT EXISTS idx_resources_chapter_id ON public.resources ("chapterId");
CREATE INDEX IF NOT EXISTS idx_resources_visibility_min_tier ON public.resources (visibility, "minTier");

-- 3) resource_interactions table
CREATE TABLE IF NOT EXISTS public.resource_interactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "resourceId" UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  "userId"     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action       public.enum_resource_interactions_action NOT NULL,
  "createdAt"  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resource_interactions_resource_id ON public.resource_interactions ("resourceId");
CREATE INDEX IF NOT EXISTS idx_resource_interactions_user_id ON public.resource_interactions ("userId");
