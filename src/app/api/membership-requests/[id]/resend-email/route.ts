import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { generateApplicantWelcomeEmail, generateApprovalEmail } from '@/lib/email-templates'

// POST /api/membership-requests/[id]/resend-email
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role (ADMIN or BOARD required)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'BOARD')) {
      return NextResponse.json({
        error: 'Insufficient privileges - Board or Admin access required'
      }, { status: 403 })
    }

    // Get request body
    const body = await request.json()
    const { emailType } = body // 'welcome' or 'approval'

    if (!emailType || !['welcome', 'approval'].includes(emailType)) {
      return NextResponse.json({
        error: 'Invalid email type. Must be "welcome" or "approval"'
      }, { status: 400 })
    }

    // Get membership request
    const membershipRequest = await prisma.membershipRequest.findUnique({
      where: { id: params.id },
      include: {
        createdMember: {
          select: { memberNumber: true }
        }
      }
    })

    if (!membershipRequest) {
      return NextResponse.json({ error: 'Membership request not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.sahakumkhmer.se'
    const language = (membershipRequest.preferredLanguage || 'en') as 'en' | 'sv' | 'km'

    let emailTemplate: { subject: string; html: string; text: string }

    if (emailType === 'welcome') {
      // Resend welcome email
      emailTemplate = generateApplicantWelcomeEmail({
        firstName: membershipRequest.firstName,
        lastName: membershipRequest.lastName,
        khmerFirstName: membershipRequest.firstNameKhmer || undefined,
        khmerLastName: membershipRequest.lastNameKhmer || undefined,
        email: membershipRequest.email,
        requestNumber: membershipRequest.requestNumber,
        language,
        baseUrl
      })
    } else {
      // Resend approval email
      if (membershipRequest.status !== 'APPROVED') {
        return NextResponse.json({
          error: 'Cannot send approval email - request is not approved'
        }, { status: 400 })
      }

      emailTemplate = generateApprovalEmail({
        firstName: membershipRequest.firstName,
        lastName: membershipRequest.lastName,
        khmerFirstName: membershipRequest.firstNameKhmer || undefined,
        khmerLastName: membershipRequest.lastNameKhmer || undefined,
        email: membershipRequest.email,
        requestNumber: membershipRequest.requestNumber,
        memberNumber: membershipRequest.createdMember?.memberNumber,
        language,
        baseUrl
      })
    }

    // Send email
    const result = await sendEmail({
      to: membershipRequest.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    })

    if (result.success) {
      // Create timeline entry for email notification
      await prisma.membershipRequestStatusHistory.create({
        data: {
          membershipRequestId: params.id,
          fromStatus: null,
          toStatus: membershipRequest.status,
          changedBy: session.user.id,
          notes: `${emailType === 'welcome' ? 'Welcome' : 'Approval'} email resent to ${membershipRequest.email}`
        }
      })

      return NextResponse.json({
        message: `${emailType === 'welcome' ? 'Welcome' : 'Approval'} email sent successfully`,
        emailType,
        sentTo: membershipRequest.email,
        messageId: result.messageId
      })
    } else {
      return NextResponse.json({
        error: `Failed to send email: ${result.error}`,
        emailType
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Resend email error:', error)
    return NextResponse.json(
      { error: 'Failed to resend email' },
      { status: 500 }
    )
  }
}
