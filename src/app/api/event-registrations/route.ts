import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/event-registrations - Get all event registrations
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions - require AUTHOR+ role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    const allowedRoles = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}

    if (eventId) {
      where.eventId = eventId
    }

    if (status && ['CONFIRMED', 'CANCELLED', 'WAITLIST'].includes(status)) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { guestFirstName: { contains: search, mode: 'insensitive' } },
        { guestLastName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ]
    }

    // Fetch registrations with event and user details
    const registrations = await prisma.eventRegistration.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            slug: true,
            startDate: true,
            endDate: true,
            locationType: true,
            translations: {
              select: {
                language: true,
                title: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Error fetching event registrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/event-registrations?id=xxx - Cancel a registration
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    const allowedRoles = ['MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const registrationId = searchParams.get('id')

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 })
    }

    // Update registration status to CANCELLED
    const registration = await prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error cancelling registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
