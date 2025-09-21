'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { UserMenu } from '@/components/layout/user-menu';
import { type Language } from '@/lib/constants';

export function Header() {
  const t = useTranslations('nav');
  const params = useParams();
  const locale = params.locale as Language;

  const navLinks = [
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/cambodia`, label: t('cambodia') },
    { href: `/${locale}/living-in-sweden`, label: t('living_in_sweden') },
    { href: `/${locale}/community`, label: t('community') },
    { href: `/${locale}/membership`, label: t('membership') },
    { href: `/${locale}/news`, label: t('news') },
  ];

  return (
    <header className="bg-[#006AA7] text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 bg-[#FECC02] rounded-full flex items-center justify-center">
              <span className="text-[#006AA7] font-bold text-lg">SK</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Sahakum Khmer</h1>
              <p className="text-xs text-[#FECC02] font-medium">Gemenskap • Kultur • Integration</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#FECC02] transition-colors duration-200 font-medium text-sm uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side - Language switcher and User menu */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher currentLocale={locale} />
            <UserMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}