'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import {
  subscribeToRoom,
  unsubscribeFromRoom,
  trackPresence,
  broadcastToRoom,
  isRealtimeAvailable,
  type PlaylistEvent,
  type PlaylistEventPayload,
} from '@/lib/playlist/supabase-realtime'

interface UsePlaylistRealtimeOptions {
  roomCode: string
  onEvent: (payload: PlaylistEventPayload) => void
  userInfo?: { id: string; nickname: string; role: string } | null
  enabled?: boolean
}

interface UsePlaylistRealtimeReturn {
  isConnected: boolean
  isRealtimeSupported: boolean
  broadcast: (event: PlaylistEvent, data?: Record<string, unknown>) => Promise<void>
}

/**
 * Hook to subscribe to realtime playlist events via Supabase.
 * Falls back gracefully if Supabase is not configured.
 */
export function usePlaylistRealtime({
  roomCode,
  onEvent,
  userInfo,
  enabled = true,
}: UsePlaylistRealtimeOptions): UsePlaylistRealtimeReturn {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const onEventRef = useRef(onEvent)

  // Keep the callback ref fresh without re-subscribing
  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!enabled || !roomCode) return

    const channel = subscribeToRoom(
      roomCode,
      (payload) => onEventRef.current(payload),
    )

    if (!channel) return

    channelRef.current = channel
    setIsConnected(true)

    // Track presence if user info is available
    if (userInfo) {
      trackPresence(channel, userInfo)
    }

    return () => {
      unsubscribeFromRoom(channel)
      channelRef.current = null
      setIsConnected(false)
    }
  }, [roomCode, enabled, userInfo?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const broadcast = useCallback(
    async (event: PlaylistEvent, data: Record<string, unknown> = {}) => {
      await broadcastToRoom(roomCode, event, data, userInfo?.id)
    },
    [roomCode, userInfo?.id]
  )

  return {
    isConnected,
    isRealtimeSupported: isRealtimeAvailable(),
    broadcast,
  }
}
