// Google Analytics 4 implementation for Next.js with GDPR compliance
// https://developers.google.com/analytics/devguides/collection/gtagjs/pages

import { isAnalyticsAllowed } from './cookie-consent'

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// Check if GA tracking ID is configured and consent is given
export const isProduction = process.env.NODE_ENV === 'production'
export const isGAConfigured = GA_TRACKING_ID && (isProduction || process.env.NODE_ENV === 'development')

// Analytics is enabled only if configured AND user has consented
export function isAnalyticsEnabled(): boolean {
  return isGAConfigured && isAnalyticsAllowed()
}

// Log page views to Google Analytics
export const pageview = (url: string) => {
  if (!isAnalyticsEnabled()) return

  window.gtag('config', GA_TRACKING_ID!, {
    page_location: url,
  })
}

// Log specific events to Google Analytics
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (!isAnalyticsEnabled()) return

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// Custom events for Sahakum Khmer
export const trackEvents = {
  // Page sharing events
  shareArticle: (method: 'copy_link' | 'native_share', title: string) => {
    event({
      action: 'share',
      category: 'engagement',
      label: `${method}: ${title}`,
    })
  },

  // Language switching
  changeLanguage: (from: string, to: string) => {
    event({
      action: 'language_change',
      category: 'user_preference',
      label: `${from} -> ${to}`,
    })
  },

  // Membership form interactions
  membershipFormStart: () => {
    event({
      action: 'form_start',
      category: 'membership',
      label: 'membership_application',
    })
  },

  membershipFormSubmit: () => {
    event({
      action: 'form_submit',
      category: 'membership',
      label: 'membership_application',
    })
  },

  // Content engagement
  readArticle: (title: string, timeSpent: number) => {
    event({
      action: 'read_article',
      category: 'content',
      label: title,
      value: Math.round(timeSpent / 1000), // Convert to seconds
    })
  },

  // Navigation events
  clickInternalLink: (linkText: string, destination: string) => {
    event({
      action: 'click',
      category: 'navigation',
      label: `${linkText} -> ${destination}`,
    })
  },

  // Contact form
  contactFormSubmit: () => {
    event({
      action: 'form_submit',
      category: 'contact',
      label: 'contact_form',
    })
  },
}

// Global gtag function declaration
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: any
    ) => void
  }
}