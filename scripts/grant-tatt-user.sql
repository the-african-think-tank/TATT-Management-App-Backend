-- Run this in DBeaver as user "postgres", with database "tatt_db" selected.
-- Do NOT add: "tatt_db" or \c — those are not valid here. Select tatt_db in the left panel instead.

-- Create the user (comment out next line if tatt_user already exists)
CREATE USER tatt_user WITH PASSWORD 'emma';

-- Grant connect on the database
GRANT CONNECT ON DATABASE "tatt_db" TO tatt_user;

-- Grant usage and full rights on the public schema (so tatt_user can create tables)
GRANT USAGE ON SCHEMA public TO tatt_user;
GRANT CREATE ON SCHEMA public TO tatt_user;
GRANT ALL ON SCHEMA public TO tatt_user;

-- Grant full rights on all current tables in public
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO tatt_user;

-- Allow the user to use sequences (for auto-increment columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tatt_user;

-- So that future tables get the same rights automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tatt_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO tatt_user;
