import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const decodedSlug = decodeURIComponent(slug)

    // Find the initiative by slug
    const initiative = await prisma.initiative.findUnique({
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

    if (!initiative) {
      return NextResponse.json(
        { availableLanguages: [] },
        { status: 404 }
      )
    }

    const availableLanguages = initiative.translations.map(t => t.language)

    return NextResponse.json({
      availableLanguages,
      slug: initiative.slug
    })
  } catch (error) {
    console.error('Error fetching initiative languages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch initiative languages', availableLanguages: [] },
      { status: 500 }
    )
  }
}
