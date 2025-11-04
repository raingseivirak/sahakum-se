-- CreateEnum
CREATE TYPE "public"."JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."initiative_join_requests" (
    "id" TEXT NOT NULL,
    "initiativeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "initiative_join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "initiative_join_requests_status_idx" ON "public"."initiative_join_requests"("status");

-- CreateIndex
CREATE INDEX "initiative_join_requests_initiativeId_idx" ON "public"."initiative_join_requests"("initiativeId");

-- CreateIndex
CREATE INDEX "initiative_join_requests_userId_idx" ON "public"."initiative_join_requests"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "initiative_join_requests_initiativeId_userId_key" ON "public"."initiative_join_requests"("initiativeId", "userId");

-- AddForeignKey
ALTER TABLE "public"."initiative_join_requests" ADD CONSTRAINT "initiative_join_requests_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "public"."initiatives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."initiative_join_requests" ADD CONSTRAINT "initiative_join_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."initiative_join_requests" ADD CONSTRAINT "initiative_join_requests_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
