"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  CheckSquare,
  Loader2,
  Lock,
  AlertCircle,
} from "lucide-react"
import { createSafeHTML } from "@/lib/sanitize"

interface Initiative {
  id: string
  slug: string
  category: string
  visibility: string
  startDate: string
  endDate?: string
  featuredImage?: string
  projectLead: {
    name: string
  }
  translation: {
    title: string
    shortDescription: string
  } | null
  hasRequestedLanguage: boolean
  _count: {
    members: number
    tasks: number
  }
}

interface InitiativesGridProps {
  locale: string
}

export function InitiativesGrid({ locale }: InitiativesGridProps) {
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchInitiatives()
  }, [locale])

  const fetchInitiatives = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/initiatives?language=${locale}`)
      if (!response.ok) {
        throw new Error("Failed to fetch initiatives")
      }
      const data = await response.json()
      setInitiatives(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
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
      month: 'long',
      day: 'numeric'
    })
  }

  const getReadMoreText = () => {
    return {
      sv: "Läs mer",
      en: "Read more",
      km: "អានបន្ថែម"
    }[locale] || "Read more"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--sahakum-navy)]" />
        <span className={`ml-3 text-[var(--sahakum-navy)] ${fontClass}`}>
          {locale === 'sv' ? 'Laddar initiativ...' : locale === 'km' ? 'កំពុងផ្ទុក...' : 'Loading initiatives...'}
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className={`text-red-500 ${fontClass}`}>{error}</p>
      </div>
    )
  }

  if (initiatives.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={`text-gray-500 text-lg ${fontClass}`}>
          {locale === 'sv' ? 'Inga initiativ tillgängliga för tillfället.' :
           locale === 'km' ? 'គ្មានគម្រោងនៅពេលនេះ។' :
           'No initiatives available at the moment.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {initiatives.map((initiative) => (
        <Card key={initiative.id} className="overflow-hidden border-2 border-[var(--sahakum-navy)] hover:shadow-xl transition-all duration-200 rounded-none bg-white">
          {/* Featured Image */}
          {initiative.featuredImage && (
            <div className="relative h-48 bg-gray-100">
              <img
                src={initiative.featuredImage}
                alt={initiative.translation?.title || "Initiative"}
                className="w-full h-full object-cover"
              />
              {initiative.visibility === "MEMBERS_ONLY" && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-purple-600 text-white border-0 rounded-none px-3 py-1">
                    <Lock className="h-3 w-3 mr-1" />
                    Members Only
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-4 bg-white">
            {/* Category Badge */}
            <Badge variant="outline" className="text-[var(--sahakum-navy)] border-[var(--sahakum-navy)] rounded-none border-2 px-3 py-1 font-medium">
              {getCategoryLabel(initiative.category)}
            </Badge>

            {/* Title */}
            <h3 className={`text-xl font-semibold text-[var(--sahakum-navy)] break-words whitespace-normal overflow-visible ${fontClass}`} style={{ textOverflow: 'clip' }}>
              {initiative.translation?.title || "Untitled"}
            </h3>

            {/* Short Description */}
            {initiative.translation?.shortDescription && (
              <div
                className={`text-gray-700 line-clamp-3 text-base leading-relaxed prose prose-sm max-w-none ${fontClass}`}
                dangerouslySetInnerHTML={createSafeHTML(initiative.translation.shortDescription)}
              />
            )}

            {/* Meta Info */}
            <div className="space-y-2 text-sm text-[var(--sahakum-navy)]/70 pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-[var(--sahakum-gold)]" />
                <span className={fontClass}>
                  {formatDate(initiative.startDate)}
                  {initiative.endDate && ` - ${formatDate(initiative.endDate)}`}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-[var(--sahakum-gold)]" />
                  <span className={fontClass}>{initiative._count.members}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckSquare className="h-4 w-4 text-[var(--sahakum-gold)]" />
                  <span className={fontClass}>{initiative._count.tasks}</span>
                </div>
              </div>
            </div>

            {/* Read More Button */}
            <Button
              asChild
              className="w-full bg-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/90 text-white rounded-none border-0 font-medium transition-colors duration-200"
            >
              <Link href={`/${locale}/initiatives/${initiative.slug}`} className={fontClass}>
                {getReadMoreText()}
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
