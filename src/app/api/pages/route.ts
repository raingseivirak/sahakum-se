import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ActivityLogger } from "@/lib/activity-logger"
import { z } from "zod"

// Schema for page creation/update
const pageSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featuredImg: z.string().optional().nullable(),
  pdfUrl: z.string().optional().nullable(),
  translations: z.array(z.object({
    language: z.string(),
    title: z.string().min(1, "Title is required"),
    content: z.string(),
    excerpt: z.string().optional(),
    metaDescription: z.string().optional(),
    seoTitle: z.string().optional(),
  }))
})

// GET /api/pages - List all pages
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "BOARD" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pages = await prisma.contentItem.findMany({
      where: { type: "PAGE" },
      include: {
        author: {
          select: { name: true, email: true }
        },
        translations: true,
      },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error("Error fetching pages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/pages - Create a new page
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "BOARD" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = pageSchema.parse(body)

    // Check if slug already exists
    const existingPage = await prisma.contentItem.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingPage) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Create page with translations
    const page = await prisma.contentItem.create({
      data: {
        slug: validatedData.slug,
        type: "PAGE",
        status: validatedData.status,
        featuredImg: validatedData.featuredImg || null,
        pdfUrl: validatedData.pdfUrl || null,
        authorId: session.user.id,
        publishedAt: validatedData.status === "PUBLISHED" ? new Date() : null,
        translations: {
          create: validatedData.translations
        }
      },
      include: {
        author: {
          select: { name: true, email: true }
        },
        translations: true,
      }
    })

    // Log page creation activity
    const mainTranslation = validatedData.translations.find(t => t.language === 'en') || validatedData.translations[0]
    await ActivityLogger.logContentCreated(
      session.user.id,
      'PAGE',
      page.id,
      mainTranslation.title,
      {
        slug: page.slug,
        status: page.status,
        languages: validatedData.translations.map(t => t.language)
      }
    )

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}