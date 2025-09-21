import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const pageUpdateSchema = z.object({
  slug: z.string().min(1, "Slug is required").optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featuredImg: z.string().optional().nullable(),
  translations: z.array(z.object({
    id: z.string().optional(),
    language: z.string(),
    title: z.string().min(1, "Title is required"),
    content: z.string(),
    excerpt: z.string().optional(),
    metaDescription: z.string().optional(),
    seoTitle: z.string().optional(),
  })).optional()
})

// GET /api/pages/[id] - Get a specific page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "BOARD" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const page = await prisma.contentItem.findUnique({
      where: {
        id: params.id,
        type: "PAGE"
      },
      include: {
        author: {
          select: { name: true, email: true }
        },
        translations: true,
      }
    })

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error("Error fetching page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/pages/[id] - Update a specific page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "BOARD" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = pageUpdateSchema.parse(body)

    // Check if page exists
    const existingPage = await prisma.contentItem.findUnique({
      where: {
        id: params.id,
        type: "PAGE"
      },
      include: { translations: true }
    })

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Check slug uniqueness if changing slug
    if (validatedData.slug && validatedData.slug !== existingPage.slug) {
      const slugExists = await prisma.contentItem.findUnique({
        where: { slug: validatedData.slug }
      })
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
      }
    }

    // Update page
    const updateData: any = {}
    if (validatedData.slug) updateData.slug = validatedData.slug
    if (validatedData.status) {
      updateData.status = validatedData.status
      if (validatedData.status === "PUBLISHED" && !existingPage.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (validatedData.featuredImg !== undefined) {
      updateData.featuredImg = validatedData.featuredImg || null
    }

    const page = await prisma.contentItem.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          select: { name: true, email: true }
        },
        translations: true,
      }
    })

    // Update translations if provided
    if (validatedData.translations) {
      // Delete existing translations and create new ones
      await prisma.contentTranslation.deleteMany({
        where: { contentItemId: params.id }
      })

      await prisma.contentTranslation.createMany({
        data: validatedData.translations.map(translation => ({
          contentItemId: params.id,
          language: translation.language,
          title: translation.title,
          content: translation.content,
          excerpt: translation.excerpt,
          metaDescription: translation.metaDescription,
          seoTitle: translation.seoTitle,
        }))
      })

      // Fetch updated page with translations
      const updatedPage = await prisma.contentItem.findUnique({
        where: { id: params.id },
        include: {
          author: {
            select: { name: true, email: true }
          },
          translations: true,
        }
      })

      return NextResponse.json(updatedPage)
    }

    return NextResponse.json(page)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error updating page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/pages/[id] - Delete a specific page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "BOARD")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if page exists
    const existingPage = await prisma.contentItem.findUnique({
      where: {
        id: params.id,
        type: "PAGE"
      }
    })

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 })
    }

    // Delete page (translations will be deleted automatically due to cascade)
    await prisma.contentItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Page deleted successfully" })
  } catch (error) {
    console.error("Error deleting page:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}