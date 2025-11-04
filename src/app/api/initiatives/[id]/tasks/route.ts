import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/initiatives/[id]/tasks - Get all tasks
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

    const tasks = await prisma.task.findMany({
      where: {
        initiativeId: params.id,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { priority: "desc" },
        { order: "asc" },
      ],
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

// POST /api/initiatives/[id]/tasks - Create task
export async function POST(
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

    // Check if user is a member of the initiative
    const membership = await prisma.initiativeMember.findUnique({
      where: {
        initiativeId_userId: {
          initiativeId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member of this initiative to create tasks" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      titleEn,
      titleSv,
      titleKm,
      descriptionEn,
      descriptionSv,
      descriptionKm,
      assignedToId,
      status = "TODO",
      priority = "MEDIUM",
      dueDate,
      order = 0,
    } = body

    // Validate at least one title is provided
    if (!titleEn && !titleSv && !titleKm) {
      return NextResponse.json(
        { error: "At least one title (EN, SV, or KM) is required" },
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

    // Validate assignedTo is a team member if provided
    if (assignedToId) {
      const teamMember = await prisma.initiativeMember.findUnique({
        where: {
          initiativeId_userId: {
            initiativeId: params.id,
            userId: assignedToId,
          },
        },
      })

      if (!teamMember) {
        return NextResponse.json(
          { error: "Assigned user is not a team member" },
          { status: 400 }
        )
      }
    }

    // Validate status
    if (!["TODO", "IN_PROGRESS", "COMPLETED", "BLOCKED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    // Validate priority
    if (!["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority" },
        { status: 400 }
      )
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        initiativeId: params.id,
        titleEn,
        titleSv,
        titleKm,
        descriptionEn,
        descriptionSv,
        descriptionKm,
        assignedToId,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        order,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}
