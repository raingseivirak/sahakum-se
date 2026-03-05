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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Music,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Users,
  Clock,
  Shield,
} from 'lucide-react'

interface PlaylistSettings {
  id: string
  serviceEnabled: boolean
  allowAnonRooms: boolean
  maxConcurrentRooms: number
  maxRoomDurationHours: number
  eveningCutoffHour: number
  roomCreationPerIpHour: number
  videoAddPerUserSec: number
  updatedAt: string
  updatedBy: string | null
}

interface PlaylistStats {
  activeRooms: number
  totalParticipants: number
}

export default function PlaylistSettingsPage() {
  const [settings, setSettings] = useState<PlaylistSettings | null>(null)
  const [stats, setStats] = useState<PlaylistStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, statsRes] = await Promise.all([
        fetch('/api/playlist/settings'),
        fetch('/api/playlist/stats'),
      ])
      if (settingsRes.ok) setSettings(await settingsRes.json())
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

  async function handleSave() {
    if (!settings) return

    setSaving(true)
    setSaveStatus(null)

    try {
      const res = await fetch('/api/playlist/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceEnabled: settings.serviceEnabled,
          allowAnonRooms: settings.allowAnonRooms,
          maxConcurrentRooms: settings.maxConcurrentRooms,
          maxRoomDurationHours: settings.maxRoomDurationHours,
          eveningCutoffHour: settings.eveningCutoffHour,
          roomCreationPerIpHour: settings.roomCreationPerIpHour,
          videoAddPerUserSec: settings.videoAddPerUserSec,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setSettings(updated)
        setSaveStatus('success')
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!settings) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load playlist settings. Make sure the seed script has been
          run.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/playlist/settings">
                  Playlist Service
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8 text-[var(--sahakum-navy)]" />
            <div>
              <h1 className="text-2xl font-bold font-sweden">
                Playlist Service Settings
              </h1>
              <p className="text-sm text-gray-500">
                Control the shared YouTube playlist service
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Save Status */}
        {saveStatus === 'success' && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Settings saved successfully
            </AlertDescription>
          </Alert>
        )}
        {saveStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to save settings. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Music className="h-4 w-4" />
                Active Rooms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.activeRooms ?? 0}
                <span className="text-base font-normal text-gray-400">
                  /{settings.maxConcurrentRooms}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.totalParticipants ?? 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Service Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg font-bold ${
                  settings.serviceEnabled ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {settings.serviceEnabled ? 'Active' : 'Disabled'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Service Control
            </CardTitle>
            <CardDescription>
              Enable or disable the playlist service and configure access
              policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Service Enabled</Label>
                <p className="text-sm text-gray-500">
                  Turn the entire playlist service on or off for all users
                </p>
              </div>
              <Switch
                checked={settings.serviceEnabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, serviceEnabled: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">
                  Allow Anonymous Room Creation
                </Label>
                <p className="text-sm text-gray-500">
                  When disabled, only logged-in users can create rooms.
                  Anonymous users can still join existing rooms.
                </p>
              </div>
              <Switch
                checked={settings.allowAnonRooms}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, allowAnonRooms: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Room Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Room Configuration
            </CardTitle>
            <CardDescription>
              Configure room duration, limits, and expiry rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Max Concurrent Rooms</Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={settings.maxConcurrentRooms}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxConcurrentRooms: parseInt(e.target.value) || 100,
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Maximum number of active rooms at the same time
                </p>
              </div>

              <div className="space-y-2">
                <Label>Default Room Duration (hours)</Label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={settings.maxRoomDurationHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maxRoomDurationHours: parseInt(e.target.value) || 4,
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  How long a room stays active after creation
                </p>
              </div>

              <div className="space-y-2">
                <Label>Evening Cutoff Hour (24h format)</Label>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={settings.eveningCutoffHour}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      eveningCutoffHour: parseInt(e.target.value) || 22,
                    })
                  }
                />
                <p className="text-xs text-gray-500">
                  Rooms expire at this hour regardless of duration (e.g., 22 =
                  10:00 PM Stockholm time)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Rate Limiting
            </CardTitle>
            <CardDescription>
              Prevent abuse by limiting how quickly actions can be performed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Room Creations per IP (per hour)</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.roomCreationPerIpHour}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      roomCreationPerIpHour: parseInt(e.target.value) || 3,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Seconds Between Video Adds (per user)</Label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={settings.videoAddPerUserSec}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      videoAddPerUserSec: parseInt(e.target.value) || 10,
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Updated */}
        {settings.updatedAt && (
          <p className="text-xs text-gray-400 text-right">
            Last updated:{' '}
            {new Date(settings.updatedAt).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        )}
      </div>
    </>
  )
}
