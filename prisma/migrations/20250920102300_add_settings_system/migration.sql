-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'JSON', 'URL', 'EMAIL', 'IMAGE');

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "type" "SettingType" NOT NULL DEFAULT 'TEXT',
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");