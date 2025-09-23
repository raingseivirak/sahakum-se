'use client'

// Cookie consent management for GDPR compliance
export const CONSENT_COOKIE_NAME = 'sahakum-cookie-consent'
export const CONSENT_VERSION = '1.0'

export interface CookieConsent {
  version: string
  timestamp: number
  analytics: boolean
  marketing: boolean
  functional: boolean
}

// Default consent state (only essential cookies)
export const defaultConsent: CookieConsent = {
  version: CONSENT_VERSION,
  timestamp: Date.now(),
  analytics: false,
  marketing: false,
  functional: true, // Essential cookies always allowed
}

// Get current consent state
export function getConsentState(): CookieConsent | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(CONSENT_COOKIE_NAME)
    if (!stored) return null

    const consent = JSON.parse(stored) as CookieConsent

    // Check if consent is still valid (same version)
    if (consent.version !== CONSENT_VERSION) {
      return null
    }

    return consent
  } catch {
    return null
  }
}

// Save consent state
export function saveConsentState(consent: CookieConsent): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(consent))

    // Trigger consent change event
    window.dispatchEvent(new CustomEvent('consentChanged', {
      detail: consent
    }))
  } catch {
    // Handle storage errors gracefully
  }
}

// Check if user has made a consent choice
export function hasConsentChoice(): boolean {
  return getConsentState() !== null
}

// Check if analytics is allowed
export function isAnalyticsAllowed(): boolean {
  const consent = getConsentState()
  return consent?.analytics ?? false
}

// Accept all cookies
export function acceptAllCookies(): void {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    analytics: true,
    marketing: false, // We don't use marketing cookies yet
    functional: true,
  }
  saveConsentState(consent)
}

// Accept only essential cookies
export function acceptEssentialOnly(): void {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    analytics: false,
    marketing: false,
    functional: true,
  }
  saveConsentState(consent)
}

// Accept custom consent preferences
export function acceptCustomConsent(analytics: boolean, marketing: boolean): void {
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    analytics,
    marketing,
    functional: true,
  }
  saveConsentState(consent)
}

// Show cookie banner again (for settings link)
export function showCookieSettings(): void {
  if (typeof window === 'undefined') return

  // Only trigger the settings event without removing consent
  // This will show the banner with settings open directly
  window.dispatchEvent(new CustomEvent('showCookieSettings'))
}