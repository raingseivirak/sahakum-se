import { prisma } from '@/lib/prisma'
import { Role, MembershipType } from '@prisma/client'

export type Permission =
  | 'create_content'
  | 'edit_own_content'
  | 'edit_others_content'
  | 'delete_content'
  | 'publish_content'
  | 'moderate_comments'
  | 'manage_categories'
  | 'manage_tags'
  | 'manage_media'
  | 'view_members'
  | 'edit_members'
  | 'approve_membership'
  | 'manage_users'
  | 'manage_settings'

export interface UserWithMember {
  id: string
  role: Role
  linkedMember?: {
    id: string
    membershipType: MembershipType
  } | null
}

class PermissionService {
  private settingsCache: Map<string, string> = new Map()
  private cacheExpiry: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private async getSettings(): Promise<Map<string, string>> {
    const now = Date.now()

    if (now > this.cacheExpiry) {
      const settings = await prisma.setting.findMany({
        where: { category: 'permissions' }
      })

      this.settingsCache.clear()
      settings.forEach(setting => {
        this.settingsCache.set(setting.key, setting.value || '')
      })

      this.cacheExpiry = now + this.CACHE_DURATION
    }

    return this.settingsCache
  }

  private async getSetting(key: string, defaultValue: string = 'false'): Promise<boolean> {
    const settings = await this.getSettings()
    const value = settings.get(key) || defaultValue
    return value.toLowerCase() === 'true'
  }

  /**
   * Check if user has permission for a specific action
   */
  async hasPermission(user: UserWithMember, permission: Permission): Promise<boolean> {
    // ADMIN always has all permissions
    if (user.role === 'ADMIN') return true

    // Get dynamic settings
    const authorCanEditOthers = await this.getSetting('permissions_author_edit_others')
    const authorCanPublishDirect = await this.getSetting('permissions_author_publish_direct')
    const moderatorCanEditOthers = await this.getSetting('permissions_moderator_edit_others')
    const moderatorCanPublishDirect = await this.getSetting('permissions_moderator_publish_direct')

    // Check board member privileges
    const isBoardMember = user.linkedMember?.membershipType === 'BOARD'

    switch (permission) {
      case 'create_content':
        return ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD'].includes(user.role)

      case 'edit_own_content':
        return ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD'].includes(user.role)

      case 'edit_others_content':
        if (user.role === 'EDITOR' || user.role === 'BOARD') return true
        if (user.role === 'AUTHOR' && authorCanEditOthers) return true
        if (user.role === 'MODERATOR' && moderatorCanEditOthers) return true
        return false

      case 'delete_content':
        return ['EDITOR', 'BOARD'].includes(user.role)

      case 'publish_content':
        if (user.role === 'EDITOR' || user.role === 'BOARD') return true
        if (user.role === 'AUTHOR' && authorCanPublishDirect) return true
        if (user.role === 'MODERATOR' && moderatorCanPublishDirect) return true
        return false

      case 'moderate_comments':
        return ['MODERATOR', 'EDITOR', 'BOARD'].includes(user.role)

      case 'manage_categories':
      case 'manage_tags':
        return ['EDITOR', 'BOARD'].includes(user.role)

      case 'manage_media':
        return ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD'].includes(user.role)

      case 'view_members':
        return ['USER', 'AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD'].includes(user.role)

      case 'edit_members':
        return user.role === 'BOARD' || isBoardMember

      case 'approve_membership':
        return user.role === 'BOARD' || isBoardMember

      case 'manage_users':
      case 'manage_settings':
        return user.role === 'ADMIN'

      default:
        return false
    }
  }

  /**
   * Check if user can edit specific content item
   */
  async canEditContent(user: UserWithMember, contentAuthorId: string): Promise<boolean> {
    // Can always edit own content
    if (user.id === contentAuthorId) {
      return this.hasPermission(user, 'edit_own_content')
    }

    // Check if can edit others' content
    return this.hasPermission(user, 'edit_others_content')
  }

  /**
   * Check if user can approve membership requests
   */
  async canApproveMembership(user: UserWithMember): Promise<boolean> {
    return this.hasPermission(user, 'approve_membership')
  }

  /**
   * Get user with member information for permission checking
   */
  async getUserWithMember(userId: string): Promise<UserWithMember | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        linkedMember: {
          select: {
            id: true,
            membershipType: true
          }
        }
      }
    })

    return user as UserWithMember | null
  }

  /**
   * Middleware helper to check permissions
   */
  async requirePermission(userId: string, permission: Permission): Promise<boolean> {
    const user = await this.getUserWithMember(userId)
    if (!user) return false

    return this.hasPermission(user, permission)
  }
}

export const permissions = new PermissionService()