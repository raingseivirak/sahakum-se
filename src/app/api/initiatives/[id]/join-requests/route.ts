import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/initiatives/[id]/join-requests - Submit a join request
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const initiativeId = params.id

    // Check if initiative exists
    const initiative = await prisma.initiative.findUnique({
      where: { id: initiativeId },
      include: {
        members: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!initiative) {
      return NextResponse.json(
        { error: 'Initiative not found' },
        { status: 404 }
      )
    }

    // Check if user is already a member
    if (initiative.members.length > 0) {
      return NextResponse.json(
        { error: 'You are already a member of this initiative' },
        { status: 400 }
      )
    }

    // Check if there's already a pending request
    const existingRequest = await prisma.initiativeJoinRequest.findUnique({
      where: {
        initiativeId_userId: {
          initiativeId,
          userId: session.user.id
        }
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: `You already have a ${existingRequest.status.toLowerCase()} request for this initiative` },
        { status: 400 }
      )
    }

    // Parse request body for optional message
    const body = await request.json().catch(() => ({}))
    const { message } = body

    // Create join request
    const joinRequest = await prisma.initiativeJoinRequest.create({
      data: {
        initiativeId,
        userId: session.user.id,
        status: 'PENDING',
        message: message || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        initiative: {
          select: {
            id: true,
            slug: true,
            translations: {
              where: { language: 'en' }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: joinRequest
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating join request:', error)
    return NextResponse.json(
      { error: 'Failed to submit join request' },
      { status: 500 }
    )
  }
}

// GET /api/initiatives/[id]/join-requests - Get all join requests for an initiative (admin only)
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

    // Check if initiative exists
    const initiative = await prisma.initiative.findUnique({
      where: { id: initiativeId },
      select: {
        id: true,
        projectLeadId: true,
        members: {
          where: {
            userId: session.user.id,
            role: { in: ['LEAD', 'CO_LEAD'] }
          },
          select: { id: true }
        }
      }
    })

    if (!initiative) {
      return NextResponse.json(
        { error: 'Initiative not found' },
        { status: 404 }
      )
    }

    // Check if user is project lead or has LEAD/CO_LEAD role
    const isProjectLead = initiative.projectLeadId === session.user.id
    const hasLeadRole = initiative.members.length > 0
    const userRole = (session.user as any).role

    if (!isProjectLead && !hasLeadRole && !['ADMIN', 'BOARD'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden - Only initiative leads and admins can view join requests' },
        { status: 403 }
      )
    }

    // Get status filter from query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const whereClause: any = { initiativeId }
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      whereClause.status = status
    }

    // Get all join requests
    const joinRequests = await prisma.initiativeJoinRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: joinRequests
    })
  } catch (error) {
    console.error('Error fetching join requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch join requests' },
      { status: 500 }
    )
  }
}
