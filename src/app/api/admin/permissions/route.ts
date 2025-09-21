import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PermissionService } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { AdminPermissions } from '@/contexts/admin-permissions-context'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user (without member relationship)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Temporarily use simplified permissions - admin gets all, others get basic
    const isAdmin = user.role === 'ADMIN'
    const isEditor = ['EDITOR', 'BOARD', 'ADMIN'].includes(user.role)
    const isModerator = ['MODERATOR', 'EDITOR', 'BOARD', 'ADMIN'].includes(user.role)
    const isAuthor = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN'].includes(user.role)

    // Check all permissions for the admin interface
    const permissions: AdminPermissions = {
      // Content Management
      canCreateContent: isAuthor,
      canEditOwnContent: isAuthor,
      canEditOthersContent: isEditor,
      canDeleteOwnContent: isEditor,
      canDeleteOthersContent: isEditor,
      canPublishDirect: isEditor,
      canApproveContent: isEditor,

      // Organization Management
      canViewMembershipRequests: isModerator,
      canApproveMembership: isEditor,
      canManageMembers: isEditor,
      canManageServices: isEditor,
      canManageCategories: isEditor,
      canManageMedia: isModerator,

      // System Management
      canManageUsers: isAdmin,
      canManageSettings: isAdmin,
      canAccessSettings: isEditor,
      canViewAllUsers: isAdmin,

      // User roles for conditional rendering
      isUser: user.role === 'USER',
      isAuthor: user.role === 'AUTHOR',
      isModerator: user.role === 'MODERATOR',
      isEditor: user.role === 'EDITOR',
      isBoard: user.role === 'BOARD',
      isAdmin: user.role === 'ADMIN',

      // Board member privileges (temporarily disabled)
      isBoardMember: false,
    }

    return NextResponse.json({
      permissions,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Admin permissions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}