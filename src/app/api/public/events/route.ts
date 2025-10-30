import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const language = searchParams.get('language') || 'sv'
    const timeFilter = searchParams.get('time') || 'upcoming' // upcoming | past | all

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      status: 'PUBLISHED',
      publishedAt: {
        lte: new Date()
      }
    }

    // Add time filter
    const now = new Date()
    if (timeFilter === 'upcoming') {
      whereClause.endDate = { gte: now }
    } else if (timeFilter === 'past') {
      whereClause.endDate = { lt: now }
    }

    // Add category filter if provided
    if (category) {
      whereClause.categories = {
        some: {
          category: {
            slug: category
          }
        }
      }
    }

    // Get events with translations
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        translations: {
          where: {
            language: language
          }
        },
        author: {
          select: {
            name: true,
            email: true
          }
        },
        categories: {
          include: {
            category: {
              include: {
                translations: {
                  where: {
                    language: language
                  }
                }
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: {
                  where: {
                    language: language
                  }
                }
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
      orderBy: timeFilter === 'past'
        ? { startDate: 'desc' }  // Most recent first for past events
        : { startDate: 'asc' },   // Closest first for upcoming events
      skip,
      take: limit
    })

    // Filter events that have translations in the requested language
    const eventsWithTranslations = events.filter(event => event.translations.length > 0)

    // Get total count for pagination
    const totalCount = await prisma.event.count({
      where: whereClause
    })

    // Transform data for frontend
    const transformedEvents = eventsWithTranslations.map(event => {
      const confirmedRegistrations = event._count.registrations
      const spotsRemaining = event.maxCapacity
        ? Math.max(0, event.maxCapacity - confirmedRegistrations)
        : null

      return {
        id: event.id,
        slug: event.slug,
        startDate: event.startDate,
        endDate: event.endDate,
        allDay: event.allDay,
        locationType: event.locationType,
        venueName: event.venueName,
        address: event.address,
        postalCode: event.postalCode,
        city: event.city,
        country: event.country,
        virtualUrl: event.virtualUrl,
        registrationEnabled: event.registrationEnabled,
        registrationType: event.registrationType,
        registrationDeadline: event.registrationDeadline,
        maxCapacity: event.maxCapacity,
        currentAttendees: confirmedRegistrations,
        spotsRemaining,
        isFull: event.maxCapacity ? confirmedRegistrations >= event.maxCapacity : false,
        isFree: event.isFree,
        price: event.price,
        currency: event.currency,
        organizer: event.organizer,
        contactEmail: event.contactEmail,
        externalUrl: event.externalUrl,
        featuredImg: event.featuredImg,
        status: event.status,
        publishedAt: event.publishedAt,
        author: event.author,
        translation: event.translations[0],
        categories: event.categories.map(ec => ({
          slug: ec.category.slug,
          name: ec.category.translations[0]?.name || ec.category.slug
        })),
        tags: event.tags.map(et => ({
          slug: et.tag.slug,
          name: et.tag.translations[0]?.name || et.tag.slug
        }))
      }
    })

    return NextResponse.json({
      events: transformedEvents,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
