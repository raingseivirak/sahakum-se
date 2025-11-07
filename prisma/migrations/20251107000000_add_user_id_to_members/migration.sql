-- Add userId column to members table if it doesn't exist
-- This migration fixes schema drift between code and production database

DO $$
BEGIN
    -- Add userId column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'members'
        AND column_name = 'userId'
    ) THEN
        ALTER TABLE "public"."members" ADD COLUMN "userId" TEXT;
    END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'members_userId_key'
    ) THEN
        ALTER TABLE "public"."members" ADD CONSTRAINT "members_userId_key" UNIQUE ("userId");
    END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        JOIN pg_class ON pg_constraint.conrelid = pg_class.oid
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        WHERE pg_class.relname = 'members'
        AND pg_namespace.nspname = 'public'
        AND pg_constraint.contype = 'f'
        AND pg_constraint.conname = 'members_userId_fkey'
    ) THEN
        ALTER TABLE "public"."members" ADD CONSTRAINT "members_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;