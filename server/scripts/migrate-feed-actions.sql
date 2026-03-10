-- Migration: Create tables for Feed v2 (Upvotes, Bookmarks, Reports)
-- And add parentPostId to posts for reposting functionality.

-- 1) Add parentPostId to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS "parentPostId" UUID REFERENCES public.posts(id) ON DELETE SET NULL;

-- 2) Enums for Reports
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_post_reports_suggestedAction') THEN
    CREATE TYPE public."enum_post_reports_suggestedAction" AS ENUM ('NONE', 'DELETE', 'HIDE', 'LIMIT_RECOMMENDATION');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_post_reports_status') THEN
    CREATE TYPE public."enum_post_reports_status" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED', 'RESOLVED');
  END IF;
END$$;

-- 3) Create post_upvotes table
CREATE TABLE IF NOT EXISTS public.post_upvotes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "postId"    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  "userId"    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE("postId", "userId")
);

-- 4) Create post_bookmarks table
CREATE TABLE IF NOT EXISTS public.post_bookmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "postId"    UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  "userId"    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE("postId", "userId")
);

-- 5) Create post_reports table
CREATE TABLE IF NOT EXISTS public.post_reports (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "postId"          UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  "reporterId"      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason            TEXT NOT NULL,
  "suggestedAction" public."enum_post_reports_suggestedAction" NOT NULL DEFAULT 'NONE',
  status            public."enum_post_reports_status" NOT NULL DEFAULT 'PENDING',
  "adminNote"       TEXT,
  "reviewedAt"      TIMESTAMP WITH TIME ZONE,
  "reviewedById"    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  "createdAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_post_upvotes_post_id ON public.post_upvotes ("postId");
CREATE INDEX IF NOT EXISTS idx_post_upvotes_user_id ON public.post_upvotes ("userId");
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user_id ON public.post_bookmarks ("userId");
CREATE INDEX IF NOT EXISTS idx_post_reports_postId ON public.post_reports ("postId");
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON public.post_reports ("status");
