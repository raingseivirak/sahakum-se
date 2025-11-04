"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SwedenH2, SwedenBody } from '@/components/ui/sweden-typography'
import { SwedishCard, SwedishCardHeader, SwedishCardContent, SwedishCardTitle } from '@/components/ui/swedish-card'
import { SwedenButton } from '@/components/ui/sweden-motion'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, CheckSquare, ArrowRight, Lightbulb } from 'lucide-react'

interface Initiative {
  id: string
  slug: string
  category: string
  startDate: string
  endDate?: string
  featuredImage?: string
  translation: {
    title: string
    shortDescription: string
  } | null
  _count: {
    members: number
    tasks: number
  }
}

interface InitiativesSectionProps {
  locale: string
}

export function InitiativesSection({ locale }: InitiativesSectionProps) {
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInitiatives()
  }, [locale])

  const fetchInitiatives = async () => {
    try {
      const response = await fetch(`/api/public/initiatives?language=${locale}`)
      if (!response.ok) {
        throw new Error('Failed to fetch initiatives')
      }
      const data = await response.json()
      // Get top 3 most recent initiatives
      setInitiatives(data.slice(0, 3))
    } catch (err) {
      console.error('Error fetching initiatives:', err)
    } finally {
      setLoading(false)
    }
  }

  const getSectionContent = () => {
    return {
      sv: {
        title: 'Våra Initiativ',
        description: 'Upptäck de projekt och initiativ som formar vår gemenskap',
        viewAll: 'Se alla initiativ',
        readMore: 'Läs mer',
        members: 'medlemmar',
        tasks: 'uppgifter'
      },
      en: {
        title: 'Our Initiatives',
        description: 'Discover the projects and initiatives shaping our community',
        viewAll: 'View all initiatives',
        readMore: 'Read more',
        members: 'members',
        tasks: 'tasks'
      },
      km: {
        title: 'គម្រោងរបស់យើង',
        description: 'ស្វែងយល់អំពីគម្រោងដែលកំពុងកសាងសហគមន៍របស់យើង',
        viewAll: 'មើលគម្រោងទាំងអស់',
        readMore: 'អានបន្ថែម',
        members: 'សមាជិក',
        tasks: 'កិច្ចការ'
      }
    }[locale] || {
      title: 'Our Initiatives',
      description: 'Discover the projects and initiatives shaping our community',
      viewAll: 'View all initiatives',
      readMore: 'Read more',
      members: 'members',
      tasks: 'tasks'
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: { en: string; sv: string; km: string } } = {
      CULTURAL_EVENT: { en: "Cultural Event", sv: "Kulturellt Evenemang", km: "ពិធីវប្បធម៌" },
      BUSINESS: { en: "Business", sv: "Affärer", km: "អាជីវកម្ម" },
      EDUCATION: { en: "Education", sv: "Utbildning", km: "ការអប់រំ" },
      TRANSLATION: { en: "Translation", sv: "Översättning", km: "ការបកប្រែ" },
      SOCIAL: { en: "Social", sv: "Socialt", km: "សង្គម" },
      OTHER: { en: "Other", sv: "Annat", km: "ផ្សេងៗ" },
    }
    return labels[category]?.[locale as keyof typeof labels.BUSINESS] || category
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const content = getSectionContent()

  // Don't show section if no initiatives
  if (!loading && initiatives.length === 0) {
    return null
  }

  return (
    <section className={`py-16 bg-white ${fontClass}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Lightbulb className="h-8 w-8 text-[var(--sahakum-gold)] mr-3" />
            <SwedenH2 className="text-[var(--sahakum-navy)] mb-0" locale={locale}>
              {content.title}
            </SwedenH2>
          </div>
          <SwedenBody className="text-gray-600 max-w-2xl mx-auto" locale={locale}>
            {content.description}
          </SwedenBody>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t"></div>
                <div className="bg-gray-100 p-6 rounded-b">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {initiatives.map((initiative) => (
                <SwedishCard key={initiative.id} className="overflow-hidden hover:shadow-lg transition-all duration-[var(--duration-sweden-base)]">
                  {/* Featured Image */}
                  {initiative.featuredImage && (
                    <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                      <img
                        src={initiative.featuredImage}
                        alt={initiative.translation?.title || 'Initiative'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <SwedishCardHeader>
                    <SwedishCardTitle className={`text-lg ${fontClass}`}>
                      {initiative.translation?.title || 'Untitled'}
                    </SwedishCardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-[var(--sahakum-navy)] border-[var(--sahakum-navy)]">
                        {getCategoryLabel(initiative.category)}
                      </Badge>
                    </div>
                  </SwedishCardHeader>

                  <SwedishCardContent>
                    <div className="space-y-3">
                      {/* Short Description */}
                      {initiative.translation?.shortDescription && (
                        <p className={`text-sm text-muted-foreground line-clamp-2 ${fontClass}`}>
                          {initiative.translation.shortDescription}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-4 w-4 mt-0.5 text-sahakum-navy flex-shrink-0" />
                        <div className={fontClass}>
                          <div className="font-medium">
                            {formatDate(initiative.startDate)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span className={fontClass}>{initiative._count.members} {content.members}</span>
                        </div>
                        {initiative._count.tasks > 0 && (
                          <div className="flex items-center gap-1">
                            <CheckSquare className="h-4 w-4" />
                            <span className={fontClass}>{initiative._count.tasks} {content.tasks}</span>
                          </div>
                        )}
                      </div>

                      {/* Read More Button */}
                      <SwedenButton asChild variant="default" size="sm" className="w-full">
                        <Link href={`/${locale}/initiatives/${initiative.slug}`}>
                          {content.readMore}
                        </Link>
                      </SwedenButton>
                    </div>
                  </SwedishCardContent>
                </SwedishCard>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <SwedenButton asChild variant="outline" size="lg">
                <Link href={`/${locale}/initiatives`}>
                  {content.viewAll} →
                </Link>
              </SwedenButton>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
