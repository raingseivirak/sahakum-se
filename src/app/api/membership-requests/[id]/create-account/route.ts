import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTemporaryPassword, hashPassword } from '@/lib/password'
import { generateMemberCredentialsEmail } from '@/lib/email-templates'
import { sendEmail } from '@/lib/email'
import { ActivityLogger } from '@/lib/activity-logger'

// POST /api/membership-requests/[id]/create-account - Manually create user account for approved member
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Only ADMIN can manually create user accounts
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const requestId = params.id

    // Get the membership request
    const membershipRequest = await prisma.membershipRequest.findUnique({
      where: { id: requestId },
      include: {
        createdMember: {
          select: {
            id: true,
            memberNumber: true,
            email: true,
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    })

    if (!membershipRequest) {
      return NextResponse.json(
        { error: 'Membership request not found' },
        { status: 404 }
      )
    }

    // Check if request is approved
    if (membershipRequest.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Membership request must be APPROVED before creating user account' },
        { status: 400 }
      )
    }

    // Check if member was created
    if (!membershipRequest.createdMemberId || !membershipRequest.createdMember) {
      return NextResponse.json(
        { error: 'Member record not found. Please ensure member was created during approval.' },
        { status: 400 }
      )
    }

    // Check if user account already exists
    if (membershipRequest.createdMember.user) {
      return NextResponse.json(
        { error: `User account already exists for ${membershipRequest.createdMember.email}` },
        { status: 400 }
      )
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword()
    const hashedPassword = await hashPassword(temporaryPassword)

    // Create user account
    const newUser = await prisma.user.create({
      data: {
        email: membershipRequest.createdMember.email,
        name: `${membershipRequest.firstName} ${membershipRequest.lastName}`,
        firstName: membershipRequest.firstName,
        lastName: membershipRequest.lastName,
        password: hashedPassword,
        role: 'USER', // Regular members get USER role
        isActive: true,
        memberId: membershipRequest.createdMemberId,
      }
    })

    console.log(`Manual user account created: ${newUser.email} for member #${membershipRequest.createdMember.memberNumber}`)

    // Log activity
    await ActivityLogger.log({
      userId: session.user.id,
      action: 'membership_request.manual_user_account_created',
      resourceType: 'MEMBERSHIP_REQUEST',
      resourceId: requestId,
      description: `Manually created user account for member #${membershipRequest.createdMember.memberNumber}`,
      metadata: {
        requestNumber: membershipRequest.requestNumber,
        memberNumber: membershipRequest.createdMember.memberNumber,
        memberEmail: membershipRequest.createdMember.email,
        userId: newUser.id,
        createdBy: session.user.email
      }
    })

    // Send credentials email
    const language = (membershipRequest.preferredLanguage || 'en') as 'en' | 'sv' | 'km'
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.sahakumkhmer.se'

    try {
      const credentialsEmailTemplate = generateMemberCredentialsEmail({
        firstName: membershipRequest.firstName,
        lastName: membershipRequest.lastName,
        khmerFirstName: membershipRequest.firstNameKhmer || undefined,
        khmerLastName: membershipRequest.lastNameKhmer || undefined,
        email: membershipRequest.createdMember.email,
        memberNumber: membershipRequest.createdMember.memberNumber,
        temporaryPassword,
        language,
        baseUrl
      })

      await sendEmail({
        to: membershipRequest.createdMember.email,
        subject: credentialsEmailTemplate.subject,
        html: credentialsEmailTemplate.html,
        text: credentialsEmailTemplate.text
      })

      console.log(`Login credentials email sent to: ${membershipRequest.createdMember.email} (${language})`)
    } catch (emailError) {
      console.error('Failed to send credentials email:', emailError)
      // Don't fail the request if email fails - user account is created
    }

    return NextResponse.json({
      success: true,
      message: 'User account created and credentials email sent',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      member: {
        id: membershipRequest.createdMember.id,
        memberNumber: membershipRequest.createdMember.memberNumber
      }
    })

  } catch (error) {
    console.error('Error creating user account:', error)
    return NextResponse.json(
      { error: 'Failed to create user account' },
      { status: 500 }
    )
  }
}
