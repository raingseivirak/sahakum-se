import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/my/initiatives/[slug] - Get single initiative details (only if I'm a member)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const language = searchParams.get("language") || "en"

    // Find the initiative
    const initiative = await prisma.initiative.findUnique({
      where: { slug: params.slug },
      include: {
        translations: {
          where: {
            language: language,
          },
        },
        projectLead: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
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
                profileImage: true,
              },
            },
          },
          orderBy: [
            { status: "asc" },
            { order: "asc" },
          ],
        },
        _count: {
          select: {
            members: true,
            tasks: true,
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

    // Check if user is a member
    const isMember = initiative.members.some((member) => member.userId === session.user.id)
    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this initiative" },
        { status: 403 }
      )
    }

    // Get user's role
    const myMembership = initiative.members.find((member) => member.userId === session.user.id)

    const translation = initiative.translations[0] || {
      title: "Untitled",
      shortDescription: "",
      description: "",
    }

    const responseData = {
      id: initiative.id,
      slug: initiative.slug,
      status: initiative.status,
      category: initiative.category,
      startDate: initiative.startDate,
      endDate: initiative.endDate,
      featuredImage: initiative.featuredImage,
      translation,
      projectLead: initiative.projectLead,
      members: initiative.members,
      tasks: initiative.tasks,
      myRole: myMembership?.role,
      _count: initiative._count,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching my initiative:", error)
    return NextResponse.json(
      { error: "Failed to fetch initiative" },
      { status: 500 }
    )
  }
}
