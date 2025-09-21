import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcryptjs from 'bcryptjs'

const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// GET /api/admin/profile - Get current admin's profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'BOARD', 'EDITOR', 'MODERATOR', 'AUTHOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/profile - Update current admin's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !['ADMIN', 'BOARD', 'EDITOR', 'MODERATOR', 'AUTHOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...data } = body

    if (action === 'change_password') {
      // Handle password change
      const validatedData = passwordChangeSchema.parse(data)

      // Get current user
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true }
      })

      if (!currentUser?.password) {
        return NextResponse.json({ error: 'User not found or no password set' }, { status: 404 })
      }

      // Verify current password
      const isValidPassword = await bcryptjs.compare(validatedData.currentPassword, currentUser.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }

      // Hash new password
      const hashedPassword = await bcryptjs.hash(validatedData.newPassword, 12)

      // Update password
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword }
      })

      return NextResponse.json({ message: 'Password changed successfully' })
    } else {
      // Handle profile info update
      const validatedData = profileUpdateSchema.parse(data)

      // Check if email is being changed and if it conflicts
      if (validatedData.email) {
        const emailConflict = await prisma.user.findFirst({
          where: {
            email: validatedData.email,
            id: { not: session.user.id }
          }
        })

        if (emailConflict) {
          return NextResponse.json({ error: 'Email address already in use' }, { status: 400 })
        }
      }

      // Update profile
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.email && { email: validatedData.email }),
          ...(validatedData.firstName !== undefined && { firstName: validatedData.firstName || null }),
          ...(validatedData.lastName !== undefined && { lastName: validatedData.lastName || null }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      return NextResponse.json({ user, message: 'Profile updated successfully' })
    }
  } catch (error) {
    console.error('Profile update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}