-- Fix the enum name mismatch between production and local
-- Production has "UserRole" but local schema expects "Role"

-- First, rename the UserRole enum to Role
ALTER TYPE "public"."UserRole" RENAME TO "Role";

-- Add USER value to the Role enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'USER' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role')) THEN
        ALTER TYPE "public"."Role" ADD VALUE 'USER';
    END IF;
END $$;