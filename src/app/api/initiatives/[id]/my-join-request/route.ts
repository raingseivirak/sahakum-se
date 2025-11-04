import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/initiatives/[id]/my-join-request - Check current user's join request status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const initiativeId = params.id

    // Check if user has a join request for this initiative
    const joinRequest = await prisma.initiativeJoinRequest.findUnique({
      where: {
        initiativeId_userId: {
          initiativeId,
          userId: session.user.id
        }
      },
      select: {
        id: true,
        status: true,
        message: true,
        createdAt: true,
        reviewedAt: true,
        reviewNote: true
      }
    })

    if (!joinRequest) {
      return NextResponse.json({
        success: true,
        data: null
      })
    }

    return NextResponse.json({
      success: true,
      data: joinRequest
    })
  } catch (error) {
    console.error('Error checking join request:', error)
    return NextResponse.json(
      { error: 'Failed to check join request status' },
      { status: 500 }
    )
  }
}
