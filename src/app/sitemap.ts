import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.sahakumkhmer.se'
  const locales = ['sv', 'en', 'km']

  const sitemap: MetadataRoute.Sitemap = []

  // Static pages (Homepage for each locale)
  locales.forEach((locale) => {
    sitemap.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    })
  })

  // Static routes for each locale
  const staticRoutes = ['join', 'contact', 'blog', 'pages', 'events']
  locales.forEach((locale) => {
    staticRoutes.forEach((route) => {
      sitemap.push({
        url: `${baseUrl}/${locale}/${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    })
  })

  try {
    // Dynamic Pages
    const pages = await prisma.contentItem.findMany({
      where: {
        type: 'PAGE',
        status: 'PUBLISHED'
      },
      include: {
        translations: true
      }
    })

    pages.forEach((page) => {
      page.translations.forEach((translation) => {
        sitemap.push({
          url: `${baseUrl}/${translation.language}/${page.slug}`,
          lastModified: page.updatedAt || page.createdAt,
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      })
    })

    // Blog Posts
    const posts = await prisma.contentItem.findMany({
      where: {
        type: 'POST',
        status: 'PUBLISHED'
      },
      include: {
        translations: true
      }
    })

    posts.forEach((post) => {
      post.translations.forEach((translation) => {
        sitemap.push({
          url: `${baseUrl}/${translation.language}/blog/${encodeURIComponent(post.slug)}`,
          lastModified: post.publishedAt || post.updatedAt || post.createdAt,
          changeFrequency: 'weekly',
          priority: 0.9,
        })
      })
    })

    // Events
    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        translations: true
      }
    })

    events.forEach((event) => {
      event.translations.forEach((translation) => {
        sitemap.push({
          url: `${baseUrl}/${translation.language}/events/${event.slug}`,
          lastModified: event.updatedAt || event.createdAt,
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      })
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return sitemap
}