import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication for preview access
    const session = await getServerSession(authOptions)
    if (!session || !['ADMIN', 'EDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'en'

    // Get post regardless of status for preview
    const post = await prisma.contentItem.findUnique({
      where: {
        id: params.id,
        type: 'POST'
      },
      include: {
        translations: {
          where: {
            language: language
          }
        },
        author: {
          select: {
            name: true,
            email: true
          }
        },
        categories: {
          include: {
            category: {
              include: {
                translations: {
                  where: {
                    language: language
                  }
                }
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: {
                  where: {
                    language: language
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if translation exists for the requested language
    if (post.translations.length === 0) {
      return NextResponse.json(
        { error: `Translation not found for language: ${language}` },
        { status: 404 }
      )
    }

    // Transform data for frontend
    const transformedPost = {
      id: post.id,
      slug: post.slug,
      type: post.type,
      status: post.status,
      featuredImg: post.featuredImg,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      translation: post.translations[0],
      categories: post.categories.map(cc => ({
        slug: cc.category.slug,
        name: cc.category.translations[0]?.name || cc.category.slug
      })),
      tags: post.tags.map(ct => ({
        slug: ct.tag.slug,
        name: ct.tag.translations[0]?.name || ct.tag.slug
      }))
    }

    return NextResponse.json(transformedPost)
  } catch (error) {
    console.error('Error fetching post preview:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}