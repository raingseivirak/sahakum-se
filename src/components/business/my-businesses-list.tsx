'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, ExternalLink, Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BusinessWithDetails } from '@/lib/business-directory'

const statusStyle: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800', PENDING: 'bg-amber-100 text-amber-900', APPROVED: 'bg-green-100 text-green-900',
  CHANGES_REQUESTED: 'bg-blue-100 text-blue-900', SUSPENDED: 'bg-red-100 text-red-900',
}

export function MyBusinessesList({ locale }: { locale: string }) {
  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/my/businesses').then(async response => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not load businesses')
      setBusinesses(data.businesses)
    }).catch(reason => setError(reason.message)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse bg-white p-8">Loading…</div>
  if (error) return <div className="border-l-4 border-red-600 bg-red-50 p-5 text-red-800">{error}</div>

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-3xl font-semibold text-sahakum-navy-900">Khmer Connections</h2><p className="mt-2 text-gray-600">Manage your business listings and review status.</p></div>
        <Button asChild className="rounded-none bg-sahakum-gold-500 text-sahakum-navy-900 hover:bg-sahakum-gold-600"><Link href={`/${locale}/my-account/connections/new`}><Plus className="h-4 w-4" />Add business</Link></Button>
      </div>
      {!businesses.length ? (
        <div className="border border-sweden-neutral-200 bg-white p-10 text-center"><Building2 className="mx-auto mb-4 h-12 w-12 text-sahakum-gold-500" /><h3 className="text-xl font-semibold text-sahakum-navy-900">No business listings yet</h3><p className="mx-auto mt-2 max-w-lg text-gray-600">Register your business so the community can discover your products and services.</p></div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {businesses.map(business => (
            <article key={business.id} className="border border-sweden-neutral-200 bg-white p-6 shadow-sweden-sm">
              <div className="mb-4 flex items-start justify-between gap-4"><div><h3 className="text-xl font-semibold text-sahakum-navy-900">{business.name}</h3><p className="mt-1 text-sm text-gray-600">{business.city}, {business.country}</p></div><span className={`px-2 py-1 text-xs font-medium ${statusStyle[business.status]}`}>{business.status.replaceAll('_', ' ')}</span></div>
              <p className="mb-4 text-sm leading-relaxed text-gray-700">{business.summary}</p>
              {business.reviewNote && <div className="mb-4 border-l-4 border-sweden-blue-500 bg-sweden-blue-50 p-3 text-sm text-sweden-blue-900"><strong className="block">Review note</strong>{business.reviewNote}</div>}
              <div className="flex flex-wrap gap-3 border-t border-sweden-neutral-200 pt-4">
                {!['PENDING', 'SUSPENDED'].includes(business.status) && <Button asChild variant="outline" size="sm" className="rounded-none"><Link href={`/${locale}/my-account/connections/${business.id}/edit`}><Pencil className="h-4 w-4" />Edit</Link></Button>}
                {business.status === 'APPROVED' && <Button asChild variant="ghost" size="sm"><Link href={`/${locale}/connections/${business.slug}`} target="_blank"><ExternalLink className="h-4 w-4" />View public page</Link></Button>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
