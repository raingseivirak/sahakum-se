import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/initiatives/[id]/members - Get all team members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const members = await prisma.initiativeMember.findMany({
      where: {
        initiativeId: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    })

    return NextResponse.json({ members })
  } catch (error) {
    console.error("Error fetching initiative members:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

// POST /api/initiatives/[id]/members - Add team member
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "BOARD", "EDITOR"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, role = "MEMBER", contributionNote } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Check if initiative exists
    const initiative = await prisma.initiative.findUnique({
      where: { id: params.id },
    })

    if (!initiative) {
      return NextResponse.json(
        { error: "Initiative not found" },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const existingMember = await prisma.initiativeMember.findUnique({
      where: {
        initiativeId_userId: {
          initiativeId: params.id,
          userId,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a team member" },
        { status: 400 }
      )
    }

    // Validate role
    if (!["LEAD", "CO_LEAD", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    // Add member
    const member = await prisma.initiativeMember.create({
      data: {
        initiativeId: params.id,
        userId,
        role,
        contributionNote,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (error) {
    console.error("Error adding initiative member:", error)
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    )
  }
}
