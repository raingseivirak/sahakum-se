-- AlterEnum
ALTER TYPE "public"."ResidenceStatus" ADD VALUE 'EU_CITIZEN';

-- AlterTable
ALTER TABLE "public"."membership_requests" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Sweden',
ADD COLUMN     "createdMemberId" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "hearAboutUs" TEXT,
ADD COLUMN     "interests" TEXT,
ADD COLUMN     "requestNumber" TEXT,
ADD COLUMN     "requestedMemberType" "public"."MembershipType" NOT NULL DEFAULT 'REGULAR',
ADD COLUMN     "residenceSince" TIMESTAMP(3),
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."members" ADD COLUMN     "memberNumber" TEXT;

-- Note: User table already supports the relation through the foreign key constraints

-- CreateIndex
CREATE UNIQUE INDEX "membership_requests_requestNumber_key" ON "public"."membership_requests"("requestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "members_memberNumber_key" ON "public"."members"("memberNumber");

-- AddForeignKey
ALTER TABLE "public"."membership_requests" ADD CONSTRAINT "membership_requests_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."membership_requests" ADD CONSTRAINT "membership_requests_createdMemberId_fkey" FOREIGN KEY ("createdMemberId") REFERENCES "public"."members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Generate unique numbers for existing records (Production Safe)
DO $$
DECLARE
    r RECORD;
    counter INTEGER := 1;
BEGIN
    -- Update existing membership requests with unique request numbers
    FOR r IN SELECT id FROM "public"."membership_requests" WHERE "requestNumber" IS NULL ORDER BY "createdAt"
    LOOP
        UPDATE "public"."membership_requests"
        SET "requestNumber" = 'REQ-2025-' || LPAD(counter::TEXT, 3, '0')
        WHERE id = r.id;
        counter := counter + 1;
    END LOOP;

    -- Reset counter for members
    counter := 1;

    -- Update existing members with unique member numbers
    FOR r IN SELECT id FROM "public"."members" WHERE "memberNumber" IS NULL ORDER BY "joinedAt"
    LOOP
        UPDATE "public"."members"
        SET "memberNumber" = 'MBR-2025-' || LPAD(counter::TEXT, 3, '0')
        WHERE id = r.id;
        counter := counter + 1;
    END LOOP;
END $$;

-- Now make the fields required and unique
ALTER TABLE "public"."membership_requests" ALTER COLUMN "requestNumber" SET NOT NULL;
ALTER TABLE "public"."members" ALTER COLUMN "memberNumber" SET NOT NULL;