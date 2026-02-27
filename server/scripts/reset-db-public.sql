-- Reset public schema for tatt_db (drops all tables and enum types).
-- Run in DBeaver as postgres, with database tatt_db selected.
-- After running this, you can start the app with synchronize: true once to create tables, then set synchronize: false.

-- Drop all tables in public (order can matter for FKs; CASCADE drops dependents)
DROP TABLE IF EXISTS public.direct_messages CASCADE;
DROP TABLE IF EXISTS public.post_comments CASCADE;
DROP TABLE IF EXISTS public.post_likes CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.connections CASCADE;
DROP TABLE IF EXISTS public.user_interests CASCADE;
DROP TABLE IF EXISTS public.professional_interests CASCADE;
DROP TABLE IF EXISTS public.chapters CASCADE;
DROP TABLE IF EXISTS public.email_otps CASCADE;
DROP TABLE IF EXISTS public.password_history CASCADE;
DROP TABLE IF EXISTS public.security_policy CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop enum types (created by Sequelize for PostgreSQL)
DROP TYPE IF EXISTS public.enum_direct_messages_status CASCADE;
DROP TYPE IF EXISTS public.enum_posts_contentFormat CASCADE;
DROP TYPE IF EXISTS public.enum_posts_type CASCADE;
DROP TYPE IF EXISTS public.enum_connections_status CASCADE;
DROP TYPE IF EXISTS public.enum_users_billingCycle CASCADE;
DROP TYPE IF EXISTS public.enum_users_twoFactorMethod CASCADE;
DROP TYPE IF EXISTS public.enum_users_flags CASCADE;
DROP TYPE IF EXISTS public.enum_users_communityTier CASCADE;
DROP TYPE IF EXISTS public.enum_users_systemRole CASCADE;
DROP TYPE IF EXISTS public.enum_security_policy_twoFactorPolicyVolunteers CASCADE;
DROP TYPE IF EXISTS public.enum_security_policy_twoFactorPolicyOrgMembers CASCADE;
