import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    let { slug } = params
    let contentType = 'PAGE'

    // Check if this is a blog post (slug contains blog/)
    if (slug.startsWith('blog/')) {
      slug = slug.replace('blog/', '')
      contentType = 'POST'
    }

    const content = await prisma.contentItem.findFirst({
      where: {
        slug: slug,
        type: contentType as any,
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

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    const availableLanguages = content.translations.map(t => t.language)

    return NextResponse.json({
      slug: content.slug,
      type: content.type,
      availableLanguages
    })
  } catch (error) {
    console.error('Error fetching content languages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}