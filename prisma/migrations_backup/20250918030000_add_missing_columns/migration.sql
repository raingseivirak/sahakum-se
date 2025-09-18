-- Add missing columns to match local schema without data loss

-- Rename isActive to active for users table (preserving data)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'isActive') THEN
        ALTER TABLE "public"."users" RENAME COLUMN "isActive" TO "active";
    END IF;
END $$;

-- Add missing columns to services table
ALTER TABLE "public"."services" ADD COLUMN IF NOT EXISTS "icon" TEXT;
ALTER TABLE "public"."services" ADD COLUMN IF NOT EXISTS "featuredImg" TEXT;
ALTER TABLE "public"."services" ADD COLUMN IF NOT EXISTS "colorTheme" TEXT DEFAULT 'navy';

-- Add missing filename column to media_files
ALTER TABLE "public"."media_files" ADD COLUMN IF NOT EXISTS "filename" TEXT;
ALTER TABLE "public"."media_files" ADD COLUMN IF NOT EXISTS "originalName" TEXT;
ALTER TABLE "public"."media_files" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;

-- Update filename column to be unique (set filename = url for existing records)
UPDATE "public"."media_files" SET "filename" = "url" WHERE "filename" IS NULL;
UPDATE "public"."media_files" SET "originalName" = "url" WHERE "originalName" IS NULL;
UPDATE "public"."media_files" SET "mimeType" = 'image/jpeg' WHERE "mimeType" IS NULL;

-- Add unique constraint on filename
ALTER TABLE "public"."media_files" ADD CONSTRAINT "media_files_filename_key" UNIQUE ("filename");

-- Add missing columns to members table
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "firstNameKhmer" TEXT;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "lastNameKhmer" TEXT;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "membershipType" TEXT DEFAULT 'REGULAR';
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "residenceStatus" TEXT;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "joinedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "active" BOOLEAN DEFAULT true;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "profileImage" TEXT;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "skills" TEXT[] DEFAULT '{}';
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "interests" TEXT[] DEFAULT '{}';
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "emergencyContact" TEXT;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "emergencyPhone" TEXT;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "public"."members" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Add unique constraint on email for members
ALTER TABLE "public"."members" ADD CONSTRAINT "members_email_key" UNIQUE ("email");