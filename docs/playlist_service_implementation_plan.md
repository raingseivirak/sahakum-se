# Playlist Service - Implementation Plan
**Created**: March 4, 2026  
**Project**: Sahakum Khmer CMS - YouTube Playlist/Karaoke Service

---

## 📋 Executive Summary

**Service Purpose**: Offer a shared YouTube playlist/karaoke room service for community events

**Business Model**: Service offering (not internal tool)

**Target Users**: Khmer community groups organizing events (no bars, family/community events only)

**Key Requirements**:
- ✅ Anonymous users: 4 hours max, auto-close at 10pm local time
- ✅ Logged-in users: 4 hours max, auto-close at 10pm local time  
- ✅ Admin extension: Can extend specific room codes beyond 4 hours/10pm limit
- ✅ Multi-language support: EN/SV/KM (public pages only, admin stays English)
- ✅ **Admin Service Control**: Turn service on/off globally via admin portal
- ✅ **Room Creation Policy**: Admin toggles allow anon users OR only logged-in users
- ✅ **Concurrent Room Limit**: Max 100 active rooms at once
- ✅ **Real-time Sync**: Use Supabase Realtime (already integrated)

---

## 🏗️ Current Project Structure Analysis

### ✅ **Existing Infrastructure We Can Leverage**

**Authentication & Authorization**:
- ✅ NextAuth.js with User/Session models
- ✅ Role-based access (admin/user)
- ✅ Admin middleware (`src/lib/admin-auth-middleware.ts`)

**Database**:
- ✅ PostgreSQL + Prisma ORM
- ✅ User model with role support
- ✅ Session management

**Frontend Framework**:
- ✅ Next.js 14.2 with App Router
- ✅ Internationalization (next-intl) for EN/SV/KM
- ✅ Tailwind CSS + shadcn/ui components
- ✅ Swedish Design System components ready

**Real-time Infrastructure**:
- ✅ Supabase Database (PostgreSQL)
- ✅ Supabase Realtime available (broadcast + presence)
- ✅ Deployment: Vercel (Next.js) + Supabase (DB + Realtime)

**UI Components Available**:
- ✅ Cards, Buttons, Forms, Tabs, Dialogs
- ✅ Sweden Typography components
- ✅ Toast notifications (can be added)
- ✅ Modal/Dialog system

**API Infrastructure**:
- ✅ Next.js API routes pattern established
- ✅ Consistent error handling patterns
- ✅ Admin-protected API routes

### ❌ **What We Need to Add**

**Service Settings (Admin Control)**:
- ❌ Global service on/off toggle
- ❌ Room creation policy (anon allowed vs logged-in only)
- ❌ Concurrent room limit enforcement (100 max)

**Real-time Communication**:
- ❌ Supabase Realtime channels for room updates
- ❌ Presence tracking for participants

**New Database Models**:
- ❌ Room, Participant, QueueItem, PlaybackState tables
- ❌ PlaylistServiceSettings table (service configuration)

**External APIs**:
- ✅ No YouTube API needed - users paste links directly
- ❌ YouTube oEmbed API (free, no key) for optional metadata

**New UI Screens**:
- ❌ Public: Landing, Join, Room, Display Mode
- ❌ Admin: Service Settings, Room Management, Extensions

---

## 🗄️ Database Schema Design

### **New Prisma Models** (to add to `prisma/schema.prisma`)

