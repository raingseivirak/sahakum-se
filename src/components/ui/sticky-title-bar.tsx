'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Container } from '@/components/layout/grid'
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo'

interface StickyTitleBarProps {
  locale: string
  title: string
  excerpt?: string
  heroHeight?: number
}

export function StickyTitleBar({ locale, title, excerpt, heroHeight = 400 }: StickyTitleBarProps) {
  const [visible, setVisible] = useState(false)
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > heroHeight)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [heroHeight])

  if (!visible) return null

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-[var(--sahakum-navy)]/10 shadow-sm animate-slide-down">
      <Container size="wide">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4">
            <SwedenBrandLogo locale={locale} size="xs" variant="horizontal" colorScheme="light" className="flex-shrink-0" />
            <div className="border-l border-[var(--sahakum-navy)]/20 pl-4">
              <h2 className={`text-[var(--sahakum-navy)] font-semibold text-sm lg:text-base line-clamp-1 ${fontClass}`}>
                {title}
              </h2>
              {excerpt && (
                <p className={`text-[var(--sahakum-navy)]/60 text-xs mt-0.5 line-clamp-1 ${fontClass}`}>
                  {excerpt}
                </p>
              )}
            </div>
          </div>
          <Link
            href={`/${locale}`}
            className={`text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] transition-colors text-xs font-medium ${fontClass}`}
          >
            ← {locale === 'sv' ? 'Hem' : locale === 'km' ? 'ទំព័រដើម' : 'Home'}
          </Link>
        </div>
      </Container>
    </div>
  )
}
