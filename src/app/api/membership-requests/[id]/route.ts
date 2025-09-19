import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/membership-requests/[id] - Get specific membership request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const membershipRequest = await prisma.membershipRequest.findUnique({
      where: { id: params.id },
      include: {
        reviewer: {
          select: { id: true, name: true, email: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        },
        createdMember: {
          select: {
            id: true,
            memberNumber: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        statusHistory: {
          include: {
            changedByUser: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { changedAt: 'asc' }
        }
      }
    })

    if (!membershipRequest) {
      return NextResponse.json(
        { error: 'Membership request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(membershipRequest)

  } catch (error) {
    console.error('Get membership request error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch membership request' },
      { status: 500 }
    )
  }
}

// PUT /api/membership-requests/[id] - Update membership request status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, adminNotes, rejectionReason } = body

    // Validate status
    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'ADDITIONAL_INFO_REQUESTED', 'APPROVED', 'REJECTED']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({
        error: 'Invalid status'
      }, { status: 400 })
    }

    // Check if request exists
    const existingRequest = await prisma.membershipRequest.findUnique({
      where: { id: params.id }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Membership request not found' },
        { status: 404 }
      )
    }

    // Prevent updating approved requests
    if (existingRequest.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Cannot update an approved request' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (status) {
      updateData.status = status

      // Set reviewer information when status changes from PENDING
      if (existingRequest.status === 'PENDING' && status !== 'PENDING') {
        updateData.reviewedBy = session.user.id
        updateData.reviewedAt = new Date()
      }
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes
    }

    if (rejectionReason !== undefined) {
      updateData.rejectionReason = rejectionReason
    }

    // Update the request and create status history entry in a transaction
    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Create status history entry if status is changing
      if (status && status !== existingRequest.status) {
        await tx.membershipRequestStatusHistory.create({
          data: {
            membershipRequestId: params.id,
            fromStatus: existingRequest.status,
            toStatus: status,
            changedBy: session.user.id,
            notes: adminNotes || null
          }
        })
      }

      // Update the request
      return await tx.membershipRequest.update({
        where: { id: params.id },
        data: updateData,
        include: {
          reviewer: {
            select: { id: true, name: true, email: true }
          },
          approver: {
            select: { id: true, name: true, email: true }
          },
          createdMember: {
            select: {
              id: true,
              memberNumber: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          statusHistory: {
            include: {
              changedByUser: {
                select: { id: true, name: true, email: true }
              }
            },
            orderBy: { changedAt: 'asc' }
          }
        }
      })
    })

    return NextResponse.json({
      message: 'Membership request updated successfully',
      request: updatedRequest
    })

  } catch (error) {
    console.error('Update membership request error:', error)
    return NextResponse.json(
      { error: 'Failed to update membership request' },
      { status: 500 }
    )
  }
}