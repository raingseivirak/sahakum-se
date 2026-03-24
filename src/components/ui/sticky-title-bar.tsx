'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Container } from '@/components/layout/grid'
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo'

interface StickyTitleBarProps {
  locale: string
  title: string
  excerpt?: string
  author?: string
  publishedAt?: string
  heroHeight?: number
  backHref?: string
  backLabel?: string
}

export function StickyTitleBar({
  locale,
  title,
  excerpt,
  author,
  publishedAt,
  heroHeight = 400,
  backHref,
  backLabel,
}: StickyTitleBarProps) {
  const [visible, setVisible] = useState(false)
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > heroHeight)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [heroHeight])

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : locale, {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(date)
  }

  const defaultBackLabel = locale === 'sv' ? 'Hem' : locale === 'km' ? 'ទំព័រដើម' : 'Home'

  if (!visible) return null

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-[var(--sahakum-navy)]/10 shadow-sm animate-slide-down">
      <Container size="wide">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4 min-w-0">
            <SwedenBrandLogo locale={locale} size="xs" variant="horizontal" colorScheme="light" className="flex-shrink-0" />
            <div className="border-l border-[var(--sahakum-navy)]/20 pl-4 min-w-0">
              <h2 className={`text-[var(--sahakum-navy)] font-semibold text-sm lg:text-base line-clamp-1 ${fontClass}`}>
                {title}
              </h2>
              {author && publishedAt && (
                <div className="flex items-center text-xs text-[var(--sahakum-navy)]/60 mt-0.5">
                  <span>{locale === 'km' ? 'ដោយ' : locale === 'sv' ? 'Av' : 'By'} {author}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(publishedAt)}</span>
                </div>
              )}
              {excerpt && !author && (
                <p className={`text-[var(--sahakum-navy)]/60 text-xs mt-0.5 line-clamp-1 ${fontClass}`}>
                  {excerpt}
                </p>
              )}
            </div>
          </div>
          <Link
            href={backHref ?? `/${locale}`}
            className={`text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] transition-colors text-xs font-medium flex-shrink-0 ml-4 ${fontClass}`}
          >
            ← {backLabel ?? defaultBackLabel}
          </Link>
        </div>
      </Container>
    </div>
  )
}
