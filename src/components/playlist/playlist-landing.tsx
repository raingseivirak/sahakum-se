'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Music, LogIn, AlertCircle, Loader2 } from 'lucide-react'

export interface PlaylistLandingTranslations {
  createRoom: string
  createRoomDesc: string
  createNewRoom: string
  joinRoom: string
  joinRoomDesc: string
  enterRoomCode: string
  serviceUnavailable: string
  atCapacity: string
  loginRequired: string
  customCodePlaceholder: string
  codeTaken: string
  codeInvalid: string
}

interface PlaylistLandingProps {
  locale: string
  t: PlaylistLandingTranslations
}

export function PlaylistLanding({ locale, t }: PlaylistLandingProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  const [roomCode, setRoomCode] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  async function handleCreateRoom() {
    setCreating(true)
    setError(null)

    const trimmedCode = customCode.trim().toUpperCase()

    try {
      const res = await fetch('/api/playlist/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trimmedCode ? { roomCode: trimmedCode } : {}),
      })
      const data = await res.json()

      if (res.ok) {
        localStorage.setItem(`playlist_admin_${data.roomCode}`, data.adminToken)
        router.push(`/${locale}/playlist/room/${data.roomCode}`)
      } else if (res.status === 503) {
        setError(t.serviceUnavailable)
      } else if (res.status === 429) {
        setError(t.atCapacity)
      } else if (res.status === 409) {
        setError(t.codeTaken)
      } else if (res.status === 400) {
        setError(t.codeInvalid)
      } else if (res.status === 403) {
        setError(t.loginRequired)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  function handleJoinRoom() {
    const code = roomCode.trim().toUpperCase()
    if (!code) return
    router.push(`/${locale}/playlist/room/${code}`)
  }

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={fontClass}>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
        <Card className="border-2 hover:border-[var(--sahakum-gold)] transition-colors">
          <CardContent className="p-5 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[var(--sahakum-navy)] rounded-full flex items-center justify-center mx-auto">
              <Music className="h-8 w-8 text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${fontClass}`}>
              {t.createRoom}
            </h2>
            <p className={`text-gray-600 ${fontClass}`}>
              {t.createRoomDesc}
            </p>
            {isLoggedIn && (
              <Input
                placeholder={t.customCodePlaceholder}
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                className={`text-center text-lg tracking-widest uppercase ${fontClass}`}
                maxLength={10}
              />
            )}
            <Button
              size="lg"
              onClick={handleCreateRoom}
              disabled={creating}
              className="w-full bg-[var(--sahakum-navy)] text-white hover:bg-[var(--sahakum-navy)]/90"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Music className="h-4 w-4 mr-2" />
              )}
              <span className={fontClass}>
                {creating ? t.createRoom + '...' : t.createNewRoom}
              </span>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-[var(--sahakum-gold)] transition-colors">
          <CardContent className="p-5 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[var(--sahakum-gold)] rounded-full flex items-center justify-center mx-auto">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h2 className={`text-2xl font-bold ${fontClass}`}>
              {t.joinRoom}
            </h2>
            <p className={`text-gray-600 ${fontClass}`}>
              {t.joinRoomDesc}
            </p>
            <Input
              placeholder={t.enterRoomCode}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className={`text-center text-lg tracking-widest uppercase ${fontClass}`}
              maxLength={10}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
            <Button
              size="lg"
              variant="outline"
              onClick={handleJoinRoom}
              disabled={!roomCode.trim()}
              className="w-full border-[var(--sahakum-navy)] text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)] hover:text-white"
            >
              <LogIn className="h-4 w-4 mr-2" />
              <span className={fontClass}>{t.joinRoom}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
