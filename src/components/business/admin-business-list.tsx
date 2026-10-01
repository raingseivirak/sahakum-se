'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { BusinessWithDetails } from '@/lib/business-directory'

export function AdminBusinessList({ locale }: { locale: string }) {
  const [businesses, setBusinesses] = useState<BusinessWithDetails[]>([])
  const [status, setStatus] = useState('PENDING')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [note, setNote] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/businesses?status=${status}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not load businesses')
      setBusinesses(data.businesses)
    } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : 'Could not load businesses') } finally { setLoading(false) }
  }, [status])
  useEffect(() => { load() }, [load])

  async function moderate(id: string, action: string) {
    setError('')
    const response = await fetch(`/api/admin/businesses/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, note: note[id] || '' }) })
    const data = await response.json()
    if (!response.ok) return setError(data.error || 'Could not update business')
    load()
  }

  return <div className="font-sweden">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold text-sahakum-navy-900">Khmer Connections</h1><p className="mt-1 text-gray-600">Review and feature member businesses.</p></div><label><span className="mb-1 block text-sm font-medium">Status</span><select value={status} onChange={event => setStatus(event.target.value)} className="h-10 border border-sweden-neutral-300 bg-white px-3"><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="CHANGES_REQUESTED">Changes requested</option><option value="SUSPENDED">Suspended</option><option value="ALL">All</option></select></label></div>
    {error && <div className="mb-5 border-l-4 border-red-600 bg-red-50 p-4 text-red-800">{error}</div>}
    {loading ? <div className="animate-pulse bg-white p-8">Loading…</div> : !businesses.length ? <div className="border border-sweden-neutral-200 bg-white p-8 text-gray-600">No listings in this status.</div> : <div className="space-y-5">{businesses.map(business => <article key={business.id} className="border border-sweden-neutral-200 bg-white p-6 shadow-sweden-sm"><div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div><div className="mb-2 flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold text-sahakum-navy-900">{business.name}</h2><span className="bg-gray-100 px-2 py-1 text-xs">{business.status.replaceAll('_', ' ')}</span>{business.featured && <span className="bg-sahakum-gold-100 px-2 py-1 text-xs">Featured</span>}</div><p className="text-sm text-gray-500">{business.owner.firstName} {business.owner.lastName} · {business.city}, {business.country} · {business.category.nameEn}</p><p className="mt-4 text-gray-700">{business.summary}</p><Link className="mt-4 inline-block text-sweden-blue-600 underline" href={`/${locale}/connections/${business.slug}`} target="_blank">Preview public page</Link></div><div><textarea value={note[business.id] || ''} onChange={event => setNote(current => ({ ...current, [business.id]: event.target.value }))} placeholder="Review note or requested changes" className="mb-3 min-h-24 w-full border border-sweden-neutral-300 p-3 text-sm" /><div className="flex flex-wrap gap-2">{business.status !== 'APPROVED' && <Button size="sm" className="rounded-none bg-green-700 hover:bg-green-800" onClick={() => moderate(business.id, 'approve')}>Approve</Button>}<Button size="sm" variant="outline" className="rounded-none" onClick={() => moderate(business.id, 'request_changes')}>Request changes</Button><Button size="sm" variant="outline" className="rounded-none" onClick={() => moderate(business.id, 'suspend')}>Suspend</Button>{business.status === 'APPROVED' && <Button size="sm" variant="outline" className="rounded-none" onClick={() => moderate(business.id, business.featured ? 'unfeature' : 'feature')}>{business.featured ? 'Remove feature' : 'Feature'}</Button>}</div></div></div></article>)}</div>}
  </div>
}
