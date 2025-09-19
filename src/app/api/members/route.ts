import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for Member
const memberSchema = z.object({
  memberNumber: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  firstNameKhmer: z.string().optional(),
  lastNameKhmer: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Sweden"),
  membershipType: z.enum(['REGULAR', 'STUDENT', 'FAMILY', 'BOARD', 'VOLUNTEER', 'HONORARY', 'LIFETIME']),
  joinedAt: z.string().transform((str) => new Date(str)),
  active: z.boolean().default(true),
  bio: z.string().optional(),
  emergencyContact: z.string().optional(),
})

// GET /api/members - List all members
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated for admin access
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const memberType = searchParams.get('memberType') || ''
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { firstNameKhmer: { contains: search, mode: 'insensitive' } },
        { lastNameKhmer: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { memberNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (memberType) {
      where.membershipType = memberType
    }

    if (isActive !== null && isActive !== '') {
      where.active = isActive === 'true'
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
        skip,
        take: limit,
      }),
      prisma.member.count({ where })
    ])

    return NextResponse.json({
      members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Members fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// POST /api/members - Create new member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = memberSchema.parse(body)

    // Check if member number already exists (if provided)
    if (validatedData.memberNumber) {
      const existingMember = await prisma.member.findUnique({
        where: { memberNumber: validatedData.memberNumber }
      })

      if (existingMember) {
        return NextResponse.json({ error: 'Member number already exists' }, { status: 400 })
      }
    }

    // Check if email already exists (if provided)
    if (validatedData.email) {
      const existingEmail = await prisma.member.findFirst({
        where: { email: validatedData.email }
      })

      if (existingEmail) {
        return NextResponse.json({ error: 'Email address already exists' }, { status: 400 })
      }
    }

    const member = await prisma.member.create({
      data: {
        memberNumber: validatedData.memberNumber || null,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        firstNameKhmer: validatedData.firstNameKhmer || null,
        lastNameKhmer: validatedData.lastNameKhmer || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        postalCode: validatedData.postalCode || null,
        country: validatedData.country,
        membershipType: validatedData.membershipType,
        joinedAt: validatedData.joinedAt,
        active: validatedData.active,
        bio: validatedData.bio || null,
        emergencyContact: validatedData.emergencyContact || null,
      }
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error('Member creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    )
  }
}