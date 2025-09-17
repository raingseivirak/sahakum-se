import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for post creation/update
const postSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  publishedAt: z.string().optional(),
  featuredImg: z.string().optional(),
  translations: z.array(z.object({
    language: z.string(),
    title: z.string().min(1, "Title is required"),
    content: z.string(),
    excerpt: z.string().optional(),
    metaDescription: z.string().optional(),
    seoTitle: z.string().optional(),
  }))
})

// GET /api/posts - List all posts
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const posts = await prisma.contentItem.findMany({
      where: { type: "POST" },
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
      },
      orderBy: { updatedAt: "desc" }
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "EDITOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = postSchema.parse(body)

    // Check if slug already exists
    const existingPost = await prisma.contentItem.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingPost) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Parse publishedAt if provided
    let publishedAt = null
    if (validatedData.publishedAt) {
      publishedAt = new Date(validatedData.publishedAt)
    } else if (validatedData.status === "PUBLISHED") {
      publishedAt = new Date()
    }

    // Create post with translations
    const post = await prisma.contentItem.create({
      data: {
        slug: validatedData.slug,
        type: "POST",
        status: validatedData.status,
        authorId: session.user.id,
        publishedAt: publishedAt,
        featuredImg: validatedData.featuredImg,
        translations: {
          create: validatedData.translations
        }
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

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}