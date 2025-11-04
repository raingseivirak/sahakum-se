import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/initiatives/[id] - Get single initiative
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const initiative = await prisma.initiative.findUnique({
      where: { id: params.id },
      include: {
        projectLead: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        translations: true,
        members: {
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
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: [
            { status: "asc" },
            { order: "asc" },
          ],
        },
        updates: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            publishedAt: "desc",
          },
        },
      },
    })

    if (!initiative) {
      return NextResponse.json(
        { error: "Initiative not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(initiative)
  } catch (error) {
    console.error("Error fetching initiative:", error)
    return NextResponse.json(
      { error: "Failed to fetch initiative" },
      { status: 500 }
    )
  }
}

// PUT /api/initiatives/[id] - Update initiative
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["BOARD", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      slug,
      status,
      visibility,
      category,
      startDate,
      endDate,
      featuredImage,
      projectLeadId,
      translations,
    } = body

    // If slug is being changed, check if it's unique
    if (slug) {
      const existingInitiative = await prisma.initiative.findFirst({
        where: {
          slug,
          NOT: { id: params.id },
        },
      })

      if (existingInitiative) {
        return NextResponse.json(
          { error: "Initiative with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (slug !== undefined) updateData.slug = slug
    if (status !== undefined) updateData.status = status
    if (visibility !== undefined) updateData.visibility = visibility
    if (category !== undefined) updateData.category = category
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage
    if (projectLeadId !== undefined) updateData.projectLeadId = projectLeadId

    // Handle translations
    if (translations) {
      // Delete existing translations and create new ones
      await prisma.initiativeTranslation.deleteMany({
        where: { initiativeId: params.id },
      })
      updateData.translations = {
        create: translations,
      }
    }

    const initiative = await prisma.initiative.update({
      where: { id: params.id },
      data: updateData,
      include: {
        projectLead: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        translations: true,
      },
    })

    return NextResponse.json(initiative)
  } catch (error) {
    console.error("Error updating initiative:", error)
    return NextResponse.json(
      { error: "Failed to update initiative" },
      { status: 500 }
    )
  }
}

// DELETE /api/initiatives/[id] - Delete initiative
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !["BOARD", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.initiative.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting initiative:", error)
    return NextResponse.json(
      { error: "Failed to delete initiative" },
      { status: 500 }
    )
  }
}
