import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const tagUpdateSchema = z.object({
  slug: z.string().min(1, "Slug is required").optional(),
  translations: z.array(z.object({
    id: z.string().optional(),
    language: z.string(),
    name: z.string().min(1, "Name is required"),
  })).optional()
})

// GET /api/tags/[id] - Get a specific tag
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        translations: true,
        contentItems: {
          include: {
            contentItem: {
              include: {
                translations: true
              }
            }
          }
        }
      }
    })

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error("Error fetching tag:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/tags/[id] - Update a specific tag
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = tagUpdateSchema.parse(body)

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: { translations: true }
    })

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    // Check slug uniqueness if changing slug
    if (validatedData.slug && validatedData.slug !== existingTag.slug) {
      const slugExists = await prisma.tag.findUnique({
        where: { slug: validatedData.slug }
      })
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
      }
    }

    // Update tag
    const updateData: any = {}
    if (validatedData.slug) updateData.slug = validatedData.slug

    const tag = await prisma.tag.update({
      where: { id: params.id },
      data: updateData,
      include: {
        translations: true
      }
    })

    // Update translations if provided
    if (validatedData.translations) {
      // Delete existing translations and create new ones
      await prisma.tagTranslation.deleteMany({
        where: { tagId: params.id }
      })

      await prisma.tagTranslation.createMany({
        data: validatedData.translations.map(translation => ({
          tagId: params.id,
          language: translation.language,
          name: translation.name,
        }))
      })

      // Fetch updated tag with translations
      const updatedTag = await prisma.tag.findUnique({
        where: { id: params.id },
        include: {
          translations: true
        }
      })

      return NextResponse.json(updatedTag)
    }

    return NextResponse.json(tag)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error updating tag:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/tags/[id] - Delete a specific tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: params.id },
      include: {
        contentItems: true
      }
    })

    if (!existingTag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    // Check if tag is used by content
    if (existingTag.contentItems.length > 0) {
      return NextResponse.json({
        error: "Cannot delete tag that is assigned to content. Please remove tag from content first."
      }, { status: 400 })
    }

    // Delete tag (translations will be deleted automatically due to cascade)
    await prisma.tag.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Tag deleted successfully" })
  } catch (error) {
    console.error("Error deleting tag:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}