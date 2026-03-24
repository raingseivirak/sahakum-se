'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previous = useRef<string | null>(null)

  useEffect(() => {
    const current = pathname + searchParams.toString()
    if (previous.current !== null && previous.current !== current) {
      NProgress.done()
    }
    previous.current = current
  }, [pathname, searchParams])

  return (
    <style>{`
      #nprogress { pointer-events: none; }
      #nprogress .bar {
        background: #D4932F;
        position: fixed;
        z-index: 9999;
        top: 0; left: 0;
        width: 100%; height: 3px;
      }
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0; width: 100px; height: 100%;
        box-shadow: 0 0 10px #D4932F, 0 0 5px #D4932F;
        opacity: 1;
        transform: rotate(3deg) translate(0px, -4px);
      }
    `}</style>
  )
}
