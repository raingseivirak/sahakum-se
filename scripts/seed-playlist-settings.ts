import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const settings = await prisma.playlistServiceSettings.upsert({
    where: { id: 'playlist_service_settings' },
    update: {},
    create: {
      id: 'playlist_service_settings',
      serviceEnabled: true,
      allowAnonRooms: true,
      maxConcurrentRooms: 100,
      maxRoomDurationHours: 4,
      eveningCutoffHour: 22,
      roomCreationPerIpHour: 3,
      videoAddPerUserSec: 10,
    },
  })

  console.log('Playlist service settings seeded:', settings)
}

main()
  .catch((e) => {
    console.error('Failed to seed playlist settings:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
