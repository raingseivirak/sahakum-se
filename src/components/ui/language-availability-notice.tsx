'use client'

import { useState, useEffect } from 'react'
import { Languages } from 'lucide-react'

interface LanguageAvailabilityNoticeProps {
  currentLocale: string
  slug: string
  type?: 'page' | 'event' | 'post' | 'initiative'
  className?: string
}

const languageNames = {
  sv: { native: 'Svenska', english: 'Swedish' },
  en: { native: 'English', english: 'English' },
  km: { native: 'ខ្មែរ', english: 'Khmer' }
}

export function LanguageAvailabilityNotice({ currentLocale, slug, type = 'page', className = '' }: LanguageAvailabilityNoticeProps) {
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAvailableLanguages() {
      try {
        // Determine the API endpoint based on type
        let apiUrl = ''
        if (type === 'event') {
          // For events, slug is just the event slug
          apiUrl = `/api/public/events/${encodeURIComponent(slug)}/languages`
        } else if (type === 'initiative') {
          // For initiatives, slug is just the initiative slug
          apiUrl = `/api/public/initiatives/${encodeURIComponent(slug)}/languages`
        } else if (type === 'post') {
          // For posts, slug is like "blog/post-slug"
          const postSlug = slug.replace('blog/', '')
          apiUrl = `/api/public/pages/${encodeURIComponent(postSlug)}/languages`
        } else {
          // For pages, slug might include path like "blog/post-slug" or just "slug"
          apiUrl = `/api/public/pages/${encodeURIComponent(slug)}/languages`
        }

        const response = await fetch(apiUrl)
        if (response.ok) {
          const data = await response.json()
          setAvailableLanguages(data.availableLanguages || [])
        }
      } catch (error) {
        console.error('Error fetching available languages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailableLanguages()
  }, [slug, type])

  // Don't show if there's only one language or still loading
  if (loading || availableLanguages.length <= 1) {
    return null
  }

  const otherLanguages = availableLanguages.filter(lang => lang !== currentLocale)

  const getLocalizedText = () => {
    let contentType
    if (type === 'event') {
      contentType = {
        sv: 'evenemanget',
        en: 'event',
        km: 'ព្រឹត្តិការណ៍'
      }
    } else if (type === 'initiative') {
      contentType = {
        sv: 'initiativet',
        en: 'initiative',
        km: 'គម្រោង'
      }
    } else {
      contentType = {
        sv: 'artikeln',
        en: 'article',
        km: 'អត្ថបទ'
      }
    }

    switch (currentLocale) {
      case 'sv':
        return `Den här ${contentType.sv} finns även på`
      case 'en':
        return `This ${contentType.en} is also available in`
      case 'km':
        return `${contentType.km}នេះក៏មានជា`
      default:
        return `This ${contentType.en} is also available in`
    }
  }

  const getLanguageUrl = (lang: string) => {
    if (type === 'event') {
      return `/${lang}/events/${slug}`
    } else if (type === 'initiative') {
      return `/${lang}/initiatives/${slug}`
    } else if (type === 'post') {
      return `/${lang}/${slug}` // slug already contains 'blog/'
    } else {
      return `/${lang}/${slug}`
    }
  }

  return (
    <div className={`bg-[var(--sahakum-gold)]/5 border border-[var(--sahakum-gold)]/20 rounded-sm p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <Languages className="w-5 h-5 text-[var(--sahakum-gold)] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-[var(--sahakum-navy)] font-sweden leading-relaxed">
            <span className="font-medium">{getLocalizedText()}</span>{' '}
            {otherLanguages.map((lang, index) => {
              const language = languageNames[lang as keyof typeof languageNames]
              return (
                <span key={lang}>
                  <a
                    href={getLanguageUrl(lang)}
                    className="text-[var(--sahakum-gold)] hover:text-[var(--sahakum-navy)] underline decoration-1 underline-offset-2 transition-colors font-medium"
                  >
                    {language?.native}
                  </a>
                  {index < otherLanguages.length - 2 && ', '}
                  {index === otherLanguages.length - 2 && otherLanguages.length > 1 && (
                    <span className="text-[var(--sahakum-navy)]">
                      {currentLocale === 'km' ? ' និង ' : currentLocale === 'sv' ? ' och ' : ' and '}
                    </span>
                  )}
                </span>
              )
            })}
          </p>
        </div>
      </div>
    </div>
  )
}