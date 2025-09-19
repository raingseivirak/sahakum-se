-- Add new membership types to the MembershipType enum if they don't exist

-- Check and add BOARD if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'BOARD' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'MembershipType')) THEN
        ALTER TYPE "MembershipType" ADD VALUE 'BOARD';
    END IF;
END$$;

-- Check and add VOLUNTEER if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'VOLUNTEER' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'MembershipType')) THEN
        ALTER TYPE "MembershipType" ADD VALUE 'VOLUNTEER';
    END IF;
END$$;

-- Check and add LIFETIME if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'LIFETIME' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'MembershipType')) THEN
        ALTER TYPE "MembershipType" ADD VALUE 'LIFETIME';
    END IF;
END$$;