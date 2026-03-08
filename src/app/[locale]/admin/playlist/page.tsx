'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Music,
  Users,
  Clock,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatTimeRemaining } from '@/lib/playlist/expiry-calculator'

interface Room {
  id: string
  roomCode: string
  ownerType: string
  expiresAt: string
  extendedUntil: string | null
  createdAt: string
  autoplay: boolean
  owner: { name: string | null; email: string } | null
  _count: { participants: number; queueItems: number }
}

export default function PlaylistAdminPage() {
  const params = useParams()
  const locale = params.locale as string

  const [rooms, setRooms] = useState<Room[]>([])
  const [stats, setStats] = useState<{ activeRooms: number; totalParticipants: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [extendingRoom, setExtendingRoom] = useState<string | null>(null)
  const [extendHours, setExtendHours] = useState('2')

  const extendPresets = [
    { label: '1 hour', value: 1 },
    { label: '2 hours', value: 2 },
    { label: '6 hours', value: 6 },
    { label: '12 hours', value: 12 },
    { label: '1 day', value: 24 },
    { label: '3 days', value: 72 },
    { label: '7 days', value: 168 },
    { label: '30 days', value: 720 },
  ]
  const [extendResult, setExtendResult] = useState<{ code: string; status: 'success' | 'error'; action?: string } | null>(null)
  const [expiringRoom, setExpiringRoom] = useState<string | null>(null)
  const [confirmExpireRoom, setConfirmExpireRoom] = useState<string | null>(null)
  const [reactivatingRoom, setReactivatingRoom] = useState<string | null>(null)
  const [reactivateHours, setReactivateHours] = useState('2')

  const fetchData = useCallback(async () => {
    try {
      const [roomsRes, statsRes] = await Promise.all([
        fetch('/api/playlist/rooms'),
        fetch('/api/playlist/stats'),
      ])
      if (roomsRes.ok) setRooms(await roomsRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function isExpired(room: Room) {
    const expiry = room.extendedUntil ?? room.expiresAt
    return new Date(expiry) < new Date()
  }

  const activeRooms = rooms.filter((r) => !isExpired(r))
  const expiredRooms = rooms.filter((r) => isExpired(r))

  async function handleExtend(roomCode: string) {
    const hours = parseInt(extendHours)
    if (!hours || hours < 1 || hours > 720) return

    try {
      const res = await fetch(`/api/playlist/rooms/${roomCode}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      })

      if (res.ok) {
        setExtendResult({ code: roomCode, status: 'success' })
        setExtendingRoom(null)
        fetchData()
      } else {
        setExtendResult({ code: roomCode, status: 'error' })
      }
    } catch {
      setExtendResult({ code: roomCode, status: 'error' })
    }

    setTimeout(() => setExtendResult(null), 3000)
  }

  async function handleForceExpire(roomCode: string) {
    setConfirmExpireRoom(null)
    setExpiringRoom(roomCode)

    try {
      const res = await fetch(`/api/playlist/rooms/${roomCode}/expire`, {
        method: 'POST',
      })

      if (res.ok) {
        setExtendResult({ code: roomCode, status: 'success', action: 'expired' })
        fetchData()
      } else {
        setExtendResult({ code: roomCode, status: 'error', action: 'expired' })
      }
    } catch {
      setExtendResult({ code: roomCode, status: 'error', action: 'expired' })
    } finally {
      setExpiringRoom(null)
    }

    setTimeout(() => setExtendResult(null), 3000)
  }

  async function handleReactivate(roomCode: string) {
    const hours = parseInt(reactivateHours)
    if (!hours || hours < 1 || hours > 720) return

    try {
      const res = await fetch(`/api/playlist/rooms/${roomCode}/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours }),
      })

      if (res.ok) {
        setExtendResult({ code: roomCode, status: 'success', action: 'reactivated' })
        setReactivatingRoom(null)
        fetchData()
      } else {
        setExtendResult({ code: roomCode, status: 'error', action: 'reactivated' })
      }
    } catch {
      setExtendResult({ code: roomCode, status: 'error', action: 'reactivated' })
    }

    setTimeout(() => setExtendResult(null), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${locale}/admin`}>Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Playlist Rooms</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8 text-[var(--sahakum-navy)]" />
            <div>
              <h1 className="text-2xl font-bold font-sweden">Playlist Rooms</h1>
              <p className="text-sm text-gray-500">Manage active and expired rooms</p>
            </div>
          </div>
          <Link href={`/${locale}/admin/playlist/settings`}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Service Settings
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Music className="h-4 w-4" /> Active Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.activeRooms ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="h-4 w-4" /> Total Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalParticipants ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Expired Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{expiredRooms.length}</div>
            </CardContent>
          </Card>
        </div>

        {extendResult && (
          <Alert variant={extendResult.status === 'success' ? 'default' : 'destructive'}>
            {extendResult.status === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {extendResult.status === 'success'
                ? extendResult.action === 'expired'
                  ? `Room ${extendResult.code} has been force-expired`
                  : extendResult.action === 'reactivated'
                    ? `Room ${extendResult.code} reactivated successfully`
                    : `Room ${extendResult.code} extended successfully`
                : extendResult.action === 'expired'
                  ? `Failed to expire room ${extendResult.code}`
                  : extendResult.action === 'reactivated'
                    ? `Failed to reactivate room ${extendResult.code}`
                    : `Failed to extend room ${extendResult.code}`}
            </AlertDescription>
          </Alert>
        )}

        {/* Active Rooms */}
        <Card>
          <CardHeader>
            <CardTitle>Active Rooms ({activeRooms.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {activeRooms.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No active rooms</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Videos</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeRooms.map((room) => {
                    const expiry = room.extendedUntil ?? room.expiresAt
                    const minutesLeft = Math.max(
                      0,
                      Math.floor((new Date(expiry).getTime() - Date.now()) / 60_000)
                    )

                    return (
                      <TableRow key={room.id}>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                            {room.roomCode}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={room.ownerType === 'USER' ? 'default' : 'secondary'}>
                            {room.ownerType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {room.owner?.name || room.owner?.email || 'Anonymous'}
                        </TableCell>
                        <TableCell>{room._count.participants}</TableCell>
                        <TableCell>{room._count.queueItems}</TableCell>
                        <TableCell>
                          <Badge variant={minutesLeft < 30 ? 'destructive' : 'secondary'}>
                            {formatTimeRemaining(minutesLeft)}
                          </Badge>
                          {room.extendedUntil && (
                            <Badge className="ml-1 bg-blue-100 text-blue-700">Extended</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/${locale}/playlist/room/${room.roomCode}`}
                              target="_blank"
                            >
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                            {extendingRoom === room.roomCode ? (
                              <div className="flex items-center gap-1">
                                <select
                                  value={extendHours}
                                  onChange={(e) => setExtendHours(e.target.value)}
                                  className="h-8 text-xs border rounded px-1 bg-white"
                                >
                                  {extendPresets.map((p) => (
                                    <option key={p.value} value={p.value}>
                                      {p.label}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs"
                                  onClick={() => handleExtend(room.roomCode)}
                                >
                                  Extend
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs"
                                  onClick={() => setExtendingRoom(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setExtendingRoom(room.roomCode)}
                                >
                                  <PlusCircle className="h-3 w-3 mr-1" />
                                  Extend
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setConfirmExpireRoom(room.roomCode)}
                                  disabled={expiringRoom === room.roomCode}
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                  {expiringRoom === room.roomCode ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Expire
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Expired Rooms (last 20) */}
        {expiredRooms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Recently Expired ({Math.min(expiredRooms.length, 20)})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expired At</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Videos</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiredRooms.slice(0, 20).map((room) => (
                    <TableRow key={room.id} className="opacity-60 hover:opacity-100 transition-opacity">
                      <TableCell>
                        <code className="text-sm font-mono">{room.roomCode}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{room.ownerType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(room.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(room.extendedUntil ?? room.expiresAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>{room._count.participants}</TableCell>
                      <TableCell>{room._count.queueItems}</TableCell>
                      <TableCell>
                        {reactivatingRoom === room.roomCode ? (
                          <div className="flex items-center gap-1">
                            <select
                              value={reactivateHours}
                              onChange={(e) => setReactivateHours(e.target.value)}
                              className="h-8 text-xs border rounded px-1 bg-white"
                            >
                              {extendPresets.map((p) => (
                                <option key={p.value} value={p.value}>
                                  {p.label}
                                </option>
                              ))}
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs border-green-300 text-green-700 hover:bg-green-50"
                              onClick={() => handleReactivate(room.roomCode)}
                            >
                              Reactivate
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs"
                              onClick={() => setReactivatingRoom(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => setReactivatingRoom(room.roomCode)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Force Expire Confirmation Dialog */}
      <AlertDialog open={!!confirmExpireRoom} onOpenChange={(open) => !open && setConfirmExpireRoom(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Force Expire Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to force expire room{' '}
              <span className="font-mono font-bold text-gray-900">{confirmExpireRoom}</span>?
              This will immediately stop playback and disconnect all participants.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmExpireRoom && handleForceExpire(confirmExpireRoom)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Force Expire
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