```prisma
// ==========================================
// PLAYLIST SERVICE MODELS
// ==========================================

// Service Configuration (Admin Control)
model PlaylistServiceSettings {
  id                    String   @id @default("playlist_service_settings") // Singleton
  
  // Global Service Control
  serviceEnabled        Boolean  @default(true)  // Admin can turn service on/off
  allowAnonRooms        Boolean  @default(true)  // Allow anonymous users to create rooms
  
  // Limits
  maxConcurrentRooms    Int      @default(100)   // Maximum active rooms
  maxRoomDurationHours  Int      @default(4)     // Default max duration
  eveningCutoffHour     Int      @default(22)    // 10pm cutoff (24-hour format)
  
  // Rate Limits
  roomCreationPerIpHour Int      @default(3)
  videoAddPerUserSec    Int      @default(10)    // Seconds between adds
  
  // Features (removed YouTube API quota tracking - not needed)
  
  // Admin Info
  updatedAt             DateTime @updatedAt
  updatedBy             String?  // Admin user ID who last updated
  updatedByUser         User?    @relation("PlaylistSettingsUpdater", fields: [updatedBy], references: [id])
  
  @@map("playlist_service_settings")
}

model PlaylistRoom {
  id                String              @id @default(cuid())
  roomCode          String              @unique // 6-char short code
  
  // Ownership
  ownerType         RoomOwnerType       @default(ANON)
  ownerId           String?             // userId if ownerType = USER
  owner             User?               @relation("RoomOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  adminSessionToken String              @unique // JWT token for admin auth
  
  // Lifecycle
  createdAt         DateTime            @default(now())
  expiresAt         DateTime            // Calculated: now + 4h OR 10pm today
  extendedUntil     DateTime?           // Admin can extend
  extendedBy        String?             // Admin userId who extended
  extendedByUser    User?               @relation("RoomExtender", fields: [extendedBy], references: [id])
  
  // Settings (JSON for flexibility)
  settings          Json                @default("{\"autoplay\":true,\"allowGuestsAdd\":true,\"karaokeEnabled\":false,\"defaultSlotMinutes\":4}")
  
  // Features
  karaokeEnabled    Boolean             @default(false)
  allowGuestsAdd    Boolean             @default(true)
  autoplay          Boolean             @default(true)
  
  // Timezone for 10pm calculation
  timezone          String              @default("Europe/Stockholm") // IANA timezone
  
  // Relations
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
  
  // Identity
  nickname      String        // Display name in room
  userId        String?       // If logged in
  user          User?         @relation("PlaylistParticipants", fields: [userId], references: [id], onDelete: SetNull)
  
  // Session
  sessionToken  String        @unique // For reconnection
  role          ParticipantRole @default(PARTICIPANT)
  
  // Activity
  joinedAt      DateTime      @default(now())
  lastSeenAt    DateTime      @default(now())
  isActive      Boolean       @default(true)
  
  // IP for rate limiting
  ipAddress     String?
  
  // Relations
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
  
  // YouTube Video
  youtubeVideoId      String              // e.g., "dQw4w9WgXcQ" (extracted from URL)
  youtubeUrl          String              // Full URL (user pasted)
  title               String?             // Optional: from oEmbed or user input
  durationSeconds     Int?                // Optional: not critical for MVP
  thumbnailUrl        String?             // Auto-generated: https://img.youtube.com/vi/{videoId}/default.jpg
  
  // Queue Management
  queueOrder          Int                 // Position in queue
  state               QueueItemState      @default(QUEUED)
  
  // Who Added
  addedById           String
  addedBy             PlaylistParticipant @relation("ItemAdder", fields: [addedById], references: [id], onDelete: Cascade)
  addedAt             DateTime            @default(now())
  
  // Karaoke Fields (optional)
  performerId         String?
  performer           PlaylistParticipant? @relation("ItemPerformer", fields: [performerId], references: [id], onDelete: SetNull)
  slotDurationSeconds Int?                // Override default slot
  etaStart            DateTime?           // Calculated ETA start
  etaEnd              DateTime?           // Calculated ETA end
  
  // Playback tracking
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
  
  // Current Playback
  currentItemId   String?       // Currently playing QueueItem
  positionSeconds Float         @default(0)
  isPlaying       Boolean       @default(false)
  
  // State Management
  lastUpdatedAt   DateTime      @default(now())
  updatedBy       String?       // Participant ID who triggered update
  
  @@index([roomId])
  @@map("playlist_playback_states")
}

// Enums
enum RoomOwnerType {
  ANON
  USER
}

enum ParticipantRole {
  ADMIN
  PARTICIPANT
  DISPLAY // Read-only display device
}

enum QueueItemState {
  QUEUED
  PLAYING
  PLAYED
  SKIPPED
  REMOVED
}
```

