'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface PageLanguageSwitcherProps {
  currentLocale: string
  slug: string
  className?: string
}

const languageNames = {
  sv: { native: 'Svenska', english: 'Swedish', code: 'SV' },
  en: { native: 'English', english: 'English', code: 'EN' },
  km: { native: 'ខ្មែរ', english: 'Khmer', code: 'KM' }
}

export function PageLanguageSwitcher({ currentLocale, slug, className = '' }: PageLanguageSwitcherProps) {
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAvailableLanguages() {
      try {
        const response = await fetch(`/api/public/pages/${slug}/languages`)
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

  const currentLanguage = languageNames[currentLocale as keyof typeof languageNames]
  const otherLanguages = availableLanguages.filter(lang => lang !== currentLocale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center space-x-2 px-3 py-2 text-sm bg-[var(--sahakum-gold)]/10 text-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/20 rounded-sm transition-colors font-sweden ${className}`}>
        <Globe className="w-4 h-4" />
        <span className="font-medium">{currentLanguage?.code}</span>
        <ChevronDown className="w-3 h-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white border border-[var(--sahakum-gold)]/20 shadow-lg"
      >
        {otherLanguages.map((lang) => {
          const language = languageNames[lang as keyof typeof languageNames]
          return (
            <DropdownMenuItem
              key={lang}
              className="hover:bg-[var(--sahakum-gold)]/10 focus:bg-[var(--sahakum-gold)]/10"
            >
              <a
                href={`/${lang}/${slug}`}
                className="flex items-center justify-between w-full text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] font-sweden"
              >
                <span className="font-medium">{language?.code}</span>
                <span className="text-sm">{language?.native}</span>
              </a>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}