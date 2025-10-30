import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const decodedSlug = decodeURIComponent(slug)

    // Find the event by slug
    const event = await prisma.event.findUnique({
      where: {
        slug: decodedSlug,
        status: 'PUBLISHED'
      },
      include: {
        translations: {
          select: {
            language: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { availableLanguages: [] },
        { status: 404 }
      )
    }

    const availableLanguages = event.translations.map(t => t.language)

    return NextResponse.json({
      availableLanguages,
      slug: event.slug
    })
  } catch (error) {
    console.error('Error fetching event languages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event languages', availableLanguages: [] },
      { status: 500 }
    )
  }
}
