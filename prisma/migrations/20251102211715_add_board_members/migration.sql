-- CreateTable
CREATE TABLE "public"."board_members" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstNameKhmer" TEXT,
    "lastNameKhmer" TEXT,
    "profileImage" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isChairman" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "joinedBoard" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."board_member_translations" (
    "id" TEXT NOT NULL,
    "boardMemberId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_member_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "board_members_slug_key" ON "public"."board_members"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "board_member_translations_boardMemberId_language_key" ON "public"."board_member_translations"("boardMemberId", "language");

-- AddForeignKey
ALTER TABLE "public"."board_member_translations" ADD CONSTRAINT "board_member_translations_boardMemberId_fkey" FOREIGN KEY ("boardMemberId") REFERENCES "public"."board_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
