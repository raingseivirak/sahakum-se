-- Migration to add firstName, lastName fields and rename active to isActive in users table
-- This migration matches the current database state

-- AlterTable
ALTER TABLE "users" RENAME COLUMN "active" TO "isActive";

-- AlterTable
ALTER TABLE "users" ADD COLUMN "firstName" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "lastName" TEXT;