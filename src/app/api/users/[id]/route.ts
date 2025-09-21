import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for User update
const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['USER', 'AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/users/[id] - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can view user details
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('User fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can update users
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = userUpdateSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if email is being changed and if it conflicts
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (emailConflict) {
        return NextResponse.json({ error: 'Email address already in use' }, { status: 400 })
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.firstName !== undefined && { firstName: validatedData.firstName || null }),
        ...(validatedData.lastName !== undefined && { lastName: validatedData.lastName || null }),
        ...(validatedData.role && { role: validatedData.role }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('User update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user permanently
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can delete users
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        contentItems: { select: { id: true, type: true, slug: true } },
        mediaFiles: { select: { id: true, filename: true } }
      }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting the last admin
    if (existingUser.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN', isActive: true }
      })

      if (adminCount <= 1) {
        return NextResponse.json({
          error: 'Cannot delete the last active admin user'
        }, { status: 400 })
      }
    }

    // Handle user's content - we have several options:
    // Option 1: Prevent deletion if user has content
    if (existingUser.contentItems.length > 0) {
      return NextResponse.json({
        error: `Cannot delete user with existing content. User has ${existingUser.contentItems.length} content items. Please reassign or delete their content first.`,
        contentItems: existingUser.contentItems
      }, { status: 400 })
    }

    // Option 2: We could reassign content to another admin, but that's complex
    // Option 3: We could archive content, but that's also complex

    // Delete the user (NextAuth relations will cascade automatically)
    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'User deleted successfully',
      deletedUser: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email
      }
    })
  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}

// POST /api/users/[id] - Special actions (reassign content)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can perform user actions
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, targetUserId } = body

    if (action === 'reassign_content') {
      // Validate inputs
      if (!targetUserId) {
        return NextResponse.json({
          error: 'Target user ID is required for content reassignment'
        }, { status: 400 })
      }

      // Check if source user exists
      const sourceUser = await prisma.user.findUnique({
        where: { id: params.id },
        include: {
          contentItems: {
            select: { id: true, type: true, slug: true, translations: true }
          }
        }
      })

      if (!sourceUser) {
        return NextResponse.json({ error: 'Source user not found' }, { status: 404 })
      }

      // Check if target user exists and is active
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId }
      })

      if (!targetUser) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
      }

      if (!targetUser.isActive) {
        return NextResponse.json({
          error: 'Cannot reassign content to inactive user'
        }, { status: 400 })
      }

      // Reassign all content items to the target user
      const updateResult = await prisma.contentItem.updateMany({
        where: { authorId: params.id },
        data: { authorId: targetUserId }
      })

      // Also reassign any media files uploaded by this user
      const mediaUpdateResult = await prisma.mediaFile.updateMany({
        where: { uploadedBy: params.id },
        data: { uploadedBy: targetUserId }
      })

      return NextResponse.json({
        message: 'Content reassigned successfully',
        reassignedContent: updateResult.count,
        reassignedMedia: mediaUpdateResult.count,
        sourceUser: {
          id: sourceUser.id,
          name: sourceUser.name,
          email: sourceUser.email
        },
        targetUser: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('User action error:', error)
    return NextResponse.json(
      { error: 'Failed to perform user action' },
      { status: 500 }
    )
  }
}