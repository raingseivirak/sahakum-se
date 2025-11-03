import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/board-members/[id] - Get single board member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const boardMember = await prisma.boardMember.findUnique({
      where: { id: params.id },
      include: {
        translations: true
      }
    })

    if (!boardMember) {
      return NextResponse.json(
        { error: 'Board member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(boardMember)
  } catch (error) {
    console.error('Error fetching board member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch board member' },
      { status: 500 }
    )
  }
}

// PUT /api/board-members/[id] - Update board member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      slug,
      firstName,
      lastName,
      firstNameKhmer,
      lastNameKhmer,
      profileImage,
      email,
      phone,
      order,
      isChairman,
      active,
      joinedBoard,
      translations
    } = body

    // Check if board member exists
    const existing = await prisma.boardMember.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Board member not found' },
        { status: 404 }
      )
    }

    // Update board member
    const boardMember = await prisma.boardMember.update({
      where: { id: params.id },
      data: {
        slug,
        firstName,
        lastName,
        firstNameKhmer,
        lastNameKhmer,
        profileImage,
        email,
        phone,
        order,
        isChairman,
        active,
        joinedBoard: joinedBoard ? new Date(joinedBoard) : null,
        translations: translations
          ? {
              deleteMany: {},
              create: translations
            }
          : undefined
      },
      include: {
        translations: true
      }
    })

    return NextResponse.json(boardMember)
  } catch (error) {
    console.error('Error updating board member:', error)
    return NextResponse.json(
      { error: 'Failed to update board member' },
      { status: 500 }
    )
  }
}

// DELETE /api/board-members/[id] - Delete board member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const boardMember = await prisma.boardMember.findUnique({
      where: { id: params.id }
    })

    if (!boardMember) {
      return NextResponse.json(
        { error: 'Board member not found' },
        { status: 404 }
      )
    }

    await prisma.boardMember.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Board member deleted successfully' })
  } catch (error) {
    console.error('Error deleting board member:', error)
    return NextResponse.json(
      { error: 'Failed to delete board member' },
      { status: 500 }
    )
  }
}
