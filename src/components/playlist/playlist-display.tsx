'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, Music, Pause, Play, Wifi, WifiOff, Maximize, Minimize, Repeat, Mic2 } from 'lucide-react'
import { usePlaylistRealtime } from '@/hooks/usePlaylistRealtime'
import type { PlaylistEventPayload } from '@/lib/playlist/supabase-realtime'
import { formatTimeRemaining } from '@/lib/playlist/expiry-calculator'

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
  const [needsInteraction, setNeedsInteraction] = useState(false)
  const [userInteracted, setUserInteracted] = useState(false)
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

  const handleUserInteraction = useCallback(() => {
    setUserInteracted(true)
    setNeedsInteraction(false)
    try {
      if (playerRef.current) {
        playerRef.current.playVideo()
      }
    } catch {
      // Player not ready
    }
  }, [])

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
          playsinline: 1,
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            event.target.playVideo()
            setNeedsInteraction(false)
            // Detect autoplay block: if still not playing after a short delay
            setTimeout(() => {
              try {
                const state = event.target.getPlayerState()
                if (state !== window.YT.PlayerState.PLAYING && state !== window.YT.PlayerState.BUFFERING) {
                  setNeedsInteraction(true)
                }
              } catch {
                // Player may have been destroyed
              }
            }, 1500)
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setNeedsInteraction(false)
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              setNextUpCountdown(null)
              advanceToNext()
            }
          },
          onError: (event: YT.OnErrorEvent) => {
            console.error('YouTube player error:', event.data)
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
      <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 py-2 sm:py-3 bg-[var(--sahakum-navy)]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Music className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--sahakum-gold)] flex-shrink-0" />
          <span className={`text-sm sm:text-xl font-bold truncate ${fontClass}`}>
            {t.title}
          </span>
          <span className="text-base sm:text-2xl font-mono tracking-widest text-[var(--sahakum-gold)] flex-shrink-0">
            {roomCode}
          </span>
          {realtimeConnected ? (
            <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
          ) : (
            <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
          )}
          {room.loopQueue && (
            <Repeat className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" title={t.loopList} />
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {minutesLeft !== null && (
            <div className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-lg ${minutesLeft < 10 ? 'text-red-400' : 'text-gray-300'}`}>
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className={`hidden sm:inline ${fontClass}`}>
                {formatTimeRemaining(minutesLeft)}
              </span>
              <span className="sm:hidden">{formatTimeRemaining(minutesLeft)}</span>
            </div>
          )}
          <button
            onClick={toggleFullscreen}
            className="text-gray-300 hover:text-white transition-colors p-1.5 sm:px-3 sm:py-1.5 rounded hover:bg-white/10"
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
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Video Player Area */}
        <div className="flex-1 flex items-center justify-center relative min-h-[50vh] md:min-h-0" onClick={() => !userInteracted && setUserInteracted(true)}>
          {/* "Coming Up Next" splash overlay */}
          {splash && (
            <div className="absolute inset-0 z-10 bg-black flex items-center justify-center" style={{ animation: 'fade-in-up 0.6s ease-out' }}>
              <div className="text-center max-w-2xl px-4 sm:px-8">
                <p className={`text-[var(--sahakum-gold)] text-base sm:text-xl font-semibold uppercase tracking-widest mb-4 sm:mb-6 ${fontClass}`}>
                  {t.comingUpNext}
                </p>
                {splash.thumbnailUrl && (
                  <img
                    src={`https://img.youtube.com/vi/${splash.youtubeVideoId}/maxresdefault.jpg`}
                    alt=""
                    className="w-full max-w-sm sm:max-w-lg mx-auto rounded-lg shadow-2xl mb-4 sm:mb-6"
                  />
                )}
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3 truncate px-2">
                  {splash.title || splash.youtubeVideoId}
                </h2>
                <p className={`text-base sm:text-xl text-gray-400 ${fontClass}`}>
                  {interpolate(t.addedBy, { name: splash.addedBy.nickname })}
                </p>
              </div>
            </div>
          )}

          {showVideo && currentItem ? (
            <>
              <div ref={playerContainerRef} className="w-full h-full" />
              {/* Autoplay blocked — prompt user interaction */}
              {needsInteraction && (
                <button
                  onClick={handleUserInteraction}
                  className="absolute inset-0 z-30 bg-black/80 flex items-center justify-center cursor-pointer"
                >
                  <div className="text-center">
                    <div className="bg-white/10 backdrop-blur rounded-full p-6 sm:p-8 inline-block mb-4 hover:bg-white/20 transition-colors">
                      <Play className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                    </div>
                    <p className={`text-lg sm:text-2xl text-white font-medium ${fontClass}`}>
                      Tap to Play
                    </p>
                  </div>
                </button>
              )}
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
                  <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent px-3 sm:px-8 pb-3 sm:pb-6 pt-6 sm:pt-10">
                    <div className="flex items-center gap-3 sm:gap-6">
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <Mic2 className="h-4 w-4 sm:h-6 sm:w-6 text-[var(--sahakum-gold)]" />
                        <span className={`text-[var(--sahakum-gold)] text-sm sm:text-lg font-semibold uppercase tracking-wider ${fontClass}`}>
                          {interpolate(t.nextUpIn, { seconds: nextUpCountdown })}
                        </span>
                      </div>
                      {nextQueueItem.thumbnailUrl && (
                        <img
                          src={nextQueueItem.thumbnailUrl}
                          alt=""
                          className="w-14 h-9 sm:w-20 sm:h-12 object-cover rounded flex-shrink-0 hidden sm:block"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm sm:text-xl font-bold truncate">
                          {nextQueueItem.title || nextQueueItem.youtubeVideoId}
                        </p>
                        <p className={`text-gray-400 text-xs sm:text-sm ${fontClass}`}>
                          {interpolate(t.addedBy, { name: nextQueueItem.addedBy.nickname })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : currentItem && !isPlaying && !splash ? (
            <div className="text-center px-4">
              <div className="relative w-full max-w-[300px] sm:max-w-[600px] mx-auto">
                <img
                  src={`https://img.youtube.com/vi/${currentItem.youtubeVideoId}/maxresdefault.jpg`}
                  alt=""
                  className="w-full rounded-lg opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-4 sm:p-6">
                    <Pause className="h-10 w-10 sm:h-16 sm:w-16 text-white" />
                  </div>
                </div>
              </div>
              <p className="text-lg sm:text-2xl text-gray-400 mt-4 sm:mt-6 font-medium truncate">
                {currentItem.title || currentItem.youtubeVideoId}
              </p>
              <p className={`text-gray-600 mt-2 ${fontClass}`}>{t.paused}</p>
            </div>
          ) : !splash ? (
            <div className="text-center px-4">
              <Music className="h-16 w-16 sm:h-24 sm:w-24 text-gray-700 mx-auto mb-4 sm:mb-6" />
              <p className={`text-xl sm:text-3xl text-gray-500 ${fontClass}`}>
                {t.nothingPlaying}
              </p>
              <p className={`text-base sm:text-xl text-gray-600 mt-2 sm:mt-3 ${fontClass}`}>
                {t.waitingForAdmin}
              </p>
            </div>
          ) : null}
        </div>

        {/* Sidebar - Up Next (hidden on mobile, shown on md+) */}
        {upNext.length > 0 && (
          <div className="hidden md:flex w-64 lg:w-80 bg-gray-900 border-l border-gray-800 p-4 lg:p-6 flex-col flex-shrink-0">
            <h2 className={`text-lg font-bold text-[var(--sahakum-gold)] mb-4 ${fontClass}`}>
              {t.upNext}
            </h2>
            <div className="space-y-3 lg:space-y-4 flex-1 overflow-y-auto">
              {upNext.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-xl lg:text-2xl font-bold text-gray-600 w-6 lg:w-8 flex-shrink-0">
                    {index + 1}
                  </span>
                  {item.thumbnailUrl && (
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      className="w-16 h-10 lg:w-20 lg:h-12 object-cover rounded flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {item.title || item.youtubeVideoId}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.addedBy.nickname}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Queue - shown below video on small screens */}
      {upNext.length > 0 && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-3 py-2">
          <h3 className={`text-sm font-bold text-[var(--sahakum-gold)] mb-2 ${fontClass}`}>
            {t.upNext} ({upNext.length})
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {upNext.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 flex-shrink-0 max-w-[200px]">
                <span className="text-sm font-bold text-gray-600">{index + 1}</span>
                {item.thumbnailUrl && (
                  <img src={item.thumbnailUrl} alt="" className="w-12 h-8 object-cover rounded flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white truncate">{item.title || item.youtubeVideoId}</p>
                  <p className="text-[10px] text-gray-500 truncate">{item.addedBy.nickname}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Now Playing Bar */}
      {currentItem && (
        <div className="px-3 sm:px-6 lg:px-8 py-2 sm:py-3 bg-gray-900 border-t border-gray-800">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {isPlaying ? (
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            ) : (
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full flex-shrink-0" />
            )}
            <span className={`text-xs sm:text-sm text-gray-400 flex-shrink-0 ${fontClass}`}>{t.nowPlaying}</span>
            <span className="text-sm sm:text-lg font-bold text-white truncate">
              {currentItem.title || currentItem.youtubeVideoId}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
