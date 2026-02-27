
-- Create EventType enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_events_type') THEN
        CREATE TYPE "public"."enum_events_type" AS ENUM('EVENT', 'MIXER', 'WORKSHOP');
    END IF;
END$$;

-- Create Events table
CREATE TABLE IF NOT EXISTS "events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "dateTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "type" "public"."enum_events_type" NOT NULL,
    "imageUrl" VARCHAR(255),
    "isForAllMembers" BOOLEAN NOT NULL DEFAULT true,
    "targetMembershipTiers" VARCHAR(255)[], -- Sequence-style array of strings
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "deletedAt" TIMESTAMP WITH TIME ZONE
);

-- Create EventChapters table
CREATE TABLE IF NOT EXISTS "event_chapters" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventId" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "chapterId" UUID NOT NULL REFERENCES "chapters"("id") ON DELETE CASCADE,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create EventGuests table
CREATE TABLE IF NOT EXISTS "event_guests" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventId" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE("eventId", "userId")
);

-- Register Registration status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_event_registrations_status') THEN
        CREATE TYPE "public"."enum_event_registrations_status" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED');
    END IF;
END$$;

-- Create EventRegistrations table
CREATE TABLE IF NOT EXISTS "event_registrations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "eventId" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "isBusinessRegistration" BOOLEAN NOT NULL DEFAULT false,
    "amountPaid" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "status" "public"."enum_event_registrations_status" NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" VARCHAR(255),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE("eventId", "userId")
);
