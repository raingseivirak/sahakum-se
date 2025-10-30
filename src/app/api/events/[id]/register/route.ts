import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for event registration
const registrationSchema = z.object({
  // For guest registrations (PUBLIC events)
  guestFirstName: z.string().optional(),
  guestLastName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  // Registration details
  numberOfGuests: z.number().min(1).default(1),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const validatedData = registrationSchema.parse(body)

    // Get event with registration settings
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: 'CONFIRMED' }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if event allows registration
    if (!event.registrationEnabled) {
      return NextResponse.json(
        { error: 'Registration is not enabled for this event' },
        { status: 400 }
      )
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return NextResponse.json(
        { error: 'Registration deadline has passed' },
        { status: 400 }
      )
    }

    // Check if event has passed
    if (new Date(event.endDate) < new Date()) {
      return NextResponse.json(
        { error: 'This event has already ended' },
        { status: 400 }
      )
    }

    // Check capacity
    const confirmedCount = event._count.registrations
    if (event.maxCapacity && confirmedCount >= event.maxCapacity) {
      return NextResponse.json(
        { error: 'Event is at full capacity' },
        { status: 400 }
      )
    }

    // Check capacity with number of guests
    if (event.maxCapacity && (confirmedCount + validatedData.numberOfGuests) > event.maxCapacity) {
      const spotsRemaining = event.maxCapacity - confirmedCount
      return NextResponse.json(
        {
          error: `Only ${spotsRemaining} spot(s) remaining. Cannot register ${validatedData.numberOfGuests} guest(s).`
        },
        { status: 400 }
      )
    }

    // Handle MEMBERS_ONLY events
    if (event.registrationType === 'MEMBERS_ONLY') {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Please sign in to register for this members-only event' },
          { status: 401 }
        )
      }

      // Check if user is a member
      const member = await prisma.member.findFirst({
        where: {
          email: session.user.email!,
          active: true
        }
      })

      if (!member) {
        return NextResponse.json(
          { error: 'This event is for members only' },
          { status: 403 }
        )
      }

      // Check if user already registered
      const existingRegistration = await prisma.eventRegistration.findFirst({
        where: {
          eventId: params.id,
          userId: session.user.id,
          status: { in: ['CONFIRMED', 'WAITLIST'] }
        }
      })

      if (existingRegistration) {
        return NextResponse.json(
          { error: 'You have already registered for this event' },
          { status: 400 }
        )
      }

      // Create member registration
      const registration = await prisma.eventRegistration.create({
        data: {
          eventId: params.id,
          userId: session.user.id,
          numberOfGuests: validatedData.numberOfGuests,
          notes: validatedData.notes,
          status: 'CONFIRMED'
        }
      })

      return NextResponse.json(registration, { status: 201 })
    }

    // Handle PUBLIC events
    if (event.registrationType === 'PUBLIC') {
      // If user is logged in, use userId
      if (session?.user?.id) {
        // Check if user already registered
        const existingRegistration = await prisma.eventRegistration.findFirst({
          where: {
            eventId: params.id,
            userId: session.user.id,
            status: { in: ['CONFIRMED', 'WAITLIST'] }
          }
        })

        if (existingRegistration) {
          return NextResponse.json(
            { error: 'You have already registered for this event' },
            { status: 400 }
          )
        }

        const registration = await prisma.eventRegistration.create({
          data: {
            eventId: params.id,
            userId: session.user.id,
            numberOfGuests: validatedData.numberOfGuests,
            notes: validatedData.notes,
            status: 'CONFIRMED'
          }
        })

        return NextResponse.json(registration, { status: 201 })
      }

      // Guest registration - require guest details
      if (!validatedData.guestFirstName || !validatedData.guestLastName || !validatedData.guestEmail) {
        return NextResponse.json(
          { error: 'Guest details (first name, last name, email) are required for registration' },
          { status: 400 }
        )
      }

      // Check if guest email already registered
      const existingRegistration = await prisma.eventRegistration.findFirst({
        where: {
          eventId: params.id,
          guestEmail: validatedData.guestEmail,
          status: { in: ['CONFIRMED', 'WAITLIST'] }
        }
      })

      if (existingRegistration) {
        return NextResponse.json(
          { error: 'This email has already been registered for this event' },
          { status: 400 }
        )
      }

      // Create guest registration
      const registration = await prisma.eventRegistration.create({
        data: {
          eventId: params.id,
          guestFirstName: validatedData.guestFirstName,
          guestLastName: validatedData.guestLastName,
          guestEmail: validatedData.guestEmail,
          guestPhone: validatedData.guestPhone,
          numberOfGuests: validatedData.numberOfGuests,
          notes: validatedData.notes,
          status: 'CONFIRMED'
        }
      })

      return NextResponse.json(registration, { status: 201 })
    }

    return NextResponse.json(
      { error: 'Invalid registration type' },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
