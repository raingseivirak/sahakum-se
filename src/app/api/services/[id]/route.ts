import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for Service update
const serviceUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  icon: z.string().optional(),
  featuredImg: z.string().optional(),
  colorTheme: z.string().optional(),
  active: z.boolean().optional(),
  order: z.number().optional(),
  translations: z.array(z.object({
    language: z.enum(['sv', 'en', 'km']),
    title: z.string().min(1),
    description: z.string().optional(),
    buttonText: z.string().default('Explore')
  })).optional()
})

// GET /api/services/[id] - Get specific service
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        translations: true
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Service fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

// PUT /api/services/[id] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'BOARD' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = serviceUpdateSchema.parse(body)

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: params.id }
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Check if slug is being changed and if it conflicts
    if (validatedData.slug && validatedData.slug !== existingService.slug) {
      const slugConflict = await prisma.service.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugConflict) {
        return NextResponse.json({ error: 'Service with this slug already exists' }, { status: 400 })
      }
    }

    // Update service with translations
    const service = await prisma.service.update({
      where: { id: params.id },
      data: {
        ...(validatedData.slug && { slug: validatedData.slug }),
        ...(validatedData.icon !== undefined && { icon: validatedData.icon }),
        ...(validatedData.featuredImg !== undefined && { featuredImg: validatedData.featuredImg }),
        ...(validatedData.colorTheme !== undefined && { colorTheme: validatedData.colorTheme }),
        ...(validatedData.active !== undefined && { active: validatedData.active }),
        ...(validatedData.order !== undefined && { order: validatedData.order }),
        ...(validatedData.translations && {
          translations: {
            deleteMany: {},
            create: validatedData.translations
          }
        })
      },
      include: {
        translations: true
      }
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Service update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id] - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'BOARD')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: params.id }
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    await prisma.service.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Service deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}