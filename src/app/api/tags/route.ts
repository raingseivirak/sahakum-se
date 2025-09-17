import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const tagCreateSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  translations: z.array(z.object({
    language: z.string(),
    name: z.string().min(1, "Name is required"),
  })).min(1, "At least one translation is required")
})

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tags = await prisma.tag.findMany({
      include: {
        translations: true,
        _count: {
          select: {
            content: true
          }
        }
      },
      orderBy: {
        slug: 'asc'
      }
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = tagCreateSchema.parse(body)

    // Check if slug already exists
    const existingTag = await prisma.tag.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingTag) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Create tag with translations
    const tag = await prisma.tag.create({
      data: {
        slug: validatedData.slug,
        translations: {
          create: validatedData.translations.map(translation => ({
            language: translation.language,
            name: translation.name,
          }))
        }
      },
      include: {
        translations: true
      }
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating tag:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}