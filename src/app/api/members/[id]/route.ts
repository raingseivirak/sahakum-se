import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for Member update
const memberUpdateSchema = z.object({
  memberNumber: z.string().optional().nullable(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  firstNameKhmer: z.string().optional().nullable(),
  lastNameKhmer: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  memberType: z.enum(['REGULAR', 'BOARD', 'VOLUNTEER', 'HONORARY', 'LIFETIME']).optional(),
  joinedDate: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
})

// GET /api/members/[id] - Get specific member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const member = await prisma.member.findUnique({
      where: { id: params.id }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Member fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    )
  }
}

// PUT /api/members/[id] - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'BOARD' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = memberUpdateSchema.parse(body)

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id: params.id }
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check if member number is being changed and if it conflicts
    if (validatedData.memberNumber && validatedData.memberNumber !== existingMember.memberNumber) {
      const memberNumberConflict = await prisma.member.findUnique({
        where: { memberNumber: validatedData.memberNumber }
      })

      if (memberNumberConflict) {
        return NextResponse.json({ error: 'Member number already exists' }, { status: 400 })
      }
    }

    // Check if email is being changed and if it conflicts
    if (validatedData.email && validatedData.email !== existingMember.email) {
      const emailConflict = await prisma.member.findFirst({
        where: {
          email: validatedData.email,
          id: { not: params.id }
        }
      })

      if (emailConflict) {
        return NextResponse.json({ error: 'Email address already exists' }, { status: 400 })
      }
    }

    // Update member
    const member = await prisma.member.update({
      where: { id: params.id },
      data: {
        ...(validatedData.memberNumber !== undefined && { memberNumber: validatedData.memberNumber || null }),
        ...(validatedData.firstName && { firstName: validatedData.firstName }),
        ...(validatedData.lastName && { lastName: validatedData.lastName }),
        ...(validatedData.firstNameKhmer !== undefined && { firstNameKhmer: validatedData.firstNameKhmer || null }),
        ...(validatedData.lastNameKhmer !== undefined && { lastNameKhmer: validatedData.lastNameKhmer || null }),
        ...(validatedData.email !== undefined && { email: validatedData.email || null }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone || null }),
        ...(validatedData.address !== undefined && { address: validatedData.address || null }),
        ...(validatedData.city !== undefined && { city: validatedData.city || null }),
        ...(validatedData.postalCode !== undefined && { postalCode: validatedData.postalCode || null }),
        ...(validatedData.country && { country: validatedData.country }),
        ...(validatedData.memberType && { membershipType: validatedData.memberType }),
        ...(validatedData.joinedDate && { joinedAt: new Date(validatedData.joinedDate) }),
        ...(validatedData.isActive !== undefined && { active: validatedData.isActive }),
        ...(validatedData.notes !== undefined && { bio: validatedData.notes || null }),
        ...(validatedData.emergencyContact !== undefined && { emergencyContact: validatedData.emergencyContact || null }),
      }
    })

    return NextResponse.json({ member })
  } catch (error) {
    console.error('Member update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE /api/members/[id] - Delete member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'BOARD')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id: params.id }
    })

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    await prisma.member.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Member deleted successfully' })
  } catch (error) {
    console.error('Member deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
  }
}