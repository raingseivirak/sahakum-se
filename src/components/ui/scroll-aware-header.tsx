'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Container } from '@/components/layout/grid'
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { UserMenu } from '@/components/layout/user-menu'
import { type Language } from '@/lib/constants'

interface ScrollAwareHeaderProps {
  locale: string
  showBlogLink?: boolean
  stickyContent?: {
    title: string
    excerpt?: string
    author?: string
    publishedAt?: string
  }
  translations?: {
    sign_in: string
    sign_out: string
    admin: string
    profile: string
    settings: string
  }
  currentUrl?: string
}

export function ScrollAwareHeader({
  locale,
  showBlogLink = false,
  stickyContent,
  translations,
  currentUrl
}: ScrollAwareHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showStickyTitle, setShowStickyTitle] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const heroHeight = 400 // Approximate hero section height

      setIsScrolled(scrollY > 50)
      setShowStickyTitle(scrollY > heroHeight && !!stickyContent)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [stickyContent])

  const formatDate = (dateString: string, locale: string): string => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : locale, options).format(date)
  }

  return (
    <>
      {/* Main Header */}
      <header className={`bg-[var(--sahakum-navy)] text-white shadow-lg border-b border-[var(--sahakum-gold)]/20 transition-all duration-300 ${isScrolled ? 'shadow-xl' : ''}`}>
        <Container size="wide">
          <nav className="flex items-center justify-between py-4 lg:py-6">
            {/* Swedish Brand Logo */}
            <Link href={`/${locale}`} className="block">
              <SwedenBrandLogo
                locale={locale}
                size={isScrolled ? "sm" : "md"}
                variant="horizontal"
                className="hover:opacity-90 transition-all duration-300"
              />
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                href={`/${locale}`}
                className="text-white hover:text-[var(--sahakum-gold)] transition-colors duration-200 text-sm font-medium"
              >
                {locale === 'sv' ? 'Hem' :
                 locale === 'km' ? 'ទំព័រដើម' : 'Home'}
              </Link>
              {showBlogLink && (
                <Link
                  href={`/${locale}/blog`}
                  className="text-white hover:text-[var(--sahakum-gold)] transition-colors duration-200 text-sm font-medium"
                >
                  {locale === 'km' ? 'ប្លុក' : locale === 'en' ? 'Blog' : 'Blogg'}
                </Link>
              )}
              <LanguageSwitcher
                currentLocale={locale as Language}
                variant="compact"
              />
              {translations && (
                <UserMenu
                  locale={locale as Language}
                  translations={translations}
                  currentUrl={currentUrl}
                />
              )}
            </div>
          </nav>
        </Container>
      </header>

      {/* Sticky Title Bar - Shows when scrolled past hero */}
      {stickyContent && showStickyTitle && (
        <div className="sticky top-0 z-40 bg-white border-b border-[var(--sahakum-navy)]/10 shadow-sm animate-slide-down">
          <Container size="wide">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-4">
                <SwedenBrandLogo
                  locale={locale}
                  size="xs"
                  variant="horizontal"
                  colorScheme="light"
                  className="flex-shrink-0"
                />
                <div className="border-l border-[var(--sahakum-navy)]/20 pl-4">
                  <h2 className={`text-[var(--sahakum-navy)] font-semibold text-sm lg:text-base line-clamp-1 ${locale === 'km' ? 'font-khmer' : 'font-sweden'}`}>
                    {stickyContent.title}
                  </h2>
                  {stickyContent.author && stickyContent.publishedAt && (
                    <div className="flex items-center text-xs text-[var(--sahakum-navy)]/60 mt-1">
                      <span>{locale === 'km' ? 'ដោយ' : locale === 'en' ? 'By' : 'Av'} {stickyContent.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(stickyContent.publishedAt, locale)}</span>
                    </div>
                  )}
                  {stickyContent.excerpt && !stickyContent.author && (
                    <p className={`text-[var(--sahakum-navy)]/60 text-xs mt-1 line-clamp-1 ${locale === 'km' ? 'font-khmer' : 'font-sweden'}`}>
                      {stickyContent.excerpt}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={showBlogLink ? `/${locale}/blog` : `/${locale}`}
                  className="text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] transition-colors duration-200 text-xs font-medium"
                >
                  ← {showBlogLink ?
                    (locale === 'km' ? 'ប្លុក' : locale === 'en' ? 'Blog' : 'Blogg') :
                    (locale === 'sv' ? 'Hem' : locale === 'km' ? 'ទំព័រដើម' : 'Home')
                  }
                </Link>
              </div>
            </div>
          </Container>
        </div>
      )}
    </>
  )
}