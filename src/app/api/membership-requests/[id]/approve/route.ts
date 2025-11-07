import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ActivityLogger } from '@/lib/activity-logger'
import { sendEmail } from '@/lib/email'
import { generateApprovalEmail, generateMemberCredentialsEmail } from '@/lib/email-templates'
import { generateTemporaryPassword, hashPassword } from '@/lib/password'

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

    // Check if this request uses multi-board approval system
    if (membershipRequest.approvalSystem === 'MULTI_BOARD') {
      return NextResponse.json(
        { error: 'This request uses board voting system. Please use the voting endpoint instead.' },
        { status: 400 }
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

    // Generate temporary password for User account
    const temporaryPassword = generateTemporaryPassword()
    const hashedPassword = await hashPassword(temporaryPassword)

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Generate unique member number
      const memberNumber = await generateMemberNumber()

      // Create User account for member login
      const newUser = await tx.user.create({
        data: {
          email: membershipRequest.email,
          name: `${membershipRequest.firstName} ${membershipRequest.lastName}`,
          firstName: membershipRequest.firstName,
          lastName: membershipRequest.lastName,
          password: hashedPassword,
          role: 'USER', // Regular member role
          isActive: true,
          profileImage: null
        }
      })

      // Create new member linked to User account
      const newMember = await tx.member.create({
        data: {
          memberNumber,
          userId: newUser.id, // Link to User account
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

      return { member: newMember, request: updatedRequest, user: newUser, temporaryPassword }
    })

    // Log membership approval activity
    await ActivityLogger.log({
      userId: session.user.id,
      action: 'membership_request.approved',
      resourceType: 'MEMBERSHIP_REQUEST',
      resourceId: params.id,
      description: `Approved membership request for "${membershipRequest.firstName} ${membershipRequest.lastName}" and created member ${result.member.memberNumber} with User account`,
      oldValues: {
        status: membershipRequest.status,
        requestNumber: membershipRequest.requestNumber
      },
      newValues: {
        status: 'APPROVED',
        memberNumber: result.member.memberNumber,
        memberId: result.member.id,
        userId: result.user.id
      },
      metadata: {
        requestNumber: membershipRequest.requestNumber,
        memberNumber: result.member.memberNumber,
        memberId: result.member.id,
        userId: result.user.id,
        userAccountCreated: true,
        membershipType: membershipRequest.requestedMemberType,
        adminNotes: adminNotes
      }
    })

    // Log member creation activity
    await ActivityLogger.log({
      userId: session.user.id,
      action: 'member.created',
      resourceType: 'MEMBER',
      resourceId: result.member.id,
      description: `Created member ${result.member.memberNumber} from approved membership request with linked User account`,
      newValues: {
        memberNumber: result.member.memberNumber,
        firstName: result.member.firstName,
        lastName: result.member.lastName,
        email: result.member.email,
        membershipType: result.member.membershipType,
        active: result.member.active,
        userId: result.user.id
      },
      metadata: {
        sourceRequestId: params.id,
        requestNumber: membershipRequest.requestNumber,
        residenceStatus: result.member.residenceStatus,
        userId: result.user.id,
        userAccountLinked: true
      }
    })

    // Send both approval email and credentials email to applicant
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'https://www.sahakumkhmer.se'
      const language = (membershipRequest.preferredLanguage || 'en') as 'en' | 'sv' | 'km'

      // 1. Send approval email
      const approvalEmailTemplate = generateApprovalEmail({
        firstName: membershipRequest.firstName,
        lastName: membershipRequest.lastName,
        khmerFirstName: membershipRequest.firstNameKhmer || undefined,
        khmerLastName: membershipRequest.lastNameKhmer || undefined,
        email: membershipRequest.email,
        requestNumber: membershipRequest.requestNumber,
        memberNumber: result.member.memberNumber,
        language,
        baseUrl
      })

      await sendEmail({
        to: membershipRequest.email,
        subject: approvalEmailTemplate.subject,
        html: approvalEmailTemplate.html,
        text: approvalEmailTemplate.text
      })

      console.log(`Approval email sent to: ${membershipRequest.email} (${language})`)

      // 2. Send credentials email with login information
      const credentialsEmailTemplate = generateMemberCredentialsEmail({
        firstName: membershipRequest.firstName,
        lastName: membershipRequest.lastName,
        khmerFirstName: membershipRequest.firstNameKhmer || undefined,
        khmerLastName: membershipRequest.lastNameKhmer || undefined,
        email: membershipRequest.email,
        memberNumber: result.member.memberNumber,
        temporaryPassword: result.temporaryPassword,
        language,
        baseUrl
      })

      await sendEmail({
        to: membershipRequest.email,
        subject: credentialsEmailTemplate.subject,
        html: credentialsEmailTemplate.html,
        text: credentialsEmailTemplate.text
      })

      console.log(`Member credentials email sent to: ${membershipRequest.email} (${language})`)

    } catch (emailError) {
      // Log email error but don't fail the approval
      console.error('Failed to send approval/credentials emails:', emailError)
      // Approval was successful even if emails failed
    }

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