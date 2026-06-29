'use client'

import { showCookieSettings } from '@/lib/cookie-consent'
import type { ContactSettings, OrganizationSettings, SocialSettings } from '@/lib/public-settings'

/**
 * Static translations for the footer chrome (labels, headings).
 * Actual data — email, phone, social URLs — comes from the DB via `getPublicSettings()`
 * and is the SAME across all languages by design.
 */
const footerTranslations = {
  sv: {
    contact: 'Kontakt',
    cookie_settings: 'Cookie-inställningar',
    follow_us: 'Följ oss',
    copyright: '© 2025 Sahakum Khmer. Alla rättigheter förbehållna.',
    tagline: 'Gemenskap • Kultur • Integration',
    quick_links: 'Snabblänkar',
    about_us: 'Om oss',
    board: 'Styrelsen',
    statutes: 'Stadgar',
    events: 'Evenemang',
    blog: 'Blogg',
    pages: 'Sidor',
    playlist: 'Spellista',
    phone: 'Telefon',
    address: 'Adress',
  },
  en: {
    contact: 'Contact',
    cookie_settings: 'Cookie Settings',
    follow_us: 'Follow us',
    copyright: '© 2025 Sahakum Khmer. All rights reserved.',
    tagline: 'Community • Culture • Integration',
    quick_links: 'Quick Links',
    about_us: 'About Us',
    board: 'Board of Directors',
    statutes: 'Statutes',
    events: 'Events',
    blog: 'Blog',
    pages: 'Pages',
    playlist: 'Playlist',
    phone: 'Phone',
    address: 'Address',
  },
  km: {
    contact: 'ទំនាក់ទំនង',
    cookie_settings: 'ការកំណត់ Cookie',
    follow_us: 'តាមដាន',
    copyright: '© ២០២៥ សហគមន៍ខ្មែរ។ រក្សាសិទ្ធិគ្រប់យ៉ាង។',
    tagline: 'សហគមន៍ • វប្បធម៌ • ការរួមបញ្ចូល',
    quick_links: 'តំណរហ័ស',
    about_us: 'អំពីយើង',
    board: 'ក្រុមប្រឹក្សាភិបាល',
    statutes: 'ជំពូក',
    events: 'ព្រឹត្តិការណ៍',
    blog: 'ប្លុក',
    pages: 'ទំព័រ',
    playlist: 'បញ្ជីចម្រៀង',
    phone: 'ទូរស័ព្ទ',
    address: 'អាសយដ្ឋាន',
  },
} as const

type FooterT = (typeof footerTranslations)['en']

interface FooterContentProps {
  locale: string
  organization: OrganizationSettings
  contact: ContactSettings
  social: SocialSettings
}

export function FooterContent({ locale, organization, contact, social }: FooterContentProps) {
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'
  const t: FooterT =
    footerTranslations[locale as keyof typeof footerTranslations] || footerTranslations.sv

  const hasAnySocial = social.facebook || social.instagram || social.youtube || social.linkedin

  return (
    <footer className={`bg-gray-50 border-t ${fontClass}`}>
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className={`font-semibold text-[var(--sweden-blue)] mb-1 md:mb-4 text-sm md:text-base ${fontClass}`}>
              {organization.name}
            </h3>
            <p className="text-gray-600 text-xs md:text-sm">{t.tagline}</p>
          </div>

          {/* Quick Links */}
          <div className="col-span-2 md:col-span-1">
            <h4 className={`font-semibold text-gray-800 mb-2 text-xs md:text-base ${fontClass}`}>{t.quick_links}</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:text-sm text-gray-600">
              <a href={`/${locale}/about-us`} className="hover:text-[var(--sahakum-gold)] transition-colors">{t.about_us}</a>
              <a href={`/${locale}/blog`} className="hover:text-[var(--sahakum-gold)] transition-colors">{t.blog}</a>
              <a href={`/${locale}/board`} className="hover:text-[var(--sahakum-gold)] transition-colors">{t.board}</a>
              <a href={`/${locale}/events`} className="hover:text-[var(--sahakum-gold)] transition-colors">{t.events}</a>
              <a href={`/${locale}/statutes`} className="hover:text-[var(--sahakum-gold)] transition-colors">{t.statutes}</a>
              <a href={`/${locale}/playlist`} className="hover:text-[var(--sahakum-gold)] transition-colors">{t.playlist}</a>
            </div>
          </div>

          {/* Contact */}
          <div className="col-span-1 md:col-span-1">
            <h4 className={`font-semibold text-gray-800 mb-1 md:mb-4 text-xs md:text-base ${fontClass}`}>{t.contact}</h4>
            <div className="text-xs md:text-sm text-gray-600 space-y-0.5 md:space-y-1">
              {contact.email && (
                <p className="break-all">
                  <a href={`mailto:${contact.email}`} className="hover:text-[var(--sahakum-gold)] transition-colors">
                    {contact.email}
                  </a>
                </p>
              )}
              {contact.phone && (
                <p>
                  <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="hover:text-[var(--sahakum-gold)] transition-colors">
                    {contact.phone}
                  </a>
                </p>
              )}
              {contact.address && (
                <p className="whitespace-pre-line">{contact.address}</p>
              )}
            </div>
          </div>

          {/* Social */}
          <div className="col-span-1 md:col-span-1">
            <h4 className={`font-semibold text-gray-800 mb-1 md:mb-4 text-xs md:text-base ${fontClass}`}>{t.follow_us}</h4>
            {hasAnySocial ? (
              <div className="flex flex-col space-y-1 md:flex-row md:flex-wrap md:gap-x-4 md:gap-y-1 md:space-y-0 text-xs md:text-sm">
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--sweden-blue)] hover:text-[var(--sweden-blue-light)]"
                  >
                    Facebook
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--sweden-blue)] hover:text-[var(--sweden-blue-light)]"
                  >
                    Instagram
                  </a>
                )}
                {social.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--sweden-blue)] hover:text-[var(--sweden-blue-light)]"
                  >
                    YouTube
                  </a>
                )}
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--sweden-blue)] hover:text-[var(--sweden-blue-light)]"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t pt-3 md:pt-6 mt-4 md:mt-8 text-center text-xs md:text-sm text-gray-500">
          <p>{t.copyright}</p>
          <div className="mt-1.5 md:mt-2">
            <button
              onClick={showCookieSettings}
              className="text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] transition-colors duration-200 underline font-medium"
            >
              {t.cookie_settings}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
