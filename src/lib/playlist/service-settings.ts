import { prisma } from '@/lib/prisma'

const SETTINGS_ID = 'playlist_service_settings'
const CACHE_TTL = 60_000 // 1 minute

let cachedSettings: PlaylistSettings | null = null
let cacheTimestamp = 0

interface PlaylistSettings {
  id: string
  serviceEnabled: boolean
  allowAnonRooms: boolean
  maxConcurrentRooms: number
  maxRoomDurationHours: number
  eveningCutoffHour: number
  roomCreationPerIpHour: number
  videoAddPerUserSec: number
  updatedAt: Date
  updatedBy: string | null
}

export async function getServiceSettings(): Promise<PlaylistSettings> {
  const now = Date.now()

  if (cachedSettings && now - cacheTimestamp < CACHE_TTL) {
    return cachedSettings
  }

  const settings = await prisma.playlistServiceSettings.findUnique({
    where: { id: SETTINGS_ID },
  })

  if (!settings) {
    throw new Error(
      'Playlist service settings not found. Run the seed script first.'
    )
  }

  cachedSettings = settings
  cacheTimestamp = now
  return settings
}

export function clearSettingsCache() {
  cachedSettings = null
  cacheTimestamp = 0
}

export async function updateServiceSettings(
  updates: Partial<{
    serviceEnabled: boolean
    allowAnonRooms: boolean
    maxConcurrentRooms: number
    maxRoomDurationHours: number
    eveningCutoffHour: number
    roomCreationPerIpHour: number
    videoAddPerUserSec: number
  }>,
  adminUserId: string
) {
  const settings = await prisma.playlistServiceSettings.update({
    where: { id: SETTINGS_ID },
    data: {
      ...updates,
      updatedBy: adminUserId,
    },
  })

  clearSettingsCache()
  return settings
}

export async function isServiceEnabled(): Promise<boolean> {
  const settings = await getServiceSettings()
  return settings.serviceEnabled
}

export async function canAnonCreateRooms(): Promise<boolean> {
  const settings = await getServiceSettings()
  return settings.allowAnonRooms
}

export async function getActiveRoomsCount(): Promise<number> {
  return prisma.playlistRoom.count({
    where: {
      OR: [
        { expiresAt: { gt: new Date() }, extendedUntil: null },
        { extendedUntil: { gt: new Date() } },
      ],
    },
  })
}

export async function isRoomLimitReached(): Promise<boolean> {
  const settings = await getServiceSettings()
  const activeCount = await getActiveRoomsCount()
  return activeCount >= settings.maxConcurrentRooms
}
