import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getServiceSettings,
  updateServiceSettings,
} from '@/lib/playlist/service-settings'

export async function GET() {
  try {
    const settings = await getServiceSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch playlist settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()

    const allowedFields = [
      'serviceEnabled',
      'allowAnonRooms',
      'maxConcurrentRooms',
      'maxRoomDurationHours',
      'eveningCutoffHour',
      'roomCreationPerIpHour',
      'videoAddPerUserSec',
    ]

    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const settings = await updateServiceSettings(updates, session.user.id)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to update playlist settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
