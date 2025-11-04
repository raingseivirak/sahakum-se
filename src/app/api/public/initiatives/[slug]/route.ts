import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/public/initiatives/[slug] - Get single initiative
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const language = searchParams.get("language") || "en"

    const initiative = await prisma.initiative.findUnique({
      where: { slug: params.slug },
      include: {
        projectLead: {
          select: {
            id: true,
            name: true,
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
                profileImage: true,
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        tasks: {
          where: {
            status: {
              not: "COMPLETED",
            },
          },
          select: {
            id: true,
            titleEn: true,
            titleSv: true,
            titleKm: true,
            status: true,
            priority: true,
          },
          orderBy: [
            { status: "asc" },
            { priority: "desc" },
          ],
        },
        updates: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            publishedAt: "desc",
          },
          take: 5,
        },
        _count: {
          select: {
            members: true,
            tasks: true,
            updates: true,
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

    // Check if published
    if (initiative.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Initiative not found" },
        { status: 404 }
      )
    }

    // Note: We don't block MEMBERS_ONLY content here
    // Instead, we just limit what data is shown based on login status

    // Get translation for requested language or fallback
    const translation =
      initiative.translations.find((t) => t.language === language) ||
      initiative.translations.find((t) => t.language === "en") ||
      initiative.translations.find((t) => t.language === "sv") ||
      initiative.translations[0]

    // Filter sensitive information based on user status
    const isLoggedIn = !!session
    const responseData = {
      ...initiative,
      translation,
      // Show full team only to logged-in users
      members: isLoggedIn ? initiative.members : [],
      // Show tasks only to logged-in users
      tasks: isLoggedIn ? initiative.tasks : [],
      // Show updates to everyone
      updates: initiative.updates,
      _count: initiative._count,
      isLoggedIn,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching public initiative:", error)
    return NextResponse.json(
      { error: "Failed to fetch initiative" },
      { status: 500 }
    )
  }
}
