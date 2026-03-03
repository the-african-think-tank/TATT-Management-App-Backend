-- Grant the app user (tatt_user) access to the Volunteers tables.
-- Run as postgres (or another superuser) with database tatt_db selected.
-- Required after running migrate-volunteers.sql if the app connects as tatt_user.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.volunteer_roles TO tatt_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.volunteer_applications TO tatt_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.volunteer_activities TO tatt_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.volunteer_stats TO tatt_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.volunteer_training_resources TO tatt_user;

GRANT USAGE ON TYPE public.enum_volunteer_applications_status TO tatt_user;
GRANT USAGE ON TYPE public.enum_volunteer_activities_status TO tatt_user;
GRANT USAGE ON TYPE public.enum_volunteer_stats_grade TO tatt_user;
