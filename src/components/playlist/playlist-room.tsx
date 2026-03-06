'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Pause,
  SkipForward,
  Trash2,
  Plus,
  Users,
  Clock,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Monitor,
  X,
  Wifi,
  WifiOff,
  Music,
  ExternalLink,
  QrCode,
  Repeat,
  Youtube,
  Send,
} from 'lucide-react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { usePlaylistRealtime } from '@/hooks/usePlaylistRealtime'
import type { PlaylistEventPayload } from '@/lib/playlist/supabase-realtime'
import { formatTimeRemaining } from '@/lib/playlist/expiry-calculator'

export interface PlaylistRoomTranslations {
  nicknameTaken: string
  invalidYoutubeUrl: string
  roomNotFound: string
  createRoom: string
  roomExpired: string
  createNewRoom: string
  joinRoom: string
  enterNickname: string
  join: string
  codeCopied: string
  copyCode: string
  expiresIn: string
  displayMode: string
  nowPlaying: string
  nothingPlaying: string
  play: string
  pause: string
  skip: string
  clearQueueConfirm: string
  clearQueueDescription: string
  clearQueue: string
  cancel: string
  pasteYoutubeUrl: string
  add: string
  queue: string
  noVideos: string
  addFirstVideo: string
  addedBy: string
  removeSong: string
  participants: string
  openDisplayScreen: string
  displayScreenHint: string
  shareLink: string
  showQr: string
  scanToJoin: string
  loopList: string
  loopListOn: string
  loopListOff: string
  playing: string
  paused: string
  pressPlayHint: string
  adminControls: string
  serviceUnavailable: string
  serviceUnavailableDesc: string
}

interface PlaylistRoomProps {
  locale: string
  roomCode: string
  t: PlaylistRoomTranslations
}

interface Participant {
  id: string
  nickname: string
  role: string
  joinedAt: string
  lastSeenAt: string
}

interface QueueItem {
  id: string
  youtubeVideoId: string
  youtubeUrl: string
  title: string | null
  thumbnailUrl: string | null
  queueOrder: number
  state: string
  addedAt: string
  addedBy: { id: string; nickname: string }
}

interface PlaybackState {
  currentItemId: string | null
  positionSeconds: number
  isPlaying: boolean
}

interface RoomData {
  id: string
  roomCode: string
  expiresAt: string
  extendedUntil: string | null
  allowGuestsAdd: boolean
  autoplay: boolean
  loopQueue: boolean
  participants: Participant[]
  queueItems: QueueItem[]
  playbackState: PlaybackState | null
}

type RoomPhase = 'loading' | 'join' | 'room' | 'expired' | 'not-found' | 'error' | 'service-disabled'

function interpolate(template: string, vars: Record<string, string | number>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(`{${key}}`, String(value))
  }
  return result
}

