import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ActivityLogger } from '@/lib/activity-logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'BOARD', 'EDITOR', 'MODERATOR', 'AUTHOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const userId = searchParams.get('userId') || undefined
    const action = searchParams.get('action') || undefined
    const resourceType = searchParams.get('resourceType') || undefined
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Only ADMIN and BOARD can see all users' activity, others see only their own
    const effectiveUserId = ['ADMIN', 'BOARD'].includes(session.user.role) ? userId : session.user.id

    const result = await ActivityLogger.getAllActivity({
      userId: effectiveUserId,
      action,
      resourceType,
      startDate,
      endDate,
      limit: Math.min(limit, 200), // Cap at 200
      offset
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      action,
      resourceType,
      resourceId,
      description,
      oldValues,
      newValues,
      metadata
    } = body

    // Validate required fields
    if (!action || !resourceType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: action, resourceType, description' },
        { status: 400 }
      )
    }

    await ActivityLogger.log({
      userId: session.user.id,
      action,
      resourceType,
      resourceId,
      description,
      oldValues,
      newValues,
      metadata
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating activity log:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}