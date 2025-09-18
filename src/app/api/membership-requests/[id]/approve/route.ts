import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Function to generate unique member number
async function generateMemberNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `M${year}-`

  // Find the highest member number for this year
  const lastMember = await prisma.member.findFirst({
    where: {
      memberNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      memberNumber: 'desc'
    }
  })

  let nextNumber = 1
  if (lastMember && lastMember.memberNumber) {
    const lastNumber = parseInt(lastMember.memberNumber.split('-')[1])
    nextNumber = lastNumber + 1
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`
}

// POST /api/membership-requests/[id]/approve - Approve request and create member
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { adminNotes } = body

    // Check if request exists and is in correct status
    const membershipRequest = await prisma.membershipRequest.findUnique({
      where: { id: params.id }
    })

    if (!membershipRequest) {
      return NextResponse.json(
        { error: 'Membership request not found' },
        { status: 404 }
      )
    }

    if (membershipRequest.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Request has already been approved' },
        { status: 400 }
      )
    }

    if (membershipRequest.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Cannot approve a rejected request' },
        { status: 400 }
      )
    }

    // Check if email already exists as a member
    const existingMember = await prisma.member.findFirst({
      where: { email: membershipRequest.email }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'A member with this email address already exists' },
        { status: 400 }
      )
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Generate unique member number
      const memberNumber = await generateMemberNumber()

      // Create new member
      const newMember = await tx.member.create({
        data: {
          memberNumber,
          firstName: membershipRequest.firstName,
          lastName: membershipRequest.lastName,
          firstNameKhmer: membershipRequest.firstNameKhmer,
          lastNameKhmer: membershipRequest.lastNameKhmer,
          email: membershipRequest.email,
          phone: membershipRequest.phone,
          address: membershipRequest.address,
          city: membershipRequest.city,
          postalCode: membershipRequest.postalCode,
          country: membershipRequest.country,
          membershipType: membershipRequest.requestedMemberType,
          residenceStatus: membershipRequest.residenceStatus,
          joinedAt: new Date(),
          active: true,
          bio: `Created from membership request ${membershipRequest.requestNumber}`,
        }
      })

      // Update membership request
      const updatedRequest = await tx.membershipRequest.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          approvedBy: session.user.id,
          approvedAt: new Date(),
          createdMemberId: newMember.id,
          adminNotes: adminNotes || null,
          updatedAt: new Date()
        },
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
          }
        }
      })

      return { member: newMember, request: updatedRequest }
    })

    return NextResponse.json({
      message: 'Membership request approved and member created successfully',
      memberId: result.member.id,
      memberNumber: result.member.memberNumber,
      request: result.request
    })

  } catch (error) {
    console.error('Approve membership request error:', error)
    return NextResponse.json(
      { error: 'Failed to approve membership request' },
      { status: 500 }
    )
  }
}