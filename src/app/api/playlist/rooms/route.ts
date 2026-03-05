import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import {
  isServiceEnabled,
  canAnonCreateRooms,
  isRoomLimitReached,
  getServiceSettings,
} from '@/lib/playlist/service-settings'
import { calculateRoomExpiry } from '@/lib/playlist/expiry-calculator'
import crypto from 'crypto'

function generateAdminToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isServiceEnabled())) {
      return NextResponse.json(
        { error: 'Playlist service is currently unavailable' },
        { status: 503 }
      )
    }

    if (await isRoomLimitReached()) {
      return NextResponse.json(
        { error: 'Maximum number of active rooms reached. Please try again later.' },
        { status: 429 }
      )
    }

    const session = await getServerSession(authOptions)
    const isLoggedIn = !!session?.user?.id

    if (!isLoggedIn && !(await canAnonCreateRooms())) {
      return NextResponse.json(
        { error: 'Login required to create rooms' },
        { status: 403 }
      )
    }

    const settings = await getServiceSettings()
    const roomCode = nanoid(6).toUpperCase()
    const adminToken = generateAdminToken()

    const expiresAt = calculateRoomExpiry(
      'Europe/Stockholm',
      settings.maxRoomDurationHours,
      settings.eveningCutoffHour
    )

    const room = await prisma.playlistRoom.create({
      data: {
        roomCode,
        ownerType: isLoggedIn ? 'USER' : 'ANON',
        ownerId: session?.user?.id ?? null,
        adminSessionToken: adminToken,
        expiresAt,
        timezone: 'Europe/Stockholm',
      },
    })

    await prisma.playlistPlaybackState.create({
      data: { roomId: room.id },
    })

    return NextResponse.json({
      roomCode: room.roomCode,
      adminToken,
      expiresAt: room.expiresAt,
    })
  } catch (error) {
    console.error('Failed to create room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const rooms = await prisma.playlistRoom.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { participants: true, queueItems: true } },
      },
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Failed to fetch rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}
