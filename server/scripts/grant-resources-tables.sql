-- Grant the app user (tatt_user) access to the Resources tables.
-- Run as postgres (or another superuser) with database tatt_db selected.
-- Required after running migrate-resources-tables.sql, because those tables
-- were created by postgres and are not covered by "ALL TABLES" grants run earlier.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.resources TO tatt_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.resource_interactions TO tatt_user;