### **Updates to Existing User Model**

```prisma
// Add to User model relations:
model User {
  // ... existing fields ...
  
  // Playlist Service Relations
  ownedPlaylistRooms      PlaylistRoom[]              @relation("RoomOwner")
  extendedPlaylistRooms   PlaylistRoom[]              @relation("RoomExtender")
  playlistParticipation   PlaylistParticipant[]       @relation("PlaylistParticipants")
  playlistSettingsUpdates PlaylistServiceSettings[]   @relation("PlaylistSettingsUpdater")
}
```

---

## 📁 Project Structure

### **New Directories & Files to Create**

```
sahakum-khmer-se/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   └── playlist/                    # PUBLIC PAGES (multilingual)
│   │   │       ├── page.tsx                 # Landing: Create/Join
│   │   │       ├── create/
│   │   │       │   └── page.tsx            # Create room flow
│   │   │       ├── join/
│   │   │       │   └── page.tsx            # Join with code
│   │   │       └── room/
│   │   │           └── [code]/
│   │   │               ├── page.tsx         # Main room interface
│   │   │               ├── display/
│   │   │               │   └── page.tsx    # Full-screen display mode
│   │   │               └── admin/
│   │   │                   └── page.tsx    # Admin control panel (optional)
│   │   │
│   │   │   └── admin/                       # ADMIN PAGES (English only)
│   │   │       └── playlist/
│   │   │           ├── page.tsx            # All rooms dashboard
│   │   │           ├── settings/
│   │   │           │   └── page.tsx        # Service settings (on/off, policies)
│   │   │           └── [id]/
│   │   │               └── page.tsx        # Room details + extension
│   │   │
│   │   └── api/
│   │       └── playlist/
│   │           ├── rooms/
│   │           │   ├── route.ts            # POST: Create room
│   │           │   └── [code]/
│   │           │       ├── route.ts        # GET: Room details
│   │           │       ├── join/
│   │           │       │   └── route.ts    # POST: Join room
│   │           │       ├── items/
│   │           │       │   ├── route.ts    # POST: Add video, GET: List
│   │           │       │   └── [itemId]/
│   │           │       │       └── route.ts # DELETE: Remove item
│   │           │       ├── controls/
│   │           │       │   └── route.ts    # POST: Play/pause/skip
│   │           │       ├── extend/
│   │           │       │   └── route.ts    # POST: Admin extend expiry
│   │           │       └── playback/
│   │           │           └── route.ts    # GET: Current playback state
│   │           ├── settings/
│   │           │   └── route.ts            # GET/PATCH: Service settings (admin only)
│   │           ├── stats/
│   │           │   └── route.ts            # GET: Service stats (active rooms, quota)
│   │           └── youtube/
│   │               └── parse/
│   │                   └── route.ts        # POST: Parse YouTube URL (extract ID)
│   │
│   ├── components/
│   │   └── playlist/
│   │       ├── room-landing.tsx            # Create/Join UI
│   │       ├── join-modal.tsx              # Nickname input
│   │       ├── room-header.tsx             # Room code + expiry timer
│   │       ├── now-playing.tsx             # YouTube embed
│   │       ├── queue-list.tsx              # Queue items
│   │       ├── add-video-form.tsx          # YouTube URL input
│   │       ├── participants-list.tsx       # Active users
│   │       ├── admin-controls.tsx          # Play/pause/skip
│   │       ├── service-disabled-notice.tsx # Show when service is off
│   │       ├── room-limit-notice.tsx       # Show when 100 rooms reached
│   │       ├── karaoke-schedule.tsx        # Karaoke mode UI
│   │       ├── display-view.tsx            # Projector UI
│   │       └── expiry-warning.tsx          # Countdown toast
│   │
│   ├── lib/
│   │   ├── playlist/
│   │   │   ├── room-manager.ts             # Room lifecycle logic
│   │   │   ├── supabase-realtime.ts        # Supabase Realtime setup
│   │   │   ├── youtube-parser.ts           # Extract video ID from URL (no API)
│   │   │   ├── expiry-calculator.ts        # 4h + 10pm logic
│   │   │   ├── service-settings.ts         # Get/update service config
│   │   │   └── rate-limiter.ts             # IP-based limits
│   │   └── playlist-auth.ts                # Admin token validation
│   │
│   └── types/
│       └── playlist.ts                     # TypeScript interfaces
│
├── scripts/
│   └── seed-playlist-test.ts              # Seed test rooms
│
└── prisma/
    └── migrations/
        └── XXXXXX_add_playlist_models/
            └── migration.sql               # Generated migration
```

