import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/services - Get active services for homepage
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'en'

    const services = await prisma.service.findMany({
      where: {
        active: true
      },
      include: {
        translations: {
          where: {
            language: language
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    // Transform data to include translation directly
    const transformedServices = services.map(service => ({
      id: service.id,
      slug: service.slug,
      icon: service.icon,
      featuredImg: service.featuredImg,
      colorTheme: service.colorTheme,
      order: service.order,
      translation: service.translations[0] || {
        title: service.slug,
        description: '',
        buttonText: 'Learn More'
      }
    }))

    return NextResponse.json({ services: transformedServices })
  } catch (error) {
    console.error('Public services fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}