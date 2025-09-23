import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ActivityLogger } from '@/lib/activity-logger'
import { z } from 'zod'
import bcryptjs from 'bcryptjs'

// Validation schema for User creation
const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['USER', 'AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

// GET /api/users - List all system users
async function handleGET(request: NextRequest, context: AdminAuthContext) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        // linkedMember: {
        //   select: {
        //     id: true,
        //     memberNumber: true,
        //     membershipType: true,
        //   }
        // }
      },
      orderBy: [
        { role: 'asc' }, // ADMIN first, then EDITOR, then AUTHOR
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user
async function handlePOST(request: NextRequest, context: AdminAuthContext) {
  try {
    const body = await request.json()
    const validatedData = userCreateSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        // linkedMember: {
        //   select: {
        //     id: true,
        //     memberNumber: true,
        //     membershipType: true,
        //   }
        // }
      }
    })

    // Log user creation activity
    await ActivityLogger.logUserManagement(
      context.user.id,
      'created',
      user.id,
      user.name || user.email,
      undefined,
      {
        email: user.email,
        role: user.role
      }
    )

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('User creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// GET /api/users - List all users (requires ADMIN role)
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    // Get user and check for ADMIN role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({
        error: 'Insufficient privileges - Admin access required',
        required: 'ADMIN',
        current: user.role
      }, { status: 403 })
    }

    // User is authenticated and has ADMIN role - proceed with original handler
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'asc' }, // ADMIN first, then EDITOR, then AUTHOR
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create new user (requires ADMIN role)
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    // Get user and check for ADMIN role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json({
        error: 'Insufficient privileges - Admin access required',
        required: 'ADMIN',
        current: user.role
      }, { status: 403 })
    }

    // User is authenticated and has ADMIN role - proceed with creation
    const body = await request.json()
    const validatedData = userCreateSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(validatedData.password, 12)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        role: validatedData.role,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
      }
    })

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error) {
    console.error('User creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}