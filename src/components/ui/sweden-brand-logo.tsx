"use client"

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SwedenBrandLogoProps {
  className?: string
  locale?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'horizontal' | 'compact'
  colorScheme?: 'dark' | 'light' // dark = white text (for dark backgrounds), light = dark text (for light backgrounds)
}

export function SwedenBrandLogo({
  className,
  locale = 'en',
  size = 'md',
  variant = 'horizontal',
  colorScheme = 'dark'
}: SwedenBrandLogoProps) {
  // Swedish Brand size specifications with responsive design
  const sizes = {
    xs: {
      container: 'h-10 sm:h-12',
      logo: 'h-10 w-10 sm:h-12 sm:w-12',
      swedenText: 'text-xs sm:text-sm',
      sahakumText: 'text-sm sm:text-lg'
    },
    sm: {
      container: 'h-12 sm:h-16',
      logo: 'h-12 w-12 sm:h-16 sm:w-16',
      swedenText: 'text-sm sm:text-base',
      sahakumText: 'text-lg sm:text-2xl'
    },
    md: {
      container: 'h-16 sm:h-20',
      logo: 'h-16 w-16 sm:h-20 sm:w-20',
      swedenText: 'text-base sm:text-xl',
      sahakumText: 'text-2xl sm:text-4xl'
    },
    lg: {
      container: 'h-20 sm:h-24',
      logo: 'h-20 w-20 sm:h-24 sm:w-24',
      swedenText: 'text-lg sm:text-2xl',
      sahakumText: 'text-3xl sm:text-5xl'
    }
  }

  const currentSize = sizes[size]

  // Font classes based on locale
  const getFontClass = () => {
    return locale === 'km' ? 'font-khmer' : 'font-sweden'
  }

  const fontClass = getFontClass()

  // Color scheme for different backgrounds
  const swedenTextColor = colorScheme === 'dark'
    ? 'text-white'
    : 'text-[var(--color-sweden-blue-primary)]'

  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center justify-center',
        currentSize.container,
        className
      )}>
        <div className="relative">
          <Image
            src="/media/images/logo.svg"
            alt="Sahakum Khmer Logo"
            width={64}
            height={64}
            className={currentSize.logo}
            priority
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'flex items-center gap-0 group',
      currentSize.container,
      className
    )}>
      {/* Logo - Left side */}
      <div className="flex-shrink-0">
        <Image
          src="/media/images/logo.svg"
          alt="Sahakum Khmer Logo"
          width={96}
          height={96}
          className={cn(
            currentSize.logo,
            'transition-transform duration-200 group-hover:scale-105'
          )}
          priority
        />
      </div>

      {/* Brand Text - Right side, Swedish Brand style */}
      <div className={cn(
        'flex flex-col justify-center min-w-0 -space-y-1',
        currentSize.container // Match the logo height exactly
      )}>
        {/* Sweden - Top line, smaller text */}
        <div className={cn(
          swedenTextColor,
          'font-medium tracking-wide leading-none flex-shrink-0',
          currentSize.swedenText,
          fontClass
        )}>
          {locale === 'sv' ? 'Sverige' :
           locale === 'km' ? 'ស៊ុយអែត' :
           'Sweden'}
        </div>

        {/* Sahakum Khmer - Bottom line, bigger font */}
        <div className={cn(
          'text-[var(--sahakum-gold)] font-semibold leading-none flex-shrink-0',
          currentSize.sahakumText,
          fontClass
        )}>
          {locale === 'sv' ? 'Sahakum Khmer' :
           locale === 'km' ? 'សហគមន៍ខ្មែរ' :
           'Sahakum Khmer'}
        </div>
      </div>
    </div>
  )
}