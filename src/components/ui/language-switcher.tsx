'use client';

import { ChevronDown, Globe, Languages } from 'lucide-react';
import { LANGUAGES, type Language } from '@/lib/constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface LanguageSwitcherProps {
  currentLocale: Language;
  variant?: 'default' | 'compact' | 'simple';
  className?: string;
  showLabel?: boolean;
}

export function LanguageSwitcher({
  currentLocale,
  variant = 'default',
  className = '',
  showLabel = false
}: LanguageSwitcherProps) {
  const switchLanguage = (newLocale: Language) => {
    // Remove current locale from pathname and add new one
    const currentPath = window.location.pathname;
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}/, '') || '';
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    // Set cookie and navigate
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000`; // 1 year
    window.location.href = newPath;
  };

  const currentLanguage = LANGUAGES[currentLocale];
  const otherLanguages = Object.entries(LANGUAGES).filter(([code]) => code !== currentLocale);

  // Simple variant (just current language, no dropdown)
  if (variant === 'simple') {
    return (
      <div className={`text-sm bg-[var(--sahakum-gold)]/20 text-[var(--sahakum-gold)] px-3 py-1 rounded-sm font-medium font-sweden ${className}`}>
        {currentLocale.toUpperCase()}
      </div>
    );
  }

  // Compact variant (minimal dropdown)
  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className={`flex items-center space-x-1 px-2 py-1 text-xs bg-[var(--sahakum-gold)]/20 text-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/30 rounded-sm transition-colors font-sweden ${className}`}>
          <Languages className="w-3 h-3" />
          <img
            src={currentLanguage.flagImage}
            alt={`${currentLanguage.name} flag`}
            className="w-4 h-3 object-cover rounded-sm"
          />
          <ChevronDown className="w-3 h-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-white border border-[var(--sahakum-gold)]/20 shadow-lg"
        >
          {otherLanguages.map(([code, lang]) => (
            <DropdownMenuItem
              key={code}
              onClick={() => switchLanguage(code as Language)}
              className="hover:bg-[var(--sahakum-gold)]/10 focus:bg-[var(--sahakum-gold)]/10 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] font-sweden text-xs">
                <div className="flex items-center space-x-2">
                  <img
                    src={lang.flagImage}
                    alt={`${lang.name} flag`}
                    className="w-4 h-3 object-cover rounded-sm"
                  />
                  <span className="font-medium">{code.toUpperCase()}</span>
                </div>
                <span>{lang.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant (full dropdown with flags)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`flex items-center space-x-2 px-3 py-2 text-sm bg-[var(--sahakum-gold)]/10 text-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/20 rounded-sm transition-colors font-sweden ${className}`}>
        <Globe className="w-4 h-4" />
        <img
          src={currentLanguage.flagImage}
          alt={`${currentLanguage.name} flag`}
          className="w-5 h-3 object-cover rounded-sm"
        />
        <span className="hidden sm:inline">{currentLanguage.name}</span>
        <ChevronDown className="w-3 h-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white border border-[var(--sahakum-gold)]/20 shadow-lg min-w-48"
      >
        {otherLanguages.map(([code, lang]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => switchLanguage(code as Language)}
            className="hover:bg-[var(--sahakum-gold)]/10 focus:bg-[var(--sahakum-gold)]/10 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] font-sweden">
              <div className="flex items-center space-x-2">
                <img
                  src={lang.flagImage}
                  alt={`${lang.name} flag`}
                  className="w-5 h-3 object-cover rounded-sm"
                />
                <span className="font-medium">{code.toUpperCase()}</span>
              </div>
              <span className="text-sm">{lang.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}