import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/board-members - List all board members (with auth check)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const boardMembers = await prisma.boardMember.findMany({
      include: {
        translations: true
      },
      orderBy: [
        { isChairman: 'desc' },
        { order: 'asc' }
      ]
    })

    return NextResponse.json(boardMembers)
  } catch (error) {
    console.error('Error fetching board members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch board members' },
      { status: 500 }
    )
  }
}

// POST /api/board-members - Create new board member
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!slug || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, firstName, lastName' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.boardMember.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A board member with this slug already exists' },
        { status: 400 }
      )
    }

    // Create board member with translations
    const boardMember = await prisma.boardMember.create({
      data: {
        slug,
        firstName,
        lastName,
        firstNameKhmer,
        lastNameKhmer,
        profileImage,
        email,
        phone,
        order: order || 0,
        isChairman: isChairman || false,
        active: active !== undefined ? active : true,
        joinedBoard: joinedBoard ? new Date(joinedBoard) : null,
        translations: {
          create: translations || []
        }
      },
      include: {
        translations: true
      }
    })

    return NextResponse.json(boardMember, { status: 201 })
  } catch (error) {
    console.error('Error creating board member:', error)
    return NextResponse.json(
      { error: 'Failed to create board member' },
      { status: 500 }
    )
  }
}
