import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { withAuthorAccess, AdminAuthContext } from "@/lib/admin-auth-middleware"
import { prisma } from "@/lib/prisma"
import { ActivityLogger } from "@/lib/activity-logger"
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
async function handleGET(request: NextRequest, context: AdminAuthContext) {
  try {
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

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    // Get user and check for appropriate role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For posts, require AUTHOR+ role (AUTHOR, MODERATOR, EDITOR, BOARD, ADMIN)
    const allowedRoles = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({
        error: 'Insufficient privileges - Author access required',
        required: allowedRoles,
        current: user.role
      }, { status: 403 })
    }

    // User is authenticated and has appropriate role - proceed with original handler
    return handleGET(request, { user })
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST /api/posts - Create a new post
async function handlePOST(request: NextRequest, context: AdminAuthContext) {
  try {
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
        authorId: context.user.id,
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

    // Log post creation activity
    const mainTranslation = validatedData.translations.find(t => t.language === 'en') || validatedData.translations[0]
    await ActivityLogger.logContentCreated(
      context.user.id,
      'POST',
      post.id,
      mainTranslation.title,
      {
        slug: post.slug,
        status: post.status,
        languages: validatedData.translations.map(t => t.language)
      }
    )

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 })
    }

    // Get user and check for appropriate role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, email: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For creating posts, require AUTHOR+ role
    const allowedRoles = ['AUTHOR', 'MODERATOR', 'EDITOR', 'BOARD', 'ADMIN']
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({
        error: 'Insufficient privileges - Author access required',
        required: allowedRoles,
        current: user.role
      }, { status: 403 })
    }

    // User is authenticated and has appropriate role - proceed with original handler
    return handlePOST(request, { user })
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}