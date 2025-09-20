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

    // Get user with member relationship
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        linkedMember: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const permissionService = new PermissionService()

    // Check all permissions for the admin interface
    const permissions: AdminPermissions = {
      // Content Management
      canCreateContent: await permissionService.hasPermission(user, 'CREATE_CONTENT'),
      canEditOwnContent: await permissionService.hasPermission(user, 'EDIT_OWN_CONTENT'),
      canEditOthersContent: await permissionService.hasPermission(user, 'EDIT_OTHERS_CONTENT'),
      canDeleteOwnContent: await permissionService.hasPermission(user, 'DELETE_OWN_CONTENT'),
      canDeleteOthersContent: await permissionService.hasPermission(user, 'DELETE_OTHERS_CONTENT'),
      canPublishDirect: await permissionService.hasPermission(user, 'PUBLISH_CONTENT'),
      canApproveContent: await permissionService.hasPermission(user, 'APPROVE_CONTENT'),

      // Organization Management
      canViewMembershipRequests: await permissionService.hasPermission(user, 'VIEW_MEMBERSHIP_REQUESTS'),
      canApproveMembership: await permissionService.hasPermission(user, 'APPROVE_MEMBERSHIP'),
      canManageMembers: await permissionService.hasPermission(user, 'MANAGE_MEMBERS'),
      canManageServices: await permissionService.hasPermission(user, 'MANAGE_SERVICES'),
      canManageCategories: await permissionService.hasPermission(user, 'MANAGE_CATEGORIES'),
      canManageMedia: await permissionService.hasPermission(user, 'MANAGE_MEDIA'),

      // System Management
      canManageUsers: await permissionService.hasPermission(user, 'MANAGE_USERS'),
      canManageSettings: await permissionService.hasPermission(user, 'MANAGE_SETTINGS'),
      canAccessSettings: await permissionService.hasPermission(user, 'ACCESS_SETTINGS'),
      canViewAllUsers: await permissionService.hasPermission(user, 'VIEW_ALL_USERS'),

      // User roles for conditional rendering
      isUser: user.role === 'USER',
      isAuthor: user.role === 'AUTHOR',
      isModerator: user.role === 'MODERATOR',
      isEditor: user.role === 'EDITOR',
      isBoard: user.role === 'BOARD',
      isAdmin: user.role === 'ADMIN',

      // Board member privileges
      isBoardMember: user.linkedMember?.membershipType === 'BOARD',
    }

    return NextResponse.json({
      permissions,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        linkedMember: user.linkedMember ? {
          id: user.linkedMember.id,
          membershipType: user.linkedMember.membershipType,
          memberNumber: user.linkedMember.memberNumber,
        } : null,
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