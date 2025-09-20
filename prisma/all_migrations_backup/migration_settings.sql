-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('PAGE', 'POST');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."MembershipType" AS ENUM ('REGULAR', 'STUDENT', 'FAMILY', 'BOARD', 'VOLUNTEER', 'HONORARY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "public"."ResidenceStatus" AS ENUM ('CITIZEN', 'PERMANENT_RESIDENT', 'EU_CITIZEN', 'STUDENT', 'WORK_PERMIT', 'ASYLUM_SEEKER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'ADDITIONAL_INFO_REQUESTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."SettingType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'JSON', 'URL', 'EMAIL', 'IMAGE');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "password" TEXT,
    "profileImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."content_items" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "public"."ContentType" NOT NULL DEFAULT 'PAGE',
    "status" "public"."Status" NOT NULL DEFAULT 'DRAFT',
    "featuredImg" TEXT,
    "authorId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_translations" (
    "id" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "seoTitle" TEXT,
    "metaDescription" TEXT,

    CONSTRAINT "content_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parentId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'general',

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category_translations" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_item_categories" (
    "contentItemId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "content_item_categories_pkey" PRIMARY KEY ("contentItemId","categoryId")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tag_translations" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tag_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."content_item_tags" (
    "contentItemId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "content_item_tags_pkey" PRIMARY KEY ("contentItemId","tagId")
);

-- CreateTable
CREATE TABLE "public"."media_files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "caption" TEXT,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "category" TEXT NOT NULL DEFAULT 'images',
    "uploaderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "colorTheme" TEXT DEFAULT 'navy',
    "featuredImg" TEXT,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_translations" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL DEFAULT 'Learn More',

    CONSTRAINT "service_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."members" (
    "id" TEXT NOT NULL,
    "memberNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstNameKhmer" TEXT,
    "lastNameKhmer" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'Sweden',
    "membershipType" "public"."MembershipType" NOT NULL DEFAULT 'REGULAR',
    "residenceStatus" "public"."ResidenceStatus",
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "profileImage" TEXT,
    "bio" TEXT,
    "skills" TEXT[],
    "interests" TEXT[],
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."membership_requests" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstNameKhmer" TEXT,
    "lastNameKhmer" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Sweden',
    "residenceStatus" "public"."ResidenceStatus",
    "residenceSince" TIMESTAMP(3),
    "motivation" TEXT NOT NULL,
    "hearAboutUs" TEXT,
    "interests" TEXT,
    "skills" TEXT,
    "requestedMemberType" "public"."MembershipType" NOT NULL DEFAULT 'REGULAR',
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdMemberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminNotes" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "membership_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."membership_request_status_history" (
    "id" TEXT NOT NULL,
    "membershipRequestId" TEXT NOT NULL,
    "fromStatus" "public"."RequestStatus",
    "toStatus" "public"."RequestStatus" NOT NULL,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "membership_request_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "type" "public"."SettingType" NOT NULL DEFAULT 'TEXT',
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "public"."verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "public"."verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_slug_key" ON "public"."content_items"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "content_translations_contentItemId_language_key" ON "public"."content_translations"("contentItemId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_categoryId_language_key" ON "public"."category_translations"("categoryId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "public"."tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tag_translations_tagId_language_key" ON "public"."tag_translations"("tagId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "media_files_filename_key" ON "public"."media_files"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "public"."services"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "service_translations_serviceId_language_key" ON "public"."service_translations"("serviceId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "members_memberNumber_key" ON "public"."members"("memberNumber");

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "public"."members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "membership_requests_requestNumber_key" ON "public"."membership_requests"("requestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "public"."settings"("key");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_items" ADD CONSTRAINT "content_items_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_translations" ADD CONSTRAINT "content_translations_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "public"."content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."category_translations" ADD CONSTRAINT "category_translations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_item_categories" ADD CONSTRAINT "content_item_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_item_categories" ADD CONSTRAINT "content_item_categories_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "public"."content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tag_translations" ADD CONSTRAINT "tag_translations_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_item_tags" ADD CONSTRAINT "content_item_tags_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "public"."content_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content_item_tags" ADD CONSTRAINT "content_item_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media_files" ADD CONSTRAINT "media_files_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_translations" ADD CONSTRAINT "service_translations_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_requests" ADD CONSTRAINT "membership_requests_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_requests" ADD CONSTRAINT "membership_requests_createdMemberId_fkey" FOREIGN KEY ("createdMemberId") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_requests" ADD CONSTRAINT "membership_requests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_request_status_history" ADD CONSTRAINT "membership_request_status_history_membershipRequestId_fkey" FOREIGN KEY ("membershipRequestId") REFERENCES "public"."membership_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_request_status_history" ADD CONSTRAINT "membership_request_status_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

