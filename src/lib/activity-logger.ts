import { prisma } from './prisma'
import { headers } from 'next/headers'

export interface ActivityLogData {
  userId: string
  action: string
  resourceType: string
  resourceId?: string
  description: string
  oldValues?: any
  newValues?: any
  metadata?: any
}

/**
 * Activity Logger for tracking user actions in the admin system
 *
 * Standard action format: "{resource}.{action}"
 * Examples: "page.created", "user.updated", "auth.login"
 */
export class ActivityLogger {
  /**
   * Log an activity with automatic IP and User-Agent detection
   */
  static async log(data: ActivityLogData) {
    try {
      const headersList = headers()
      const ipAddress = headersList.get('x-forwarded-for') ||
                       headersList.get('x-real-ip') ||
                       'unknown'
      const userAgent = headersList.get('user-agent') || 'unknown'

      await prisma.activityLog.create({
        data: {
          ...data,
          ipAddress,
          userAgent,
        }
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
      // Don't throw - logging should not break the main operation
    }
  }

  /**
   * Log content creation (pages, posts, etc.)
   */
  static async logContentCreated(
    userId: string,
    resourceType: 'PAGE' | 'POST' | 'MEDIA',
    resourceId: string,
    title: string,
    metadata?: any
  ) {
    await this.log({
      userId,
      action: `${resourceType.toLowerCase()}.created`,
      resourceType,
      resourceId,
      description: `Created ${resourceType.toLowerCase()}: "${title}"`,
      newValues: { title },
      metadata
    })
  }

  /**
   * Log content updates with before/after values
   */
  static async logContentUpdated(
    userId: string,
    resourceType: 'PAGE' | 'POST' | 'USER' | 'CATEGORY' | 'TAG' | 'SERVICE',
    resourceId: string,
    title: string,
    oldValues?: any,
    newValues?: any,
    changedFields?: string[]
  ) {
    await this.log({
      userId,
      action: `${resourceType.toLowerCase()}.updated`,
      resourceType,
      resourceId,
      description: `Updated ${resourceType.toLowerCase()}: "${title}"${changedFields ? ` (${changedFields.join(', ')})` : ''}`,
      oldValues,
      newValues,
      metadata: { changedFields }
    })
  }

  /**
   * Log content deletion
   */
  static async logContentDeleted(
    userId: string,
    resourceType: 'PAGE' | 'POST' | 'USER' | 'MEDIA' | 'CATEGORY' | 'TAG',
    resourceId: string,
    title: string,
    metadata?: any
  ) {
    await this.log({
      userId,
      action: `${resourceType.toLowerCase()}.deleted`,
      resourceType,
      resourceId,
      description: `Deleted ${resourceType.toLowerCase()}: "${title}"`,
      oldValues: { title },
      metadata
    })
  }

  /**
   * Log authentication events
   */
  static async logAuth(
    userId: string,
    action: 'login' | 'logout' | 'failed_login',
    email?: string,
    metadata?: any
  ) {
    await this.log({
      userId,
      action: `auth.${action}`,
      resourceType: 'AUTH',
      description: `User ${action.replace('_', ' ')}: ${email || 'unknown'}`,
      metadata: { email, ...metadata }
    })
  }

  /**
   * Log user management actions
   */
  static async logUserManagement(
    actorUserId: string,
    action: 'created' | 'updated' | 'activated' | 'deactivated' | 'role_changed',
    targetUserId: string,
    targetUserName: string,
    oldValues?: any,
    newValues?: any
  ) {
    await this.log({
      userId: actorUserId,
      action: `user.${action}`,
      resourceType: 'USER',
      resourceId: targetUserId,
      description: `${action.replace('_', ' ')} user: "${targetUserName}"`,
      oldValues,
      newValues
    })
  }

  /**
   * Log membership request actions
   */
  static async logMembershipRequest(
    userId: string,
    action: 'submitted' | 'approved' | 'rejected' | 'reviewed',
    requestId: string,
    applicantName: string,
    metadata?: any
  ) {
    await this.log({
      userId,
      action: `membership.${action}`,
      resourceType: 'MEMBERSHIP_REQUEST',
      resourceId: requestId,
      description: `${action} membership request from: "${applicantName}"`,
      metadata
    })
  }

  /**
   * Log settings changes
   */
  static async logSettingsChange(
    userId: string,
    settingKey: string,
    oldValue: any,
    newValue: any
  ) {
    await this.log({
      userId,
      action: 'settings.updated',
      resourceType: 'SETTINGS',
      resourceId: settingKey,
      description: `Updated setting: "${settingKey}"`,
      oldValues: { [settingKey]: oldValue },
      newValues: { [settingKey]: newValue }
    })
  }

  /**
   * Get recent activity for a user (for their profile)
   */
  static async getUserActivity(userId: string, limit = 50) {
    return await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })
  }

  /**
   * Get all activity with filtering (for admin dashboard)
   */
  static async getAllActivity(options: {
    userId?: string
    action?: string
    resourceType?: string
    resourceId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  } = {}) {
    const {
      userId,
      action,
      resourceType,
      resourceId,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = options

    const where: any = {}

    if (userId) where.userId = userId
    if (action) where.action = { contains: action, mode: 'insensitive' }
    if (resourceType) where.resourceType = resourceType
    if (resourceId) where.resourceId = resourceId
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.activityLog.count({ where })
    ])

    return { activities, total }
  }
}

/**
 * Helper function to extract changed fields from old and new values
 */
export function getChangedFields(oldValues: any, newValues: any): string[] {
  if (!oldValues || !newValues) return []

  const changedFields: string[] = []

  for (const key in newValues) {
    if (oldValues[key] !== newValues[key]) {
      changedFields.push(key)
    }
  }

  return changedFields
}

/**
 * Activity types for filtering and display
 */
export const ACTIVITY_TYPES = {
  // Content
  PAGE_CREATED: 'page.created',
  PAGE_UPDATED: 'page.updated',
  PAGE_DELETED: 'page.deleted',
  POST_CREATED: 'post.created',
  POST_UPDATED: 'post.updated',
  POST_DELETED: 'post.deleted',
  POST_PUBLISHED: 'post.published',

  // Media
  MEDIA_UPLOADED: 'media.uploaded',
  MEDIA_DELETED: 'media.deleted',

  // Users
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_ACTIVATED: 'user.activated',
  USER_DEACTIVATED: 'user.deactivated',
  USER_ROLE_CHANGED: 'user.role_changed',

  // Auth
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_FAILED_LOGIN: 'auth.failed_login',

  // Membership
  MEMBERSHIP_SUBMITTED: 'membership.submitted',
  MEMBERSHIP_APPROVED: 'membership.approved',
  MEMBERSHIP_REJECTED: 'membership.rejected',

  // Settings
  SETTINGS_UPDATED: 'settings.updated',

  // Categories & Tags
  CATEGORY_CREATED: 'category.created',
  CATEGORY_UPDATED: 'category.updated',
  CATEGORY_DELETED: 'category.deleted',
  TAG_CREATED: 'tag.created',
  TAG_UPDATED: 'tag.updated',
  TAG_DELETED: 'tag.deleted',
} as const

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES]