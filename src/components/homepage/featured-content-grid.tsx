"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container, Grid } from '@/components/layout/grid'
import { SwedenH2, SwedenBody } from '@/components/ui/sweden-typography'

interface Page {
  id: string
  slug: string
  featuredImg: string | null
  translation: {
    title: string
    excerpt: string
  }
}

interface FeaturedContentGridProps {
  locale: string
  className?: string
}

// Default placeholder images for different page types
const getPlaceholderImage = (slug: string): string => {
  const placeholders = {
    'about-us': '/images/placeholders/about-us-placeholder.jpg',
    'cambodia': '/images/placeholders/cambodia-placeholder.jpg',
    'living-in-sweden': '/images/placeholders/sweden-placeholder.jpg',
    'support-resources': '/images/placeholders/support-placeholder.jpg',
    'community': '/images/placeholders/community-placeholder.jpg',
    'default': '/images/placeholders/default-placeholder.jpg'
  }

  return placeholders[slug as keyof typeof placeholders] || placeholders.default
}

// Generate placeholder SVG for missing images
const generatePlaceholderSVG = (title: string, color: string): string => {
  const svg = `
    <svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <circle cx="200" cy="100" r="30" fill="white" opacity="0.3"/>
      <text x="200" y="160" text-anchor="middle" fill="white" font-family="system-ui" font-size="16" font-weight="600">
        ${title}
      </text>
    </svg>
  `
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export function FeaturedContentGrid({ locale, className = '' }: FeaturedContentGridProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPages() {
      try {
        const response = await fetch(`/api/public/pages?language=${locale}&limit=4`)
        if (response.ok) {
          const data = await response.json()
          setPages(data.pages || [])
        }
      } catch (error) {
        console.error('Failed to fetch pages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [locale])

  if (loading) {
    return (
      <section className={`py-16 lg:py-24 ${className}`}>
        <Container>
          <div className="text-center mb-16">
            <div className="h-8 bg-sahakum-navy-100 rounded w-64 mx-auto mb-6 animate-pulse"></div>
            <div className="h-4 bg-sahakum-navy-100 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <Grid cols={4} gap={8}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-sahakum-navy-100"></div>
                <div className="p-6">
                  <div className="h-6 bg-sahakum-navy-100 rounded mb-3"></div>
                  <div className="h-4 bg-sahakum-navy-100 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </Grid>
        </Container>
      </section>
    )
  }

  return (
    <section className={`py-16 lg:py-24 ${className}`}>
      <Container size="wide">
        <div className="text-center mb-16">
          <SwedenH2 className="text-sahakum-navy-900 mb-6" locale={locale}>
            {locale === 'sv' ? 'Utforska vårt innehåll' :
             locale === 'km' ? 'ស្វែងរកមាតិកាយើង' :
             'Explore Our Content'}
          </SwedenH2>
          <SwedenBody className="text-sahakum-navy-600 max-w-3xl mx-auto" locale={locale}>
            {locale === 'sv' ? 'Upptäck information om kambodjansk kultur, praktiska guider för att bo i Sverige och resurser för att hjälpa dig att trivas.' :
             locale === 'km' ? 'ស្វែងរកព័ត៌មានអំពីវប្បធម៌កម្ពុជា មគ្គុទ្ទេសក៍ជាក់ស្តែងសម្រាប់ការរស់នៅក្នុងស៊ុយអែត និងធនធានដើម្បីជួយអ្នកឱ្យទទួលបានជោគជ័យ។' :
             'Discover information about Cambodian culture, practical guides for living in Sweden, and resources to help you thrive.'}
          </SwedenBody>
        </div>

        {/* Visit Sweden inspired varied grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
          {pages.map((page, index) => {
            // Cycle through color themes for visual variety
            const colorThemes = [
              'from-sahakum-gold-500 to-sahakum-gold-600',
              'from-sweden-blue-500 to-sweden-blue-600',
              'from-sahakum-navy-600 to-sahakum-navy-700',
              'from-sahakum-gold-600 to-sahakum-navy-600'
            ]
            const theme = colorThemes[index % colorThemes.length]

            // Visit Sweden style varied column spans
            const getColumnSpan = (idx: number, totalItems: number) => {
              if (totalItems === 1) return 'md:col-span-6 lg:col-span-12' // Single item - full width
              if (totalItems === 2) {
                return idx === 0 ? 'md:col-span-4 lg:col-span-8' : 'md:col-span-2 lg:col-span-4'
              }
              if (totalItems === 3) {
                if (idx === 0) return 'md:col-span-6 lg:col-span-6' // Featured item
                return 'md:col-span-3 lg:col-span-3' // Others
              }
              // 4 or more items - original layout
              if (idx === 0) return 'md:col-span-4 lg:col-span-8' // Featured item - larger
              if (idx === 1) return 'md:col-span-2 lg:col-span-4' // Medium
              if (idx === 2) return 'md:col-span-3 lg:col-span-6' // Medium-large
              return 'md:col-span-3 lg:col-span-6' // Default
            }

            // Different heights for visual variety
            const getHeight = (idx: number, totalItems: number) => {
              if (totalItems === 1) return 'h-80 md:h-96' // Single item - tall
              if (totalItems === 2) {
                return idx === 0 ? 'h-80 md:h-96' : 'h-64 md:h-80' // Featured larger
              }
              if (totalItems === 3) {
                return idx === 0 ? 'h-72 md:h-80' : 'h-64 md:h-72' // More balanced
              }
              // 4 or more items - better balanced heights
              if (idx === 0) return 'h-80 md:h-96' // Featured item - taller
              if (idx === 1) return 'h-80 md:h-96' // Match featured item height for first row balance
              return 'h-72' // Medium
            }

            return (
              <Link
                key={page.id}
                href={`/${locale}/${page.slug}`}
                className={`group block bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${getColumnSpan(index, pages.length)}`}
              >
                {/* Featured Image */}
                <div className={`relative overflow-hidden ${getHeight(index, pages.length)}`}>
                  {page.featuredImg ? (
                    <Image
                      src={page.featuredImg}
                      alt={page.translation.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${theme} flex items-center justify-center relative overflow-hidden`}>
                      {/* Minimalist geometric pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <pattern id={`minimal-${index}`} x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill={`url(#minimal-${index})`}/>
                        </svg>
                      </div>

                      {/* Subtle corner accent - only on featured item */}
                      {index === 0 && (
                        <div className="absolute top-6 right-6 w-16 h-16 border border-white/15 transform rotate-12"></div>
                      )}

                    </div>
                  )}

                  {/* Content overlay - show for ALL items */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <h3 className={`text-white text-xl lg:text-2xl font-semibold mb-3 ${
                      locale === 'km' ? 'font-khmer text-khmer-heading' : 'font-sweden text-sweden-heading'
                    }`}>
                      {page.translation.title}
                    </h3>
                    <p className={`text-white/90 text-base lg:text-lg leading-relaxed line-clamp-2 mb-4 ${
                      locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'
                    }`}>
                      {page.translation.excerpt}
                    </p>

                    {/* Swedish rectangular button with Sahakum colors */}
                    <div className="inline-flex items-center bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-navy)] text-[var(--sahakum-navy)] hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 group-hover:scale-105">
                      <span className={locale === 'km' ? 'font-khmer' : 'font-sweden'}>
                        {locale === 'sv' ? 'Läs mer' :
                         locale === 'km' ? 'អានបន្ថែម' :
                         'Read more'}
                      </span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Hover overlay for better interactivity */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

              </Link>
            )
          })}
        </div>

        {/* View all pages link */}
        {pages.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href={`/${locale}/pages`}
              className="inline-flex items-center px-6 py-3 bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-navy)] text-[var(--sahakum-navy)] hover:text-white font-medium transition-all duration-200 hover:scale-105"
            >
              <span className={locale === 'km' ? 'font-khmer' : 'font-sweden'}>
                {locale === 'sv' ? 'Se alla sidor' :
                 locale === 'km' ? 'មើលទំព័រទាំងអស់' :
                 'View all pages'}
              </span>
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        )}
      </Container>
    </section>
  )
}