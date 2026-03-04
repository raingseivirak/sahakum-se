-- Add OAuth fields to users table for NextAuth PrismaAdapter compatibility
-- (image and emailVerified are required by Google/Facebook OAuth providers)

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);
