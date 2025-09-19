-- Migration to sync production database with current schema
-- This adds missing firstName/lastName columns and renames active to isActive

-- Check if firstName column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'firstName') THEN
        ALTER TABLE "users" ADD COLUMN "firstName" TEXT;
    END IF;
END $$;

-- Check if lastName column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'lastName') THEN
        ALTER TABLE "users" ADD COLUMN "lastName" TEXT;
    END IF;
END $$;

-- Check if active column exists and isActive doesn't, then rename
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'active')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'isActive') THEN
        ALTER TABLE "users" RENAME COLUMN "active" TO "isActive";
    END IF;
END $$;