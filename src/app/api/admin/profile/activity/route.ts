import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ActivityLogger } from '@/lib/activity-logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '30')

    // Users can only see their own activity via this endpoint
    const activities = await ActivityLogger.getUserActivity(
      session.user.id,
      Math.min(limit, 100) // Cap at 100
    )

    // Transform for frontend display
    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      resourceType: activity.resourceType,
      description: activity.description,
      createdAt: activity.createdAt,
      metadata: activity.metadata
    }))

    return NextResponse.json({
      activities: transformedActivities,
      total: activities.length
    })
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}