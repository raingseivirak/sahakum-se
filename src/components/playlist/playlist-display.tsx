'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, Music, Pause, Wifi, WifiOff, Maximize, Minimize, Repeat, Mic2 } from 'lucide-react'
import { usePlaylistRealtime } from '@/hooks/usePlaylistRealtime'
import type { PlaylistEventPayload } from '@/lib/playlist/supabase-realtime'

const NEXT_UP_COUNTDOWN_SECONDS = 10

declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: (() => void) | undefined
  }
}

export interface PlaylistDisplayTranslations {
  title: string
  roomExpired: string
  expiresIn: string
  nothingPlaying: string
  upNext: string
  nowPlaying: string
  waitingForAdmin: string
  fullscreen: string
  exitFullscreen: string
  comingUpNext: string
  addedBy: string
  loopList: string
  paused: string
  nextUpIn: string
}

interface PlaylistDisplayProps {
  locale: string
  roomCode: string
  t: PlaylistDisplayTranslations
}

interface QueueItem {
  id: string
  youtubeVideoId: string
  title: string | null
  thumbnailUrl: string | null
  state: string
  addedBy: { nickname: string }
}

interface RoomData {
  roomCode: string
  expiresAt: string
  extendedUntil: string | null
  loopQueue: boolean
  queueItems: QueueItem[]
  playbackState: {
    currentItemId: string | null
    isPlaying: boolean
  } | null
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(`{${key}}`, String(value))
  }
  return result
}

export function PlaylistDisplay({ locale, roomCode, t }: PlaylistDisplayProps) {
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  const [room, setRoom] = useState<RoomData | null>(null)
  const [expired, setExpired] = useState(false)
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [splash, setSplash] = useState<QueueItem | null>(null)
  const [ytReady, setYtReady] = useState(false)
  const [nextUpCountdown, setNextUpCountdown] = useState<number | null>(null)
  const fetchRoomRef = useRef<() => void>(() => {})
  const prevVideoIdRef = useRef<string | null>(null)
  const splashTimerRef = useRef<NodeJS.Timeout | null>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const advancingRef = useRef(false)
  const currentVideoIdRef = useRef<string | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load YouTube IFrame API once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setYtReady(true)
      return
    }
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]')
    if (!existingScript) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
    const prevCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.()
      setYtReady(true)
    }
  }, [])

  useEffect(() => {
    function getFullscreenElement(): Element | null {
      return (
        document.fullscreenElement ??
        (document as any).webkitFullscreenElement ??
        null
      )
    }
    function onFsChange() {
      setIsFullscreen(!!getFullscreenElement())
    }
    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
      if (splashTimerRef.current) clearTimeout(splashTimerRef.current)
    }
  }, [])

  function toggleFullscreen() {
    const el = document.documentElement as any
    const doc = document as any

    const fsElement =
      document.fullscreenElement ?? doc.webkitFullscreenElement ?? null

    if (!fsElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {})
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen()
      }
    }
  }

  const handleRealtimeEvent = useCallback((_payload: PlaylistEventPayload) => {
    fetchRoomRef.current()
  }, [])

  const { isConnected: realtimeConnected } = usePlaylistRealtime({
    roomCode,
    onEvent: handleRealtimeEvent,
    enabled: !expired,
  })

  const advanceToNext = useCallback(async () => {
    if (advancingRef.current) return
    advancingRef.current = true
    try {
      const adminToken = localStorage.getItem(`playlist_admin_${roomCode}`)
      if (!adminToken) return
      await fetch(`/api/playlist/rooms/${roomCode}/controls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ action: 'next' }),
      })
      fetchRoomRef.current()
    } finally {
      advancingRef.current = false
    }
  }, [roomCode])

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/playlist/rooms/${roomCode}`)
      if (res.status === 410 || res.status === 503) {
        setExpired(true)
        return
      }
      if (res.ok) {
        setRoom(await res.json())
      }
    } catch {
      // Retry on next interval
    }
  }, [roomCode])

  useEffect(() => {
    fetchRoomRef.current = fetchRoom
  }, [fetchRoom])

  useEffect(() => {
    fetchRoom()
    const interval = setInterval(fetchRoom, realtimeConnected ? 30000 : 5000)
    return () => clearInterval(interval)
  }, [fetchRoom, realtimeConnected])

  useEffect(() => {
    if (!room) return
    function update() {
      const expiry = room!.extendedUntil ?? room!.expiresAt
      const diff = new Date(expiry).getTime() - Date.now()
      setMinutesLeft(Math.max(0, Math.floor(diff / 60_000)))
    }
    update()
    const interval = setInterval(update, 30_000)
    return () => clearInterval(interval)
  }, [room])

  const currentItem = room?.queueItems?.find(
    (item) => item.id === room?.playbackState?.currentItemId
  ) ?? null
  const currentVideoId = currentItem?.youtubeVideoId ?? null

  // Keep a ref in sync so the YT player callback can read the latest value
  useEffect(() => {
    currentVideoIdRef.current = currentVideoId
  }, [currentVideoId])

  // Poll playback progress to show "Next Up" countdown near end of video
  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }

    const isPlaying = room?.playbackState?.isPlaying ?? false
    if (!isPlaying || !playerRef.current) {
      setNextUpCountdown(null)
      return
    }

    progressIntervalRef.current = setInterval(() => {
      try {
        const player = playerRef.current
        if (!player || !player.getDuration || !player.getCurrentTime) return
        const duration = player.getDuration()
        const current = player.getCurrentTime()
        if (duration <= 0) return
        const remaining = Math.ceil(duration - current)
        if (remaining <= NEXT_UP_COUNTDOWN_SECONDS && remaining > 0) {
          setNextUpCountdown(remaining)
        } else {
          setNextUpCountdown(null)
        }
      } catch {
        // Player not ready yet
      }
    }, 500)

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.playbackState?.isPlaying, currentVideoId])

  // Manage YouTube player: create, update video, or destroy
  useEffect(() => {
    if (!ytReady) return

    const isPlaying = room?.playbackState?.isPlaying ?? false
    const shouldPlay = currentVideoId && isPlaying && !splash

    if (!shouldPlay) {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      return
    }

    if (playerRef.current) {
      try {
        const current = playerRef.current.getVideoData?.()
        if (current && current.video_id !== currentVideoId) {
          setNextUpCountdown(null)
          playerRef.current.loadVideoById(currentVideoId)
        }
      } catch {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }

    if (!playerRef.current && playerContainerRef.current) {
      const div = document.createElement('div')
      div.id = 'yt-player-target'
      playerContainerRef.current.innerHTML = ''
      playerContainerRef.current.appendChild(div)

      playerRef.current = new window.YT.Player('yt-player-target', {
        videoId: currentVideoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              setNextUpCountdown(null)
              advanceToNext()
            }
          },
        },
      })
    }

    return () => {
      // Cleanup only when the component unmounts — not on every re-render
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ytReady, currentVideoId, splash, room?.playbackState?.isPlaying])

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  // "Coming Up Next" splash for 4 seconds on song change
  useEffect(() => {
    if (!currentVideoId || !currentItem) {
      prevVideoIdRef.current = currentVideoId
      return
    }
    if (currentVideoId !== prevVideoIdRef.current) {
      const isFirstLoad = prevVideoIdRef.current === null
      prevVideoIdRef.current = currentVideoId

      if (isFirstLoad) return

      setNextUpCountdown(null)
      setSplash(currentItem)
      if (splashTimerRef.current) clearTimeout(splashTimerRef.current)
      splashTimerRef.current = setTimeout(() => setSplash(null), 4000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVideoId])

  if (expired) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-20 w-20 text-gray-500 mx-auto mb-6" />
          <h1 className={`text-4xl font-bold ${fontClass}`}>{t.roomExpired}</h1>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-2xl text-gray-500">Loading...</div>
      </div>
    )
  }

  const isPlaying = room.playbackState?.isPlaying ?? false
  const queuedItems = room.queueItems.filter((item) => item.state === 'QUEUED')
  const upNext = queuedItems.slice(0, 5)
  const nextQueueItem = queuedItems[0] ?? null

  const showVideo = currentItem && isPlaying && !splash

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-3 bg-[var(--sahakum-navy)]">
        <div className="flex items-center gap-3">
          <Music className="h-6 w-6 text-[var(--sahakum-gold)]" />
          <span className={`text-xl font-bold ${fontClass}`}>
            {t.title}
          </span>
          <span className="text-2xl font-mono tracking-widest text-[var(--sahakum-gold)]">
            {roomCode}
          </span>
          {realtimeConnected ? (
            <Wifi className="h-4 w-4 text-green-400 ml-2" />
          ) : (
            <WifiOff className="h-4 w-4 text-gray-500 ml-2" />
          )}
          {room.loopQueue && (
            <div className="flex items-center gap-1 ml-2 text-green-400" title={t.loopList}>
              <Repeat className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {minutesLeft !== null && (
            <div className={`flex items-center gap-2 text-lg ${minutesLeft < 10 ? 'text-red-400' : 'text-gray-300'}`}>
              <Clock className="h-5 w-5" />
              <span className={fontClass}>
                {interpolate(t.expiresIn, { minutes: minutesLeft })}
              </span>
            </div>
          )}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded hover:bg-white/10"
            title={isFullscreen ? t.exitFullscreen : t.fullscreen}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Video Player Area */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* "Coming Up Next" splash overlay */}
          {splash && (
            <div className="absolute inset-0 z-10 bg-black flex items-center justify-center" style={{ animation: 'fade-in-up 0.6s ease-out' }}>
              <div className="text-center max-w-2xl px-8">
                <p className={`text-[var(--sahakum-gold)] text-xl font-semibold uppercase tracking-widest mb-6 ${fontClass}`}>
                  {t.comingUpNext}
                </p>
                {splash.thumbnailUrl && (
                  <img
                    src={`https://img.youtube.com/vi/${splash.youtubeVideoId}/maxresdefault.jpg`}
                    alt=""
                    className="w-full max-w-lg mx-auto rounded-lg shadow-2xl mb-6"
                  />
                )}
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {splash.title || splash.youtubeVideoId}
                </h2>
                <p className={`text-xl text-gray-400 ${fontClass}`}>
                  {interpolate(t.addedBy, { name: splash.addedBy.nickname })}
                </p>
              </div>
            </div>
          )}

          {showVideo && currentItem ? (
            <>
              <div ref={playerContainerRef} className="w-full h-full" />
              {/* "Next Up" countdown overlay — appears in last 10 seconds */}
              {nextUpCountdown !== null && nextQueueItem && (
                <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
                  {/* Countdown progress bar */}
                  <div className="w-full h-1 bg-black/40">
                    <div
                      className="h-full bg-[var(--sahakum-gold)] transition-all duration-500 ease-linear"
                      style={{ width: `${((NEXT_UP_COUNTDOWN_SECONDS - nextUpCountdown) / NEXT_UP_COUNTDOWN_SECONDS) * 100}%` }}
                    />
                  </div>
                  <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent px-8 pb-6 pt-10">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Mic2 className="h-6 w-6 text-[var(--sahakum-gold)]" />
                        <span className={`text-[var(--sahakum-gold)] text-lg font-semibold uppercase tracking-wider ${fontClass}`}>
                          {interpolate(t.nextUpIn, { seconds: nextUpCountdown })}
                        </span>
                      </div>
                      {nextQueueItem.thumbnailUrl && (
                        <img
                          src={nextQueueItem.thumbnailUrl}
                          alt=""
                          className="w-20 h-12 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xl font-bold truncate">
                          {nextQueueItem.title || nextQueueItem.youtubeVideoId}
                        </p>
                        <p className={`text-gray-400 text-sm ${fontClass}`}>
                          {interpolate(t.addedBy, { name: nextQueueItem.addedBy.nickname })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : currentItem && !isPlaying && !splash ? (
            <div className="text-center">
              <div className="relative w-full max-w-[600px] mx-auto">
                <img
                  src={`https://img.youtube.com/vi/${currentItem.youtubeVideoId}/maxresdefault.jpg`}
                  alt=""
                  className="w-full rounded-lg opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-6">
                    <Pause className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-2xl text-gray-400 mt-6 font-medium">
                {currentItem.title || currentItem.youtubeVideoId}
              </p>
              <p className={`text-gray-600 mt-2 ${fontClass}`}>{t.paused}</p>
            </div>
          ) : !splash ? (
            <div className="text-center">
              <Music className="h-24 w-24 text-gray-700 mx-auto mb-6" />
              <p className={`text-3xl text-gray-500 ${fontClass}`}>
                {t.nothingPlaying}
              </p>
              <p className={`text-xl text-gray-600 mt-3 ${fontClass}`}>
                {t.waitingForAdmin}
              </p>
            </div>
          ) : null}
        </div>

        {/* Sidebar - Up Next */}
        {upNext.length > 0 && (
          <div className="w-80 bg-gray-900 border-l border-gray-800 p-6 flex flex-col">
            <h2 className={`text-lg font-bold text-[var(--sahakum-gold)] mb-4 ${fontClass}`}>
              {t.upNext}
            </h2>
            <div className="space-y-4 flex-1">
              {upNext.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-600 w-8">
                    {index + 1}
                  </span>
                  {item.thumbnailUrl && (
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      className="w-20 h-12 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {item.title || item.youtubeVideoId}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.addedBy.nickname}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Now Playing Bar */}
      {currentItem && (
        <div className="px-8 py-3 bg-gray-900 border-t border-gray-800">
          <div className="flex items-center gap-4">
            {isPlaying ? (
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            ) : (
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            )}
            <span className={`text-sm text-gray-400 ${fontClass}`}>{t.nowPlaying}</span>
            <span className="text-lg font-bold text-white truncate">
              {currentItem.title || currentItem.youtubeVideoId}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
