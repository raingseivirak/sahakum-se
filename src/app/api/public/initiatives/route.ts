import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/public/initiatives - List published initiatives
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const language = searchParams.get("language") || "en"
    const category = searchParams.get("category")

    // Build where clause
    const where: any = {
      status: "PUBLISHED",
      OR: [
        { visibility: "PUBLIC" },
        // If user is logged in, also show MEMBERS_ONLY
        ...(session ? [{ visibility: "MEMBERS_ONLY" }] : []),
      ],
    }

    if (category) {
      where.category = category
    }

    const initiatives = await prisma.initiative.findMany({
      where,
      include: {
        projectLead: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        translations: {
          where: {
            language,
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
        startDate: "desc",
      },
    })

    // Filter out initiatives without translation in requested language
    // but keep them with a flag indicating translation is missing
    const initiativesWithTranslation = initiatives.map((initiative) => {
      const translation = initiative.translations[0]
      if (!translation) {
        // Try to get any available translation
        const anyTranslation = initiative.translations.find(t => t.title)
        return {
          ...initiative,
          translation: anyTranslation || null,
          hasRequestedLanguage: false,
        }
      }
      return {
        ...initiative,
        translation,
        hasRequestedLanguage: true,
      }
    })

    return NextResponse.json(initiativesWithTranslation)
  } catch (error) {
    console.error("Error fetching public initiatives:", error)
    return NextResponse.json(
      { error: "Failed to fetch initiatives" },
      { status: 500 }
    )
  }
}
