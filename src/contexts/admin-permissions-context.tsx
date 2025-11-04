'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Permission } from '@/lib/permissions'

export interface AdminPermissions {
  // Content Management
  canCreateContent: boolean
  canEditOwnContent: boolean
  canEditOthersContent: boolean
  canDeleteOwnContent: boolean
  canDeleteOthersContent: boolean
  canPublishDirect: boolean
  canApproveContent: boolean

  // Organization Management
  canViewMembershipRequests: boolean
  canApproveMembership: boolean
  canManageMembers: boolean
  canManageServices: boolean
  canManageCategories: boolean
  canManageMedia: boolean
  canManageInitiatives: boolean

  // System Management
  canManageUsers: boolean
  canManageSettings: boolean
  canAccessSettings: boolean
  canViewAllUsers: boolean

  // User roles for conditional rendering
  isUser: boolean
  isAuthor: boolean
  isModerator: boolean
  isEditor: boolean
  isBoard: boolean
  isAdmin: boolean

  // Board member privileges
  isBoardMember: boolean
}

interface AdminPermissionsContextType {
  permissions: AdminPermissions
  loading: boolean
  error: string | null
  checkPermission: (permission: keyof AdminPermissions) => boolean
  refresh: () => Promise<void>
}

const AdminPermissionsContext = createContext<AdminPermissionsContextType | undefined>(undefined)

interface AdminPermissionsProviderProps {
  children: ReactNode
}

export function AdminPermissionsProvider({ children }: AdminPermissionsProviderProps) {
  const { data: session, status } = useSession()
  const [permissions, setPermissions] = useState<AdminPermissions>({
    // Content Management
    canCreateContent: false,
    canEditOwnContent: false,
    canEditOthersContent: false,
    canDeleteOwnContent: false,
    canDeleteOthersContent: false,
    canPublishDirect: false,
    canApproveContent: false,

    // Organization Management
    canViewMembershipRequests: false,
    canApproveMembership: false,
    canManageMembers: false,
    canManageServices: false,
    canManageCategories: false,
    canManageMedia: false,
    canManageInitiatives: false,

    // System Management
    canManageUsers: false,
    canManageSettings: false,
    canAccessSettings: false,
    canViewAllUsers: false,

    // User roles
    isUser: false,
    isAuthor: false,
    isModerator: false,
    isEditor: false,
    isBoard: false,
    isAdmin: false,

    // Board member privileges
    isBoardMember: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPermissions = async () => {
    if (!session?.user?.id || status !== 'authenticated') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/permissions', {
        headers: {
          'Authorization': `Bearer ${session.user.id}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.statusText}`)
      }

      const data = await response.json()
      setPermissions(data.permissions)
    } catch (err) {
      console.error('Error fetching admin permissions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions')
    } finally {
      setLoading(false)
    }
  }

  const checkPermission = (permission: keyof AdminPermissions): boolean => {
    return permissions[permission] === true
  }

  const refresh = async () => {
    await fetchPermissions()
  }

  useEffect(() => {
    fetchPermissions()
  }, [session?.user?.id, status])

  const contextValue: AdminPermissionsContextType = {
    permissions,
    loading,
    error,
    checkPermission,
    refresh,
  }

  return (
    <AdminPermissionsContext.Provider value={contextValue}>
      {children}
    </AdminPermissionsContext.Provider>
  )
}

export function useAdminPermissions() {
  const context = useContext(AdminPermissionsContext)
  if (context === undefined) {
    throw new Error('useAdminPermissions must be used within an AdminPermissionsProvider')
  }
  return context
}

// Convenience hooks for common permission checks
export function useCanCreateContent() {
  const { checkPermission } = useAdminPermissions()
  return checkPermission('canCreateContent')
}

export function useCanEditContent(isOwnContent: boolean = false) {
  const { checkPermission } = useAdminPermissions()
  return isOwnContent
    ? checkPermission('canEditOwnContent')
    : checkPermission('canEditOthersContent')
}

export function useCanDeleteContent(isOwnContent: boolean = false) {
  const { checkPermission } = useAdminPermissions()
  return isOwnContent
    ? checkPermission('canDeleteOwnContent')
    : checkPermission('canDeleteOthersContent')
}

export function useCanManageUsers() {
  const { checkPermission } = useAdminPermissions()
  return checkPermission('canManageUsers')
}

export function useCanManageSettings() {
  const { checkPermission } = useAdminPermissions()
  return checkPermission('canManageSettings')
}

export function useIsAdminRole() {
  const { permissions } = useAdminPermissions()
  return permissions.isAdmin
}

export function useIsEditorOrAbove() {
  const { permissions } = useAdminPermissions()
  return permissions.isEditor || permissions.isBoard || permissions.isAdmin
}

export function useIsBoardMember() {
  const { permissions } = useAdminPermissions()
  return permissions.isBoardMember
}