'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { X, Cookie, Settings, Check } from 'lucide-react'
import {
  hasConsentChoice,
  acceptAllCookies,
  acceptEssentialOnly,
  acceptCustomConsent,
  getConsentState
} from '@/lib/cookie-consent'

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [customConsent, setCustomConsent] = useState({
    analytics: false,
    marketing: false
  })

  const params = useParams()
  const locale = params.locale as string
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  // Translations
  const t = {
    en: {
      title: 'Cookie Settings',
      description: 'We use cookies to improve your experience and understand how our website is used. You can accept all cookies or customize your preferences.',
      essential: 'Essential Cookies',
      essentialDesc: 'Required for basic website functionality. Always enabled.',
      analytics: 'Analytics Cookies',
      analyticsDesc: 'Help us understand how visitors interact with our website.',
      marketing: 'Marketing Cookies',
      marketingDesc: 'Currently not used. Reserved for future functionality.',
      acceptAll: 'Accept All',
      acceptEssential: 'Essential Only',
      customize: 'Customize',
      savePreferences: 'Save Preferences',
      close: 'Close'
    },
    sv: {
      title: 'Cookie-inställningar',
      description: 'Vi använder cookies för att förbättra din upplevelse och förstå hur vår webbplats används. Du kan acceptera alla cookies eller anpassa dina preferenser.',
      essential: 'Nödvändiga Cookies',
      essentialDesc: 'Krävs för grundläggande webbplatsfunktionalitet. Alltid aktiverade.',
      analytics: 'Analys-cookies',
      analyticsDesc: 'Hjälper oss förstå hur besökare interagerar med vår webbplats.',
      marketing: 'Marknadsföring-cookies',
      marketingDesc: 'Används för närvarande inte. Reserverad för framtida funktionalitet.',
      acceptAll: 'Acceptera alla',
      acceptEssential: 'Endast nödvändiga',
      customize: 'Anpassa',
      savePreferences: 'Spara preferenser',
      close: 'Stäng'
    },
    km: {
      title: 'ការកំណត់ Cookie',
      description: 'យើងប្រើ cookies ដើម្បីកែលម្អបទពិសោធន៍របស់អ្នក និងយល់ពីរបៀបដែលគេហទំព័ររបស់យើងត្រូវបានប្រើប្រាស់។ អ្នកអាចទទួលយក cookies ទាំងអស់ ឬកែសម្រួលចំណូលចិត្តរបស់អ្នក។',
      essential: 'Cookies ចាំបាច់',
      essentialDesc: 'ត្រូវការសម្រាប់មុខងារមូលដ្ឋានរបស់គេហទំព័រ។ បើកជានិច្ច។',
      analytics: 'Analytics Cookies',
      analyticsDesc: 'ជួយយើងយល់ពីរបៀបដែលអ្នកទស្សនាធ្វើអន្តរកម្មជាមួយគេហទំព័ររបស់យើង។',
      marketing: 'Marketing Cookies',
      marketingDesc: 'បច្ចុប្បន្នមិនបានប្រើ។ រក្សាទុកសម្រាប់មុខងារអនាគត។',
      acceptAll: 'ទទួលយកទាំងអស់',
      acceptEssential: 'ចាំបាច់តែប៉ុណ្ណោះ',
      customize: 'កែសម្រួល',
      savePreferences: 'រក្សាទុកចំណូលចិត្ត',
      close: 'បិទ'
    }
  }

  const text = t[locale as keyof typeof t] || t.en

  useEffect(() => {
    // Show banner if user hasn't made a choice
    if (!hasConsentChoice()) {
      setShowBanner(true)
    }

    // Listen for manual show settings event
    const handleShowSettings = () => {
      setShowBanner(true)
      setShowDetails(true)
    }

    window.addEventListener('showCookieSettings', handleShowSettings)
    return () => window.removeEventListener('showCookieSettings', handleShowSettings)
  }, [])

  const handleAcceptAll = () => {
    acceptAllCookies()
    setShowBanner(false)
    setShowDetails(false)
  }

  const handleAcceptEssential = () => {
    acceptEssentialOnly()
    setShowBanner(false)
    setShowDetails(false)
  }

  const handleCustomSave = () => {
    acceptCustomConsent(customConsent.analytics, customConsent.marketing)
    setShowBanner(false)
    setShowDetails(false)
  }

  const handleCustomize = () => {
    const currentConsent = getConsentState()
    if (currentConsent) {
      setCustomConsent({
        analytics: currentConsent.analytics,
        marketing: currentConsent.marketing
      })
    }
    setShowDetails(true)
  }

  if (!showBanner) return null

  return (
    <>
      {/* Backdrop */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black/50 z-[9998]"
          onClick={() => setShowDetails(false)}
        />
      )}

      {/* Main Banner */}
      <div className={`fixed bottom-0 left-0 right-0 z-[9999] ${fontClass}`}>
        <div className="bg-[var(--sahakum-navy)] text-white border-t-2 border-[var(--sahakum-gold)]">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">
            <div className="flex items-start gap-4">
              {/* Cookie Icon */}
              <div className="flex-shrink-0 mt-1">
                <Cookie className="w-6 h-6 text-[var(--sahakum-gold)]" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {text.title}
                </h3>
                <p className="text-white/90 text-sm leading-relaxed mb-4">
                  {text.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 text-[var(--sahakum-navy)] px-4 py-2 rounded font-medium text-sm transition-colors"
                  >
                    {text.acceptAll}
                  </button>
                  <button
                    onClick={handleAcceptEssential}
                    className="border border-white/30 hover:border-white/60 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
                  >
                    {text.acceptEssential}
                  </button>
                  <button
                    onClick={handleCustomize}
                    className="text-[var(--sahakum-gold)] hover:text-[var(--sahakum-gold)]/80 px-4 py-2 rounded font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {text.customize}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleAcceptEssential}
                className="flex-shrink-0 text-white/60 hover:text-white transition-colors p-1"
                aria-label={text.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Settings Modal */}
        {showDetails && (
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-[9999] flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-[var(--sahakum-navy)]">
                    {text.title}
                  </h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Cookie Categories */}
                <div className="space-y-6">
                  {/* Essential Cookies */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[var(--sahakum-navy)]">
                        {text.essential}
                      </h3>
                      <div className="flex items-center text-green-600">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-sm">Always On</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {text.essentialDesc}
                    </p>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[var(--sahakum-navy)]">
                        {text.analytics}
                      </h3>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customConsent.analytics}
                          onChange={(e) => setCustomConsent(prev => ({
                            ...prev,
                            analytics: e.target.checked
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--sahakum-gold)]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--sahakum-gold)]"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600">
                      {text.analyticsDesc}
                    </p>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border border-gray-200 rounded-lg p-4 opacity-60">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[var(--sahakum-navy)]">
                        {text.marketing}
                      </h3>
                      <label className="relative inline-flex items-center cursor-not-allowed">
                        <input
                          type="checkbox"
                          checked={false}
                          disabled
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600">
                      {text.marketingDesc}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCustomSave}
                    className="bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 text-[var(--sahakum-navy)] px-6 py-2 rounded font-medium transition-colors"
                  >
                    {text.savePreferences}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="border border-[var(--sahakum-navy)] text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)] hover:text-white px-6 py-2 rounded font-medium transition-colors"
                  >
                    {text.acceptAll}
                  </button>
                  <button
                    onClick={handleAcceptEssential}
                    className="text-gray-600 hover:text-gray-800 px-6 py-2 rounded font-medium transition-colors"
                  >
                    {text.acceptEssential}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}