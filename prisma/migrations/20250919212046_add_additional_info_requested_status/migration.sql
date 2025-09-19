-- Add ADDITIONAL_INFO_REQUESTED to the RequestStatus enum if it doesn't exist

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ADDITIONAL_INFO_REQUESTED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'RequestStatus')) THEN
        ALTER TYPE "RequestStatus" ADD VALUE 'ADDITIONAL_INFO_REQUESTED';
    END IF;
END$$;