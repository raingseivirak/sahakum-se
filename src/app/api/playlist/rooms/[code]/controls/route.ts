import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type ControlAction = 'play' | 'pause' | 'skip' | 'next' | 'clear' | 'seek' | 'toggleLoop'

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const adminToken = req.headers.get('x-admin-token')

    const room = await prisma.playlistRoom.findUnique({
      where: { roomCode: params.code },
      include: { playbackState: true },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (adminToken !== room.adminSessionToken) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await req.json()
    const action: ControlAction = body.action

    if (action === 'toggleLoop') {
      const updated = await prisma.playlistRoom.update({
        where: { id: room.id },
        data: { loopQueue: !room.loopQueue },
        select: { loopQueue: true },
      })
      return NextResponse.json({ loopQueue: updated.loopQueue })
    }

    const playbackState = room.playbackState
    if (!playbackState) {
      return NextResponse.json(
        { error: 'Playback state not found' },
        { status: 500 }
      )
    }

    switch (action) {
      case 'play': {
        if (!playbackState.currentItemId) {
          const firstQueued = await prisma.playlistQueueItem.findFirst({
            where: { roomId: room.id, state: 'QUEUED' },
            orderBy: { queueOrder: 'asc' },
          })

          if (!firstQueued) {
            return NextResponse.json(
              { error: 'No songs in queue' },
              { status: 400 }
            )
          }

          await prisma.playlistQueueItem.update({
            where: { id: firstQueued.id },
            data: { state: 'PLAYING', playedAt: new Date() },
          })
          await prisma.playlistPlaybackState.update({
            where: { roomId: room.id },
            data: {
              currentItemId: firstQueued.id,
              isPlaying: true,
              positionSeconds: 0,
              lastUpdatedAt: new Date(),
            },
          })
        } else {
          await prisma.playlistPlaybackState.update({
            where: { roomId: room.id },
            data: { isPlaying: true, lastUpdatedAt: new Date() },
          })
        }
        break
      }

      case 'pause': {
        const position = body.position ?? playbackState.positionSeconds
        await prisma.playlistPlaybackState.update({
          where: { roomId: room.id },
          data: {
            isPlaying: false,
            positionSeconds: position,
            lastUpdatedAt: new Date(),
          },
        })
        break
      }

      case 'skip':
      case 'next': {
        if (playbackState.currentItemId) {
          await prisma.playlistQueueItem.update({
            where: { id: playbackState.currentItemId },
            data: {
              state: action === 'skip' ? 'SKIPPED' : 'PLAYED',
              skippedAt: action === 'skip' ? new Date() : undefined,
            },
          })
        }

        let nextItem = await prisma.playlistQueueItem.findFirst({
          where: { roomId: room.id, state: 'QUEUED' },
          orderBy: { queueOrder: 'asc' },
        })

        if (!nextItem && room.loopQueue) {
          await prisma.playlistQueueItem.updateMany({
            where: {
              roomId: room.id,
              state: { in: ['PLAYED', 'SKIPPED'] },
            },
            data: { state: 'QUEUED', playedAt: null, skippedAt: null },
          })

          nextItem = await prisma.playlistQueueItem.findFirst({
            where: { roomId: room.id, state: 'QUEUED' },
            orderBy: { queueOrder: 'asc' },
          })
        }

        if (nextItem) {
          await prisma.playlistQueueItem.update({
            where: { id: nextItem.id },
            data: { state: 'PLAYING', playedAt: new Date() },
          })
          await prisma.playlistPlaybackState.update({
            where: { roomId: room.id },
            data: {
              currentItemId: nextItem.id,
              isPlaying: true,
              positionSeconds: 0,
              lastUpdatedAt: new Date(),
            },
          })
        } else {
          await prisma.playlistPlaybackState.update({
            where: { roomId: room.id },
            data: {
              currentItemId: null,
              isPlaying: false,
              positionSeconds: 0,
              lastUpdatedAt: new Date(),
            },
          })
        }
        break
      }

      case 'clear': {
        await prisma.playlistQueueItem.updateMany({
          where: { roomId: room.id, state: 'QUEUED' },
          data: { state: 'REMOVED' },
        })
        break
      }

      case 'seek': {
        const seekPosition = body.position
        if (typeof seekPosition !== 'number') {
          return NextResponse.json(
            { error: 'Position required for seek' },
            { status: 400 }
          )
        }
        await prisma.playlistPlaybackState.update({
          where: { roomId: room.id },
          data: {
            positionSeconds: seekPosition,
            lastUpdatedAt: new Date(),
          },
        })
        break
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedState = await prisma.playlistPlaybackState.findUnique({
      where: { roomId: room.id },
    })

    return NextResponse.json(updatedState)
  } catch (error) {
    console.error('Failed to execute control action:', error)
    return NextResponse.json(
      { error: 'Failed to execute action' },
      { status: 500 }
    )
  }
}
