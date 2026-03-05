-- CreateEnum
CREATE TYPE "public"."RoomOwnerType" AS ENUM ('ANON', 'USER');

-- CreateEnum
CREATE TYPE "public"."ParticipantRole" AS ENUM ('ADMIN', 'PARTICIPANT', 'DISPLAY');

-- CreateEnum
CREATE TYPE "public"."QueueItemState" AS ENUM ('QUEUED', 'PLAYING', 'PLAYED', 'SKIPPED', 'REMOVED');

-- CreateTable: PlaylistServiceSettings (singleton configuration)
CREATE TABLE "public"."playlist_service_settings" (
    "id" TEXT NOT NULL DEFAULT 'playlist_service_settings',
    "serviceEnabled" BOOLEAN NOT NULL DEFAULT true,
    "allowAnonRooms" BOOLEAN NOT NULL DEFAULT true,
    "maxConcurrentRooms" INTEGER NOT NULL DEFAULT 100,
    "maxRoomDurationHours" INTEGER NOT NULL DEFAULT 4,
    "eveningCutoffHour" INTEGER NOT NULL DEFAULT 22,
    "roomCreationPerIpHour" INTEGER NOT NULL DEFAULT 3,
    "videoAddPerUserSec" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "playlist_service_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PlaylistRoom
CREATE TABLE "public"."playlist_rooms" (
    "id" TEXT NOT NULL,
    "roomCode" TEXT NOT NULL,
    "ownerType" "public"."RoomOwnerType" NOT NULL DEFAULT 'ANON',
    "ownerId" TEXT,
    "adminSessionToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "extendedUntil" TIMESTAMP(3),
    "extendedBy" TEXT,
    "karaokeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "allowGuestsAdd" BOOLEAN NOT NULL DEFAULT true,
    "autoplay" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Stockholm',

    CONSTRAINT "playlist_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PlaylistParticipant
CREATE TABLE "public"."playlist_participants" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "userId" TEXT,
    "sessionToken" TEXT NOT NULL,
    "role" "public"."ParticipantRole" NOT NULL DEFAULT 'PARTICIPANT',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "ipAddress" TEXT,

    CONSTRAINT "playlist_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PlaylistQueueItem
CREATE TABLE "public"."playlist_queue_items" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "title" TEXT,
    "durationSeconds" INTEGER,
    "thumbnailUrl" TEXT,
    "queueOrder" INTEGER NOT NULL,
    "state" "public"."QueueItemState" NOT NULL DEFAULT 'QUEUED',
    "addedById" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "performerId" TEXT,
    "slotDurationSeconds" INTEGER,
    "etaStart" TIMESTAMP(3),
    "etaEnd" TIMESTAMP(3),
    "playedAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),

    CONSTRAINT "playlist_queue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PlaylistPlaybackState
CREATE TABLE "public"."playlist_playback_states" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "currentItemId" TEXT,
    "positionSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPlaying" BOOLEAN NOT NULL DEFAULT false,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "playlist_playback_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraints
CREATE UNIQUE INDEX "playlist_rooms_roomCode_key" ON "public"."playlist_rooms"("roomCode");
CREATE UNIQUE INDEX "playlist_rooms_adminSessionToken_key" ON "public"."playlist_rooms"("adminSessionToken");
CREATE UNIQUE INDEX "playlist_participants_sessionToken_key" ON "public"."playlist_participants"("sessionToken");
CREATE UNIQUE INDEX "playlist_playback_states_roomId_key" ON "public"."playlist_playback_states"("roomId");

-- CreateIndex: Performance indexes
CREATE INDEX "playlist_rooms_roomCode_idx" ON "public"."playlist_rooms"("roomCode");
CREATE INDEX "playlist_rooms_ownerId_idx" ON "public"."playlist_rooms"("ownerId");
CREATE INDEX "playlist_rooms_expiresAt_idx" ON "public"."playlist_rooms"("expiresAt");
CREATE INDEX "playlist_participants_roomId_idx" ON "public"."playlist_participants"("roomId");
CREATE INDEX "playlist_participants_sessionToken_idx" ON "public"."playlist_participants"("sessionToken");
CREATE INDEX "playlist_queue_items_roomId_queueOrder_idx" ON "public"."playlist_queue_items"("roomId", "queueOrder");
CREATE INDEX "playlist_queue_items_roomId_state_idx" ON "public"."playlist_queue_items"("roomId", "state");
CREATE INDEX "playlist_playback_states_roomId_idx" ON "public"."playlist_playback_states"("roomId");

-- AddForeignKey: PlaylistServiceSettings -> User
ALTER TABLE "public"."playlist_service_settings" ADD CONSTRAINT "playlist_service_settings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: PlaylistRoom -> User (owner)
ALTER TABLE "public"."playlist_rooms" ADD CONSTRAINT "playlist_rooms_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: PlaylistRoom -> User (extender)
ALTER TABLE "public"."playlist_rooms" ADD CONSTRAINT "playlist_rooms_extendedBy_fkey" FOREIGN KEY ("extendedBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: PlaylistParticipant -> PlaylistRoom
ALTER TABLE "public"."playlist_participants" ADD CONSTRAINT "playlist_participants_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."playlist_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: PlaylistParticipant -> User
ALTER TABLE "public"."playlist_participants" ADD CONSTRAINT "playlist_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: PlaylistQueueItem -> PlaylistRoom
ALTER TABLE "public"."playlist_queue_items" ADD CONSTRAINT "playlist_queue_items_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."playlist_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: PlaylistQueueItem -> PlaylistParticipant (addedBy)
ALTER TABLE "public"."playlist_queue_items" ADD CONSTRAINT "playlist_queue_items_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "public"."playlist_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: PlaylistQueueItem -> PlaylistParticipant (performer)
ALTER TABLE "public"."playlist_queue_items" ADD CONSTRAINT "playlist_queue_items_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "public"."playlist_participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: PlaylistPlaybackState -> PlaylistRoom
ALTER TABLE "public"."playlist_playback_states" ADD CONSTRAINT "playlist_playback_states_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."playlist_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: Insert default service settings
INSERT INTO "public"."playlist_service_settings" (
    "id",
    "serviceEnabled",
    "allowAnonRooms",
    "maxConcurrentRooms",
    "maxRoomDurationHours",
    "eveningCutoffHour",
    "roomCreationPerIpHour",
    "videoAddPerUserSec",
    "updatedAt"
) VALUES (
    'playlist_service_settings',
    true,
    true,
    100,
    4,
    22,
    3,
    10,
    NOW()
) ON CONFLICT ("id") DO NOTHING;
