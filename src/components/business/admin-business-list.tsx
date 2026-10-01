'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { BusinessWithDetails } from '@/lib/business-directory'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, ExternalLink, MapPin, UserRound } from 'lucide-react'
import Image from 'next/image'

const statusStyle: Record<string, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800',
  APPROVED: 'border-green-200 bg-green-50 text-green-800',
  CHANGES_REQUESTED: 'border-blue-200 bg-blue-50 text-blue-800',
  SUSPENDED: 'border-red-200 bg-red-50 text-red-800',
  DRAFT: 'border-gray-200 bg-gray-50 text-gray-700',
}

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

  return <Card>
    <CardHeader className="gap-4 border-b sm:flex-row sm:items-end sm:justify-between">
      <div><CardTitle>Business listings</CardTitle><CardDescription>Review submissions, request changes and choose featured businesses.</CardDescription></div>
      <label className="block min-w-48"><span className="mb-1.5 block text-sm font-medium">Listing status</span><select value={status} onChange={event => setStatus(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="PENDING">Pending review</option><option value="APPROVED">Approved</option><option value="CHANGES_REQUESTED">Changes requested</option><option value="SUSPENDED">Suspended</option><option value="ALL">All listings</option></select></label>
    </CardHeader>
    <CardContent className="pt-6">
      {error && <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
      {loading ? <div className="animate-pulse rounded-md bg-muted p-8 text-muted-foreground">Loading listings…</div> : !businesses.length ? <div className="rounded-md border border-dashed p-10 text-center"><Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" /><p className="font-medium">No listings in this status</p><p className="mt-1 text-sm text-muted-foreground">Choose another status to view more businesses.</p></div> : <div className="space-y-4">{businesses.map(business => <article key={business.id} className="rounded-lg border bg-card p-5 shadow-sm"><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="flex min-w-0 gap-4"><div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-md bg-sahakum-navy-50 p-2">{business.logoUrl ? <Image src={business.logoUrl} alt="" width={80} height={64} unoptimized className="max-h-12 max-w-full object-contain" /> : <Building2 className="h-8 w-8 text-sahakum-navy-500" />}</div><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold text-sahakum-navy-900">{business.name}</h3><Badge variant="outline" className={statusStyle[business.status]}>{business.status.replaceAll('_', ' ')}</Badge>{business.featured && <Badge className="bg-sahakum-gold-400 text-sahakum-navy-900 hover:bg-sahakum-gold-400">Featured</Badge>}</div><div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"><span className="flex items-center gap-1.5"><UserRound className="h-4 w-4" />{business.owner.firstName} {business.owner.lastName}</span><span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{business.city}, {business.country}</span><span>{business.category.nameEn}</span></div><p className="mt-3 max-w-3xl text-sm leading-6 text-foreground/80">{business.summary}</p><Button asChild variant="link" className="mt-2 h-auto p-0 text-sweden-blue-700"><Link href={`/${locale}/connections/${business.slug}`} target="_blank">Preview public page<ExternalLink className="ml-1.5 h-3.5 w-3.5" /></Link></Button></div></div><div className="rounded-md bg-muted/40 p-4"><label><span className="mb-2 block text-sm font-medium">Review note</span><textarea value={note[business.id] || ''} onChange={event => setNote(current => ({ ...current, [business.id]: event.target.value }))} placeholder="Add context for requested changes" className="mb-3 min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm" /></label><div className="flex flex-wrap gap-2">{business.status !== 'APPROVED' && <Button size="sm" className="bg-green-700 hover:bg-green-800" onClick={() => moderate(business.id, 'approve')}>Approve</Button>}<Button size="sm" variant="outline" onClick={() => moderate(business.id, 'request_changes')}>Request changes</Button><Button size="sm" variant="outline" onClick={() => moderate(business.id, 'suspend')}>Suspend</Button>{business.status === 'APPROVED' && <Button size="sm" variant="outline" onClick={() => moderate(business.id, business.featured ? 'unfeature' : 'feature')}>{business.featured ? 'Remove feature' : 'Feature'}</Button>}</div></div></div></article>)}</div>}
    </CardContent>
  </Card>
}
