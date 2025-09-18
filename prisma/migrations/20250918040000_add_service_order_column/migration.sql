-- Add missing order column to services table
ALTER TABLE "public"."services" ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;