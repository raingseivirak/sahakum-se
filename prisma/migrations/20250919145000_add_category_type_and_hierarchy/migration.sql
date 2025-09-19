-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'general';

-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;