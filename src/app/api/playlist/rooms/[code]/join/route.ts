import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isRoomExpired } from '@/lib/playlist/expiry-calculator'
import { isServiceEnabled } from '@/lib/playlist/service-settings'
import crypto from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    if (!(await isServiceEnabled())) {
      return NextResponse.json(
        { error: 'Playlist service is currently disabled' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { nickname } = body

    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json(
        { error: 'Nickname is required' },
        { status: 400 }
      )
    }

    const trimmed = nickname.trim()
    if (trimmed.length < 2 || trimmed.length > 20) {
      return NextResponse.json(
        { error: 'Nickname must be 2-20 characters' },
        { status: 400 }
      )
    }

    const room = await prisma.playlistRoom.findUnique({
      where: { roomCode: params.code },
      include: {
        participants: { where: { isActive: true } },
      },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (isRoomExpired(room.expiresAt, room.extendedUntil)) {
      return NextResponse.json({ error: 'Room has expired' }, { status: 410 })
    }

    const existingNickname = room.participants.find(
      (p) => p.nickname.toLowerCase() === trimmed.toLowerCase()
    )
    if (existingNickname) {
      return NextResponse.json(
        { error: 'Nickname already taken in this room' },
        { status: 409 }
      )
    }

    const session = await getServerSession(authOptions)
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip')

    const participant = await prisma.playlistParticipant.create({
      data: {
        roomId: room.id,
        nickname: trimmed,
        userId: session?.user?.id ?? null,
        sessionToken,
        role: 'PARTICIPANT',
        ipAddress: ip,
      },
    })

    return NextResponse.json({
      participantId: participant.id,
      sessionToken: participant.sessionToken,
      nickname: participant.nickname,
      role: participant.role,
    })
  } catch (error) {
    console.error('Failed to join room:', error)
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    )
  }
}
