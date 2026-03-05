# Playlist Service - Quick Summary
**Updated**: March 4, 2026

---

## ✅ **Final Requirements Confirmed**

### **Core Features**
- ✅ Shared YouTube playlist rooms for community events
- ✅ 4-hour duration for all users (anon + logged-in)
- ✅ Auto-close at 10pm local time (Stockholm timezone default)
- ✅ Admin can extend specific rooms beyond limits
- ✅ Max 100 concurrent rooms
- ✅ Multi-language: EN/SV/KM (public pages only)
- ✅ Admin portal: English only

### **Admin Service Control** ⭐ NEW
- ✅ **Global on/off toggle** - Turn entire service on/off
- ✅ **Room creation policy** - Toggle between:
  - Allow anonymous users to create rooms
  - Only logged-in users can create rooms

### **Technology Stack** ⭐ SIMPLIFIED
- ✅ **No YouTube API key needed** - Users just paste links
- ✅ **Supabase Realtime** for real-time sync (already using Supabase)
- ✅ **Vercel** for deployment (Next.js)
- ✅ **PostgreSQL** via Supabase

---

## 🎯 **Key Design Decisions**

### **1. No YouTube API Key Required** ✅
**Why it's better:**
- Zero setup complexity
- No API quota limits to worry about
- No daily rate limits
- Free forever

**How it works:**
```typescript
// Just parse the URL and extract video ID
const videoId = extractYouTubeId(url) // "dQw4w9WgXcQ"
const embedUrl = `https://www.youtube.com/embed/${videoId}`
const thumbnail = `https://img.youtube.com/vi/${videoId}/default.jpg`
```

**Optional enhancement:**
- Use YouTube oEmbed API (free, no key) to get video title
- URL: `https://www.youtube.com/oembed?url={videoUrl}&format=json`

---

