import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id]/content - Check what content a user owns (before deletion)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        contentItems: { select: { id: true, type: true, slug: true } },
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      hasContent: user.contentItems.length > 0,
      contentItems: user.contentItems,
    })
  } catch (error) {
    console.error('User content check error:', error)
    return NextResponse.json({ error: 'Failed to check user content' }, { status: 500 })
  }
}
