import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'en'
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const offset = (page - 1) * limit

    const pages = await prisma.contentItem.findMany({
      where: {
        type: 'PAGE',
        status: 'PUBLISHED'
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
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    // Filter out pages without translations in the requested language
    const pagesWithTranslations = pages.filter(page => page.translations.length > 0)

    // Transform the data to match the expected format
    const transformedPages = pagesWithTranslations.map(page => ({
      id: page.id,
      slug: page.slug,
      featuredImg: page.featuredImg,
      publishedAt: page.publishedAt,
      author: page.author,
      translation: page.translations[0] // Get the first (and only) translation for the requested language
    }))

    // Get total count for pagination
    const total = await prisma.contentItem.count({
      where: {
        type: 'PAGE',
        status: 'PUBLISHED',
        translations: {
          some: {
            language: language
          }
        }
      }
    })

    return NextResponse.json({
      pages: transformedPages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching public pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}