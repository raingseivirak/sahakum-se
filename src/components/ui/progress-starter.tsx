'use client'

import { useEffect } from 'react'
import NProgress from 'nprogress'

export function ProgressStarter() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return
      const href = target.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (target.target === '_blank') return
      // Only trigger for same-origin navigation
      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname + url.search === window.location.pathname + window.location.search) return
      } catch {
        return
      }
      NProgress.start()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
