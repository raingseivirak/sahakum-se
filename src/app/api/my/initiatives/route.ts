import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/my/initiatives - Get initiatives where I'm a team member
export async function GET(request: NextRequest) {
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

    // Get all initiatives where user is a team member
    const memberInitiatives = await prisma.initiativeMember.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        initiative: {
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
            _count: {
              select: {
                members: true,
                tasks: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    })

    // Filter out archived initiatives and format response
    const activeInitiatives = memberInitiatives
      .filter((member) => member.initiative.status !== "ARCHIVED")
      .map((member) => {
        const initiative = member.initiative
        const translation = initiative.translations[0] || {
          title: "Untitled",
          shortDescription: "",
        }

        return {
          id: initiative.id,
          slug: initiative.slug,
          status: initiative.status,
          category: initiative.category,
          startDate: initiative.startDate,
          endDate: initiative.endDate,
          featuredImage: initiative.featuredImage,
          myRole: member.role,
          joinedAt: member.joinedAt,
          translation,
          projectLead: initiative.projectLead,
          taskCount: initiative._count.tasks,
          memberCount: initiative._count.members,
        }
      })

    return NextResponse.json({ initiatives: activeInitiatives })
  } catch (error) {
    console.error("Error fetching my initiatives:", error)
    return NextResponse.json(
      { error: "Failed to fetch initiatives" },
      { status: 500 }
    )
  }
}