### **2. Supabase Realtime** ✅
**Why it's perfect:**
- Already using Supabase for database
- Built-in Presence tracking (who's in room)
- Broadcast channels for events
- Automatic reconnection
- Free tier: 200 concurrent connections, 2M messages/month

**Real-time events:**
```typescript
supabase.channel('room:ABC123')
  .on('broadcast', { event: 'item_added' }, handleNewVideo)
  .on('broadcast', { event: 'playback_update' }, syncPlayback)
  .on('presence', { event: 'sync' }, updateParticipants)
  .subscribe()
```

**Note**: Free tier = 200 connections. With 100 rooms × average 5 participants = 500 connections needed. May need Supabase Pro ($25/mo).

---

### **3. Admin Service Settings**

**New database model:**
```prisma
model PlaylistServiceSettings {
  serviceEnabled      Boolean  @default(true)   // Turn service on/off
  allowAnonRooms      Boolean  @default(true)   // Anon can create?
  maxConcurrentRooms  Int      @default(100)    // Room limit
  maxRoomDurationHours Int     @default(4)      // Default 4h
  eveningCutoffHour   Int      @default(22)     // 10pm cutoff
}
```

**Admin UI:**
```
/[locale]/admin/playlist/settings
┌─────────────────────────────────────────┐
│ Playlist Service Settings               │
├─────────────────────────────────────────┤
│ ☑ Service Enabled                       │
│ ☑ Allow Anonymous Room Creation        │
│ Max Concurrent Rooms: [100]            │
│ Default Duration: [4] hours             │
│ Evening Cutoff: [22:00] (10pm)         │
│                                         │
│ Current Stats:                          │
│ - Active Rooms: 23/100                  │
│ - Total Participants: 87                │
│                                         │
│ [Save Changes]                          │
└─────────────────────────────────────────┘
```

---

## 📁 **Project Structure**

```
src/
├── app/
│   ├── [locale]/
│   │   ├── playlist/                    # PUBLIC (EN/SV/KM)
│   │   │   ├── page.tsx                # Landing
│   │   │   ├── create/page.tsx         # Create room
│   │   │   ├── join/page.tsx           # Join
│   │   │   └── room/[code]/
│   │   │       ├── page.tsx            # Room interface
│   │   │       └── display/page.tsx    # Projector view
│   │   │
│   │   └── admin/
│   │       └── playlist/               # ADMIN (English only)
│   │           ├── page.tsx           # All rooms dashboard
│   │           ├── settings/page.tsx  # Service settings ⭐
│   │           └── [id]/page.tsx      # Room management
│   │
│   └── api/
│       └── playlist/
│           ├── settings/route.ts       # Service settings API ⭐
│           ├── stats/route.ts          # Active rooms count
│           ├── rooms/route.ts          # Create room (check limits)
│           └── rooms/[code]/
│               ├── join/route.ts
│               ├── items/route.ts      # Add video
│               └── controls/route.ts   # Play/pause/skip
│
├── components/
│   └── playlist/
│       ├── room-landing.tsx
│       ├── service-disabled-notice.tsx  # ⭐ Show when off
│       ├── room-limit-notice.tsx        # ⭐ Show when 100 reached
│       ├── now-playing.tsx
│       ├── queue-list.tsx
│       └── admin-controls.tsx
│
└── lib/
    └── playlist/
        ├── supabase-realtime.ts        # Real-time channels
        ├── youtube-parser.ts           # Extract video ID (no API)
        ├── expiry-calculator.ts        # 4h + 10pm logic
        ├── service-settings.ts         # Get/update settings ⭐
        └── rate-limiter.ts             # IP limits
```

---

## 🗄️ **Database Models**

**5 new tables:**

1. **PlaylistServiceSettings** ⭐ - Admin configuration (singleton)
2. **PlaylistRoom** - Rooms with expiry logic
3. **PlaylistParticipant** - Users in rooms
4. **PlaylistQueueItem** - YouTube videos in queue
5. **PlaylistPlaybackState** - Current playback state

---

## 🚀 **Implementation Timeline**

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1**: Foundation | 2 weeks | Database, URL parser, Service settings |
| **Phase 2**: Core Features | 2 weeks | Landing, Room UI, Join flow |
| **Phase 3**: Real-time | 1 week | Supabase Realtime integration |
| **Phase 4**: Display Mode | 1 week | Projector full-screen view |
| **Phase 5**: Admin Portal | 1 week | Settings, Extensions, Stats |
| **Testing & Polish** | 1 week | Bug fixes, UX improvements |

**Total**: 7-8 weeks (1 full-time developer)

---

## 📋 **Room Creation Flow**

### **User visits `/playlist`:**

```
1. Check service settings:
   - Is service enabled?
     → NO: Show "Service temporarily unavailable"
   
   - User is anonymous:
     → Check allowAnonRooms setting
     → NO: Show "Login required to create rooms"
   
   - Active rooms count:
     → >= 100: Show "Service at capacity, try later"

2. If all checks pass:
   → Show "Create Room" button
   → User clicks → Room created
   → Redirect to /playlist/room/ABC123
```

### **Expiry Calculation:**
```typescript
// Always: min(now + 4h, today 10pm)
const fourHoursFromNow = addHours(now, 4)
const todayAt10pm = setHours(now, 22) // 10pm

const expiresAt = min([fourHoursFromNow, todayAt10pm])

// Examples:
// Created at 2pm → expires at 6pm (4h)
// Created at 7pm → expires at 10pm (3h)
// Created at 11pm → expires at 3am next day (4h)
```

---

## ⚠️ **Important Limits & Checks**

### **Rate Limits:**
- Room creation: 3 per IP per hour
- Video adds: 1 per 10 seconds per user
- Join attempts: 10 per IP per hour

### **Supabase Realtime:**
- Free tier: 200 concurrent connections
- Estimated need: 100 rooms × 5 users = 500 connections
- **Action needed**: May require Supabase Pro plan ($25/mo)

### **YouTube Embeds:**
- Some videos have "embedding disabled"
- Shows error in iframe
- User must remove and add different video

---

## 🎨 **UI/UX Considerations**

### **Service Disabled State:**
When admin turns service off via settings:
```
┌─────────────────────────────────────────┐
│   🎵 Playlist Service                   │
├─────────────────────────────────────────┤
│                                         │
│   ⚠️  Service Temporarily Unavailable   │
│                                         │
│   The playlist service is currently     │
│   offline for maintenance.              │
│                                         │
│   Please check back later.              │
│                                         │
└─────────────────────────────────────────┘
```

### **Room Limit Reached:**
```
┌─────────────────────────────────────────┐
│   🎵 Playlist Service                   │
├─────────────────────────────────────────┤
│                                         │
│   ⚠️  Service at Capacity               │
│                                         │
│   All 100 room slots are currently      │
│   in use. Please try again in a few     │
│   minutes.                              │
│                                         │
│   Or join an existing room:             │
│   [Enter Room Code]                     │
│                                         │
└─────────────────────────────────────────┘
```

### **Anon Users Blocked:**
```
┌─────────────────────────────────────────┐
│   🎵 Playlist Service                   │
├─────────────────────────────────────────┤
│                                         │
│   🔒 Login Required                     │
│                                         │
│   Room creation is currently limited    │
│   to registered users.                  │
│                                         │
│   [Login] [Create Account]              │
│                                         │
│   Already have a room code?             │
│   [Join Room]                           │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📦 **Dependencies to Add**

```bash
npm install @supabase/supabase-js  # Already installed?
npm install date-fns-tz            # Timezone calculations
npm install nanoid                 # Short room codes (ABC123)
```

**Total new dependencies: 3**  
**No API keys needed!**

---

## ✅ **MVP Scope - What's Included**

✅ Create room (anon + logged-in, with policy check)  
✅ Join with nickname  
✅ Paste YouTube URLs  
✅ Auto-generate thumbnails  
✅ Queue management  
✅ Admin playback controls  
✅ 4-hour + 10pm expiry  
✅ Admin extend rooms  
✅ **Admin service settings** (on/off, policies)  
✅ Real-time sync (Supabase)  
✅ Display mode (projector)  
✅ Multi-language (EN/SV/KM)  

---

## ❌ **Out of Scope (Phase 2)**

❌ Karaoke mode with performer assignments  
❌ Video search within app  
❌ Playlist history/replay  
❌ Social features (comments, reactions)  
❌ Video duration/metadata (unless using oEmbed)  
❌ Mobile apps (web PWA only)  

---

## 🚦 **Ready to Start?**

**First steps:**

1. **Add Prisma models** to `schema.prisma`
2. **Run migration**: `npx prisma migrate dev --name add_playlist_service`
3. **Seed settings**: Create initial `PlaylistServiceSettings` row
4. **Build admin settings page**: `/[locale]/admin/playlist/settings/page.tsx`
5. **Test service on/off toggle**
6. **Build YouTube URL parser**: No API needed!

**Estimated time to working MVP: 7 weeks**

---

**Questions? Check the full implementation plan:**  
`docs/playlist_service_implementation_plan.md`
