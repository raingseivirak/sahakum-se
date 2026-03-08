import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addHours } from 'date-fns'

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const { hours } = body

    if (!hours || typeof hours !== 'number' || hours < 1 || hours > 720) {
      return NextResponse.json(
        { error: 'Hours must be between 1 and 720 (30 days)' },
        { status: 400 }
      )
    }

    const room = await prisma.playlistRoom.findUnique({
      where: { roomCode: params.code },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const currentExpiry = room.extendedUntil ?? room.expiresAt
    const isExpired = currentExpiry.getTime() < Date.now()
    const baseTime = isExpired ? new Date() : currentExpiry
    const newExpiry = addHours(baseTime, hours)

    const updated = await prisma.playlistRoom.update({
      where: { roomCode: params.code },
      data: {
        extendedUntil: newExpiry,
        extendedBy: session.user.id,
      },
    })

    return NextResponse.json({
      roomCode: updated.roomCode,
      originalExpiry: updated.expiresAt,
      extendedUntil: updated.extendedUntil,
    })
  } catch (error) {
    console.error('Failed to extend room:', error)
    return NextResponse.json(
      { error: 'Failed to extend room' },
      { status: 500 }
    )
  }
}
