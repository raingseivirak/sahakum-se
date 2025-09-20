-- AlterEnum: Add new roles to Role enum (only if needed)
DO $$
BEGIN
    -- Check if AUTHOR role already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'))
        AND enumlabel = 'AUTHOR'
    ) THEN
        -- Create new enum with all roles
        CREATE TYPE "public"."Role_new" AS ENUM ('USER', 'AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN');

        -- Create temporary column
        ALTER TABLE "public"."users" ADD COLUMN "role_new" "public"."Role_new" NOT NULL DEFAULT 'USER';

        -- Copy existing data
        UPDATE "public"."users" SET "role_new" = CASE
          WHEN "role"::text = 'USER' THEN 'USER'::"public"."Role_new"
          WHEN "role"::text = 'EDITOR' THEN 'EDITOR'::"public"."Role_new"
          WHEN "role"::text = 'ADMIN' THEN 'ADMIN'::"public"."Role_new"
          ELSE 'USER'::"public"."Role_new"
        END;

        -- Drop old column and enum
        ALTER TABLE "public"."users" DROP COLUMN "role";
        DROP TYPE "public"."Role";

        -- Rename new enum and column
        ALTER TYPE "public"."Role_new" RENAME TO "Role";
        ALTER TABLE "public"."users" RENAME COLUMN "role_new" TO "role";
    END IF;
END $$;

-- Add User-Member linking column to users table (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'linkedMemberId') THEN
        ALTER TABLE "public"."users" ADD COLUMN "linkedMemberId" TEXT;
    END IF;
END $$;

-- Add unique constraint for User-Member linking (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_linkedMemberId_key') THEN
        ALTER TABLE "public"."users" ADD CONSTRAINT "users_linkedMemberId_key" UNIQUE ("linkedMemberId");
    END IF;
END $$;

-- Add foreign key for User-Member linking (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_linkedMemberId_fkey') THEN
        ALTER TABLE "public"."users" ADD CONSTRAINT "users_linkedMemberId_fkey"
          FOREIGN KEY ("linkedMemberId") REFERENCES "public"."members"("id")
          ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Add memberNumber to members table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'members' AND column_name = 'memberNumber') THEN
        ALTER TABLE "public"."members" ADD COLUMN "memberNumber" TEXT;

        -- Generate member numbers for existing members
        UPDATE "public"."members" SET "memberNumber" = 'MB' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY "createdAt") AS TEXT), 6, '0');

        -- Make memberNumber NOT NULL and unique
        ALTER TABLE "public"."members" ALTER COLUMN "memberNumber" SET NOT NULL;
        ALTER TABLE "public"."members" ADD CONSTRAINT "members_memberNumber_key" UNIQUE ("memberNumber");
    END IF;
END $$;

-- Add country field to members if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'members' AND column_name = 'country') THEN
        ALTER TABLE "public"."members" ADD COLUMN "country" TEXT DEFAULT 'Sweden';
    END IF;
END $$;