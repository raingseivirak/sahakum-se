'use client'

import { createContext, useContext, ReactNode, useMemo } from 'react'
import { useSession } from 'next-auth/react'

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

function computePermissions(role: string): AdminPermissions {
  const isAdmin = role === 'ADMIN'
  const isBoard = ['BOARD', 'ADMIN'].includes(role)
  const isEditor = ['EDITOR', 'BOARD', 'ADMIN'].includes(role)
  const isModerator = ['MODERATOR', 'EDITOR', 'BOARD', 'ADMIN'].includes(role)
  const isAuthor = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN'].includes(role)

  return {
    // Content Management
    canCreateContent: isAuthor,
    canEditOwnContent: isAuthor,
    canEditOthersContent: isEditor,
    canDeleteOwnContent: isEditor,
    canDeleteOthersContent: isEditor,
    canPublishDirect: isEditor,
    canApproveContent: isEditor,

    // Organization Management
    canViewMembershipRequests: isBoard,
    canApproveMembership: isEditor,
    canManageMembers: isBoard,
    canManageServices: isEditor,
    canManageCategories: isEditor,
    canManageMedia: isModerator,
    canManageInitiatives: isBoard,

    // System Management
    canManageUsers: isAdmin,
    canManageSettings: isAdmin,
    canAccessSettings: isEditor,
    canViewAllUsers: isAdmin,

    // User roles
    isUser: role === 'USER',
    isAuthor: role === 'AUTHOR',
    isModerator: role === 'MODERATOR',
    isEditor: role === 'EDITOR',
    isBoard: role === 'BOARD',
    isAdmin,

    // Board member privileges (temporarily disabled)
    isBoardMember: false,
  }
}

const EMPTY_PERMISSIONS = computePermissions('USER')

interface AdminPermissionsProviderProps {
  children: ReactNode
}

export function AdminPermissionsProvider({ children }: AdminPermissionsProviderProps) {
  const { data: session, status } = useSession()

  const permissions = useMemo(
    () => computePermissions(session?.user?.role ?? 'USER'),
    [session?.user?.role]
  )

  const checkPermission = (permission: keyof AdminPermissions): boolean => {
    return permissions[permission] === true
  }

  // No-op: permissions are derived from the JWT session, which is already cached
  const refresh = async () => {}

  const contextValue: AdminPermissionsContextType = {
    permissions,
    loading: status === 'loading',
    error: null,
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
