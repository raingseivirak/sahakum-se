-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('INTERNAL', 'BLOG', 'EXTERNAL', 'CUSTOM');

-- CreateTable
CREATE TABLE "public"."services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "public"."ServiceType" NOT NULL DEFAULT 'INTERNAL',
    "featuredImg" TEXT,
    "colorTheme" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_translations" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "buttonText" TEXT NOT NULL DEFAULT 'Explore',

    CONSTRAINT "service_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "public"."services"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "service_translations_serviceId_language_key" ON "public"."service_translations"("serviceId", "language");

-- AddForeignKey
ALTER TABLE "public"."service_translations" ADD CONSTRAINT "service_translations_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
