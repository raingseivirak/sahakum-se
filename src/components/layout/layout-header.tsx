'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/layout/grid'
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { UserMenu } from '@/components/layout/user-menu'
import { type Language } from '@/lib/constants'

const translations = {
  en: { aboutUs: 'About Us', blog: 'Blog', contact: 'Contact', signIn: 'Sign In', signOut: 'Sign Out', admin: 'Admin Dashboard', profile: 'Profile', settings: 'Settings', myAccount: 'My Account' },
  sv: { aboutUs: 'Om oss', blog: 'Blogg', contact: 'Kontakt', signIn: 'Logga in', signOut: 'Logga ut', admin: 'Administratörspanel', profile: 'Min profil', settings: 'Inställningar', myAccount: 'Mitt konto' },
  km: { aboutUs: 'អំពីយើង', blog: 'ប្លុក', contact: 'ទំនាក់ទំនង', signIn: 'ចូលប្រើប្រាស់', signOut: 'ចាកចេញ', admin: 'ផ្ទាំងគ្រប់គ្រង', profile: 'ប្រវត្តិរូប', settings: 'ការកំណត់', myAccount: 'គណនីរបស់ខ្ញុំ' },
}

interface LayoutHeaderProps {
  locale: string
}

export function LayoutHeader({ locale }: LayoutHeaderProps) {
  const pathname = usePathname()
  const tr = translations[locale as keyof typeof translations] ?? translations.en
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`

  // Only show on pages that don't have their own header
  const segment = pathname.replace(`/${locale}`, '').split('/')[1] ?? ''
  const SHOW_FOR = ['', 'join', 'contact', 'blog', 'about-us', 'board']
  if (!SHOW_FOR.includes(segment)) return null
  const linkClass = `text-[var(--sahakum-gold)] hover:text-white transition-colors duration-200 text-sm font-medium hidden sm:block ${fontClass}`

  return (
    <header className="bg-[var(--sahakum-navy)] text-white shadow-lg border-b border-[var(--sahakum-gold)]/20">
      <Container size="wide">
        <nav className={`flex items-center justify-between transition-all duration-300 ease-in-out ${fontClass} ${isHome ? 'py-6 lg:py-8' : 'py-4 lg:py-6'}`}>
          <Link href={`/${locale}`} className="block">
            {/* Mobile: fixed sm size, no animation needed */}
            <div className="block lg:hidden">
              <SwedenBrandLogo
                locale={locale}
                size="sm"
                variant="horizontal"
                className="hover:opacity-90 transition-opacity duration-200"
              />
            </div>
            {/* Desktop: lg size, scale down on non-home pages */}
            <div className={`hidden lg:block transition-transform duration-300 ease-in-out origin-left overflow-hidden ${isHome ? 'scale-100' : 'scale-[0.75]'}`}>
              <SwedenBrandLogo
                locale={locale}
                size="lg"
                variant="horizontal"
                className="hover:opacity-90 transition-opacity duration-200"
              />
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href={`/${locale}/about-us`} className={linkClass}>{tr.aboutUs}</Link>
            <Link href={`/${locale}/blog`} className={linkClass}>{tr.blog}</Link>
            <Link href={`/${locale}/contact`} className={linkClass}>{tr.contact}</Link>
            <LanguageSwitcher currentLocale={locale as Language} variant="compact" />
            <UserMenu
              locale={locale as Language}
              translations={{ sign_in: tr.signIn, sign_out: tr.signOut, admin: tr.admin, profile: tr.profile, settings: tr.settings, my_account: tr.myAccount }}
              currentUrl={pathname}
            />
          </div>
        </nav>
      </Container>
    </header>
  )
}
