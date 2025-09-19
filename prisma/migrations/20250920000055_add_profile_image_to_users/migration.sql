-- CreateTable - Adding profileImage field to existing users table
-- This migration adds profile image support for user avatars

-- AlterTable
ALTER TABLE "users" ADD COLUMN "profileImage" TEXT;

-- Note: This field is nullable to allow existing users without profile images
-- Users can upload profile images through the admin interface