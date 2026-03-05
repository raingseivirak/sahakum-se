# Playlist Service - Implementation Roadmap
**Created**: March 4, 2026  
**Project**: Sahakum Khmer CMS - YouTube Playlist Service  
**Estimated Duration**: 7-8 weeks (1 full-time developer)

---

## 🎯 Implementation Strategy

This roadmap breaks down the implementation into 6 phases, each building on the previous one. Each phase is designed to deliver working, testable features.

---

## 📅 Phase 1: Foundation (Week 1-2)
**Goal**: Database, core utilities, no UI yet

### Tasks:

#### 1.1 Database Schema
**File**: `prisma/schema.prisma`

```prisma
// Add these 5 new models:

model PlaylistServiceSettings {
  id                    String   @id @default("playlist_service_settings")
  serviceEnabled        Boolean  @default(true)
  allowAnonRooms        Boolean  @default(true)
  maxConcurrentRooms    Int      @default(100)
  maxRoomDurationHours  Int      @default(4)
  eveningCutoffHour     Int      @default(22)
  roomCreationPerIpHour Int      @default(3)
  videoAddPerUserSec    Int      @default(10)
  updatedAt             DateTime @updatedAt
  updatedBy             String?
  updatedByUser         User?    @relation("PlaylistSettingsUpdater", fields: [updatedBy], references: [id])
  
  @@map("playlist_service_settings")
}

model PlaylistRoom {
  id                String              @id @default(cuid())
  roomCode          String              @unique
  ownerType         RoomOwnerType       @default(ANON)
  ownerId           String?
  owner             User?               @relation("RoomOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  adminSessionToken String              @unique
  createdAt         DateTime            @default(now())
  expiresAt         DateTime
  extendedUntil     DateTime?
  extendedBy        String?
  extendedByUser    User?               @relation("RoomExtender", fields: [extendedBy], references: [id])
  settings          Json                @default("{\"autoplay\":true,\"allowGuestsAdd\":true,\"karaokeEnabled\":false}")
  karaokeEnabled    Boolean             @default(false)
  allowGuestsAdd    Boolean             @default(true)
  autoplay          Boolean             @default(true)
  timezone          String              @default("Europe/Stockholm")
  participants      PlaylistParticipant[]
  queueItems        PlaylistQueueItem[]
  playbackState     PlaylistPlaybackState?
  
  @@index([roomCode])
  @@index([ownerId])
  @@index([expiresAt])
  @@map("playlist_rooms")
}

model PlaylistParticipant {
  id            String        @id @default(cuid())
  roomId        String
  room          PlaylistRoom  @relation(fields: [roomId], references: [id], onDelete: Cascade)
  nickname      String
  userId        String?
  user          User?         @relation("PlaylistParticipants", fields: [userId], references: [id], onDelete: SetNull)
  sessionToken  String        @unique
  role          ParticipantRole @default(PARTICIPANT)
  joinedAt      DateTime      @default(now())
  lastSeenAt    DateTime      @default(now())
  isActive      Boolean       @default(true)
  ipAddress     String?
  addedItems    PlaylistQueueItem[] @relation("ItemAdder")
  performedItems PlaylistQueueItem[] @relation("ItemPerformer")
  
  @@index([roomId])
  @@index([sessionToken])
  @@map("playlist_participants")
}

model PlaylistQueueItem {
  id                  String              @id @default(cuid())
  roomId              String
  room                PlaylistRoom        @relation(fields: [roomId], references: [id], onDelete: Cascade)
  youtubeVideoId      String
  youtubeUrl          String
  title               String?
  durationSeconds     Int?
  thumbnailUrl        String?
  queueOrder          Int
  state               QueueItemState      @default(QUEUED)
  addedById           String
  addedBy             PlaylistParticipant @relation("ItemAdder", fields: [addedById], references: [id], onDelete: Cascade)
  addedAt             DateTime            @default(now())
  performerId         String?
  performer           PlaylistParticipant? @relation("ItemPerformer", fields: [performerId], references: [id], onDelete: SetNull)
  slotDurationSeconds Int?
  etaStart            DateTime?
  etaEnd              DateTime?
  playedAt            DateTime?
  skippedAt           DateTime?
  
  @@index([roomId, queueOrder])
  @@index([roomId, state])
  @@map("playlist_queue_items")
}

model PlaylistPlaybackState {
  id              String        @id @default(cuid())
  roomId          String        @unique
  room            PlaylistRoom  @relation(fields: [roomId], references: [id], onDelete: Cascade)
  currentItemId   String?
  positionSeconds Float         @default(0)
  isPlaying       Boolean       @default(false)
  lastUpdatedAt   DateTime      @default(now())
  updatedBy       String?
  
  @@index([roomId])
  @@map("playlist_playback_states")
}

enum RoomOwnerType {
  ANON
  USER
}

enum ParticipantRole {
  ADMIN
  PARTICIPANT
  DISPLAY
}

enum QueueItemState {
  QUEUED
  PLAYING
  PLAYED
  SKIPPED
  REMOVED
}

// Update User model - add these relations:
model User {
  // ... existing fields ...
  
  ownedPlaylistRooms      PlaylistRoom[]              @relation("RoomOwner")
  extendedPlaylistRooms   PlaylistRoom[]              @relation("RoomExtender")
  playlistParticipation   PlaylistParticipant[]       @relation("PlaylistParticipants")
  playlistSettingsUpdates PlaylistServiceSettings[]   @relation("PlaylistSettingsUpdater")
}
```