---

## 🚀 Implementation Phases

### **Phase 1: Foundation (Week 1-2)**

#### **Database Setup**
- [ ] Add Prisma models to schema
- [ ] Create migration: `npx prisma migrate dev --name add_playlist_models`
- [ ] Test schema with seed script

#### **YouTube URL Parsing (No API Key Needed)**
- [ ] Create `lib/playlist/youtube-parser.ts`
  - Extract video ID from various URL formats:
    - `https://www.youtube.com/watch?v=VIDEO_ID`
    - `https://youtu.be/VIDEO_ID`
    - `https://www.youtube.com/embed/VIDEO_ID`
  - Generate thumbnail URL: `https://img.youtube.com/vi/{videoId}/default.jpg`
  - Optional: Use oEmbed for title (no API key): `https://www.youtube.com/oembed?url={videoUrl}&format=json`

#### **Room Expiry Logic**
- [ ] Create `lib/playlist/expiry-calculator.ts`
  ```typescript
  // Calculate: min(now + 4h, today_10pm_in_timezone)
  function calculateRoomExpiry(timezone: string): Date
  ```

#### **Basic API Routes**
- [ ] `POST /api/playlist/rooms` - Create room
- [ ] `POST /api/playlist/rooms/[code]/join` - Join room
- [ ] `GET /api/playlist/rooms/[code]` - Room details
- [ ] `POST /api/playlist/rooms/[code]/items` - Add video (validate URL format only)
- [ ] `DELETE /api/playlist/rooms/[code]/items/[itemId]` - Remove video

---

### **Phase 2: Core Features (Week 3-4)**

#### **Landing & Join Flow**
- [ ] `/[locale]/playlist/page.tsx` - Create as guest/user OR join with code
- [ ] `/[locale]/playlist/create/page.tsx` - Room creation flow
- [ ] `/[locale]/playlist/join/page.tsx` - Join modal with nickname

#### **Room Interface**
- [ ] `/[locale]/playlist/room/[code]/page.tsx`
  - Now Playing (YouTube iframe embed)
  - Queue list
  - Add video form
  - Participants list
  - Admin controls (if admin)
  - Expiry countdown timer

#### **Components**
- [ ] `RoomHeader` - Room code, share link, expiry timer
- [ ] `NowPlaying` - YouTube iframe with controls
- [ ] `QueueList` - Sortable list of upcoming videos
- [ ] `AddVideoForm` - URL input with validation
- [ ] `ParticipantsList` - Active users
- [ ] `AdminControls` - Play/pause/skip/clear buttons
- [ ] `ExpiryWarning` - Toast at 10min, 5min, 1min before close

#### **Admin Token System**
- [ ] Generate JWT token on room creation
- [ ] Store in localStorage/cookie
- [ ] Validate token in API middleware
- [ ] Protect admin-only actions

---

### **Phase 3: Real-time Sync (Week 5)**

#### **Supabase Realtime Integration**

