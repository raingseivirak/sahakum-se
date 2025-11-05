'use client'

import { useParams } from 'next/navigation';
import { showCookieSettings } from '@/lib/cookie-consent';

// Static translations for the footer
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
    events: 'Evenemang',
    blog: 'Blogg',
    pages: 'Sidor'
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
    events: 'Events',
    blog: 'Blog',
    pages: 'Pages'
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
    events: 'ព្រឹត្តិការណ៍',
    blog: 'ប្លុក',
    pages: 'ទំព័រ'
  }
};

export function Footer() {
  const params = useParams();
  const locale = (params?.locale as string) || 'sv';
  const t = (key: string) => footerTranslations[locale as keyof typeof footerTranslations]?.[key] || footerTranslations.sv[key] || key;

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Mobile: Compact single-column layout, Desktop: 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Brand - Full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold text-[var(--sweden-blue)] mb-1 md:mb-4 text-sm md:text-base">Sahakum Khmer</h3>
            <p className="text-gray-600 text-xs md:text-sm">
              {t('tagline')}
            </p>
          </div>

          {/* Quick Links - Full width on mobile for compact vertical space */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-semibold text-gray-800 mb-1 md:mb-4 text-xs md:text-base">{t('quick_links')}</h4>
            <div className="text-xs md:text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 md:flex-col md:space-y-2">
              <a href={`/${locale}/about-us`} className="hover:text-[var(--sahakum-gold)] transition-colors">
                {t('about_us')}
              </a>
              <a href={`/${locale}/board`} className="hover:text-[var(--sahakum-gold)] transition-colors">
                {t('board')}
              </a>
              <a href={`/${locale}/events`} className="hover:text-[var(--sahakum-gold)] transition-colors">
                {t('events')}
              </a>
              <a href={`/${locale}/blog`} className="hover:text-[var(--sahakum-gold)] transition-colors">
                {t('blog')}
              </a>
              <a href={`/${locale}/pages`} className="hover:text-[var(--sahakum-gold)] transition-colors">
                {t('pages')}
              </a>
            </div>
          </div>

          {/* Contact - Left column on mobile */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="font-semibold text-gray-800 mb-1 md:mb-4 text-xs md:text-base">{t('contact')}</h4>
            <div className="text-xs md:text-sm text-gray-600 space-y-0.5 md:space-y-1">
              <p className="break-all">contact.sahakumkhmer.se@gmail.com</p>
              {/*<p>+46 xxx xxx xxx</p>*/}
            </div>
          </div>

          {/* Social - Right column on mobile */}
          <div className="col-span-1 md:col-span-1">
            <h4 className="font-semibold text-gray-800 mb-1 md:mb-4 text-xs md:text-base">{t('follow_us')}</h4>
            <div className="flex flex-col space-y-1 md:flex-row md:space-x-4 md:space-y-0 text-xs md:text-sm">
              <a href="#" className="text-[var(--sweden-blue)] hover:text-[var(--sweden-blue-light)]">
                Facebook
              </a>
              <a href="#" className="text-[var(--sweden-blue)] hover:text-[var(--sweden-blue-light)]">
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t pt-3 md:pt-6 mt-4 md:mt-8 text-center text-xs md:text-sm text-gray-500">
          <p>{t('copyright')}</p>
          <div className="mt-1.5 md:mt-2">
            <button
              onClick={showCookieSettings}
              className="text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] transition-colors duration-200 underline font-medium"
            >
              {t('cookie_settings')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}