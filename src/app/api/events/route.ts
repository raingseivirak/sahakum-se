import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ActivityLogger } from "@/lib/activity-logger"
import { z } from "zod"

// Schema for event creation/update
const eventSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  startDate: z.string(),
  endDate: z.string(),
  allDay: z.boolean().optional().default(false),
  locationType: z.enum(["PHYSICAL", "VIRTUAL", "HYBRID"]),
  venueName: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  virtualUrl: z.string().optional(),
  registrationEnabled: z.boolean().optional().default(false),
  registrationType: z.enum(["PUBLIC", "MEMBERS_ONLY"]).optional(),
  registrationDeadline: z.string().optional(),
  maxCapacity: z.number().optional(),
  isFree: z.boolean().optional().default(true),
  price: z.number().optional(),
  currency: z.string().optional().default("SEK"),
  organizer: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  externalUrl: z.string().url().optional().or(z.literal('')),
  featuredImg: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  publishedAt: z.string().optional(),
  translations: z.array(z.object({
    language: z.string(),
    title: z.string().min(1, "Title is required"),
    content: z.string(),
    excerpt: z.string().optional(),
    metaDescription: z.string().optional(),
    seoTitle: z.string().optional(),
  })),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
})

// GET /api/events - List all events
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    // Get user and check for appropriate role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For events, require AUTHOR+ role (AUTHOR, MODERATOR, EDITOR, BOARD, ADMIN)
    const allowedRoles = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({
        error: 'Insufficient privileges - Author access required',
        required: allowedRoles,
        current: user.role
      }, { status: 403 })
    }

    const events = await prisma.event.findMany({
      include: {
        author: {
          select: { name: true, email: true }
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
      },
      orderBy: { startDate: "desc" }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Events fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    // Get user and check for appropriate role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For creating events, require AUTHOR+ role
    const allowedRoles = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({
        error: 'Insufficient privileges - Author access required',
        required: allowedRoles,
        current: user.role
      }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = eventSchema.parse(body)

    // Check if slug already exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingEvent) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Parse dates
    const startDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)

    let publishedAt = null
    if (validatedData.publishedAt) {
      publishedAt = new Date(validatedData.publishedAt)
    } else if (validatedData.status === "PUBLISHED") {
      publishedAt = new Date()
    }

    const registrationDeadline = validatedData.registrationDeadline
      ? new Date(validatedData.registrationDeadline)
      : null

    // Create event with translations
    const event = await prisma.event.create({
      data: {
        slug: validatedData.slug,
        startDate,
        endDate,
        allDay: validatedData.allDay,
        locationType: validatedData.locationType,
        venueName: validatedData.venueName,
        address: validatedData.address,
        postalCode: validatedData.postalCode,
        city: validatedData.city,
        country: validatedData.country || 'Sweden',
        virtualUrl: validatedData.virtualUrl,
        registrationEnabled: validatedData.registrationEnabled,
        registrationType: validatedData.registrationType,
        registrationDeadline,
        maxCapacity: validatedData.maxCapacity,
        isFree: validatedData.isFree,
        price: validatedData.price,
        currency: validatedData.currency || 'SEK',
        organizer: validatedData.organizer,
        contactEmail: validatedData.contactEmail,
        externalUrl: validatedData.externalUrl,
        featuredImg: validatedData.featuredImg,
        status: validatedData.status,
        authorId: user.id,
        publishedAt: publishedAt,
        translations: {
          create: validatedData.translations
        },
        categories: validatedData.categoryIds ? {
          create: validatedData.categoryIds.map(categoryId => ({
            category: {
              connect: { id: categoryId }
            }
          }))
        } : undefined,
        tags: validatedData.tagIds ? {
          create: validatedData.tagIds.map(tagId => ({
            tag: {
              connect: { id: tagId }
            }
          }))
        } : undefined,
      },
      include: {
        author: {
          select: { name: true, email: true }
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

    // Log event creation activity
    const mainTranslation = validatedData.translations.find(t => t.language === 'en') || validatedData.translations[0]
    await ActivityLogger.logContentCreated(
      user.id,
      'EVENT',
      event.id,
      mainTranslation.title,
      {
        slug: event.slug,
        status: event.status,
        startDate: event.startDate,
        locationType: event.locationType,
        languages: validatedData.translations.map(t => t.language)
      }
    )

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
