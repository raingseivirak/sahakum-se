import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ActivityLogger } from '@/lib/activity-logger'
import { VoteDecision, ApprovalThreshold } from '@prisma/client'
import { sendEmail } from '@/lib/email'
import { generateApprovalEmail, generateMemberCredentialsEmail } from '@/lib/email-templates'
import { generateTemporaryPassword, hashPassword } from '@/lib/password'

// Helper function to get approval threshold from settings
async function getApprovalThreshold(): Promise<ApprovalThreshold> {
  const setting = await prisma.setting.findUnique({
    where: { key: 'APPROVAL_THRESHOLD' }
  })

  if (setting && setting.value) {
    return setting.value as ApprovalThreshold
  }

  // Default to MAJORITY if not set
  return 'MAJORITY' as ApprovalThreshold
}

// Helper function to check if approval threshold is met
function isApprovalThresholdMet(
  approvals: number,
  rejections: number,
  totalBoardMembers: number,
  threshold: ApprovalThreshold
): { approved: boolean; rejected: boolean } {
  switch (threshold) {
    case 'UNANIMOUS':
      return {
        approved: approvals === totalBoardMembers,
        rejected: rejections > 0 // Any rejection blocks unanimous
      }

    case 'MAJORITY':
      // More than 50%
      const majorityThreshold = Math.floor(totalBoardMembers / 2) + 1
      return {
        approved: approvals >= majorityThreshold,
        rejected: rejections >= majorityThreshold
      }

    case 'SIMPLE_MAJORITY':
      // At least 50%, rounded up
      const simpleMajorityThreshold = Math.ceil(totalBoardMembers / 2)
      return {
        approved: approvals >= simpleMajorityThreshold,
        rejected: rejections >= simpleMajorityThreshold
      }

    case 'ANY_TWO':
      return {
        approved: approvals >= 2,
        rejected: rejections >= 2
      }

    case 'SINGLE':
      return {
        approved: approvals >= 1,
        rejected: rejections >= 1
      }

    default:
      return { approved: false, rejected: false }
  }
}

// Function to generate unique member number
async function generateMemberNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `M${year}-`

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

