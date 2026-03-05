# Shared YouTube Playlist — Feature Requirements & High-Level Flows



---

## Table of contents

1. Concept & Core Objects
2. Roles & Permissions
3. Feature Requirements
4. Karaoke Mode (extended)
5. Display / Projector Sharing (admin)
6. High-level flows
7. MVP scope & recommendations
8. Non-functional requirements
9. Open decisions & next steps
10. API / WebSocket events (suggested)

---

## 1. Concept & Core Objects

**Core concept**  
A **Playlist Room** is a shared space where participants join via a short `room_code` or link, add YouTube videos, and optionally watch/listen in a synchronized experience controlled by an admin. Karaoke Mode and a dedicated Display Mode are layered options.

**Key objects**

- **Room**
  - room_id (internal), `room_code`, `room_url`
  - owner_type: `anon` | `user`
  - created_at, expires_at (nullable)
  - settings: autoplay, allow_guests_add, karaoke_enabled, default_slot_minutes
- **Participant**
  - participant_id, nickname, role: admin | participant
  - join_time, last_seen
- **QueueItem**
  - youtube_video_id, url
  - title, duration_seconds (optional), thumb_url
  - added_by (participant_id), added_at
  - state: queued | playing | played | removed
  - karaoke fields (optional): performer_id, slot_duration_seconds, eta_start, eta_end
- **PlaybackState**
  - current_item_id, position_seconds, is_playing, last_updated_at, updated_by

---

## 2. Roles & Permissions

- **Anon Admin**
  - Creates room (TTL = 4 hours), becomes admin, gets admin session token.
  - Can add/remove items, control playback, enable Karaoke Mode.
- **Registered User Admin**
  - Same as anon admin but room expiry can be longer per policy.
- **Participant (Guest)**
  - Joins with nickname (no login), can add songs if allowed.
  - May claim songs / mark readiness in Karaoke Mode.
- **Display Device**
  - `display` role: read-only, renders large-screen view (Now Playing, On Deck, countdown). No controls.

---

## 3. Feature Requirements

### A. Room creation & access

- FR-1: Create room (anon) → `expires_at = now + 4h`. Creator is admin and receives an admin token in local storage or cookie.
- FR-2: Create room (logged-in) → `expires_at` per account/plan rules.
- FR-3: Join room → nickname required; profanity/length validation; uniqueness within room enforced or suggested alternatives.
- FR-4: Rejoin & persistence → preserve nickname and role if session token valid.

### B. Queue management

- FR-5: Add YouTube video → accepts URL or ID, validates format and embeddability, fetches metadata (title, duration, thumbnail).
- FR-6: View queue → show added_by and timestamps for each item.
- FR-7: Remove items → admin can remove any; participants may remove their own items (configurable).
- FR-8: Empty queue → admin can clear queue (confirmation required).

### C. Playback control (admin)

- FR-9: Playback modes → Autoplay (advance on end) and Manual.
- FR-10: Controls → Play/Pause, Skip, Next (advance), Seek (optional).
- FR-11: Sync behavior → server-authoritative playback state broadcast via WebSocket/SSE.

### D. Lifecycle & expiry

- FR-12: Anon room expiry → at `expires_at` transition to expired: read-only or inaccessible; show countdown warnings.
- FR-13: User room duration → owner-controlled extensions (policy TBD).

### E. Moderation & rate limits

- FR-14: Rate limits on adds per user/IP, nickname changes, room creations per IP.
- FR-15: Content guardrails on non-embeddable or age-restricted videos.

### F. UX screens

- Landing page: Create (guest / user) | Join (code)
- Join modal: nickname input
- Room screen: Now Playing (YouTube embed), Queue, Add video input, Participants list, Admin control panel, Room expiry timer
- Display mode: Clean, full-screen UI for projector

---

## 4. Karaoke Mode (Extended)

**New data model fields (optional)**

- Karaoke mode settings:
  - enabled: boolean
  - default_slot_minutes: integer (e.g., 4)
  - announce_offset_minutes: integer (e.g., 1)
  - slot_policy: use_song_duration | fixed_slot | min(song_duration, max_slot)

**Karaoke-specific behaviors**

- KM-1: Toggle Karaoke Mode ON/OFF (admin)
- KM-2: Singer assignment: admin-assign or self-assign (room config)
- KM-3: ETA calculation for start/end using slot policy and current playback state
- KM-4: On-deck notifications: to performer and UI, triggered at `announce_offset_minutes`
- KM-5: No-show handling: skip, move-to-end, mark skipped
- KM-6: Schedule view: list of upcoming performers with ETA and status
- KM-7: Mixed-mode fallback: normal queue behavior when karaoke is off

**Karaoke MVP cut**

- Karaoke toggle
- Admin assigns singer
- Fixed-slot ETA (e.g., 4 minutes)
- On-deck banner + single toast notification
- Admin skip / move-to-end

---

## 5. Display / Projector Sharing (Admin)

Two model approaches:

### Recommended: Single-source display (controller + display split)

