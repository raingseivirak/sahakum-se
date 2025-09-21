-- Remove linkedMemberId field and constraints from users table
DO $$
BEGIN
    -- Drop foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        JOIN pg_class ON pg_constraint.conrelid = pg_class.oid
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        WHERE pg_class.relname = 'users'
        AND pg_namespace.nspname = 'public'
        AND pg_constraint.contype = 'f'
        AND pg_constraint.conname = 'users_linkedMemberId_fkey'
    ) THEN
        ALTER TABLE "public"."users" DROP CONSTRAINT "users_linkedMemberId_fkey";
    END IF;

    -- Drop unique constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'users_linkedMemberId_key'
    ) THEN
        ALTER TABLE "public"."users" DROP CONSTRAINT "users_linkedMemberId_key";
    END IF;

    -- Drop column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'users'
        AND column_name = 'linkedMemberId'
    ) THEN
        ALTER TABLE "public"."users" DROP COLUMN "linkedMemberId";
    END IF;
END $$;