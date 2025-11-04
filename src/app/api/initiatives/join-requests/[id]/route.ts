import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/initiatives/join-requests/[id] - Approve or reject a join request
export async function PATCH(
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

    const requestId = params.id

    // Get the join request
    const joinRequest = await prisma.initiativeJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        initiative: {
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
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!joinRequest) {
      return NextResponse.json(
        { error: 'Join request not found' },
        { status: 404 }
      )
    }

    // Check if user has permission
    const isProjectLead = joinRequest.initiative.projectLeadId === session.user.id
    const hasLeadRole = joinRequest.initiative.members.length > 0
    const userRole = (session.user as any).role

    if (!isProjectLead && !hasLeadRole && !['ADMIN', 'BOARD'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden - Only initiative leads and admins can review join requests' },
        { status: 403 }
      )
    }

    // Check if request is still pending
    if (joinRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: `This request has already been ${joinRequest.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { status, reviewNote } = body

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED or REJECTED' },
        { status: 400 }
      )
    }

    // Start a transaction to update request and potentially add member
    const result = await prisma.$transaction(async (tx) => {
      // Update the join request
      const updatedRequest = await tx.initiativeJoinRequest.update({
        where: { id: requestId },
        data: {
          status,
          reviewedBy: session.user!.id,
          reviewedAt: new Date(),
          reviewNote: reviewNote || null
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
          reviewer: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      // If approved, add user as a member
      if (status === 'APPROVED') {
        // Check if user is not already a member (edge case)
        const existingMember = await tx.initiativeMember.findUnique({
          where: {
            initiativeId_userId: {
              initiativeId: joinRequest.initiative.id,
              userId: joinRequest.userId
            }
          }
        })

        if (!existingMember) {
          await tx.initiativeMember.create({
            data: {
              initiativeId: joinRequest.initiative.id,
              userId: joinRequest.userId,
              role: 'MEMBER',
              contributionNote: joinRequest.message || null
            }
          })
        }
      }

      return updatedRequest
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: status === 'APPROVED'
        ? `${result.user.name} has been added to the initiative`
        : `Join request has been rejected`
    })
  } catch (error) {
    console.error('Error updating join request:', error)
    return NextResponse.json(
      { error: 'Failed to update join request' },
      { status: 500 }
    )
  }
}

// DELETE /api/initiatives/join-requests/[id] - Delete a join request (user can delete their own pending request)
export async function DELETE(
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

    const requestId = params.id

    // Get the join request
    const joinRequest = await prisma.initiativeJoinRequest.findUnique({
      where: { id: requestId }
    })

    if (!joinRequest) {
      return NextResponse.json(
        { error: 'Join request not found' },
        { status: 404 }
      )
    }

    // Only the requester can delete their own request
    if (joinRequest.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own requests' },
        { status: 403 }
      )
    }

    // Only allow deletion of pending requests
    if (joinRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot delete a request that has been reviewed' },
        { status: 400 }
      )
    }

    await prisma.initiativeJoinRequest.delete({
      where: { id: requestId }
    })

    return NextResponse.json({
      success: true,
      message: 'Join request cancelled successfully'
    })
  } catch (error) {
    console.error('Error deleting join request:', error)
    return NextResponse.json(
      { error: 'Failed to cancel join request' },
      { status: 500 }
    )
  }
}