export function PlaylistRoom({ locale, roomCode, t }: PlaylistRoomProps) {
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  const [phase, setPhase] = useState<RoomPhase>('loading')
  const [room, setRoom] = useState<RoomData | null>(null)
  const [nickname, setNickname] = useState('')
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [joining, setJoining] = useState(false)
  const [addingVideo, setAddingVideo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null)
  const [controlLoading, setControlLoading] = useState<string | null>(null)
  const [showClearQueueDialog, setShowClearQueueDialog] = useState(false)
  const [showQr, setShowQr] = useState(false)

  const isAdmin = !!adminToken

  const handleRealtimeEvent = useCallback((_payload: PlaylistEventPayload) => {
    fetchRoomRef.current()
  }, [])

  const realtimeUserInfo = useMemo(() => {
    if (!participantId || !nickname) return null
    return { id: participantId, nickname, role: isAdmin ? 'ADMIN' : 'PARTICIPANT' }
  }, [participantId, nickname, isAdmin])

  const { isConnected: realtimeConnected, isRealtimeSupported, broadcast } = usePlaylistRealtime({
    roomCode,
    onEvent: handleRealtimeEvent,
    userInfo: realtimeUserInfo,
    enabled: phase === 'room',
  })

  const fetchRoomRef = useRef<() => void>(() => {})

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/playlist/rooms/${roomCode}`)
      if (res.status === 503) {
        setPhase('service-disabled')
        return
      }
      if (res.status === 404) {
        setPhase('not-found')
        return
      }
      if (res.status === 410) {
        setPhase('expired')
        return
      }
      if (!res.ok) {
        setPhase('error')
        return
      }
      const data: RoomData = await res.json()
      setRoom(data)

      const storedToken = localStorage.getItem(`playlist_session_${roomCode}`)
      const storedAdmin = localStorage.getItem(`playlist_admin_${roomCode}`)
      if (storedAdmin) setAdminToken(storedAdmin)

      if (storedToken) {
        setSessionToken(storedToken)
        const storedPid = localStorage.getItem(`playlist_pid_${roomCode}`)
        if (storedPid) setParticipantId(storedPid)
        setPhase('room')
      } else if (storedAdmin) {
        setSessionToken(null)
        setPhase('room')
      } else {
        setPhase('join')
      }
    } catch {
      setPhase('error')
    }
  }, [roomCode])

  useEffect(() => {
    fetchRoomRef.current = fetchRoom
  }, [fetchRoom])

  useEffect(() => {
    fetchRoom()
  }, [fetchRoom])

  useEffect(() => {
    if (phase !== 'room') return
    // When realtime is connected, only do a slow heartbeat (30s) as a safety net.
    // Without realtime, poll at 8s to stay responsive without flooding the API.
    const interval = setInterval(fetchRoom, realtimeConnected ? 30000 : 8000)
    return () => clearInterval(interval)
  }, [phase, fetchRoom, realtimeConnected])

  useEffect(() => {
    if (!room) return
    function updateTimer() {
      const expiry = room!.extendedUntil ?? room!.expiresAt
      const diff = new Date(expiry).getTime() - Date.now()
      setMinutesLeft(Math.max(0, Math.floor(diff / 60_000)))
    }
    updateTimer()
    const interval = setInterval(updateTimer, 30_000)
    return () => clearInterval(interval)
  }, [room])

  async function handleJoin() {
    if (!nickname.trim()) return
    setJoining(true)
    setError(null)

    try {
      const res = await fetch(`/api/playlist/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nickname.trim() }),
      })
      const data = await res.json()

      if (res.ok) {
        setSessionToken(data.sessionToken)
        setParticipantId(data.participantId)
        localStorage.setItem(`playlist_session_${roomCode}`, data.sessionToken)
        localStorage.setItem(`playlist_pid_${roomCode}`, data.participantId)
        setPhase('room')
        fetchRoom()
        broadcast('participant_joined', { nickname: nickname.trim() })
      } else if (res.status === 409) {
        setError(t.nicknameTaken)
      } else {
        setError(data.error || 'Failed to join')
      }
    } catch {
      setError('Network error')
    } finally {
      setJoining(false)
    }
  }

  async function handleAddVideo() {
    if (!videoUrl.trim()) return
    if (!sessionToken && !adminToken) return
    setAddingVideo(true)
    setError(null)

    try {
      const payload: Record<string, string> = { youtubeUrl: videoUrl.trim() }
      if (sessionToken) payload.participantSessionToken = sessionToken
      if (adminToken) payload.adminToken = adminToken

      const res = await fetch(`/api/playlist/rooms/${roomCode}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        setVideoUrl('')
        fetchRoom()
        broadcast('item_added', { title: data.title })
      } else {
        setError(data.error || t.invalidYoutubeUrl)
      }
    } catch {
      setError('Network error')
    } finally {
      setAddingVideo(false)
    }
  }

  async function handleControl(action: string) {
    if (!adminToken) return
    setControlLoading(action)
    setError(null)
    try {
      const res = await fetch(`/api/playlist/rooms/${roomCode}/controls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || `Failed to ${action}`)
      }
      await fetchRoom()
      broadcast('playback_update', { action })
    } catch {
      setError(`Failed to ${action}`)
    } finally {
      setControlLoading(null)
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      const headers: Record<string, string> = {}
      if (adminToken) headers['x-admin-token'] = adminToken
      if (sessionToken) headers['x-session-token'] = sessionToken

      await fetch(`/api/playlist/rooms/${roomCode}/items/${itemId}`, {
        method: 'DELETE',
        headers,
      })
      fetchRoom()
      broadcast('item_removed', { itemId })
    } catch {
      // Silently fail
    }
  }

  function handleCopyLink() {
    const shareUrl = `${window.location.origin}/${locale}/playlist/room/${roomCode}`
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- Phase Renders ---

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (phase === 'not-found') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className={`text-xl font-bold mb-2 ${fontClass}`}>
              {t.roomNotFound}
            </h2>
            <p className="text-gray-500 mb-4 font-mono tracking-widest">
              {roomCode}
            </p>
            <Link href={`/${locale}/playlist`}>
              <Button className="bg-[var(--sahakum-navy)] text-white hover:bg-[var(--sahakum-navy)]/90">
                <span className={fontClass}>{t.createRoom}</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (phase === 'expired') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className={`text-xl font-bold mb-2 ${fontClass}`}>
              {t.roomExpired}
            </h2>
            <Link href={`/${locale}/playlist`}>
              <Button className="bg-[var(--sahakum-navy)] text-white hover:bg-[var(--sahakum-navy)]/90">
                <span className={fontClass}>{t.createNewRoom}</span>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (phase === 'service-disabled') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className={`text-xl font-bold mb-2 ${fontClass}`}>
              {t.serviceUnavailable}
            </h2>
            <p className={`text-gray-500 ${fontClass}`}>
              {t.serviceUnavailableDesc}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Something went wrong. Please refresh the page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (phase === 'join') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className={fontClass}>
              {t.joinRoom} — {roomCode}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className={fontClass}>{error}</AlertDescription>
              </Alert>
            )}
            <Input
              placeholder={t.enterNickname}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              className={fontClass}
            />
            <Button
              onClick={handleJoin}
              disabled={joining || !nickname.trim()}
              className="w-full bg-[var(--sahakum-navy)] text-white hover:bg-[var(--sahakum-navy)]/90"
            >
              {joining && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <span className={fontClass}>{t.join}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- Main Room View ---
  const currentItem = room?.queueItems?.find(
    (item) => item.id === room.playbackState?.currentItemId
  )
  const queuedItems = room?.queueItems?.filter((item) => item.state === 'QUEUED') ?? []
  const isPlaying = room?.playbackState?.isPlaying ?? false

  return (
    <div className="max-w-7xl mx-auto px-3 py-3 sm:p-4 space-y-3 sm:space-y-4 w-full overflow-x-hidden pb-20 sm:pb-4">
      {/* Room Header */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="outline" className="text-base sm:text-lg tracking-widest font-mono px-2 sm:px-3 py-1 flex-shrink-0">
              {roomCode}
            </Badge>
            {isAdmin && (
              <Badge className="bg-[var(--sahakum-gold)] text-white flex-shrink-0">Admin</Badge>
            )}
            {isRealtimeSupported && (
              realtimeConnected ? (
                <Wifi className="h-4 w-4 text-green-500 flex-shrink-0" title="Realtime connected" />
              ) : (
                <WifiOff className="h-4 w-4 text-gray-300 flex-shrink-0" title="Realtime disconnected" />
              )
            )}
          </div>
          {minutesLeft !== null && (
            <Badge variant={minutesLeft < 10 ? 'destructive' : 'secondary'} className={`flex-shrink-0 ${fontClass}`}>
              <Clock className="h-3 w-3 mr-1" />
              {formatTimeRemaining(minutesLeft)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleCopyLink} className="h-8 px-2">
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            <span className={`ml-1 text-xs ${fontClass}`}>
              {copied ? t.codeCopied : t.shareLink}
            </span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowQr(true)} className="h-8 px-2">
            <QrCode className="h-4 w-4" />
            <span className={`ml-1 text-xs ${fontClass}`}>{t.showQr}</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={fontClass}>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4 min-w-0">
        {/* Left Column: Now Playing Info + Controls + Add Video */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 min-w-0 overflow-hidden">
          {/* Now Playing - Info card (no embedded video) */}
          <Card className="overflow-hidden py-3 sm:py-6 gap-2 sm:gap-6">
            <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6">
              <CardTitle className={`text-lg ${fontClass}`}>{t.nowPlaying}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {currentItem ? (
                <div className="flex items-start sm:items-center gap-3 p-2 sm:p-3 bg-[var(--sahakum-navy)] rounded-lg overflow-hidden">
                  {currentItem.thumbnailUrl ? (
                    <img
                      src={currentItem.thumbnailUrl}
                      alt=""
                      className="w-16 h-11 sm:w-28 sm:h-20 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-11 sm:w-28 sm:h-20 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                      <Music className="h-5 w-5 sm:h-8 sm:w-8 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-white font-medium text-sm sm:text-lg truncate">
                      {currentItem.title || currentItem.youtubeVideoId}
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">
                      {interpolate(t.addedBy, { name: currentItem.addedBy.nickname })}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {isPlaying ? (
                        <Badge className="bg-green-600 text-white text-xs">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                          <span className={fontClass}>{t.playing}</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <span className={fontClass}>{t.paused}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-8 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Music className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2" />
                    <p className={fontClass}>{t.nothingPlaying}</p>
                    {isAdmin && queuedItems.length > 0 && (
                      <p className={`text-sm mt-2 text-gray-500 ${fontClass}`}>
                        {t.pressPlayHint}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin: Display Screen Link + Controls */}
          {isAdmin && (
            <Card className="border-[var(--sahakum-gold)] border-2 overflow-hidden py-3 sm:py-6 gap-2 sm:gap-6">
              <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6">
                <CardTitle className="text-lg flex items-center gap-2 min-w-0">
                  <Monitor className="h-5 w-5 flex-shrink-0" />
                  <span className={`truncate ${fontClass}`}>{t.adminControls}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
                {/* Open Display Screen button */}
                <Link
                  href={`/${locale}/playlist/room/${roomCode}/display`}
                  target="_blank"
                  className="block"
                >
                  <Button
                    className="w-full bg-[var(--sahakum-navy)] text-white hover:bg-[var(--sahakum-navy)]/90 h-11 sm:h-12 text-sm sm:text-base !whitespace-normal shrink"
                  >
                    <Monitor className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className={`line-clamp-1 ${fontClass}`}>{t.openDisplayScreen}</span>
                    <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 text-center">
                  {t.displayScreenHint}
                </p>

                {/* Playback Controls */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t overflow-hidden">
                  <Button
                    onClick={() => handleControl(isPlaying ? 'pause' : 'play')}
                    disabled={controlLoading !== null || (!currentItem && queuedItems.length === 0)}
                    className="col-span-2 bg-green-600 text-white hover:bg-green-700 h-10 sm:h-11 text-sm overflow-hidden"
                  >
                    {controlLoading === 'play' || controlLoading === 'pause' ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-1.5 flex-shrink-0" />
                    ) : isPlaying ? (
                      <Pause className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 flex-shrink-0" />
                    ) : (
                      <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 flex-shrink-0" />
                    )}
                    <span className={`truncate ${fontClass}`}>{isPlaying ? t.pause : t.play}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleControl('skip')}
                    disabled={controlLoading !== null || !currentItem}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 h-10 sm:h-11 text-sm overflow-hidden"
                  >
                    {controlLoading === 'skip' ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-1.5 flex-shrink-0" />
                    ) : (
                      <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 flex-shrink-0" />
                    )}
                    <span className={`truncate ${fontClass}`}>{t.skip}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleControl('toggleLoop')}
                    disabled={controlLoading !== null}
                    className={`h-10 sm:h-11 text-sm overflow-hidden ${
                      room?.loopQueue
                        ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {controlLoading === 'toggleLoop' ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-1.5 flex-shrink-0" />
                    ) : (
                      <Repeat className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 flex-shrink-0" />
                    )}
                    <span className={`truncate ${fontClass}`}>{t.loopList}</span>
                    <span className="ml-1 text-xs flex-shrink-0">
                      {room?.loopQueue ? t.loopListOn : t.loopListOff}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowClearQueueDialog(true)}
                    disabled={controlLoading !== null || queuedItems.length === 0}
                    className="col-span-2 border-red-300 text-red-600 hover:bg-red-50 h-10 sm:h-11 text-sm overflow-hidden"
                  >
                    {controlLoading === 'clear' ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-1.5 flex-shrink-0" />
                    ) : (
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 flex-shrink-0" />
                    )}
                    <span className={`truncate ${fontClass}`}>{t.clearQueue}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Video — desktop card */}
          {(sessionToken || isAdmin) && (
            <Card className="overflow-hidden py-2 sm:py-4 hidden sm:block">
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={t.pasteYoutubeUrl}
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddVideo()}
                    className={`flex-1 text-sm ${fontClass}`}
                  />
                  <Button
                    onClick={handleAddVideo}
                    disabled={addingVideo || !videoUrl.trim()}
                    className="bg-[var(--sahakum-navy)] text-white hover:bg-[var(--sahakum-navy)]/90"
                  >
                    {addingVideo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    <span className={fontClass}>{t.add}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Queue + Participants */}
        <div className="space-y-3 sm:space-y-4 min-w-0 overflow-hidden">
          {/* Queue */}
          <Card className="overflow-hidden py-3 sm:py-6 gap-2 sm:gap-6">
            <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6">
              <CardTitle className={`text-lg flex items-center justify-between ${fontClass}`}>
                {t.queue}
                <Badge variant="secondary">{queuedItems.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              {queuedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Music className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className={fontClass}>{t.noVideos}</p>
                  <p className={`text-sm mt-1 ${fontClass}`}>{t.addFirstVideo}</p>
                </div>
              ) : (
                <div className="space-y-1 sm:space-y-2 max-h-[350px] sm:max-h-[400px] overflow-y-auto">
                  {queuedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 group"
                    >
                      <span className="text-xs sm:text-sm text-gray-400 w-4 sm:w-5 text-right flex-shrink-0">
                        {index + 1}
                      </span>
                      {item.thumbnailUrl && (
                        <img
                          src={item.thumbnailUrl}
                          alt=""
                          className="w-12 h-8 sm:w-16 sm:h-10 object-cover rounded flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium truncate">
                          {item.title || item.youtubeVideoId}
                        </p>
                        <p className={`text-xs text-gray-400 truncate ${fontClass}`}>
                          {interpolate(t.addedBy, { name: item.addedBy.nickname })}
                        </p>
                      </div>
                      {(isAdmin ||
                        (sessionToken && item.addedBy.id === participantId)) && (
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="sm:opacity-0 sm:group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                          title={t.removeSong}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="overflow-hidden py-3 sm:py-6 gap-2 sm:gap-6">
            <CardHeader className="pb-0 sm:pb-2 px-3 sm:px-6">
              <CardTitle className={`text-lg flex items-center justify-between ${fontClass}`}>
                {t.participants}
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {room?.participants?.length ?? 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="space-y-2">
                {room?.participants?.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--sahakum-navy)] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {p.nickname.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium truncate">{p.nickname}</span>
                    {p.role === 'ADMIN' && (
                      <Badge className="bg-[var(--sahakum-gold)] text-white text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Add Video — sticky bottom bar */}
      {(sessionToken || isAdmin) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="px-3 py-3 max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div className="flex-1 relative min-w-0">
                <Input
                  placeholder={t.pasteYoutubeUrl}
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddVideo()}
                  className={`w-full h-10 text-sm pr-12 ${fontClass}`}
                />
                <Button
                  onClick={handleAddVideo}
                  disabled={addingVideo || !videoUrl.trim()}
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-[var(--sahakum-navy)] text-white hover:bg-[var(--sahakum-navy)]/90 rounded-md"
                >
                  {addingVideo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowQr(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-sm w-full text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-xl font-bold mb-2 ${fontClass}`}>
              {t.scanToJoin}
            </h3>
            <p className="text-gray-500 font-mono text-2xl tracking-widest mb-6">
              {roomCode}
            </p>
            <div className="flex justify-center mb-6">
              <QRCodeSVG
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/playlist/room/${roomCode}`}
                size={220}
                level="M"
                includeMargin
                fgColor="var(--sahakum-navy, #0D1931)"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowQr(false)}
              className={`w-full ${fontClass}`}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Clear Queue Confirmation Dialog */}
      <AlertDialog open={showClearQueueDialog} onOpenChange={setShowClearQueueDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={fontClass}>{t.clearQueueConfirm}</AlertDialogTitle>
            <AlertDialogDescription className={fontClass}>
              {t.clearQueueDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={fontClass}>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowClearQueueDialog(false)
                handleControl('clear')
              }}
              className={`bg-red-600 text-white hover:bg-red-700 ${fontClass}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t.clearQueue}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
