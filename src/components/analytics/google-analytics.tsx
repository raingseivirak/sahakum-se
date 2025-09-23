'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { GA_TRACKING_ID, isGAConfigured, isAnalyticsEnabled, pageview } from '@/lib/analytics'
import { hasConsentChoice, isAnalyticsAllowed } from '@/lib/cookie-consent'

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)

  // Listen for consent changes
  useEffect(() => {
    const checkConsent = () => {
      setAnalyticsAllowed(isAnalyticsAllowed())
    }

    // Check initial consent
    checkConsent()

    // Listen for consent changes
    const handleConsentChange = () => {
      checkConsent()
    }

    window.addEventListener('consentChanged', handleConsentChange)
    return () => window.removeEventListener('consentChanged', handleConsentChange)
  }, [])

  // Track page views when consent is given
  useEffect(() => {
    if (!isAnalyticsEnabled()) return

    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    pageview(url)
  }, [pathname, searchParams, analyticsAllowed])

  // Only load GA scripts if configured and user has consented
  if (!isGAConfigured || !analyticsAllowed) {
    return null
  }

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_TRACKING_ID}', {
              page_location: window.location.href,
              page_title: document.title,
              // Privacy-focused settings
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
            });
          `,
        }}
      />
    </>
  )
}