- Admin (controller) issues playback commands.
- Dedicated display client (`/room/{code}/display`) connected to room renders the YouTube player and visual schedule. Display device is usually the projector host (laptop) or smart TV.
- Display is full-screen, no controls, large fonts, and shows Now Performing / On Deck / Countdown.

**Implementation**

- Route: `/room/:code/display`
- Optional: display token to restrict unauthorized display access
- Autoplay: display client listens to server events to start/stop videos
- Reconnect: on reconnect, display queries current PlaybackState and resumes

### Simpler (MVP): Mirror admin device

- Admin uses laptop/phone and mirrors screen to projector with HDMI, AirPlay, or Chromecast. No separate display client needed.
- Provide a “Presentation Mode” that shows clean full-screen output for mirroring.

**UX features for display**

- Large singer name, song title
- Progress bar + countdown
- “On deck” banner
- Background dimming and high-contrast typography

**Caveats**

- YouTube autoplay restrictions on mobile browsers (user interaction needed)
- Casting APIs can add complexity; prefer whole-tab/screen cast rather than programmatic cast for MVP

---

## 6. High-level Flows

### Flow 1 — Create room (Anon)

1. Click **Create room as guest**
2. System creates `room_code`, `expires_at = now + 4h`
3. Admin token saved to local storage
4. UI displays share link and admin controls

### Flow 2 — Join room with nickname

1. Open link or enter `room_code`
2. Input nickname
3. System registers participant and subscribes to room updates
4. Participant sees Now Playing and Queue

### Flow 3 — Add video

1. Paste YouTube URL/ID → validate → fetch metadata
2. Server appends QueueItem and broadcasts update
3. Clients render updated queue

### Flow 4 — Karaoke scheduling & "who's next in X minutes"

1. Admin enables Karaoke Mode and selects slot policy
2. System computes ETA timeline (using fixed slot or duration)
3. User asks "who's next in X minutes" → system returns the first slot with `eta_start - now <= X minutes`
4. UI highlights that slot

### Flow 5 — Admin display to projector (controller + display)

1. Admin opens Controller UI on phone/laptop
2. Display device opens `/room/{code}/display` (connected laptop/projector)
3. Admin controls playback from phone; display renders authoritative player
4. On skip/play, server broadcasts and display executes commands

---

## 7. MVP scope & recommendations

**MVP features**

- Room create/join (code + nickname)
- Add YouTube videos to queue
- Admin controls: play/pause, skip/next, clear
- Autoplay next on end
- Anon rooms expire at 4 hours
- Simple Display Mode (Presentation button) and support for HDMI mirroring

**Phase 2**

- Dedicated Display Mode URL + display token
- Karaoke Mode full feature set (self-assign, notifications)
- Persistent user rooms and extension policy
- Advanced moderation & reporting

---

## 8. Non-functional requirements

- **Real-time updates:** WebSocket (preferred) or SSE for room updates and playback events.
- **Consistency:** server-authoritative queue ordering and idempotent operations.
- **Security:** admin rights tied to unforgeable session tokens; prevent admin takeover by guessing room_code.
- **Rate-limiting & abuse controls:** per-IP and per-user limits, profanity filtering.
- **Observability:** logging for room lifecycle events and admin actions.
- **Scalability:** partition rooms across instances; sticky sessions or central state store (Redis) recommended.

---

## 9. Open decisions & policy questions

- **User room expiry policy:** persistent for registered users? Options:
  - A: 24h with owner extension up to 7 days
  - B: Persistent but auto-delete after 30 days inactivity
  - C: Tiered: free accounts short-lived, paid accounts persistent
- **Karaoke slot calculation:** use actual video duration vs fixed slot minutes
- **Display authorization:** display token required vs open `/display` route
- **Lyric support:** integrate lyrics (YouTube captions or third-party) — requires additional work

---

## 10. Suggested API & WebSocket events (minimal)

**REST**

- `POST /rooms` → create room (payload: owner_type, karaoke_enabled, expires_override)
- `POST /rooms/:code/join` → join room (payload: nickname)
- `POST /rooms/:code/items` → add video (payload: youtube_url)
- `DELETE /rooms/:code/items/:item_id` → remove item
- `POST /rooms/:code/controls` → admin commands (payload: {action: play|pause|skip|clear, ...})

**WebSocket events**

- Client → Server:
  - `join_room { code, nickname, token? }`
  - `add_item { youtube_id, meta? }`
  - `admin_cmd { action, item_id? }`
  - `claim_slot { item_id }` (karaoke)
- Server → Client:
  - `room_state { playbackState, queue, participants }`
  - `item_added { item }`
  - `playback_update { current_item_id, position, is_playing }`
  - `karaoke_schedule { slots[] }`
  - `display_command { action, video_id, startAt }`

---

## Next steps / Suggested deliverables

- Finalize user room expiry policy and karaoke slot policy.
- Create minimal UI wireframes for:
  - Room page (controller)
  - Display mode
  - Karaoke schedule panel
- Design WebSocket schema and server authoritative flow (Redis + message bus recommended)
- Implement MVP: room creation, queue, admin controls, presentation mode

---

**End of spec**