import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ActivityLogger } from "@/lib/activity-logger"
import { z } from "zod"

// Schema for event update
const eventUpdateSchema = z.object({
  slug: z.string().min(1, "Slug is required").optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  allDay: z.boolean().optional(),
  locationType: z.enum(["PHYSICAL", "VIRTUAL", "HYBRID"]).optional(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  virtualUrl: z.string().optional(),
  registrationEnabled: z.boolean().optional(),
  registrationType: z.enum(["PUBLIC", "MEMBERS_ONLY"]).optional(),
  registrationDeadline: z.string().optional(),
  maxCapacity: z.number().optional(),
  isFree: z.boolean().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  organizer: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  externalUrl: z.string().url().optional().or(z.literal('')),
  featuredImg: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  publishedAt: z.string().optional(),
  translations: z.array(z.object({
    id: z.string().optional(),
    language: z.string(),
    title: z.string().min(1, "Title is required"),
    content: z.string(),
    excerpt: z.string().optional(),
    metaDescription: z.string().optional(),
    seoTitle: z.string().optional(),
  })).optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
})

// GET /api/events/[id] - Get single event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    // Get user and check for appropriate role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const allowedRoles = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        translations: true,
        categories: {
          include: {
            category: {
              include: {
                translations: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: true
              }
            }
          }
        },
        _count: {
          select: {
            registrations: {
              where: {
                status: 'CONFIRMED'
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/events/[id] - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    // Get user and check for appropriate role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const allowedRoles = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = eventUpdateSchema.parse(body)

    // Get existing event
    const existingEvent = await prisma.event.findUnique({
      where: { id: params.id },
      include: { translations: true }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // If slug is being changed, check if new slug already exists
    if (validatedData.slug && validatedData.slug !== existingEvent.slug) {
      const slugExists = await prisma.event.findUnique({
        where: { slug: validatedData.slug }
      })
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    // Parse dates if provided
    const updateData: any = {}
    if (validatedData.startDate) updateData.startDate = new Date(validatedData.startDate)
    if (validatedData.endDate) updateData.endDate = new Date(validatedData.endDate)
    if (validatedData.registrationDeadline) {
      updateData.registrationDeadline = new Date(validatedData.registrationDeadline)
    }

    // Handle publishedAt
    if (validatedData.publishedAt) {
      updateData.publishedAt = new Date(validatedData.publishedAt)
    } else if (validatedData.status === 'PUBLISHED' && existingEvent.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date()
    }

    // Add all other fields
    const simpleFields = [
      'slug', 'allDay', 'locationType', 'venueName', 'address', 'postalCode',
      'city', 'country', 'virtualUrl', 'registrationEnabled', 'registrationType',
      'maxCapacity', 'isFree', 'price', 'currency', 'organizer', 'contactEmail',
      'externalUrl', 'featuredImg', 'status'
    ]
    simpleFields.forEach(field => {
      if (validatedData[field] !== undefined) {
        updateData[field] = validatedData[field]
      }
    })

    // Handle translations
    if (validatedData.translations) {
      // Delete existing translations and create new ones
      await prisma.eventTranslation.deleteMany({
        where: { eventId: params.id }
      })
      updateData.translations = {
        create: validatedData.translations.map(({ id, ...translation }) => translation)
      }
    }

    // Handle categories
    if (validatedData.categoryIds !== undefined) {
      await prisma.eventCategory.deleteMany({
        where: { eventId: params.id }
      })
      if (validatedData.categoryIds.length > 0) {
        updateData.categories = {
          create: validatedData.categoryIds.map(categoryId => ({
            category: { connect: { id: categoryId } }
          }))
        }
      }
    }

    // Handle tags
    if (validatedData.tagIds !== undefined) {
      await prisma.eventTag.deleteMany({
        where: { eventId: params.id }
      })
      if (validatedData.tagIds.length > 0) {
        updateData.tags = {
          create: validatedData.tagIds.map(tagId => ({
            tag: { connect: { id: tagId } }
          }))
        }
      }
    }

    // Update event
    const event = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        translations: true,
        categories: {
          include: {
            category: {
              include: {
                translations: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: true
              }
            }
          }
        },
        _count: {
          select: {
            registrations: true
          }
        }
      }
    })

    // Log event update activity
    const mainTranslation = event.translations.find(t => t.language === 'en') || event.translations[0]
    await ActivityLogger.logContentUpdated(
      user.id,
      'EVENT',
      event.id,
      mainTranslation?.title || event.slug,
      existingEvent,
      event
    )

    return NextResponse.json(event)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/events/[id] - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    // Get user and check for appropriate role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For deleting events, require EDITOR+ role
    const allowedRoles = ['EDITOR', 'BOARD', 'ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({
        error: 'Insufficient privileges - Editor access required',
        required: allowedRoles,
        current: user.role
      }, { status: 403 })
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { translations: true }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const mainTranslation = event.translations.find(t => t.language === 'en') || event.translations[0]

    // Delete event (cascade will handle translations, categories, tags, registrations)
    await prisma.event.delete({
      where: { id: params.id }
    })

    // Log event deletion
    await ActivityLogger.logContentDeleted(
      user.id,
      'EVENT',
      params.id,
      mainTranslation?.title || event.slug
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
