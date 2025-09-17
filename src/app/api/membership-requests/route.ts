import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for Membership Request
const membershipRequestSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  firstNameKhmer: z.string().optional(),
  lastNameKhmer: z.string().optional(),
  dateOfBirth: z.string().optional().transform((str) => str ? new Date(str) : null),

  // Contact Information
  email: z.string().email("Valid email address is required"),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().default("Sweden"),

  // Residence Information
  residenceStatus: z.enum(["STUDENT", "WORK_PERMIT", "PERMANENT_RESIDENT", "CITIZEN", "EU_CITIZEN", "OTHER"]),
  residenceSince: z.string().optional().transform((str) => str ? new Date(str) : null),

  // Application Details
  motivation: z.string().min(10, "Please tell us why you want to join (at least 10 characters)"),
  hearAboutUs: z.string().optional(),
  interests: z.string().optional(),
  skills: z.string().optional(),

  // Requested membership type
  requestedMemberType: z.enum(["REGULAR", "VOLUNTEER"]).default("REGULAR"),
})

// Function to generate unique request number
async function generateRequestNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `REQ-${year}-`

  // Find the highest request number for this year
  const lastRequest = await prisma.membershipRequest.findFirst({
    where: {
      requestNumber: {
        startsWith: prefix
      }
    },
    orderBy: {
      requestNumber: 'desc'
    }
  })

  let nextNumber = 1
  if (lastRequest) {
    const lastNumber = parseInt(lastRequest.requestNumber.split('-')[2])
    nextNumber = lastNumber + 1
  }

  return `${prefix}${nextNumber.toString().padStart(3, '0')}`
}

// GET /api/membership-requests - Get all membership requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where = status ? { status: status as any } : {}

    const [requests, total] = await Promise.all([
      prisma.membershipRequest.findMany({
        where,
        include: {
          reviewer: {
            select: { id: true, name: true, email: true }
          },
          approver: {
            select: { id: true, name: true, email: true }
          },
          createdMember: {
            select: { id: true, memberNumber: true, firstName: true, lastName: true }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.membershipRequest.count({ where })
    ])

    return NextResponse.json({
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get membership requests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch membership requests' },
      { status: 500 }
    )
  }
}

// POST /api/membership-requests - Create new membership request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = membershipRequestSchema.parse(body)

    // Check if email already has a pending or approved request
    const existingRequest = await prisma.membershipRequest.findFirst({
      where: {
        email: validatedData.email,
        status: {
          in: ['PENDING', 'UNDER_REVIEW', 'APPROVED']
        }
      }
    })

    if (existingRequest) {
      return NextResponse.json({
        error: "An application with this email address already exists. Please contact us if you need to update your application."
      }, { status: 400 })
    }

    // Check if email already exists as a member
    const existingMember = await prisma.member.findFirst({
      where: { email: validatedData.email }
    })

    if (existingMember) {
      return NextResponse.json({
        error: "This email address is already registered as a member. Please contact us if you need assistance."
      }, { status: 400 })
    }

    // Generate unique request number
    const requestNumber = await generateRequestNumber()

    // Create membership request
    const membershipRequest = await prisma.membershipRequest.create({
      data: {
        requestNumber,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        firstNameKhmer: validatedData.firstNameKhmer || null,
        lastNameKhmer: validatedData.lastNameKhmer || null,
        dateOfBirth: validatedData.dateOfBirth,
        email: validatedData.email,
        phone: validatedData.phone || null,
        address: validatedData.address,
        city: validatedData.city,
        postalCode: validatedData.postalCode,
        country: validatedData.country,
        residenceStatus: validatedData.residenceStatus,
        residenceSince: validatedData.residenceSince,
        motivation: validatedData.motivation,
        hearAboutUs: validatedData.hearAboutUs || null,
        interests: validatedData.interests || null,
        skills: validatedData.skills || null,
        requestedMemberType: validatedData.requestedMemberType,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: "Membership request submitted successfully",
      requestNumber: membershipRequest.requestNumber,
      id: membershipRequest.id
    }, { status: 201 })

  } catch (error) {
    console.error('Membership request creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit membership request' },
      { status: 500 }
    )
  }
}