-- CreateEnum
CREATE TYPE "public"."ResidenceStatus" AS ENUM ('STUDENT', 'WORK_PERMIT', 'PERMANENT_RESIDENT', 'CITIZEN', 'EU_CITIZEN', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'ADDITIONAL_INFO_REQUESTED', 'APPROVED', 'REJECTED', 'WITHDRAWN');

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
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Sweden',
    "residenceStatus" "public"."ResidenceStatus" NOT NULL,
    "residenceSince" TIMESTAMP(3),
    "motivation" TEXT,
    "hearAboutUs" TEXT,
    "interests" TEXT,
    "skills" TEXT,
    "status" "public"."RequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedMemberType" "public"."MemberType" NOT NULL DEFAULT 'REGULAR',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "rejectionReason" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdMemberId" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "membership_requests_requestNumber_key" ON "public"."membership_requests"("requestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "membership_requests_createdMemberId_key" ON "public"."membership_requests"("createdMemberId");

-- AddForeignKey
ALTER TABLE "public"."membership_requests" ADD CONSTRAINT "membership_requests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_requests" ADD CONSTRAINT "membership_requests_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_requests" ADD CONSTRAINT "membership_requests_createdMemberId_fkey" FOREIGN KEY ("createdMemberId") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
