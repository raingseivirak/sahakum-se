import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const room = await prisma.playlistRoom.findUnique({
      where: { roomCode: params.code },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const now = new Date()

    await prisma.playlistRoom.update({
      where: { roomCode: params.code },
      data: {
        expiresAt: now,
        extendedUntil: now,
      },
    })

    await prisma.playlistPlaybackState.updateMany({
      where: { roomId: room.id },
      data: { isPlaying: false },
    })

    return NextResponse.json({
      roomCode: room.roomCode,
      expiredAt: now,
    })
  } catch (error) {
    console.error('Failed to force-expire room:', error)
    return NextResponse.json(
      { error: 'Failed to expire room' },
      { status: 500 }
    )
  }
}
