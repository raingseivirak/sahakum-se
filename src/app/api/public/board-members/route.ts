import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/board-members - Public endpoint for board members
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'en'

    const boardMembers = await prisma.boardMember.findMany({
      where: {
        active: true
      },
      include: {
        translations: {
          where: {
            language
          }
        }
      },
      orderBy: [
        { isChairman: 'desc' }, // Chairman first
        { order: 'asc' }        // Then by order
      ]
    })

    // Transform data for easier consumption
    const transformedMembers = boardMembers.map(member => ({
      id: member.id,
      slug: member.slug,
      firstName: member.firstName,
      lastName: member.lastName,
      firstNameKhmer: member.firstNameKhmer,
      lastNameKhmer: member.lastNameKhmer,
      profileImage: member.profileImage,
      email: member.email,
      phone: member.phone,
      isChairman: member.isChairman,
      order: member.order,
      joinedBoard: member.joinedBoard,
      position: member.translations[0]?.position || '',
      education: member.translations[0]?.education || '',
      vision: member.translations[0]?.vision || '',
      bio: member.translations[0]?.bio || ''
    }))

    return NextResponse.json(transformedMembers)
  } catch (error) {
    console.error('Error fetching public board members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch board members' },
      { status: 500 }
    )
  }
}
