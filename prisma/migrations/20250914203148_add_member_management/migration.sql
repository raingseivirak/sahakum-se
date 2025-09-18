-- CreateEnum
CREATE TYPE "public"."MemberType" AS ENUM ('REGULAR', 'BOARD', 'VOLUNTEER', 'HONORARY', 'LIFETIME');

-- CreateTable
CREATE TABLE "public"."members" (
    "id" TEXT NOT NULL,
    "memberNumber" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'Sweden',
    "memberType" "public"."MemberType" NOT NULL DEFAULT 'REGULAR',
    "joinedDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "emergencyContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_memberNumber_key" ON "public"."members"("memberNumber");
