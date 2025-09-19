import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const categoryCreateSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  type: z.string().min(1, "Type is required"),
  parentId: z.string().optional(),
  translations: z.array(z.object({
    language: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  })).min(1, "At least one translation is required")
})

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const categories = await prisma.category.findMany({
      where: type ? { type } : undefined,
      include: {
        translations: true,
        parent: {
          include: {
            translations: true
          }
        },
        children: {
          include: {
            translations: true
          }
        },
        _count: {
          select: {
            contentItems: true
          }
        }
      },
      orderBy: {
        slug: 'asc'
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = categoryCreateSchema.parse(body)

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Create category with translations
    const category = await prisma.category.create({
      data: {
        slug: validatedData.slug,
        type: validatedData.type,
        parentId: validatedData.parentId,
        translations: {
          create: validatedData.translations.map(translation => ({
            language: translation.language,
            name: translation.name,
            description: translation.description,
          }))
        }
      },
      include: {
        translations: true,
        parent: {
          include: {
            translations: true
          }
        },
        children: {
          include: {
            translations: true
          }
        }
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}