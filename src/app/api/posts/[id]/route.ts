import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const postUpdateSchema = z.object({
  slug: z.string().min(1, "Slug is required").optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  publishedAt: z.string().optional(),
  featuredImg: z.string().optional(),
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

// GET /api/posts/[id] - Get a specific post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "BOARD" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await prisma.contentItem.findUnique({
      where: {
        id: params.id,
        type: "POST"
      },
      include: {
        author: {
          select: { name: true, email: true }
        },
        translations: true,
        categories: {
          include: {
            category: {
              include: {
                translations: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: true
              }
            }
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Error fetching post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/posts/[id] - Update a specific post
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
    const validatedData = postUpdateSchema.parse(body)

    // Check if post exists and user has permission
    const existingPost = await prisma.contentItem.findUnique({
      where: {
        id: params.id,
        type: "POST"
      },
      include: { author: true, translations: true }
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Only ADMIN and BOARD can edit others' posts, EDITOR can only edit their own
    if (session.user.role === "EDITOR" && existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You can only edit your own posts" }, { status: 403 })
    }

    // Check slug uniqueness if changing slug
    if (validatedData.slug && validatedData.slug !== existingPost.slug) {
      const slugExists = await prisma.contentItem.findUnique({
        where: { slug: validatedData.slug }
      })
      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
      }
    }

    // Update post
    const updateData: any = {}
    if (validatedData.slug) updateData.slug = validatedData.slug
    if (validatedData.featuredImg !== undefined) updateData.featuredImg = validatedData.featuredImg
    if (validatedData.status) {
      updateData.status = validatedData.status
      if (validatedData.status === "PUBLISHED" && !existingPost.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    if (validatedData.publishedAt) {
      updateData.publishedAt = new Date(validatedData.publishedAt)
    }

    const post = await prisma.contentItem.update({
      where: { id: params.id },
      data: updateData,
      include: {
        author: {
          select: { name: true, email: true }
        },
        translations: true,
        categories: {
          include: {
            category: {
              include: {
                translations: true
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: true
              }
            }
          }
        }
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

      // Fetch updated post with translations
      const updatedPost = await prisma.contentItem.findUnique({
        where: { id: params.id },
        include: {
          author: {
            select: { name: true, email: true }
          },
          translations: true,
          categories: {
            include: {
              category: {
                include: {
                  translations: true
                }
              }
            }
          },
          tags: {
            include: {
              tag: {
                include: {
                  translations: true
                }
              }
            }
          }
        }
      })

      return NextResponse.json(updatedPost)
    }

    return NextResponse.json(post)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error updating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/posts/[id] - Delete a specific post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "BOARD" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if post exists and user has permission
    const existingPost = await prisma.contentItem.findUnique({
      where: {
        id: params.id,
        type: "POST"
      },
      include: { author: true }
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Only ADMIN and BOARD can delete others' posts, EDITOR can only delete their own
    if (session.user.role === "EDITOR" && existingPost.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You can only delete your own posts" }, { status: 403 })
    }

    // Delete post (translations will be deleted automatically due to cascade)
    await prisma.contentItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Post deleted successfully" })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}