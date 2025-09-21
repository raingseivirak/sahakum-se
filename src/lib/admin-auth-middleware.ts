import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PermissionService, Permission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export interface AdminAuthContext {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
  permissions: PermissionService
}

/**
 * Admin authentication and authorization middleware
 * Verifies user session and checks required permissions
 */
export async function withAdminAuth(
  handler: (request: NextRequest, context: AdminAuthContext) => Promise<NextResponse>,
  options: {
    requiredPermission?: Permission
    allowedRoles?: string[]
    requireLogin?: boolean
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const {
        requiredPermission,
        allowedRoles,
        requireLogin = true
      } = options

      // Check if user is authenticated
      const session = await getServerSession(authOptions)
      if (requireLogin && !session?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized - Please log in' },
          { status: 401 }
        )
      }

      // If no login required and no session, continue without context
      if (!requireLogin && !session?.user?.id) {
        return handler(request, null as any)
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: session!.user.id },
        select: {
          id: true,
          role: true,
          email: true,
          name: true,
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Check role-based access
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return NextResponse.json(
          {
            error: 'Insufficient privileges - Required role not met',
            required: allowedRoles,
            current: user.role
          },
          { status: 403 }
        )
      }

      // Check permission-based access
      if (requiredPermission) {
        const permissionService = new PermissionService()
        const userWithMember = { id: user.id, role: user.role } as any
        const hasPermission = await permissionService.hasPermission(userWithMember, requiredPermission)
        if (!hasPermission) {
          return NextResponse.json(
            {
              error: 'Insufficient privileges - Permission denied',
              required: requiredPermission,
              role: user.role
            },
            { status: 403 }
          )
        }
      }

      // Create admin context
      const context: AdminAuthContext = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          role: user.role,
        },
        permissions: null as any,
      }

      // Call the protected handler
      return handler(request, context)

    } catch (error) {
      console.error('Admin auth middleware error:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown error',
        message: error instanceof Error ? error.message : 'Unknown message',
        cause: error instanceof Error ? error.cause : 'No cause'
      })
      return NextResponse.json(
        { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Convenience wrapper for admin-only routes
 */
export function withAdminOnly(
  handler: (request: NextRequest, context: AdminAuthContext) => Promise<NextResponse>
) {
  return withAdminAuth(handler, {
    allowedRoles: ['ADMIN']
  })
}

/**
 * Convenience wrapper for editor-level routes
 */
export function withEditorAccess(
  handler: (request: NextRequest, context: AdminAuthContext) => Promise<NextResponse>
) {
  return withAdminAuth(handler, {
    allowedRoles: ['EDITOR', 'BOARD', 'ADMIN']
  })
}

/**
 * Convenience wrapper for moderator-level routes
 */
export function withModeratorAccess(
  handler: (request: NextRequest, context: AdminAuthContext) => Promise<NextResponse>
) {
  return withAdminAuth(handler, {
    allowedRoles: ['MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
  })
}

/**
 * Convenience wrapper for author-level routes
 */
export function withAuthorAccess(
  handler: (request: NextRequest, context: AdminAuthContext) => Promise<NextResponse>
) {
  return withAdminAuth(handler, {
    allowedRoles: ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
  })
}

/**
 * Convenience wrapper for content management routes
 */
export function withContentPermission(
  handler: (request: NextRequest, context: AdminAuthContext) => Promise<NextResponse>
) {
  return withAdminAuth(handler, {
    requiredPermission: 'create_content'
  })
}

/**
 * Convenience wrapper for user management routes
 */
export function withUserManagement(
  handler: (request: NextRequest, context: AdminAuthContext) => Promise<NextResponse>
) {
  return withAdminAuth(handler, {
    requiredPermission: 'manage_users'
  })
}