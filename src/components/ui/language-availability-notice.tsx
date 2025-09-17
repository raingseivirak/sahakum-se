'use client'

import { useState, useEffect } from 'react'
import { Languages } from 'lucide-react'

interface LanguageAvailabilityNoticeProps {
  currentLocale: string
  slug: string
  className?: string
}

const languageNames = {
  sv: { native: 'Svenska', english: 'Swedish' },
  en: { native: 'English', english: 'English' },
  km: { native: 'ខ្មែរ', english: 'Khmer' }
}

export function LanguageAvailabilityNotice({ currentLocale, slug, className = '' }: LanguageAvailabilityNoticeProps) {
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAvailableLanguages() {
      try {
        const response = await fetch(`/api/public/pages/${encodeURIComponent(slug)}/languages`)
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
  }, [slug])

  // Don't show if there's only one language or still loading
  if (loading || availableLanguages.length <= 1) {
    return null
  }

  const otherLanguages = availableLanguages.filter(lang => lang !== currentLocale)

  const getLocalizedText = () => {
    switch (currentLocale) {
      case 'sv':
        return 'Den här artikeln finns även på'
      case 'en':
        return 'This article is also available in'
      case 'km':
        return 'អត្ថបទនេះក៏មានជា'
      default:
        return 'This article is also available in'
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
                    href={`/${lang}/${slug}`}
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