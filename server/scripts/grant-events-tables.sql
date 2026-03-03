-- Grant the app user (tatt_user) access to the Events tables.
-- Run as postgres (or another superuser) with database tatt_db selected.
-- Required after running migrate-events.sql, because those tables were
-- created by postgres and tatt_user needs explicit SELECT/INSERT/UPDATE/DELETE.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.events TO tatt_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.event_chapters TO tatt_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.event_guests TO tatt_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.event_registrations TO tatt_user;

-- Allow use of enum types (required for INSERT/UPDATE on tables that use them)
GRANT USAGE ON TYPE public.enum_events_type TO tatt_user;
GRANT USAGE ON TYPE public.enum_event_registrations_status TO tatt_user;
