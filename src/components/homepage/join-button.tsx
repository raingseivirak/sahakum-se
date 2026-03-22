'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { SwedenButton } from '@/components/ui/sweden-motion'

interface JoinButtonProps {
  locale: string
  label: string
  className?: string
}

export function JoinButton({ locale, label, className }: JoinButtonProps) {
  const { data: session } = useSession()

  // Hide for existing members — resolved client-side after hydration
  if (session?.user?.isMember) return null

  return (
    <Link href={`/${locale}/join`}>
      <SwedenButton
        variant="primary"
        size="lg"
        locale={locale}
        className={className}
      >
        {label}
      </SwedenButton>
    </Link>
  )
}
