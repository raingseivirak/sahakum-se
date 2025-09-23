import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { ActivityLogger } from '@/lib/activity-logger'

// Validation schema for Service
const serviceSchema = z.object({
  slug: z.string().min(1),
  icon: z.string().optional(),
  featuredImg: z.string().optional(),
  colorTheme: z.string().optional().default('navy'),
  active: z.boolean().default(true),
  order: z.number().default(0),
  translations: z.array(z.object({
    language: z.enum(['sv', 'en', 'km']),
    title: z.string().min(1),
    description: z.string().optional(),
    buttonText: z.string().default('Explore')
  }))
})

// GET /api/services - List all services
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is authenticated for admin access
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const services = await prisma.service.findMany({
      include: {
        translations: true
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Services fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// POST /api/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'BOARD' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = serviceSchema.parse(body)

    // Check if slug already exists
    const existingService = await prisma.service.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingService) {
      return NextResponse.json({ error: 'Service with this slug already exists' }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        slug: validatedData.slug,
        icon: validatedData.icon,
        featuredImg: validatedData.featuredImg,
        colorTheme: validatedData.colorTheme,
        active: validatedData.active,
        order: validatedData.order,
        translations: {
          create: validatedData.translations
        }
      },
      include: {
        translations: true
      }
    })

    // Log service creation activity
    const mainTranslation = validatedData.translations.find(t => t.language === 'en') || validatedData.translations[0]
    await ActivityLogger.log({
      userId: session.user.id,
      action: 'service.created',
      resourceType: 'SERVICE',
      resourceId: service.id,
      description: `Created service "${mainTranslation.title}" (${service.slug})`,
      newValues: {
        slug: service.slug,
        icon: service.icon,
        featuredImg: service.featuredImg,
        colorTheme: service.colorTheme,
        active: service.active,
        order: service.order
      },
      metadata: {
        slug: service.slug,
        colorTheme: service.colorTheme,
        languages: validatedData.translations.map(t => t.language),
        translationCount: validatedData.translations.length
      }
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Service creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
}