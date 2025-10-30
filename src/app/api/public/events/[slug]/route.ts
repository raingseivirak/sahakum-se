import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'sv'

    const event = await prisma.event.findUnique({
      where: {
        slug: params.slug
      },
      include: {
        translations: {
          where: {
            language: language
          }
        },
        author: {
          select: {
            id: true,
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
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if event is published
    if (event.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if event has translation in requested language
    if (event.translations.length === 0) {
      return NextResponse.json(
        { error: 'Translation not found for this language' },
        { status: 404 }
      )
    }

    const confirmedRegistrations = event._count.registrations
    const spotsRemaining = event.maxCapacity
      ? Math.max(0, event.maxCapacity - confirmedRegistrations)
      : null

    // Check registration availability
    const now = new Date()
    const registrationClosed = event.registrationDeadline
      ? new Date(event.registrationDeadline) < now
      : false
    const eventPassed = new Date(event.endDate) < now

    const transformedEvent = {
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
      registrationClosed,
      eventPassed,
      canRegister: event.registrationEnabled && !registrationClosed && !eventPassed && (spotsRemaining === null || spotsRemaining > 0),
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

    return NextResponse.json(transformedEvent)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
