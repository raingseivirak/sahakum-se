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
      }
    })

    // Link the member to the newly created user
    await prisma.member.update({
      where: { id: membershipRequest.createdMemberId },
      data: { userId: newUser.id }
    })

    console.log(`Manual user account created: ${newUser.email} for member #${membershipRequest.createdMember.memberNumber}`)

    // Create timeline entry for user account creation
    await prisma.membershipRequestStatusHistory.create({
      data: {
        membershipRequestId: requestId,
        fromStatus: null,
        toStatus: 'APPROVED',
        changedBy: session.user.id,
        notes: `User account created for member #${membershipRequest.createdMember.memberNumber} by ${session.user.name || session.user.email}`
      }
    })

    // Log user account creation activity (matching automatic flow pattern)
    await ActivityLogger.log({
      userId: session.user.id,
      action: 'user.created',
      resourceType: 'USER',
      resourceId: newUser.id,
      description: `Created user account for member ${membershipRequest.createdMember.memberNumber} from membership request ${membershipRequest.requestNumber}`,
      newValues: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        userId: newUser.id,
        memberId: membershipRequest.createdMemberId,
        memberNumber: membershipRequest.createdMember.memberNumber
      },
      metadata: {
        sourceRequestId: requestId,
        requestNumber: membershipRequest.requestNumber,
        memberNumber: membershipRequest.createdMember.memberNumber,
        createdBy: session.user.email,
        manualCreation: true
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

      // Create timeline entry for credentials email
      await prisma.membershipRequestStatusHistory.create({
        data: {
          membershipRequestId: requestId,
          fromStatus: null,
          toStatus: 'APPROVED',
          changedBy: session.user.id,
          notes: `Login credentials email sent to ${membershipRequest.createdMember.email}`
        }
      })

      // Log successful email sending (matching automatic flow)
      await ActivityLogger.log({
        userId: session.user.id,
        action: 'user.credentials_email_sent',
        resourceType: 'USER',
        resourceId: newUser.id,
        description: `Login credentials email sent to ${membershipRequest.createdMember.email}`,
        metadata: {
          userEmail: membershipRequest.createdMember.email,
          memberNumber: membershipRequest.createdMember.memberNumber,
          language,
          createdBy: session.user.email
        }
      })
    } catch (emailError) {
      console.error('Failed to send credentials email:', emailError)

      // Create timeline entry for failed email
      await prisma.membershipRequestStatusHistory.create({
        data: {
          membershipRequestId: requestId,
          fromStatus: null,
          toStatus: 'APPROVED',
          changedBy: session.user.id,
          notes: `Failed to send credentials email to ${membershipRequest.createdMember.email}: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`
        }
      })

      // Log failed email attempt (matching automatic flow)
      await ActivityLogger.log({
        userId: session.user.id,
        action: 'user.credentials_email_failed',
        resourceType: 'USER',
        resourceId: newUser.id,
        description: `Failed to send login credentials email to ${membershipRequest.createdMember.email}`,
        metadata: {
          userEmail: membershipRequest.createdMember.email,
          memberNumber: membershipRequest.createdMember.memberNumber,
          error: emailError instanceof Error ? emailError.message : String(emailError),
          createdBy: session.user.email
        }
      })
      // Don't fail the request if email fails - user account is created
    }

    // Fetch updated member with user relation for frontend
    const updatedMember = await prisma.member.findUnique({
      where: { id: membershipRequest.createdMemberId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User account created and credentials email sent',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      member: updatedMember
    })

  } catch (error) {
    console.error('Error creating user account:', error)
    return NextResponse.json(
      { error: 'Failed to create user account' },
      { status: 500 }
    )
  }
}
