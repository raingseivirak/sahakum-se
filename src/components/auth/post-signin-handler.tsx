'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

const STORAGE_KEY = 'pendingMembership'

export function PostSigninHandler() {
  const { data: session, status } = useSession()
  const handled = useRef(false)

  useEffect(() => {
    if (status !== 'authenticated' || handled.current) return

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    handled.current = true
    localStorage.removeItem(STORAGE_KEY)

    try {
      const { residenceStatus, preferredLanguage } = JSON.parse(raw)

      if (!session?.user?.name && !session?.user?.email) return

      const nameParts = (session.user.name || '').trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      fetch('/api/membership-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: session.user.email,
          residenceStatus: residenceStatus || undefined,
          preferredLanguage: preferredLanguage || 'en',
        }),
      }).catch(() => {
        // silently ignore — e.g. duplicate request or already a member
      })
    } catch {
      // malformed localStorage value, ignore
    }
  }, [status, session])

  return null
}
