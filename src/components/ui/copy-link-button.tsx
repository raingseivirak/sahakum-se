'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Check, Link2, Share } from 'lucide-react'

interface CopyLinkButtonProps {
  url?: string
  title?: string
  className?: string
  copyText?: string
  copiedText?: string
  shareText?: string
}

export function CopyLinkButton({
  url,
  title = 'Copy Link',
  className = '',
  copyText = 'Copy Link',
  copiedText = 'Link Copied!',
  shareText = 'Share Article'
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)
  const params = useParams()
  const locale = params.locale as string

  // Get current URL if not provided
  const linkUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
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
      {/* Subtle Meta-Style Button */}
      {className?.includes('subtle-link-button') ? (
        <button
          onClick={handleCopy}
          disabled={copied}
          className={`
            group inline-flex items-center gap-1 text-sm
            text-white/90 hover:text-[var(--sahakum-gold)]
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:text-[var(--sahakum-gold)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${fontClass}
          `}
          aria-label={copied ? copiedText : copyText}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[var(--sahakum-gold)]" strokeWidth={2.5} />
              <span className="font-medium text-[var(--sahakum-gold)]">{copiedText}</span>
            </>
          ) : (
            <>
              <Link2 className="w-3 h-3 text-[var(--sahakum-gold)] group-hover:scale-110 transition-transform duration-200" strokeWidth={2} />
              <span className="font-medium">{copyText}</span>
            </>
          )}
        </button>
      ) : (
        /* Regular Button Style */
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
          aria-label={copied ? copiedText : copyText}
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
            {copied ? copiedText : copyText}
          </span>

          {/* Success indicator */}
          {copied && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--sahakum-gold)] rounded-full animate-ping" />
          )}
        </button>
      )}

      {/* Mobile-friendly share button - only show if native share is available */}
      {typeof navigator !== 'undefined' && navigator.share && className?.includes('subtle-link-button') && (
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
            md:hidden ml-3 group inline-flex items-center gap-1 text-sm
            text-white/90 hover:text-[var(--sahakum-gold)]
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:text-[var(--sahakum-gold)]
            ${fontClass}
          `}
          aria-label={shareText}
        >
          <Share className="w-3 h-3 text-[var(--sahakum-gold)] group-hover:scale-110 transition-transform duration-200" strokeWidth={2} />
          <span className="font-medium">{shareText}</span>
        </button>
      )}
    </div>
  )
}

// Export a simpler version for quick use
export function SimpleCopyLink({ className }: { className?: string }) {
  return (
    <CopyLinkButton
      className={className}
    />
  )
}