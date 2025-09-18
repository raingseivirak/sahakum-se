-- Migration to sync production database with current local development schema
-- This brings production in line with the working local Docker PostgreSQL database

-- First, update UserRole enum to match local Role enum
ALTER TYPE "public"."UserRole" RENAME TO "Role";

-- Add USER value to Role enum (production has ADMIN, EDITOR, AUTHOR but local has USER, ADMIN, EDITOR)
ALTER TYPE "public"."Role" ADD VALUE IF NOT EXISTS 'USER';

-- Remove AUTHOR value if it exists (since local doesn't have it)
-- Note: PostgreSQL doesn't support removing enum values directly, so we'll leave it if it exists

-- Update users table to match local schema
-- Add active column if it doesn't exist (production might have isActive instead)
DO $$
BEGIN
    -- Check if 'isActive' column exists and rename it to 'active'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'isActive') THEN
        ALTER TABLE "public"."users" RENAME COLUMN "isActive" TO "active";
    END IF;

    -- If active column doesn't exist at all, add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'active') THEN
        ALTER TABLE "public"."users" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- Update content field types to match local schema
-- Local has content and excerpt as text fields, ensure they're TEXT type
ALTER TABLE "public"."content_translations" ALTER COLUMN "content" TYPE TEXT;
ALTER TABLE "public"."content_translations" ALTER COLUMN "excerpt" TYPE TEXT;

-- Service translations description should be TEXT
ALTER TABLE "public"."service_translations" ALTER COLUMN "description" TYPE TEXT;

-- Member bio should be TEXT
ALTER TABLE "public"."members" ALTER COLUMN "bio" TYPE TEXT;

-- Membership request fields should be TEXT
ALTER TABLE "public"."membership_requests" ALTER COLUMN "motivation" TYPE TEXT;
ALTER TABLE "public"."membership_requests" ALTER COLUMN "reviewNotes" TYPE TEXT;