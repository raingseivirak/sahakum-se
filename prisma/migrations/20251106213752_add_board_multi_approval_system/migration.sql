-- CreateEnum
CREATE TYPE "public"."ApprovalSystem" AS ENUM ('SINGLE', 'MULTI_BOARD');

-- CreateEnum
CREATE TYPE "public"."ApprovalThreshold" AS ENUM ('UNANIMOUS', 'MAJORITY', 'SIMPLE_MAJORITY', 'ANY_TWO', 'SINGLE');

-- CreateEnum
CREATE TYPE "public"."VoteDecision" AS ENUM ('APPROVE', 'REJECT', 'ABSTAIN');

-- AlterTable
ALTER TABLE "public"."membership_requests" ADD COLUMN     "approvalSystem" "public"."ApprovalSystem" NOT NULL DEFAULT 'SINGLE',
ADD COLUMN     "preferredLanguage" TEXT DEFAULT 'en';

-- CreateTable
CREATE TABLE "public"."board_member_votes" (
    "id" TEXT NOT NULL,
    "membershipRequestId" TEXT NOT NULL,
    "boardMemberId" TEXT NOT NULL,
    "vote" "public"."VoteDecision" NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "board_member_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_settings" (
    "id" TEXT NOT NULL,
    "settingKey" TEXT NOT NULL,
    "settingValue" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "board_member_votes_membershipRequestId_boardMemberId_key" ON "public"."board_member_votes"("membershipRequestId", "boardMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_settingKey_key" ON "public"."system_settings"("settingKey");

-- AddForeignKey
ALTER TABLE "public"."board_member_votes" ADD CONSTRAINT "board_member_votes_membershipRequestId_fkey" FOREIGN KEY ("membershipRequestId") REFERENCES "public"."membership_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."board_member_votes" ADD CONSTRAINT "board_member_votes_boardMemberId_fkey" FOREIGN KEY ("boardMemberId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_settings" ADD CONSTRAINT "system_settings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
