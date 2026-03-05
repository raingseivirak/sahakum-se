import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRoomExpired } from '@/lib/playlist/expiry-calculator'
import { isServiceEnabled } from '@/lib/playlist/service-settings'

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    if (!(await isServiceEnabled())) {
      return NextResponse.json(
        { error: 'Playlist service is currently disabled' },
        { status: 503 }
      )
    }

    const room = await prisma.playlistRoom.findUnique({
      where: { roomCode: params.code },
      include: {
        participants: {
          where: { isActive: true },
          select: {
            id: true,
            nickname: true,
            role: true,
            joinedAt: true,
            lastSeenAt: true,
          },
        },
        queueItems: {
          where: { state: { not: 'REMOVED' } },
          orderBy: { queueOrder: 'asc' },
          include: {
            addedBy: { select: { id: true, nickname: true } },
          },
        },
        playbackState: true,
      },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const expired = isRoomExpired(room.expiresAt, room.extendedUntil)
    if (expired) {
      return NextResponse.json({ error: 'Room has expired' }, { status: 410 })
    }

    const { adminSessionToken: _adminToken, ...safeRoom } = room

    return NextResponse.json(safeRoom)
  } catch (error) {
    console.error('Failed to fetch room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}