**Commands**:
```bash
# Add models to schema
# Then run:
npx prisma migrate dev --name add_playlist_service

# Generate Prisma client
npx prisma generate
```

---

#### 1.2 Seed Initial Settings
**File**: `scripts/seed-playlist-settings.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const settings = await prisma.playlistServiceSettings.upsert({
    where: { id: 'playlist_service_settings' },
    update: {},
    create: {
      id: 'playlist_service_settings',
      serviceEnabled: true,
      allowAnonRooms: true,
      maxConcurrentRooms: 100,
      maxRoomDurationHours: 4,
      eveningCutoffHour: 22,
      roomCreationPerIpHour: 3,
      videoAddPerUserSec: 10,
    },
  })

  console.log('✅ Playlist service settings seeded:', settings)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Run**: `npx tsx scripts/seed-playlist-settings.ts`

---

#### 1.3 YouTube URL Parser
**File**: `src/lib/playlist/youtube-parser.ts`

```typescript
export interface YouTubeVideoInfo {
  videoId: string
  url: string
  thumbnailUrl: string
  embedUrl: string
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // Just the ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Parse YouTube URL and return video info
 */
export function parseYouTubeUrl(url: string): YouTubeVideoInfo | null {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/default.jpg`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  }
}

/**
 * Validate YouTube URL format
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null
}

/**
 * Optional: Fetch video title from oEmbed (no API key needed)
 */
export async function fetchVideoTitle(videoId: string): Promise<string | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const response = await fetch(url)
    if (!response.ok) return null
    
    const data = await response.json()
    return data.title || null
  } catch {
    return null
  }
}
```

---

#### 1.4 Expiry Calculator
**File**: `src/lib/playlist/expiry-calculator.ts`

```typescript
import { addHours, setHours, setMinutes, setSeconds, min, isAfter } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

/**
 * Calculate room expiry: min(now + durationHours, today at cutoffHour)
 * 
 * Examples:
 * - Created at 2pm, duration 4h, cutoff 22 (10pm) → expires at 6pm (4h)
 * - Created at 7pm, duration 4h, cutoff 22 (10pm) → expires at 10pm (3h)
 * - Created at 11pm, duration 4h, cutoff 22 (10pm) → expires at 3am next day (4h)
 */
export function calculateRoomExpiry(
  timezone: string = 'Europe/Stockholm',
  durationHours: number = 4,
  cutoffHour: number = 22
): Date {
  // Get current time in the specified timezone
  const now = new Date()
  const zonedNow = utcToZonedTime(now, timezone)

  // Calculate expiry based on duration
  const durationExpiry = addHours(zonedNow, durationHours)

  // Calculate today's cutoff time
  let todayCutoff = setHours(zonedNow, cutoffHour)
  todayCutoff = setMinutes(todayCutoff, 0)
  todayCutoff = setSeconds(todayCutoff, 0)

  // If current time is already past today's cutoff, use duration only
  if (isAfter(zonedNow, todayCutoff)) {
    return zonedTimeToUtc(durationExpiry, timezone)
  }

  // Otherwise, use the minimum of duration and cutoff
  const expiryInZone = min([durationExpiry, todayCutoff])
  return zonedTimeToUtc(expiryInZone, timezone)
}

/**
 * Check if room has expired
 */
export function isRoomExpired(expiresAt: Date, extendedUntil?: Date | null): boolean {
  const effectiveExpiry = extendedUntil || expiresAt
  return isAfter(new Date(), effectiveExpiry)
}

/**
 * Get minutes until expiry
 */
export function getMinutesUntilExpiry(expiresAt: Date, extendedUntil?: Date | null): number {
  const effectiveExpiry = extendedUntil || expiresAt
  const diff = effectiveExpiry.getTime() - Date.now()
  return Math.max(0, Math.floor(diff / 1000 / 60))
}
```

---

#### 1.5 Service Settings Helper
**File**: `src/lib/playlist/service-settings.ts`

```typescript
import { prisma } from '@/lib/db'

const SETTINGS_ID = 'playlist_service_settings'

/**
 * Get service settings (cached for performance)
 */
let cachedSettings: any = null
let cacheTime = 0
const CACHE_TTL = 60000 // 1 minute

export async function getServiceSettings() {
  const now = Date.now()
  
  if (cachedSettings && (now - cacheTime) < CACHE_TTL) {
    return cachedSettings
  }

  const settings = await prisma.playlistServiceSettings.findUnique({
    where: { id: SETTINGS_ID },
  })

  if (!settings) {
    throw new Error('Playlist service settings not found')
  }

  cachedSettings = settings
  cacheTime = now
  return settings
}

/**
 * Update service settings (admin only)
 */
export async function updateServiceSettings(
  updates: Partial<{
    serviceEnabled: boolean
    allowAnonRooms: boolean
    maxConcurrentRooms: number
    maxRoomDurationHours: number
    eveningCutoffHour: number
  }>,
  adminUserId: string
) {
  const settings = await prisma.playlistServiceSettings.update({
    where: { id: SETTINGS_ID },
    data: {
      ...updates,
      updatedBy: adminUserId,
    },
  })

  // Clear cache
  cachedSettings = null

  return settings
}

/**
 * Check if service is enabled
 */
export async function isServiceEnabled(): Promise<boolean> {
  const settings = await getServiceSettings()
  return settings.serviceEnabled
}

/**
 * Check if anonymous users can create rooms
 */
export async function canAnonCreateRooms(): Promise<boolean> {
  const settings = await getServiceSettings()
  return settings.allowAnonRooms
}

/**
 * Get count of active rooms
 */
export async function getActiveRoomsCount(): Promise<number> {
  return await prisma.playlistRoom.count({
    where: {
      OR: [
        { expiresAt: { gt: new Date() }, extendedUntil: null },
        { extendedUntil: { gt: new Date() } },
      ],
    },
  })
}

/**
 * Check if room limit reached
 */
export async function isRoomLimitReached(): Promise<boolean> {
  const settings = await getServiceSettings()
  const activeCount = await getActiveRoomsCount()
  return activeCount >= settings.maxConcurrentRooms
}
```

---

#### 1.6 Install Dependencies
```bash
npm install @supabase/supabase-js date-fns-tz nanoid
```

**✅ Phase 1 Complete when:**
- [ ] Database migrated successfully
- [ ] Initial settings seeded
- [ ] YouTube parser can extract video IDs
- [ ] Expiry calculator works with different times/timezones
- [ ] Service settings helper returns correct values

---

## 📅 Phase 2: Core APIs & Admin Settings (Week 3-4)
**Goal**: Admin can control service, basic room creation works

### Tasks:

#### 2.1 Service Settings API
**File**: `src/app/api/playlist/settings/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceSettings, updateServiceSettings } from '@/lib/playlist/service-settings'

// GET - Get current settings
export async function GET() {
  try {
    const settings = await getServiceSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PATCH - Update settings (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const settings = await updateServiceSettings(body, session.user.id)

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
```

---

#### 2.2 Service Stats API
**File**: `src/app/api/playlist/stats/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getActiveRoomsCount } from '@/lib/playlist/service-settings'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const activeRooms = await getActiveRoomsCount()
    
    const totalParticipants = await prisma.playlistParticipant.count({
      where: {
        isActive: true,
        room: {
          OR: [
            { expiresAt: { gt: new Date() }, extendedUntil: null },
            { extendedUntil: { gt: new Date() } },
          ],
        },
      },
    })

    return NextResponse.json({
      activeRooms,
      totalParticipants,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
```

---

#### 2.3 Admin Settings Page
**File**: `src/app/[locale]/admin/playlist/settings/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { SwedenH1, SwedenH2, SwedenBody } from '@/components/ui/sweden-typography'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

export default function PlaylistSettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const [settingsRes, statsRes] = await Promise.all([
      fetch('/api/playlist/settings'),
      fetch('/api/playlist/stats'),
    ])

    setSettings(await settingsRes.json())
    setStats(await statsRes.json())
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    await fetch('/api/playlist/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setSaving(false)
    alert('Settings saved!')
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="container py-8">
      <SwedenH1>Playlist Service Settings</SwedenH1>

      {/* Stats */}
      <Card className="p-6 mb-6">
        <SwedenH2>Current Status</SwedenH2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <SwedenBody className="text-gray-600">Active Rooms</SwedenBody>
            <div className="text-3xl font-bold">
              {stats?.activeRooms}/{settings?.maxConcurrentRooms}
            </div>
          </div>
          <div>
            <SwedenBody className="text-gray-600">Total Participants</SwedenBody>
            <div className="text-3xl font-bold">{stats?.totalParticipants}</div>
          </div>
        </div>
      </Card>

      {/* Settings Form */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Service Enabled */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Service Enabled</Label>
              <SwedenBody className="text-sm text-gray-600">
                Turn the entire playlist service on or off
              </SwedenBody>
            </div>
            <Switch
              checked={settings?.serviceEnabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, serviceEnabled: checked })
              }
            />
          </div>

          {/* Allow Anon Rooms */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Anonymous Room Creation</Label>
              <SwedenBody className="text-sm text-gray-600">
                Let non-logged-in users create rooms
              </SwedenBody>
            </div>
            <Switch
              checked={settings?.allowAnonRooms}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowAnonRooms: checked })
              }
            />
          </div>

          {/* Max Concurrent Rooms */}
          <div>
            <Label>Max Concurrent Rooms</Label>
            <Input
              type="number"
              value={settings?.maxConcurrentRooms}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxConcurrentRooms: parseInt(e.target.value),
                })
              }
            />
          </div>

          {/* Max Room Duration */}
          <div>
            <Label>Default Room Duration (hours)</Label>
            <Input
              type="number"
              value={settings?.maxRoomDurationHours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxRoomDurationHours: parseInt(e.target.value),
                })
              }
            />
          </div>

          {/* Evening Cutoff */}
          <div>
            <Label>Evening Cutoff Hour (24h format)</Label>
            <Input
              type="number"
              min="0"
              max="23"
              value={settings?.eveningCutoffHour}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  eveningCutoffHour: parseInt(e.target.value),
                })
              }
            />
            <SwedenBody className="text-sm text-gray-600">
              Rooms expire at this hour (e.g., 22 = 10pm)
            </SwedenBody>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
```

---

#### 2.4 Create Room API
**File**: `src/app/api/playlist/rooms/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/db'
import {
  isServiceEnabled,
  canAnonCreateRooms,
  isRoomLimitReached,
  getServiceSettings,
} from '@/lib/playlist/service-settings'
import { calculateRoomExpiry } from '@/lib/playlist/expiry-calculator'
import jwt from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    // Check if service is enabled
    if (!(await isServiceEnabled())) {
      return NextResponse.json(
        { error: 'Service is currently unavailable' },
        { status: 503 }
      )
    }

    // Check room limit
    if (await isRoomLimitReached()) {
      return NextResponse.json(
        { error: 'Room limit reached. Please try again later.' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)
    const isLoggedIn = !!session?.user

    // Check if anon users can create rooms
    if (!isLoggedIn && !(await canAnonCreateRooms())) {
      return NextResponse.json(
        { error: 'Please login to create a room' },
        { status: 403 }
      )
    }

    const settings = await getServiceSettings()
    
    // Generate room code (6 characters)
    const roomCode = nanoid(6).toUpperCase()

    // Calculate expiry
    const expiresAt = calculateRoomExpiry(
      'Europe/Stockholm',
      settings.maxRoomDurationHours,
      settings.eveningCutoffHour
    )

    // Generate admin session token
    const adminToken = jwt.sign(
      { roomCode, role: 'admin' },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: `${settings.maxRoomDurationHours}h` }
    )

    // Create room
    const room = await prisma.playlistRoom.create({
      data: {
        roomCode,
        ownerType: isLoggedIn ? 'USER' : 'ANON',
        ownerId: session?.user?.id,
        adminSessionToken: adminToken,
        expiresAt,
        timezone: 'Europe/Stockholm',
      },
    })

    // Create playback state
    await prisma.playlistPlaybackState.create({
      data: {
        roomId: room.id,
      },
    })

    return NextResponse.json({
      roomCode: room.roomCode,
      adminToken,
      expiresAt: room.expiresAt,
    })
  } catch (error) {
    console.error('Create room error:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}
```

**Note**: Need to add `jsonwebtoken`:
```bash
npm install jsonwebtoken @types/jsonwebtoken
```

---

#### 2.5 Landing Page
**File**: `src/app/[locale]/playlist/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SwedenH1, SwedenBody } from '@/components/ui/sweden-typography'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function PlaylistLandingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [serviceEnabled, setServiceEnabled] = useState(false)
  const [roomCode, setRoomCode] = useState('')

  useEffect(() => {
    checkServiceStatus()
  }, [])

  async function checkServiceStatus() {
    const res = await fetch('/api/playlist/settings')
    const settings = await res.json()
    setServiceEnabled(settings.serviceEnabled)
    setLoading(false)
  }

  async function handleCreateRoom() {
    const res = await fetch('/api/playlist/rooms', { method: 'POST' })
    const data = await res.json()

    if (res.ok) {
      // Store admin token
      localStorage.setItem(`playlist_admin_${data.roomCode}`, data.adminToken)
      router.push(`/playlist/room/${data.roomCode}`)
    } else {
      alert(data.error)
    }
  }

  function handleJoinRoom() {
    if (!roomCode) return
    router.push(`/playlist/room/${roomCode.toUpperCase()}`)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!serviceEnabled) {
    return (
      <div className="container py-16 text-center">
        <SwedenH1>Playlist Service</SwedenH1>
        <Card className="max-w-md mx-auto mt-8 p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <SwedenBody className="text-xl">
            Service Temporarily Unavailable
          </SwedenBody>
          <SwedenBody className="text-gray-600 mt-4">
            The playlist service is currently offline for maintenance.
            Please check back later.
          </SwedenBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-16">
      <SwedenH1 className="text-center">Shared Playlist Service</SwedenH1>

      <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-2 gap-8">
        {/* Create Room */}
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <SwedenBody className="text-2xl mb-4">Create Room</SwedenBody>
          <SwedenBody className="text-gray-600 mb-6">
            Start a new shared playlist for your event
          </SwedenBody>
          <Button size="lg" onClick={handleCreateRoom} className="w-full">
            Create New Room
          </Button>
        </Card>

        {/* Join Room */}
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🚪</div>
          <SwedenBody className="text-2xl mb-4">Join Room</SwedenBody>
          <SwedenBody className="text-gray-600 mb-6">
            Enter a room code to join an existing playlist
          </SwedenBody>
          <Input
            placeholder="Room Code"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="mb-4"
          />
          <Button
            size="lg"
            variant="outline"
            onClick={handleJoinRoom}
            disabled={!roomCode}
            className="w-full"
          >
            Join Room
          </Button>
        </Card>
      </div>
    </div>
  )
}
```

**✅ Phase 2 Complete when:**
- [ ] Admin can access settings page
- [ ] Admin can toggle service on/off
- [ ] Settings save successfully
- [ ] Room creation respects service settings
- [ ] Landing page shows correct states
- [ ] Room codes generated and stored

---

## 📅 Phase 3: Room Interface & Video Management (Week 5)
**Goal**: Users can join rooms, add videos, see queue

### Tasks:

#### 3.1 Add Video API
**File**: `src/app/api/playlist/rooms/[code]/items/route.ts`

```typescript
// POST - Add video to queue
// GET - Get queue items
// Includes YouTube URL validation
```

#### 3.2 Playback Controls API
**File**: `src/app/api/playlist/rooms/[code]/controls/route.ts`

```typescript
// POST - Handle play/pause/skip/clear
// Admin only
```

#### 3.3 Room Components
Create these components:
- `room-header.tsx` - Room code, expiry timer, share link
- `now-playing.tsx` - YouTube embed
- `queue-list.tsx` - Upcoming videos
- `add-video-form.tsx` - URL input with validation
- `participants-list.tsx` - Active users
- `admin-controls.tsx` - Play/pause/skip buttons

#### 3.4 Main Room Page
**File**: `src/app/[locale]/playlist/room/[code]/page.tsx`

Integrate all components into main room interface.

**✅ Phase 3 Complete when:**
- [ ] Users can add YouTube videos
- [ ] Queue displays correctly
- [ ] Admin controls work
- [ ] Room info shows correctly
- [ ] Expiry countdown visible

---

## 📅 Phase 4: Real-time Sync (Week 6)
**Goal**: All participants see updates in real-time

### Tasks:

#### 4.1 Supabase Realtime Setup
**File**: `src/lib/playlist/supabase-realtime.ts`

```typescript
// Create channel management
// Broadcast functions
// Presence tracking
```

#### 4.2 Realtime Hook
**File**: `src/hooks/usePlaylistRealtime.ts`

```typescript
// Subscribe to room events
// Handle presence
// Update local state
```

#### 4.3 Integrate into Room Page
Update room page to use real-time updates.

**✅ Phase 4 Complete when:**
- [ ] Video additions broadcast to all users
- [ ] Playback syncs across devices
- [ ] Participants list updates live
- [ ] Reconnection works smoothly

---

## 📅 Phase 5: Display Mode & Admin Dashboard (Week 7)
**Goal**: Projector view and admin management

### Tasks:

#### 5.1 Display Mode Page
**File**: `src/app/[locale]/playlist/room/[code]/display/page.tsx`

Full-screen view for projectors.

#### 5.2 Admin Rooms Dashboard
**File**: `src/app/[locale]/admin/playlist/page.tsx`

List all rooms, with filters and actions.

#### 5.3 Room Extension Feature
Allow admins to extend room expiry.

**✅ Phase 5 Complete when:**
- [ ] Display mode renders correctly on projector
- [ ] Admin can see all active rooms
- [ ] Admin can extend room expiry
- [ ] Admin can force close rooms

---

## 📅 Phase 6: Polish & Testing (Week 8)
**Goal**: Production-ready

### Tasks:

#### 6.1 Translations
Add playlist UI text to `messages/en.json`, `sv.json`, `km.json`

#### 6.2 Error States
- Service disabled notice
- Room limit reached notice
- Anon users blocked notice
- Video embed failed notice
- Room expired notice

#### 6.3 Loading States
- Skeleton loaders
- Optimistic updates
- Loading spinners

#### 6.4 Testing Scenarios
- [ ] Service on/off toggle
- [ ] Anon room creation policy
- [ ] Room limit enforcement
- [ ] Expiry at 10pm (different times)
- [ ] Admin extension
- [ ] Real-time sync with 5+ users
- [ ] Mobile experience
- [ ] Display mode on projector

**✅ Phase 6 Complete when:**
- [ ] All error states handled gracefully
- [ ] All text translated to EN/SV/KM
- [ ] Loading states feel responsive
- [ ] Tested on desktop, mobile, tablet
- [ ] Admin portal fully functional
- [ ] Ready for production deployment

---

## 📊 Progress Tracking

Use this checklist to track overall progress:

- [ ] **Phase 1**: Foundation (Database, utilities)
- [ ] **Phase 2**: Admin settings & room creation
- [ ] **Phase 3**: Room interface & video management
- [ ] **Phase 4**: Real-time sync
- [ ] **Phase 5**: Display mode & admin dashboard
- [ ] **Phase 6**: Polish & testing

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Database migrated on production
- [ ] Environment variables set in Vercel
- [ ] Supabase Realtime enabled
- [ ] Service settings seeded
- [ ] Admin account tested
- [ ] Monitor Supabase connection usage
- [ ] Monitor active room count
- [ ] Test from multiple devices
- [ ] Test in all 3 languages

---

**Ready to start? Let's begin with Phase 1!**
