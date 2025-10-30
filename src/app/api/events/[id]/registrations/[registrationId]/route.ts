import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registrationUpdateSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'WAITLIST']),
})

// PUT /api/events/[id]/registrations/[registrationId] - Update registration status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; registrationId: string } }
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

    // Require MODERATOR+ role to manage registrations
    const allowedRoles = ['MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({
        error: 'Insufficient privileges - Moderator access required'
      }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = registrationUpdateSchema.parse(body)

    // Check if registration exists
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: params.registrationId }
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Verify registration belongs to this event
    if (registration.eventId !== params.id) {
      return NextResponse.json({ error: 'Registration does not belong to this event' }, { status: 400 })
    }

    // Update registration status
    const updatedRegistration = await prisma.eventRegistration.update({
      where: { id: params.registrationId },
      data: {
        status: validatedData.status
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedRegistration)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('Error updating registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/events/[id]/registrations/[registrationId] - Delete registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; registrationId: string } }
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

    // Require MODERATOR+ role to delete registrations
    const allowedRoles = ['MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({
        error: 'Insufficient privileges - Moderator access required'
      }, { status: 403 })
    }

    // Check if registration exists
    const registration = await prisma.eventRegistration.findUnique({
      where: { id: params.registrationId }
    })

    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Verify registration belongs to this event
    if (registration.eventId !== params.id) {
      return NextResponse.json({ error: 'Registration does not belong to this event' }, { status: 400 })
    }

    // Delete registration
    await prisma.eventRegistration.delete({
      where: { id: params.registrationId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
