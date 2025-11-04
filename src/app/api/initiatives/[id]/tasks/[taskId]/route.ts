import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/initiatives/[id]/tasks/[taskId] - Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
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

    if (!task || task.initiativeId !== params.id) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    )
  }
}

// PATCH /api/initiatives/[id]/tasks/[taskId] - Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
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
        { error: "You must be a member of this initiative to update tasks" },
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
      status,
      priority,
      dueDate,
      order,
    } = body

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.taskId },
    })

    if (!existingTask || existingTask.initiativeId !== params.id) {
      return NextResponse.json(
        { error: "Task not found" },
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

    // Validate status if provided
    if (status && !["TODO", "IN_PROGRESS", "COMPLETED", "BLOCKED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    // Validate priority if provided
    if (priority && !["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority)) {
      return NextResponse.json(
        { error: "Invalid priority" },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (titleEn !== undefined) updateData.titleEn = titleEn
    if (titleSv !== undefined) updateData.titleSv = titleSv
    if (titleKm !== undefined) updateData.titleKm = titleKm
    if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn
    if (descriptionSv !== undefined) updateData.descriptionSv = descriptionSv
    if (descriptionKm !== undefined) updateData.descriptionKm = descriptionKm
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (order !== undefined) updateData.order = order

    // Handle dueDate (can be set to null)
    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null
    }

    // Handle completedAt when status changes to COMPLETED
    if (status === "COMPLETED" && existingTask.status !== "COMPLETED") {
      updateData.completedAt = new Date()
    } else if (status && status !== "COMPLETED") {
      updateData.completedAt = null
    }

    // Update task
    const task = await prisma.task.update({
      where: { id: params.taskId },
      data: updateData,
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

    return NextResponse.json({ task })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    )
  }
}

// DELETE /api/initiatives/[id]/tasks/[taskId] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["ADMIN", "BOARD", "EDITOR"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: params.taskId },
    })

    if (!existingTask || existingTask.initiativeId !== params.id) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    // Delete task
    await prisma.task.delete({
      where: { id: params.taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}
