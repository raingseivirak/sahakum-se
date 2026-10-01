-- Khmer Connections business directory
CREATE TYPE "public"."BusinessStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'CHANGES_REQUESTED', 'SUSPENDED');
CREATE TYPE "public"."BusinessServiceArea" AS ENUM ('LOCAL', 'NATIONWIDE', 'ONLINE', 'INTERNATIONAL');
CREATE TYPE "public"."BusinessLocationVisibility" AS ENUM ('EXACT', 'CITY_ONLY', 'ONLINE_ONLY');

CREATE TABLE "public"."business_categories" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameSv" TEXT NOT NULL,
  "nameKm" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "business_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."business_tags" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "business_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."businesses" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "logoUrl" TEXT,
  "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "phone" TEXT,
  "email" TEXT,
  "website" TEXT,
  "facebookUrl" TEXT,
  "instagramUrl" TEXT,
  "address" TEXT,
  "city" TEXT NOT NULL,
  "region" TEXT,
  "postalCode" TEXT,
  "country" TEXT NOT NULL DEFAULT 'Sweden',
  "serviceArea" "public"."BusinessServiceArea" NOT NULL DEFAULT 'LOCAL',
  "locationVisibility" "public"."BusinessLocationVisibility" NOT NULL DEFAULT 'CITY_ONLY',
  "displayOwnerName" BOOLEAN NOT NULL DEFAULT false,
  "status" "public"."BusinessStatus" NOT NULL DEFAULT 'DRAFT',
  "reviewNote" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewedById" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."business_tag_assignments" (
  "businessId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  CONSTRAINT "business_tag_assignments_pkey" PRIMARY KEY ("businessId", "tagId")
);

CREATE UNIQUE INDEX "business_categories_slug_key" ON "public"."business_categories"("slug");
CREATE UNIQUE INDEX "business_tags_slug_key" ON "public"."business_tags"("slug");
CREATE UNIQUE INDEX "businesses_slug_key" ON "public"."businesses"("slug");
CREATE INDEX "businesses_ownerId_idx" ON "public"."businesses"("ownerId");
CREATE INDEX "businesses_categoryId_idx" ON "public"."businesses"("categoryId");
CREATE INDEX "businesses_status_featured_idx" ON "public"."businesses"("status", "featured");
CREATE INDEX "businesses_country_city_idx" ON "public"."businesses"("country", "city");
CREATE INDEX "business_tag_assignments_tagId_idx" ON "public"."business_tag_assignments"("tagId");

ALTER TABLE "public"."businesses" ADD CONSTRAINT "businesses_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."businesses" ADD CONSTRAINT "businesses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."business_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."businesses" ADD CONSTRAINT "businesses_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."business_tag_assignments" ADD CONSTRAINT "business_tag_assignments_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."business_tag_assignments" ADD CONSTRAINT "business_tag_assignments_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."business_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "public"."business_categories" ("id", "slug", "nameEn", "nameSv", "nameKm", "order", "updatedAt") VALUES
  ('kc_cat_food', 'food-catering', 'Food & Catering', 'Mat & catering', 'ម្ហូបអាហារ និងសេវាម្ហូប', 10, CURRENT_TIMESTAMP),
  ('kc_cat_beauty', 'beauty-wellness', 'Beauty & Wellness', 'Skönhet & hälsa', 'សម្រស់ និងសុខភាព', 20, CURRENT_TIMESTAMP),
  ('kc_cat_trade', 'shops-retail', 'Shops & Retail', 'Butiker & handel', 'ហាង និងពាណិជ្ជកម្ម', 30, CURRENT_TIMESTAMP),
  ('kc_cat_professional', 'professional-services', 'Professional Services', 'Professionella tjänster', 'សេវាកម្មវិជ្ជាជីវៈ', 40, CURRENT_TIMESTAMP),
  ('kc_cat_home', 'home-services', 'Home Services', 'Hushållstjänster', 'សេវាកម្មតាមផ្ទះ', 50, CURRENT_TIMESTAMP),
  ('kc_cat_creative', 'creative-media', 'Creative & Media', 'Kreativt & media', 'ច្នៃប្រឌិត និងប្រព័ន្ធផ្សព្វផ្សាយ', 60, CURRENT_TIMESTAMP),
  ('kc_cat_education', 'education-training', 'Education & Training', 'Utbildning & kurser', 'ការអប់រំ និងបណ្តុះបណ្តាល', 70, CURRENT_TIMESTAMP),
  ('kc_cat_travel', 'travel-events', 'Travel & Events', 'Resor & evenemang', 'ទេសចរណ៍ និងព្រឹត្តិការណ៍', 80, CURRENT_TIMESTAMP),
  ('kc_cat_other', 'other', 'Other', 'Övrigt', 'ផ្សេងៗ', 999, CURRENT_TIMESTAMP);

INSERT INTO "public"."business_tags" ("id", "slug", "name") VALUES
  ('kc_tag_khmer', 'khmer-speaking', 'Khmer speaking'),
  ('kc_tag_swedish', 'swedish-speaking', 'Swedish speaking'),
  ('kc_tag_english', 'english-speaking', 'English speaking'),
  ('kc_tag_online', 'online', 'Online'),
  ('kc_tag_delivery', 'delivery', 'Delivery'),
  ('kc_tag_booking', 'booking-required', 'Booking required'),
  ('kc_tag_family', 'family-friendly', 'Family friendly');
