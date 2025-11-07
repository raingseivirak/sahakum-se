import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ActivityLogger } from '@/lib/activity-logger'

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

    // Log membership request status change activity
    if (status && status !== existingRequest.status) {
      const action = status === 'REJECTED' ? 'membership_request.rejected' : 'membership_request.status_changed'

      await ActivityLogger.log({
        userId: session.user.id,
        action,
        resourceType: 'MEMBERSHIP_REQUEST',
        resourceId: params.id,
        description: status === 'REJECTED'
          ? `Rejected membership request for "${existingRequest.firstName} ${existingRequest.lastName}"${rejectionReason ? ` - ${rejectionReason}` : ''}`
          : `Changed membership request status from ${existingRequest.status} to ${status} for "${existingRequest.firstName} ${existingRequest.lastName}"`,
        oldValues: {
          status: existingRequest.status,
          requestNumber: existingRequest.requestNumber
        },
        newValues: {
          status: status,
          rejectionReason: rejectionReason || null,
          adminNotes: adminNotes || null
        },
        metadata: {
          requestNumber: existingRequest.requestNumber,
          membershipType: existingRequest.requestedMemberType,
          fromStatus: existingRequest.status,
          toStatus: status,
          rejectionReason: rejectionReason || null,
          adminNotes: adminNotes || null
        }
      })
    } else if (adminNotes !== undefined || rejectionReason !== undefined) {
      // Log when only notes are updated without status change
      await ActivityLogger.log({
        userId: session.user.id,
        action: 'membership_request.notes_updated',
        resourceType: 'MEMBERSHIP_REQUEST',
        resourceId: params.id,
        description: `Updated notes for membership request "${existingRequest.firstName} ${existingRequest.lastName}"`,
        oldValues: {
          adminNotes: existingRequest.adminNotes,
          rejectionReason: existingRequest.rejectionReason
        },
        newValues: {
          adminNotes: adminNotes !== undefined ? adminNotes : existingRequest.adminNotes,
          rejectionReason: rejectionReason !== undefined ? rejectionReason : existingRequest.rejectionReason
        },
        metadata: {
          requestNumber: existingRequest.requestNumber,
          membershipType: existingRequest.requestedMemberType,
          currentStatus: existingRequest.status
        }
      })
    }

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

// DELETE /api/membership-requests/[id] - Delete membership request (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Check authentication
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is ADMIN (only admins can delete)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Only administrators can delete membership requests' },
        { status: 403 }
      )
    }

    // Check if request exists
    const existingRequest = await prisma.membershipRequest.findUnique({
      where: { id: params.id },
      include: {
        createdMember: {
          select: { id: true, memberNumber: true }
        }
      }
    })

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Membership request not found' },
        { status: 404 }
      )
    }

    // Prevent deleting if a member was already created
    if (existingRequest.createdMemberId) {
      return NextResponse.json(
        {
          error: 'Cannot delete request that has already created a member',
          details: `Member ${existingRequest.createdMember?.memberNumber} was created from this request`
        },
        { status: 400 }
      )
    }

    // Delete the request and all related records in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete board member votes (if any)
      await tx.boardMemberVote.deleteMany({
        where: { membershipRequestId: params.id }
      })

      // Delete status history
      await tx.membershipRequestStatusHistory.deleteMany({
        where: { membershipRequestId: params.id }
      })

      // Delete the membership request
      await tx.membershipRequest.delete({
        where: { id: params.id }
      })
    })

    // Log the deletion activity
    await ActivityLogger.log({
      userId: session.user.id,
      action: 'membership_request.deleted',
      resourceType: 'MEMBERSHIP_REQUEST',
      resourceId: params.id,
      description: `Deleted membership request for "${existingRequest.firstName} ${existingRequest.lastName}" (${existingRequest.requestNumber})`,
      metadata: {
        requestNumber: existingRequest.requestNumber,
        applicantName: `${existingRequest.firstName} ${existingRequest.lastName}`,
        applicantEmail: existingRequest.email,
        status: existingRequest.status,
        requestedMemberType: existingRequest.requestedMemberType,
        approvalSystem: existingRequest.approvalSystem
      }
    })

    return NextResponse.json({
      message: 'Membership request deleted successfully',
      deletedRequest: {
        id: params.id,
        requestNumber: existingRequest.requestNumber,
        applicantName: `${existingRequest.firstName} ${existingRequest.lastName}`
      }
    })

  } catch (error) {
    console.error('Delete membership request error:', error)
    return NextResponse.json(
      { error: 'Failed to delete membership request' },
      { status: 500 }
    )
  }
}