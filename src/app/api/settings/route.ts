import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
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

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, value, type, category } = await request.json()

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value, type, category },
      create: { key, value, type, category }
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

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { settings } = await request.json()

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings must be an array' }, { status: 400 })
    }

    // Bulk update settings
    const updatedSettings = []
    for (const { key, value, type, category } of settings) {
      if (key) {
        const setting = await prisma.setting.upsert({
          where: { key },
          update: { value, type, category },
          create: { key, value, type, category }
        })
        updatedSettings.push(setting)
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