-- CreateEnum
CREATE TYPE "public"."InitiativeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."Visibility" AS ENUM ('PUBLIC', 'MEMBERS_ONLY');

-- CreateEnum
CREATE TYPE "public"."InitiativeCategory" AS ENUM ('CULTURAL_EVENT', 'BUSINESS', 'EDUCATION', 'TRANSLATION', 'SOCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MemberRole" AS ENUM ('LEAD', 'CO_LEAD', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."UpdateType" AS ENUM ('MILESTONE', 'UPDATE', 'ANNOUNCEMENT');

-- CreateTable
CREATE TABLE "public"."initiatives" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "public"."InitiativeStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "public"."Visibility" NOT NULL DEFAULT 'PUBLIC',
    "category" "public"."InitiativeCategory" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "featuredImage" TEXT,
    "projectLeadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "initiatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."initiative_translations" (
    "id" TEXT NOT NULL,
    "initiativeId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "seoTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "initiative_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."initiative_members" (
    "id" TEXT NOT NULL,
    "initiativeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."MemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contributionNote" TEXT,

    CONSTRAINT "initiative_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tasks" (
    "id" TEXT NOT NULL,
    "initiativeId" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleSv" TEXT,
    "titleKm" TEXT,
    "descriptionEn" TEXT,
    "descriptionSv" TEXT,
    "descriptionKm" TEXT,
    "assignedToId" TEXT,
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "public"."TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."initiative_updates" (
    "id" TEXT NOT NULL,
    "initiativeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."UpdateType" NOT NULL DEFAULT 'UPDATE',
    "images" TEXT[],
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "initiative_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "initiatives_slug_key" ON "public"."initiatives"("slug");

-- CreateIndex
CREATE INDEX "initiatives_status_idx" ON "public"."initiatives"("status");

-- CreateIndex
CREATE INDEX "initiatives_visibility_idx" ON "public"."initiatives"("visibility");

-- CreateIndex
CREATE INDEX "initiatives_category_idx" ON "public"."initiatives"("category");

-- CreateIndex
CREATE INDEX "initiatives_projectLeadId_idx" ON "public"."initiatives"("projectLeadId");

-- CreateIndex
CREATE UNIQUE INDEX "initiative_translations_initiativeId_language_key" ON "public"."initiative_translations"("initiativeId", "language");

-- CreateIndex
CREATE INDEX "initiative_members_userId_idx" ON "public"."initiative_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "initiative_members_initiativeId_userId_key" ON "public"."initiative_members"("initiativeId", "userId");

-- CreateIndex
CREATE INDEX "tasks_initiativeId_idx" ON "public"."tasks"("initiativeId");

-- CreateIndex
CREATE INDEX "tasks_assignedToId_idx" ON "public"."tasks"("assignedToId");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "public"."tasks"("status");

-- CreateIndex
CREATE INDEX "initiative_updates_initiativeId_idx" ON "public"."initiative_updates"("initiativeId");

-- CreateIndex
CREATE INDEX "initiative_updates_userId_idx" ON "public"."initiative_updates"("userId");

-- AddForeignKey
ALTER TABLE "public"."initiatives" ADD CONSTRAINT "initiatives_projectLeadId_fkey" FOREIGN KEY ("projectLeadId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."initiative_translations" ADD CONSTRAINT "initiative_translations_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "public"."initiatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."initiative_members" ADD CONSTRAINT "initiative_members_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "public"."initiatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."initiative_members" ADD CONSTRAINT "initiative_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tasks" ADD CONSTRAINT "tasks_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "public"."initiatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."initiative_updates" ADD CONSTRAINT "initiative_updates_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "public"."initiatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."initiative_updates" ADD CONSTRAINT "initiative_updates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
