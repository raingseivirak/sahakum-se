import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isRoomExpired } from '@/lib/playlist/expiry-calculator'
import { isServiceEnabled } from '@/lib/playlist/service-settings'
import { parseYouTubeUrl, fetchVideoTitle } from '@/lib/playlist/youtube-parser'

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
    const { youtubeUrl, participantSessionToken, adminToken } = body

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL required' },
        { status: 400 }
      )
    }

    if (!participantSessionToken && !adminToken) {
      return NextResponse.json(
        { error: 'Session token or admin token required' },
        { status: 400 }
      )
    }

    const videoInfo = parseYouTubeUrl(youtubeUrl)
    if (!videoInfo) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    const room = await prisma.playlistRoom.findUnique({
      where: { roomCode: params.code },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (isRoomExpired(room.expiresAt, room.extendedUntil)) {
      return NextResponse.json({ error: 'Room has expired' }, { status: 410 })
    }

    let addedById: string | null = null

    if (adminToken && adminToken === room.adminSessionToken) {
      // Admin adding directly — find or create an admin participant
      let adminParticipant = await prisma.playlistParticipant.findFirst({
        where: { roomId: room.id, role: 'ADMIN' },
      })
      if (!adminParticipant) {
        adminParticipant = await prisma.playlistParticipant.create({
          data: {
            roomId: room.id,
            nickname: 'Admin',
            role: 'ADMIN',
            sessionToken: adminToken,
          },
        })
      }
      addedById = adminParticipant.id
    } else if (participantSessionToken) {
      const participant = await prisma.playlistParticipant.findUnique({
        where: { sessionToken: participantSessionToken },
      })

      if (!participant || participant.roomId !== room.id) {
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 403 }
        )
      }

      if (!room.allowGuestsAdd && participant.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Only admin can add videos' },
          { status: 403 }
        )
      }
      addedById = participant.id
    } else {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 403 }
      )
    }

    const maxOrder = await prisma.playlistQueueItem.aggregate({
      where: { roomId: room.id },
      _max: { queueOrder: true },
    })

    const title = await fetchVideoTitle(videoInfo.videoId)

    const item = await prisma.playlistQueueItem.create({
      data: {
        roomId: room.id,
        youtubeVideoId: videoInfo.videoId,
        youtubeUrl: videoInfo.url,
        title,
        thumbnailUrl: videoInfo.thumbnailUrl,
        queueOrder: (maxOrder._max.queueOrder ?? 0) + 1,
        addedById,
      },
      include: {
        addedBy: { select: { id: true, nickname: true } },
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Failed to add video:', error)
    return NextResponse.json(
      { error: 'Failed to add video' },
      { status: 500 }
    )
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const room = await prisma.playlistRoom.findUnique({
      where: { roomCode: params.code },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const items = await prisma.playlistQueueItem.findMany({
      where: { roomId: room.id, state: { not: 'REMOVED' } },
      orderBy: { queueOrder: 'asc' },
      include: {
        addedBy: { select: { id: true, nickname: true } },
      },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Failed to fetch queue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch queue' },
      { status: 500 }
    )
  }
}
