import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { InitiativeCategory, InitiativeStatus, Visibility } from "@prisma/client"

// GET /api/initiatives - List all initiatives (with filters)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") as InitiativeStatus | null
    const visibility = searchParams.get("visibility") as Visibility | null
    const category = searchParams.get("category") as InitiativeCategory | null

    const where: any = {}
    if (status) where.status = status
    if (visibility) where.visibility = visibility
    if (category) where.category = category

    const initiatives = await prisma.initiative.findMany({
      where,
      include: {
        projectLead: {
          select: {
            id: true,
            name: true,
            email: true,
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
              },
            },
          },
        },
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            members: true,
            tasks: true,
            updates: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(initiatives)
  } catch (error) {
    console.error("Error fetching initiatives:", error)
    return NextResponse.json(
      { error: "Failed to fetch initiatives" },
      { status: 500 }
    )
  }
}

// POST /api/initiatives - Create new initiative
export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!slug || !category || !startDate || !projectLeadId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingInitiative = await prisma.initiative.findUnique({
      where: { slug },
    })

    if (existingInitiative) {
      return NextResponse.json(
        { error: "Initiative with this slug already exists" },
        { status: 400 }
      )
    }

    // Create initiative with translations
    const initiative = await prisma.initiative.create({
      data: {
        slug,
        status: status || "DRAFT",
        visibility: visibility || "PUBLIC",
        category,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        featuredImage,
        projectLeadId,
        translations: {
          create: translations || [],
        },
      },
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

    return NextResponse.json(initiative, { status: 201 })
  } catch (error) {
    console.error("Error creating initiative:", error)
    return NextResponse.json(
      { error: "Failed to create initiative" },
      { status: 500 }
    )
  }
}
