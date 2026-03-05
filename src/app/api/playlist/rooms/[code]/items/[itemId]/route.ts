import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { code: string; itemId: string } }
) {
  try {
    const sessionToken = req.headers.get('x-session-token')
    const adminToken = req.headers.get('x-admin-token')

    const room = await prisma.playlistRoom.findUnique({
      where: { roomCode: params.code },
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const item = await prisma.playlistQueueItem.findUnique({
      where: { id: params.itemId },
    })

    if (!item || item.roomId !== room.id) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const isAdmin = adminToken === room.adminSessionToken

    if (!isAdmin && sessionToken) {
      const participant = await prisma.playlistParticipant.findUnique({
        where: { sessionToken },
      })
      if (!participant || participant.id !== item.addedById) {
        return NextResponse.json(
          { error: 'Can only remove your own items' },
          { status: 403 }
        )
      }
    } else if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.playlistQueueItem.update({
      where: { id: params.itemId },
      data: { state: 'REMOVED' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove item:', error)
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    )
  }
}
