import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ActivityLogger } from '@/lib/activity-logger'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'BOARD' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.setting.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    })

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {} as Record<string, typeof settings>)

    return NextResponse.json({ settings: groupedSettings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'BOARD')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, value, type, category } = await request.json()

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    // Get existing setting for activity logging
    const existingSetting = await prisma.setting.findUnique({
      where: { key }
    })

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value, type, category },
      create: { key, value, type, category }
    })

    // Log setting activity
    const action = existingSetting ? 'updated' : 'created'
    await ActivityLogger.log({
      userId: session.user.id,
      action: `setting.${action}`,
      resourceType: 'SETTING',
      resourceId: setting.id,
      description: `${action === 'created' ? 'Created' : 'Updated'} setting: "${key}"`,
      oldValues: existingSetting ? {
        value: existingSetting.value,
        type: existingSetting.type,
        category: existingSetting.category
      } : undefined,
      newValues: {
        value: setting.value,
        type: setting.type,
        category: setting.category
      },
      metadata: {
        settingKey: key,
        settingCategory: category
      }
    })

    return NextResponse.json({ setting })
  } catch (error) {
    console.error('Error creating/updating setting:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'BOARD')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { settings } = await request.json()

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings must be an array' }, { status: 400 })
    }

    // Bulk update settings with activity logging
    const updatedSettings = []
    const changedSettings = []

    for (const { key, value, type, category } of settings) {
      if (key) {
        // Get existing setting for activity logging
        const existingSetting = await prisma.setting.findUnique({
          where: { key }
        })

        const setting = await prisma.setting.upsert({
          where: { key },
          update: { value, type, category },
          create: { key, value, type, category }
        })

        updatedSettings.push(setting)

        // Track changes for activity logging
        const action = existingSetting ? 'updated' : 'created'
        const hasChanges = !existingSetting ||
          existingSetting.value !== value ||
          existingSetting.type !== type ||
          existingSetting.category !== category

        if (hasChanges) {
          changedSettings.push({
            setting,
            action,
            existingSetting,
            key
          })
        }
      }
    }

    // Log bulk settings update activity
    if (changedSettings.length > 0) {
      const createdCount = changedSettings.filter(s => s.action === 'created').length
      const updatedCount = changedSettings.filter(s => s.action === 'updated').length

      await ActivityLogger.log({
        userId: session.user.id,
        action: 'settings.bulk_updated',
        resourceType: 'SETTING',
        resourceId: 'bulk_update',
        description: `Bulk updated settings: ${createdCount > 0 ? `${createdCount} created` : ''}${createdCount > 0 && updatedCount > 0 ? ', ' : ''}${updatedCount > 0 ? `${updatedCount} updated` : ''}`,
        metadata: {
          totalChanges: changedSettings.length,
          createdCount,
          updatedCount,
          changedKeys: changedSettings.map(s => s.key),
          categories: [...new Set(changedSettings.map(s => s.setting.category))]
        }
      })

      // Log individual setting changes for detailed tracking
      for (const { setting, action, existingSetting, key } of changedSettings) {
        await ActivityLogger.log({
          userId: session.user.id,
          action: `setting.${action}`,
          resourceType: 'SETTING',
          resourceId: setting.id,
          description: `${action === 'created' ? 'Created' : 'Updated'} setting: "${key}" (bulk operation)`,
          oldValues: existingSetting ? {
            value: existingSetting.value,
            type: existingSetting.type,
            category: existingSetting.category
          } : undefined,
          newValues: {
            value: setting.value,
            type: setting.type,
            category: setting.category
          },
          metadata: {
            settingKey: key,
            settingCategory: setting.category,
            isBulkOperation: true
          }
        })
      }
    }

    return NextResponse.json({ settings: updatedSettings })
  } catch (error) {
    console.error('Error bulk updating settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}