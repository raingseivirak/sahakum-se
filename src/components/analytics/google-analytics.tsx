'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { GA_TRACKING_ID, isGAConfigured, isAnalyticsEnabled, pageview } from '@/lib/analytics'
import { hasConsentChoice, isAnalyticsAllowed } from '@/lib/cookie-consent'

function GoogleAnalyticsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false)
  const [gtagReady, setGtagReady] = useState(false)

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

  // Track page views when consent is given AND gtag is ready
  useEffect(() => {
    if (!isAnalyticsEnabled() || !gtagReady) return

    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    pageview(url)
  }, [pathname, searchParams, analyticsAllowed, gtagReady])

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
        onLoad={() => setGtagReady(true)}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}

            // Ensure gtag is available globally
            window.gtag = window.gtag || gtag;

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

export function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  )
}