// POST /api/membership-requests/[id]/vote - Cast a board member vote
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a board member (only BOARD role can vote)
    if (session.user.role !== 'BOARD') {
      return NextResponse.json(
        { error: 'Only board members can vote on membership requests' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { vote, notes } = body

    if (!vote || !['APPROVE', 'REJECT', 'ABSTAIN'].includes(vote)) {
      return NextResponse.json(
        { error: 'Invalid vote. Must be APPROVE, REJECT, or ABSTAIN' },
        { status: 400 }
      )
    }

    // Check if membership request exists
    const membershipRequest = await prisma.membershipRequest.findUnique({
      where: { id: params.id },
      include: {
        boardVotes: {
          include: {
            boardMember: {
              select: { id: true, name: true, email: true }
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

    // Check if request uses multi-board approval system
    if (membershipRequest.approvalSystem !== 'MULTI_BOARD') {
      return NextResponse.json(
        { error: 'This request uses single approval system, not board voting' },
        { status: 400 }
      )
    }

    // Check if request is in correct status
    if (membershipRequest.status === 'APPROVED' || membershipRequest.status === 'REJECTED') {
      return NextResponse.json(
        { error: `Request has already been ${membershipRequest.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    // Check if board member has already voted
    const existingVote = membershipRequest.boardVotes.find(
      v => v.boardMemberId === session.user.id
    )

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted on this request' },
        { status: 400 }
      )
    }

    // Get total board members count (only BOARD role)
    const totalBoardMembers = await prisma.user.count({
      where: {
        role: 'BOARD',
        isActive: true
      }
    })

    // Cast the vote and create timeline entry in a transaction
    const newVote = await prisma.$transaction(async (tx) => {
      // Create the vote
      const vote = await tx.boardMemberVote.create({
        data: {
          membershipRequestId: params.id,
          boardMemberId: session.user.id,
          vote: body.vote as VoteDecision,
          notes: notes || null
        },
        include: {
          boardMember: {
            select: { id: true, name: true, email: true }
          }
        }
      })

      // Create timeline entry for the vote
      await tx.membershipRequestStatusHistory.create({
        data: {
          membershipRequestId: params.id,
          fromStatus: null,
          toStatus: membershipRequest.status, // Keep current status
          changedBy: session.user.id,
          notes: `Board vote: ${body.vote}${notes ? ` - ${notes}` : ''}`
        }
      })

      return vote
    })

    // Log the vote activity
    await ActivityLogger.log({
      userId: session.user.id,
      action: 'membership_request.voted',
      resourceType: 'MEMBERSHIP_REQUEST',
      resourceId: params.id,
      description: `Cast ${vote} vote on membership request ${membershipRequest.requestNumber}`,
      metadata: {
        requestNumber: membershipRequest.requestNumber,
        vote,
        notes: notes || null
      }
    })

    // Get updated vote counts
    const allVotes = [...membershipRequest.boardVotes, newVote]
    const approvals = allVotes.filter(v => v.vote === 'APPROVE').length
    const rejections = allVotes.filter(v => v.vote === 'REJECT').length
    const abstentions = allVotes.filter(v => v.vote === 'ABSTAIN').length

    // Get approval threshold
    const threshold = await getApprovalThreshold()

    // Check if threshold is met
    const thresholdResult = isApprovalThresholdMet(
      approvals,
      rejections,
      totalBoardMembers,
      threshold
    )

    let updatedRequest = null
    let createdMember = null

    // If approval threshold is met, approve the request
    let temporaryPassword: string | null = null

    if (thresholdResult.approved) {
      // Generate temporary password for User account
      temporaryPassword = generateTemporaryPassword()
      const hashedPassword = await hashPassword(temporaryPassword)

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
            bio: `Created from membership request ${membershipRequest.requestNumber} - Approved by board vote`,
          }
        })

        // Update membership request
        const updated = await tx.membershipRequest.update({
          where: { id: params.id },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            createdMemberId: newMember.id,
            updatedAt: new Date()
          }
        })

        return { member: newMember, request: updated, user: newUser }
      })

      updatedRequest = result.request
      createdMember = result.member

      // Send both approval email and credentials email
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

        // Create timeline entry for approval email
        await prisma.membershipRequestStatusHistory.create({
          data: {
            membershipRequestId: params.id,
            fromStatus: null,
            toStatus: 'APPROVED',
            changedBy: null,
            notes: `Approval email sent to ${membershipRequest.email}`
          }
        })

        console.log(`Approval email sent to: ${membershipRequest.email}`)

        // 2. Send credentials email with login information
        if (temporaryPassword) {
          const credentialsEmailTemplate = generateMemberCredentialsEmail({
            firstName: membershipRequest.firstName,
            lastName: membershipRequest.lastName,
            khmerFirstName: membershipRequest.firstNameKhmer || undefined,
            khmerLastName: membershipRequest.lastNameKhmer || undefined,
            email: membershipRequest.email,
            memberNumber: result.member.memberNumber,
            temporaryPassword,
            language,
            baseUrl
          })

          await sendEmail({
            to: membershipRequest.email,
            subject: credentialsEmailTemplate.subject,
            html: credentialsEmailTemplate.html,
            text: credentialsEmailTemplate.text
          })

          // Create timeline entry for credentials email
          await prisma.membershipRequestStatusHistory.create({
            data: {
              membershipRequestId: params.id,
              fromStatus: null,
              toStatus: 'APPROVED',
              changedBy: null,
              notes: `Member credentials email sent to ${membershipRequest.email}`
            }
          })

          console.log(`Member credentials email sent to: ${membershipRequest.email}`)
        }
      } catch (emailError) {
        console.error('Failed to send approval/credentials emails:', emailError)
      }

      // Log approval activity
      await ActivityLogger.log({
        userId: session.user.id,
        action: 'membership_request.auto_approved',
        resourceType: 'MEMBERSHIP_REQUEST',
        resourceId: params.id,
        description: `Membership request ${membershipRequest.requestNumber} auto-approved after reaching approval threshold. User account created.`,
        metadata: {
          requestNumber: membershipRequest.requestNumber,
          memberNumber: result.member.memberNumber,
          userId: result.user.id,
          userAccountCreated: true,
          credentialsEmailSent: !!temporaryPassword,
          threshold,
          approvals,
          rejections,
          abstentions,
          totalBoardMembers
        }
      })
    }

    // If rejection threshold is met, reject the request
    if (thresholdResult.rejected) {
      updatedRequest = await prisma.membershipRequest.update({
        where: { id: params.id },
        data: {
          status: 'REJECTED',
          rejectionReason: `Rejected by board vote (${rejections} rejections)`,
          updatedAt: new Date()
        }
      })

      // Log rejection activity
      await ActivityLogger.log({
        userId: session.user.id,
        action: 'membership_request.auto_rejected',
        resourceType: 'MEMBERSHIP_REQUEST',
        resourceId: params.id,
        description: `Membership request ${membershipRequest.requestNumber} auto-rejected after reaching rejection threshold`,
        metadata: {
          requestNumber: membershipRequest.requestNumber,
          threshold,
          approvals,
          rejections,
          abstentions,
          totalBoardMembers
        }
      })
    }

    return NextResponse.json({
      message: 'Vote cast successfully',
      vote: newVote,
      voteCounts: {
        approvals,
        rejections,
        abstentions,
        total: allVotes.length,
        totalBoardMembers,
        threshold
      },
      thresholdMet: thresholdResult.approved || thresholdResult.rejected,
      finalStatus: updatedRequest ? updatedRequest.status : membershipRequest.status,
      createdMember: createdMember ? {
        id: createdMember.id,
        memberNumber: createdMember.memberNumber
      } : null
    })

  } catch (error) {
    console.error('Cast vote error:', error)
    return NextResponse.json(
      { error: 'Failed to cast vote' },
      { status: 500 }
    )
  }
}

// GET /api/membership-requests/[id]/vote - Get vote status and counts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const membershipRequest = await prisma.membershipRequest.findUnique({
      where: { id: params.id },
      include: {
        boardVotes: {
          include: {
            boardMember: {
              select: { id: true, name: true, email: true, role: true }
            }
          },
          orderBy: {
            votedAt: 'asc'
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

    // Get total board members count (only BOARD role)
    const totalBoardMembers = await prisma.user.count({
      where: {
        role: 'BOARD',
        isActive: true
      }
    })

    // Get all board members for comparison (only BOARD role)
    const allBoardMembers = await prisma.user.findMany({
      where: {
        role: 'BOARD',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    // Calculate vote counts
    const approvals = membershipRequest.boardVotes.filter(v => v.vote === 'APPROVE').length
    const rejections = membershipRequest.boardVotes.filter(v => v.vote === 'REJECT').length
    const abstentions = membershipRequest.boardVotes.filter(v => v.vote === 'ABSTAIN').length

    // Get approval threshold
    const threshold = await getApprovalThreshold()

    // Check current user's vote
    const currentUserVote = membershipRequest.boardVotes.find(
      v => v.boardMemberId === session.user.id
    )

    // Get pending voters
    const votedMemberIds = membershipRequest.boardVotes.map(v => v.boardMemberId)
    const pendingVoters = allBoardMembers.filter(
      member => !votedMemberIds.includes(member.id)
    )

    return NextResponse.json({
      approvalSystem: membershipRequest.approvalSystem,
      status: membershipRequest.status,
      votes: membershipRequest.boardVotes,
      voteCounts: {
        approvals,
        rejections,
        abstentions,
        total: membershipRequest.boardVotes.length,
        totalBoardMembers,
        threshold
      },
      currentUserVote: currentUserVote || null,
      hasVoted: !!currentUserVote,
      pendingVoters,
      allBoardMembers
    })

  } catch (error) {
    console.error('Get vote status error:', error)
    return NextResponse.json(
      { error: 'Failed to get vote status' },
      { status: 500 }
    )
  }
}
