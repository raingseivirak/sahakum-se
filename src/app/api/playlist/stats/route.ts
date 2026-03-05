import { NextResponse } from 'next/server'
import { getActiveRoomsCount } from '@/lib/playlist/service-settings'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const activeRooms = await getActiveRoomsCount()

    const totalParticipants = await prisma.playlistParticipant.count({
      where: {
        isActive: true,
        room: {
          OR: [
            { expiresAt: { gt: new Date() }, extendedUntil: null },
            { extendedUntil: { gt: new Date() } },
          ],
        },
      },
    })

    return NextResponse.json({ activeRooms, totalParticipants })
  } catch (error) {
    console.error('Failed to fetch playlist stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
