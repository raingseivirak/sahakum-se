-- AlterTable
ALTER TABLE "public"."membership_requests" ADD COLUMN     "rejectionReason" TEXT;

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

-- AddForeignKey
ALTER TABLE "public"."membership_request_status_history" ADD CONSTRAINT "membership_request_status_history_membershipRequestId_fkey" FOREIGN KEY ("membershipRequestId") REFERENCES "public"."membership_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_request_status_history" ADD CONSTRAINT "membership_request_status_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
