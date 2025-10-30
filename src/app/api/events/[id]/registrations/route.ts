import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/events/[id]/registrations - Get all registrations for an event (Admin only)
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

    // Require AUTHOR+ role to view registrations
    const allowedRoles = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      select: { id: true, slug: true }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get all registrations for this event
    const registrations = await prisma.eventRegistration.findMany({
      where: {
        eventId: params.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
      }
    })

    // Transform data to include both user and guest info
    const transformedRegistrations = registrations.map(reg => ({
      id: reg.id,
      eventId: reg.eventId,
      // User or guest info
      registrantType: reg.userId ? 'MEMBER' : 'GUEST',
      registrantName: reg.userId
        ? (reg.user?.firstName && reg.user?.lastName
            ? `${reg.user.firstName} ${reg.user.lastName}`
            : reg.user?.name)
        : `${reg.guestFirstName} ${reg.guestLastName}`,
      registrantEmail: reg.userId ? reg.user?.email : reg.guestEmail,
      registrantPhone: reg.guestPhone,
      // Registration details
      numberOfGuests: reg.numberOfGuests,
      notes: reg.notes,
      status: reg.status,
      registeredAt: reg.registeredAt,
      // Additional info
      userId: reg.userId,
      createdAt: reg.createdAt,
      updatedAt: reg.updatedAt
    }))

    // Get summary statistics
    const summary = {
      total: registrations.length,
      confirmed: registrations.filter(r => r.status === 'CONFIRMED').length,
      waitlist: registrations.filter(r => r.status === 'WAITLIST').length,
      cancelled: registrations.filter(r => r.status === 'CANCELLED').length,
      totalGuests: registrations
        .filter(r => r.status === 'CONFIRMED')
        .reduce((sum, r) => sum + r.numberOfGuests, 0)
    }

    return NextResponse.json({
      registrations: transformedRegistrations,
      summary
    })
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
