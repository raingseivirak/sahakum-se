import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

function generateRoomCode(): string {
  const digits = String(Math.floor(1000 + Math.random() * 9000))
  const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ'
  const a = letters[Math.floor(Math.random() * letters.length)]
  const b = letters[Math.floor(Math.random() * letters.length)]
  return `${digits}${a}${b}`
}

const CUSTOM_CODE_REGEX = /^[A-Z0-9]{4,10}$/

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

    let body: { roomCode?: string } = {}
    try {
      body = await req.json()
    } catch {
      // No body or invalid JSON — use defaults
    }

    const settings = await getServiceSettings()
    let roomCode: string

    if (body.roomCode && typeof body.roomCode === 'string') {
      const customCode = body.roomCode.trim().toUpperCase()

      if (!isLoggedIn) {
        return NextResponse.json(
          { error: 'Login required to use a custom room code', code: 'LOGIN_REQUIRED' },
          { status: 403 }
        )
      }

      if (!CUSTOM_CODE_REGEX.test(customCode)) {
        return NextResponse.json(
          { error: 'Code must be 4-10 uppercase letters/numbers', code: 'CODE_INVALID' },
          { status: 400 }
        )
      }

      const existing = await prisma.playlistRoom.findUnique({
        where: { roomCode: customCode },
        select: { id: true },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'This code is already in use', code: 'CODE_TAKEN' },
          { status: 409 }
        )
      }

      roomCode = customCode
    } else {
      roomCode = generateRoomCode()
    }

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
