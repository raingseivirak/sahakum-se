/*
  Warnings:

  - You are about to drop the column `fileType` on the `media_files` table. All the data in the column will be lost.
  - Added the required column `category` to the `media_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `media_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `media_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `media_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `media_files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."media_files" DROP COLUMN "fileType",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "filename" TEXT NOT NULL,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uploadedBy" TEXT;

-- AddForeignKey
ALTER TABLE "public"."media_files" ADD CONSTRAINT "media_files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
