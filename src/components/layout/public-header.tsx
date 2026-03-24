import Link from 'next/link'
import { Container } from '@/components/layout/grid'
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { UserMenu } from '@/components/layout/user-menu'
import { type Language } from '@/lib/constants'

const t = {
  en: {
    aboutUs: 'About Us',
    blog: 'Blog',
    contact: 'Contact',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    admin: 'Admin Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    myAccount: 'My Account',
  },
  sv: {
    aboutUs: 'Om oss',
    blog: 'Blogg',
    contact: 'Kontakt',
    signIn: 'Logga in',
    signOut: 'Logga ut',
    admin: 'Administratörspanel',
    profile: 'Min profil',
    settings: 'Inställningar',
    myAccount: 'Mitt konto',
  },
  km: {
    aboutUs: 'អំពីយើង',
    blog: 'ប្លុក',
    contact: 'ទំនាក់ទំនង',
    signIn: 'ចូល',
    signOut: 'ចាកចេញ',
    admin: 'ផ្ទាំងគ្រប់គ្រង',
    profile: 'ប្រវត្តិរូប',
    settings: 'ការកំណត់',
    myAccount: 'គណនីរបស់ខ្ញុំ',
  },
}

interface PublicHeaderProps {
  locale: string
  currentUrl?: string
  size?: 'default' | 'large'
}

export function PublicHeader({ locale, currentUrl, size = 'default' }: PublicHeaderProps) {
  const tr = t[locale as keyof typeof t] ?? t.en
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'
  const linkClass = `text-[var(--sahakum-gold)] hover:text-white transition-colors duration-200 text-sm font-medium hidden sm:block ${fontClass}`

  return (
    <header className="bg-[var(--sahakum-navy)] text-white shadow-lg border-b border-[var(--sahakum-gold)]/20">
      <Container size="wide">
        <nav className={`flex items-center justify-between ${size === 'large' ? 'animate-header-grow py-6 lg:py-8' : 'py-4 lg:py-6'}`}>
          <Link href={`/${locale}`} className="block">
            <SwedenBrandLogo
              locale={locale}
              size={size === 'large' ? 'lg' : 'md'}
              variant="horizontal"
              className={`hover:opacity-90 transition-opacity duration-200 ${size === 'large' ? 'animate-[scale-in_0.25s_ease-out_forwards]' : ''}`}
            />
          </Link>

          <div className="flex items-center space-x-4">
            <Link href={`/${locale}/about-us`} className={linkClass}>
              {tr.aboutUs}
            </Link>
            <Link href={`/${locale}/blog`} className={linkClass}>
              {tr.blog}
            </Link>
            <Link href={`/${locale}/contact`} className={linkClass}>
              {tr.contact}
            </Link>
            <LanguageSwitcher currentLocale={locale as Language} variant="compact" />
            <UserMenu
              locale={locale as Language}
              translations={{
                sign_in: tr.signIn,
                sign_out: tr.signOut,
                admin: tr.admin,
                profile: tr.profile,
                settings: tr.settings,
                my_account: tr.myAccount,
              }}
              currentUrl={currentUrl}
            />
          </div>
        </nav>
      </Container>
    </header>
  )
}
