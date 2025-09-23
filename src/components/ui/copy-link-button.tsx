'use client'

import { useState } from 'react'
import { Check, Link2, Share } from 'lucide-react'

interface CopyLinkButtonProps {
  url?: string
  title?: string
  locale: string
  className?: string
}

export function CopyLinkButton({
  url,
  title = 'Copy Link',
  locale,
  className = ''
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  // Get current URL if not provided
  const linkUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  // Multilingual text
  const text = {
    sv: {
      copy: 'Kopiera länk',
      copied: 'Länk kopierad!',
      share: 'Dela artikel'
    },
    en: {
      copy: 'Copy Link',
      copied: 'Link Copied!',
      share: 'Share Article'
    },
    km: {
      copy: 'ចម្លងតំណ',
      copied: 'បានចម្លងតំណ!',
      share: 'ចែករំលែកអត្ថបទ'
    }
  }

  const currentText = text[locale as keyof typeof text] || text.en
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  const handleCopy = async () => {
    if (!linkUrl) return

    try {
      await navigator.clipboard.writeText(linkUrl)
      setCopied(true)

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = linkUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)

      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }

  return (
    <div className={`${className}`}>
      <button
        onClick={handleCopy}
        disabled={copied}
        className={`
          group relative inline-flex items-center gap-2 px-4 py-2.5
          bg-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy-600)]
          text-white text-sm font-medium
          border border-[var(--sahakum-gold)]/20 hover:border-[var(--sahakum-gold)]/40
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-[var(--sahakum-gold)]/50 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm hover:shadow-md
          ${fontClass}
        `}
        aria-label={copied ? currentText.copied : currentText.copy}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-4 h-4">
          {copied ? (
            <Check
              className="w-4 h-4 text-[var(--sahakum-gold)] animate-in fade-in-0 zoom-in-75 duration-200"
              strokeWidth={2.5}
            />
          ) : (
            <Link2
              className="w-4 h-4 text-[var(--sahakum-gold)] group-hover:scale-110 transition-transform duration-200"
              strokeWidth={2}
            />
          )}
        </div>

        {/* Text */}
        <span className="text-white group-hover:text-[var(--sahakum-gold)] transition-colors duration-200">
          {copied ? currentText.copied : currentText.copy}
        </span>

        {/* Success indicator */}
        {copied && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--sahakum-gold)] rounded-full animate-ping" />
        )}
      </button>

      {/* Optional: Mobile-friendly share button as fallback */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: title,
                url: linkUrl,
              }).catch(() => {
                // Fallback to copy if share fails
                handleCopy()
              })
            }
          }}
          className={`
            md:hidden ml-2 inline-flex items-center gap-2 px-4 py-2.5
            bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold-600)]
            text-[var(--sahakum-navy)] text-sm font-medium
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-[var(--sahakum-gold)]/50 focus:ring-offset-2
            shadow-sm hover:shadow-md
            ${fontClass}
          `}
          aria-label={currentText.share}
        >
          <Share className="w-4 h-4" strokeWidth={2} />
          <span>{currentText.share}</span>
        </button>
      )}
    </div>
  )
}

// Export a simpler version for quick use
export function SimpleCopyLink({ locale, className }: { locale: string, className?: string }) {
  return (
    <CopyLinkButton
      locale={locale}
      className={className}
    />
  )
}