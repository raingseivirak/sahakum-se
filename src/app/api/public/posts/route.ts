import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const language = searchParams.get('language') || 'sv'

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      type: 'POST',
      status: 'PUBLISHED',
      publishedAt: {
        lte: new Date()
      }
    }

    // Add category filter if provided
    if (category) {
      whereClause.categories = {
        some: {
          category: {
            slug: category
          }
        }
      }
    }

    // Get posts with translations
    const posts = await prisma.contentItem.findMany({
      where: whereClause,
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
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip,
      take: limit
    })

    // Filter posts that have translations in the requested language
    const postsWithTranslations = posts.filter(post => post.translations.length > 0)

    // Get total count for pagination
    const totalCount = await prisma.contentItem.count({
      where: whereClause
    })

    // Transform data for frontend
    const transformedPosts = postsWithTranslations.map(post => ({
      id: post.id,
      slug: post.slug,
      type: post.type,
      status: post.status,
      featuredImg: post.featuredImg,
      publishedAt: post.publishedAt,
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
    }))

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}