**Why Supabase Realtime is Perfect:**
- ✅ Already using Supabase for database
- ✅ Built-in Presence tracking (who's in room)
- ✅ Broadcast for room events
- ✅ Automatic reconnection handling
- ✅ Free tier: 200 concurrent connections, 2M messages/month

**Implementation:**

- [ ] Install Supabase client: `npm install @supabase/supabase-js`
- [ ] Create `lib/playlist/supabase-realtime.ts`
- [ ] Implement channel management:

```typescript
// lib/playlist/supabase-realtime.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function createRoomChannel(roomCode: string) {
  return supabase.channel(`room:${roomCode}`, {
    config: {
      presence: { key: roomCode }
    }
  })
}

// Server: Broadcast events
export async function broadcastRoomEvent(
  roomCode: string, 
  event: string, 
  payload: any
) {
  const channel = createRoomChannel(roomCode)
  await channel.send({
    type: 'broadcast',
    event,
    payload
  })
}
```

- [ ] Implement Realtime events:
  - `item_added` - New video added to queue
  - `item_removed` - Video removed
  - `playback_update` - Play/pause/position sync
  - `participant_joined` - User joined
  - `participant_left` - User left
  - `room_expired` - Force close room
  - `settings_changed` - Admin updated settings

#### **Client Realtime Hook**
- [ ] Create `hooks/usePlaylistRealtime.ts`

```typescript
export function usePlaylistRealtime(roomCode: string) {
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomCode}`)
      .on('broadcast', { event: 'item_added' }, (payload) => {
        // Update queue state
      })
      .on('broadcast', { event: 'playback_update' }, (payload) => {
        // Sync playback
      })
      .on('presence', { event: 'sync' }, () => {
        // Update participants list
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomCode])
}
```

#### **Presence Tracking**
- [ ] Track active participants using Supabase Presence
- [ ] Auto-remove participants after 30s inactivity
- [ ] Show "User X joined/left" toasts

---

### **Phase 4: Display Mode (Week 6)**

#### **Display View**
- [ ] `/[locale]/playlist/room/[code]/display/page.tsx`
  - Full-screen layout
  - Large typography (Sweden Design System)
  - Now Performing: Singer name + song title
  - On Deck: Next 2-3 songs
  - Progress bar + countdown
  - No controls (read-only)

#### **Display Device Token**
- [ ] Optional: Generate display-specific token
- [ ] Restrict display route to admin-issued tokens

---

### **Phase 5: Admin Extensions (Week 7)**

#### **Admin Dashboard**
- [ ] `/[locale]/admin/playlist/page.tsx`
  - List all active rooms
  - Filter: active/expired/extended
  - Quick actions: view, extend, close

#### **Room Extension**
- [ ] `/[locale]/admin/playlist/[id]/page.tsx`
  - Room details
  - Current expiry time
  - Extend form: Add hours or set custom expiry
  - Activity log

#### **Extension API**
- [ ] `POST /api/playlist/rooms/[code]/extend`
  - Admin-only (check User.role === ADMIN)
  - Update `extendedUntil` field
  - Broadcast to room participants

---

### **Phase 6: Karaoke Mode (Phase 2 - Optional)**

- [ ] Toggle karaoke mode in room settings
- [ ] Assign performers to queue items
- [ ] Calculate ETA for each slot
- [ ] "On deck" notifications (5 min before)
- [ ] Schedule view panel
- [ ] No-show handling (skip/move to end)

---

## 🔐 Security Considerations

### **Rate Limiting**
```typescript
// lib/playlist/rate-limiter.ts
- Room creation: 3 per IP per hour
- Join attempts: 10 per IP per hour
- Add video: 1 per 10 seconds per user
- Nickname changes: 3 per room per user
```

### **Admin Token Security**
- Use JWT with short expiry (4 hours matching room)
- Sign with `NEXTAUTH_SECRET`
- Validate on every admin action
- Never expose in URL params (use headers or cookies)

### **YouTube URL Validation**
```typescript
// Prevent non-embeddable videos
- Check video.status.embeddable === true
- Reject age-restricted (contentDetails.contentRating)
- Reject private/unlisted (optional)
```

### **Profanity Filter**
```typescript
// Nickname validation
- Length: 2-20 characters
- Pattern: alphanumeric + basic punctuation
- Profanity check: Use library or simple blacklist
- Uniqueness: Per room
```

---

## 📊 Non-Functional Requirements

### **Performance**
- [ ] YouTube metadata caching (Redis or in-memory)
  - Cache video metadata for 24 hours
  - Reduce API quota usage
- [ ] WebSocket connection pooling
- [ ] Lazy load queue items (paginate if > 50)

### **Scalability**
- [ ] Stateless API design (JWT tokens, no server sessions)
- [ ] WebSocket sticky sessions or Redis adapter
- [ ] Database indexes on `roomCode`, `expiresAt`

### **Monitoring**
- [ ] Log room lifecycle events
  - Room created/expired/extended
  - Admin actions (skip, extend, clear)
- [ ] Alert on YouTube API quota near limit
- [ ] Track active rooms count

### **Observability**
```typescript
// Activity logging for:
- Room creation (owner, timezone, expiry)
- Room extension (admin, new expiry)
- Video additions (who, what, when)
- Admin actions (skip, clear, extend)
```

---

## 🌍 Internationalization

### **Multilingual Pages (EN/SV/KM)**
- Landing page
- Join modal
- Room interface labels
- Error messages
- Expiry warnings

### **Admin Pages (English Only)**
- Admin dashboard
- Room management
- Extension interface

### **Translation Keys** (add to `messages/*.json`)
```json
{
  "playlist": {
    "landing": {
      "title": "Shared Playlist Service",
      "createButton": "Create Room",
      "joinButton": "Join Room"
    },
    "room": {
      "expiresIn": "Room expires in {minutes} minutes",
      "addVideo": "Add YouTube video",
      "nowPlaying": "Now Playing",
      "upNext": "Up Next"
    },
    "errors": {
      "invalidUrl": "Invalid YouTube URL",
      "roomExpired": "This room has expired",
      "notEmbeddable": "This video cannot be embedded"
    }
  }
}
```

---

## 🧪 Testing Strategy

### **Unit Tests**
- [ ] `expiry-calculator.ts` - Test 4h + 10pm logic across timezones
- [ ] `youtube-api.ts` - Mock API responses
- [ ] Room lifecycle state transitions

### **Integration Tests**
- [ ] Create room → join → add video → playback flow
- [ ] Admin extension flow
- [ ] Expiry at 10pm in different timezones
- [ ] WebSocket reconnection

### **Manual Testing Scenarios**
1. Create anon room at 6pm → expires at 10pm (not 10pm next day)
2. Create anon room at 10:30pm → expires at 2:30am (4 hours)
3. Admin extends room → expiry updates, participants notified
4. Add 20 videos → queue ordering maintained
5. YouTube iframe autoplays next video
6. Display mode on projector → clean full-screen UI

---

## 📦 Dependencies to Add

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0", // Real-time via Supabase
    "date-fns-tz": "^3.2.0",            // Timezone calculations
    "nanoid": "^5.0.7"                  // Short room codes
  }
}
```

**Note**: No YouTube API key needed! Videos are embedded directly via iframe.

---

## 🚀 Deployment Considerations

### **Vercel Configuration**
```json
// vercel.json (if needed)
{
  "functions": {
    "src/app/api/playlist/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

### **Environment Variables**
```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Playlist Service Settings
PLAYLIST_DEFAULT_TIMEZONE="Europe/Stockholm"
PLAYLIST_ANON_ROOM_HOURS="4"
PLAYLIST_EVENING_CUTOFF_HOUR="22" # 10pm
PLAYLIST_MAX_CONCURRENT_ROOMS="100"
```

**Note**: No YouTube API key needed!

### **Database Migrations**
```bash
# Before deployment
npm run db:migrate

# Vercel build command (update in package.json)
"build": "node scripts/setup-schema.js && prisma migrate deploy && next build"
```

---

## 📈 Success Metrics

### **MVP Success Criteria**
- [ ] Anon users can create rooms in < 30 seconds
- [ ] Room expiry logic works correctly (4h + 10pm)
- [ ] YouTube videos play synchronized across all participants
- [ ] Admins can extend room expiry from dashboard
- [ ] Display mode renders clean full-screen UI

### **Performance Targets**
- Room creation: < 2s
- Join room: < 1s
- Add video: < 3s (including YouTube API fetch)
- Playback sync latency: < 500ms
- WebSocket reconnection: < 2s

### **Usage Metrics to Track**
- Rooms created per day
- Average room duration
- Videos added per room
- Admin extensions per week
- Display mode usage rate

---

## ⚠️ Risks & Mitigations

### **Risk 1: YouTube Embed Restrictions**
- **Issue**: Some videos have "embedding disabled" by uploader
- **Impact**: Video won't play in iframe, shows error message
- **Mitigation**: 
  - Show clear error to user: "This video cannot be embedded"
  - Allow users to remove and add different video
  - Optional: Use oEmbed API to pre-check (free, no API key)

### **Risk 2: Supabase Realtime Connection Limits**
- **Free tier**: 200 concurrent connections
- **Usage**: With 100 rooms × 5 avg participants = 500 connections (exceeds limit)
- **Mitigation**:
  - Monitor connection usage
  - Consider Supabase Pro plan ($25/mo = 500 connections)
  - OR implement polling fallback (every 3s) when connections full

### **Risk 3: YouTube Autoplay Mobile Restrictions**
- **Issue**: iOS Safari blocks autoplay without user interaction
- **Mitigation**:
  - Display "Tap to play" button on mobile
  - Document limitation in help text
  - Admin device should be laptop/desktop for best experience

### **Risk 4: 10pm Calculation Timezone Errors**
- **Issue**: User's browser timezone may differ from room timezone
- **Mitigation**:
  - Default to Europe/Stockholm (Sweden)
  - Display expiry in both local time and room timezone
  - Test extensively with different timezones

---

## 🎯 MVP Scope Summary

### **IN SCOPE (Phase 1)**
✅ Create room (anon + logged-in)  
✅ Join with nickname  
✅ Add/remove YouTube videos  
✅ Queue management  
✅ Admin playback controls (play/pause/skip/clear)  
✅ Autoplay next video  
✅ 4-hour expiry + 10pm cutoff logic  
✅ Admin room extension  
✅ Basic display mode (for mirroring)  
✅ Real-time sync (WebSocket)  
✅ Multilingual (EN/SV/KM)  

### **OUT OF SCOPE (Phase 2 - Future)**
❌ Karaoke mode full features  
❌ Self-assign performers  
❌ ETA notifications  
❌ Lyrics integration  
❌ Video search within app  
❌ Playlist history/replay  
❌ Social features (comments, reactions)  
❌ Mobile apps (web-only MVP)  

---

## 📅 Timeline Estimate

**Total Duration**: 7-8 weeks (1 developer, full-time)

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1: Foundation | 2 weeks | Database, YouTube API, Basic APIs |
| Phase 2: Core Features | 2 weeks | Landing, Room UI, Join flow |
| Phase 3: Real-time Sync | 1 week | WebSocket integration |
| Phase 4: Display Mode | 1 week | Projector UI |
| Phase 5: Admin Extensions | 1 week | Admin dashboard, Extension |
| Testing & Polish | 1 week | Bug fixes, UX improvements |

---

## ✅ Next Steps

1. **~~Get YouTube API Key~~** ✅ **NOT NEEDED** - Users paste links directly

2. **✅ Supabase Realtime** - Already have Supabase, just enable Realtime channels

3. **Create Database Migration**
   ```bash
   # Add models to prisma/schema.prisma
   npx prisma migrate dev --name add_playlist_service_models
   ```

4. **Start with Core Implementation**
   - Service settings model & admin page
   - Create room endpoint with service checks
   - YouTube URL parser (no API)
   - Basic room interface

5. **Build Landing Page**
   - Check if service is enabled
   - Check room creation policy (anon allowed?)
   - Create/Join buttons
   - Room code input

---

## 📞 Open Questions for Stakeholders

1. **~~YouTube API Quota~~**: ✅ **RESOLVED** - No API needed, users paste links
2. **Room Limits**: ✅ **CONFIRMED** - 100 max concurrent rooms
3. **User Accounts**: ✅ **CONFIRMED** - Same 4h+10pm rules as anon users
4. **Branding**: Should this be "Sahakum Playlist Service" or separate brand?
5. **Supabase Plan**: Free tier = 200 connections. Need to upgrade to Pro ($25/mo) for 500 connections?

---

**End of Implementation Plan**
