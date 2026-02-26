-- Rollback: drop resources and resource_interactions (run only when safe)
-- Run in DBeaver/psql with database tatt_db selected.

DROP TABLE IF EXISTS public.resource_interactions CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TYPE IF EXISTS public.enum_resource_interactions_action CASCADE;
DROP TYPE IF EXISTS public.enum_resources_visibility CASCADE;
DROP TYPE IF EXISTS public.enum_resources_type CASCADE;
DROP TYPE IF EXISTS public.enum_resources_minTier CASCADE;
