import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

/**
 * Get the Supabase client for realtime features.
 * Returns null if env vars are not configured (graceful degradation to polling).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key || url === 'your-supabase-url' || key === 'your-anon-key') {
    return null
  }

  supabaseClient = createClient(url, key, {
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  })

  return supabaseClient
}

export function isRealtimeAvailable(): boolean {
  return getSupabaseClient() !== null
}

export type PlaylistEvent =
  | 'item_added'
  | 'item_removed'
  | 'playback_update'
  | 'participant_joined'
  | 'participant_left'
  | 'room_extended'
  | 'room_expired'
  | 'queue_cleared'

export interface PlaylistEventPayload {
  event: PlaylistEvent
  data: Record<string, unknown>
  sentBy?: string
  timestamp: number
}

/**
 * Subscribe to a playlist room channel for realtime updates.
 * Returns null if Supabase is not configured.
 */
export function subscribeToRoom(
  roomCode: string,
  onEvent: (payload: PlaylistEventPayload) => void,
  onPresenceSync?: (presenceState: Record<string, unknown[]>) => void
): RealtimeChannel | null {
  const client = getSupabaseClient()
  if (!client) return null

  const channel = client.channel(`playlist:${roomCode}`, {
    config: { presence: { key: roomCode } },
  })

  channel
    .on('broadcast', { event: 'playlist_event' }, (payload) => {
      if (payload.payload) {
        onEvent(payload.payload as PlaylistEventPayload)
      }
    })

  if (onPresenceSync) {
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      onPresenceSync(state)
    })
  }

  channel.subscribe()

  return channel
}

/**
 * Broadcast an event to all participants in a room.
 */
export async function broadcastToRoom(
  roomCode: string,
  event: PlaylistEvent,
  data: Record<string, unknown> = {},
  sentBy?: string
): Promise<void> {
  const client = getSupabaseClient()
  if (!client) return

  const channel = client.channel(`playlist:${roomCode}`)

  await channel.send({
    type: 'broadcast',
    event: 'playlist_event',
    payload: {
      event,
      data,
      sentBy,
      timestamp: Date.now(),
    } satisfies PlaylistEventPayload,
  })

  client.removeChannel(channel)
}

/**
 * Track presence in a room (join/leave tracking).
 */
export async function trackPresence(
  channel: RealtimeChannel,
  userInfo: { id: string; nickname: string; role: string }
): Promise<void> {
  await channel.track(userInfo)
}

/**
 * Unsubscribe from a room channel.
 */
export function unsubscribeFromRoom(channel: RealtimeChannel | null): void {
  if (!channel) return
  const client = getSupabaseClient()
  if (client) {
    client.removeChannel(channel)
  }
}
