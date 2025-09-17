import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const categoryUpdateSchema = z.object({
  slug: z.string().min(1, "Slug is required").optional(),
  type: z.string().min(1, "Type is required").optional(),
  parentId: z.string().nullable().optional(),
  translations: z.array(z.object({
    id: z.string().optional(),
    language: z.string(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  })).optional()
})

// GET /api/categories/[id] - Get a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
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
        content: {
          include: {
            content: {
              include: {
                translations: true
              }
            }
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/categories/[id] - Update a specific category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = categoryUpdateSchema.parse(body)

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
      include: { translations: true }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check slug uniqueness if changing slug
    if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: validatedData.slug }
      })
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
      }
    }

    // Update category
    const updateData: any = {}
    if (validatedData.slug) updateData.slug = validatedData.slug
    if (validatedData.type) updateData.type = validatedData.type
    if (validatedData.parentId !== undefined) updateData.parentId = validatedData.parentId

    const category = await prisma.category.update({
      where: { id: params.id },
      data: updateData,
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

    // Update translations if provided
    if (validatedData.translations) {
      // Delete existing translations and create new ones
      await prisma.categoryTranslation.deleteMany({
        where: { categoryId: params.id }
      })

      await prisma.categoryTranslation.createMany({
        data: validatedData.translations.map(translation => ({
          categoryId: params.id,
          language: translation.language,
          name: translation.name,
          description: translation.description,
        }))
      })

      // Fetch updated category with translations
      const updatedCategory = await prisma.category.findUnique({
        where: { id: params.id },
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

      return NextResponse.json(updatedCategory)
    }

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/categories/[id] - Delete a specific category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        children: true,
        content: true
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if category has children
    if (existingCategory.children.length > 0) {
      return NextResponse.json({
        error: "Cannot delete category with child categories. Please delete or move child categories first."
      }, { status: 400 })
    }

    // Check if category is used by content
    if (existingCategory.content.length > 0) {
      return NextResponse.json({
        error: "Cannot delete category that is assigned to content. Please remove category from content first."
      }, { status: 400 })
    }

    // Delete category (translations will be deleted automatically due to cascade)
    await prisma.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}