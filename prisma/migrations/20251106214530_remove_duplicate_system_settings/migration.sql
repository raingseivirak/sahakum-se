/*
  Warnings:

  - You are about to drop the `system_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."system_settings" DROP CONSTRAINT "system_settings_updatedBy_fkey";

-- DropTable
DROP TABLE "public"."system_settings";
