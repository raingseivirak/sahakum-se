'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Eye, Save, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import type { BusinessWithDetails } from '@/lib/business-directory'
import { businessTagName, getBusinessTranslations, locationVisibilityLabel, serviceAreaLabel } from '@/lib/business-translations'

const SwedenEditor = dynamic(() => import('@/components/editor/sweden-editor').then(module => module.SwedenEditor), { ssr: false })

const initialForm = {
  name: '', summary: '', description: '', categoryId: '', tagIds: [] as string[], logoUrl: '',
  phone: '', email: '', website: '', facebookUrl: '', instagramUrl: '', address: '', city: '',
  region: '', postalCode: '', country: 'Sweden', serviceArea: 'LOCAL',
  locationVisibility: 'CITY_ONLY', displayOwnerName: false,
}

interface CategoryOption { id: string; nameEn: string; nameSv: string; nameKm: string }
interface TagOption { id: string; slug: string; name: string }
interface ErrorResponse { error?: string }
type FormState = typeof initialForm

export function BusinessForm({ locale, businessId }: { locale: string; businessId?: string }) {
  const text = getBusinessTranslations(locale)
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [tags, setTags] = useState<TagOption[]>([])
  const [loading, setLoading] = useState(Boolean(businessId))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [optionsResponse, businessResponse] = await Promise.all([
          fetch('/api/business-options'),
          businessId ? fetch(`/api/my/businesses/${businessId}`) : Promise.resolve(null),
        ])
        if (!optionsResponse.ok) throw new Error(text.categoriesLoadError)
        const options = await optionsResponse.json()
        setCategories(options.categories)
        setTags(options.tags)
        if (businessResponse) {
          const data = await businessResponse.json() as { business: BusinessWithDetails } & ErrorResponse
          if (!businessResponse.ok) throw new Error(locale === 'en' && data.error ? data.error : text.businessLoadError)
          const item = data.business
          setForm({
            name: item.name, summary: item.summary, description: item.description, categoryId: item.categoryId,
            tagIds: item.tags.map(assignment => assignment.tagId), logoUrl: item.logoUrl || '',
            phone: item.phone || '', email: item.email || '', website: item.website || '',
            facebookUrl: item.facebookUrl || '', instagramUrl: item.instagramUrl || '', address: item.address || '',
            city: item.city, region: item.region || '', postalCode: item.postalCode || '', country: item.country,
            serviceArea: item.serviceArea, locationVisibility: item.locationVisibility, displayOwnerName: item.displayOwnerName,
          })
        }
      } catch (reason: unknown) {
        setError(reason instanceof Error ? reason.message : text.formLoadError)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [businessId, locale, text.businessLoadError, text.categoriesLoadError, text.formLoadError])

  const update = <K extends keyof FormState,>(key: K, value: FormState[K]) => setForm(current => ({ ...current, [key]: value }))
  const toggleTag = (id: string) => update('tagIds', form.tagIds.includes(id) ? form.tagIds.filter(value => value !== id) : [...form.tagIds, id])

  async function save(action: 'save' | 'submit') {
    setSaving(true)
    setError('')
    try {
      const response = await fetch(businessId ? `/api/my/businesses/${businessId}` : '/api/my/businesses', {
        method: businessId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, action }),
      })
      const data = await response.json() as ErrorResponse
      if (!response.ok) throw new Error(locale === 'en' && data.error ? data.error : text.saveError)
      router.push(`/${locale}/my-account/connections`)
      router.refresh()
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : text.saveError)
    } finally {
      setSaving(false)
    }
  }

  async function uploadLogo(file?: File) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      const response = await fetch('/api/my/businesses/logo', { method: 'POST', body })
      const data = await response.json() as { url?: string; error?: string }
      if (!response.ok) throw new Error(locale === 'en' && data.error ? data.error : text.uploadError)
      if (!data.url) throw new Error(text.uploadMissing)
      update('logoUrl', data.url)
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : text.uploadError)
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="animate-pulse bg-white p-10">{text.loading}</div>

  const inputClass = "rounded-none border-sweden-neutral-300 focus-visible:ring-sweden-blue-500"
  return (
    <div className={locale === 'km' ? 'font-khmer' : 'font-sweden'}>
      {error && <div role="alert" className="mb-6 border-l-4 border-red-600 bg-red-50 p-4 text-red-800">{error}</div>}

      <div className="space-y-8">
        <section className="border border-sweden-neutral-200 bg-white p-6 md:p-8">
          <div className="mb-6 border-b border-sweden-neutral-200 pb-4">
            <p className="text-sm font-medium text-sweden-blue-600">1</p>
            <h2 className="text-2xl font-semibold text-sahakum-navy-900">{text.detailsSection}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2"><Label>{text.businessName} *</Label><Input className={inputClass} value={form.name} onChange={event => update('name', event.target.value)} maxLength={120} /></label>
            <label className="space-y-2 md:col-span-2"><Label>{text.shortSummary} *</Label><Textarea className={`${inputClass} min-h-24`} value={form.summary} onChange={event => update('summary', event.target.value)} maxLength={240} /><span className="text-xs text-gray-500">{form.summary.length}/240</span></label>
            <label className="space-y-2"><Label>{text.category} *</Label><select className="h-10 w-full rounded-none border border-sweden-neutral-300 bg-white px-3" value={form.categoryId} onChange={event => update('categoryId', event.target.value)}><option value="">{text.chooseCategory}</option>{categories.map(category => <option key={category.id} value={category.id}>{locale === 'sv' ? category.nameSv : locale === 'km' ? category.nameKm : category.nameEn}</option>)}</select></label>
            <div className="space-y-2"><Label>{text.businessLogo}</Label><Input type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} disabled={uploading} onChange={event => uploadLogo(event.target.files?.[0])} />{uploading && <p className="text-sm text-gray-600">{text.uploading}</p>}{form.logoUrl && <div className="flex items-center gap-3 bg-sahakum-navy-50 p-3"><Image src={form.logoUrl} alt={text.logoPreview} width={80} height={64} unoptimized className="h-16 w-20 object-contain" /><button type="button" className="text-sm text-red-700 underline" onClick={() => update('logoUrl', '')}>{text.remove}</button></div>}</div>
            <div className="space-y-2 md:col-span-2"><Label>{text.fullDescription} *</Label><SwedenEditor content={form.description} onChange={value => update('description', value)} language={(locale === 'sv' || locale === 'km') ? locale : 'en'} placeholder={text.descriptionPlaceholder} /></div>
          </div>
        </section>

        <section className="border border-sweden-neutral-200 bg-white p-6 md:p-8">
          <div className="mb-6 border-b border-sweden-neutral-200 pb-4"><p className="text-sm font-medium text-sweden-blue-600">2</p><h2 className="text-2xl font-semibold text-sahakum-navy-900">{text.tags}</h2><p className="mt-1 text-sm text-gray-600">{text.tagsHelp}</p></div>
          <div className="flex flex-wrap gap-3">{tags.map(tag => <label key={tag.id} className={`flex min-h-11 items-center gap-2 border px-4 py-2 ${form.tagIds.includes(tag.id) ? 'border-sweden-blue-600 bg-sweden-blue-50 text-sweden-blue-800' : 'border-sweden-neutral-300 bg-white'}`}><input type="checkbox" checked={form.tagIds.includes(tag.id)} disabled={!form.tagIds.includes(tag.id) && form.tagIds.length >= 8} onChange={() => toggleTag(tag.id)} />{businessTagName(tag, locale)}</label>)}</div>
        </section>

        <section className="border border-sweden-neutral-200 bg-white p-6 md:p-8">
          <div className="mb-6 border-b border-sweden-neutral-200 pb-4"><p className="text-sm font-medium text-sweden-blue-600">3</p><h2 className="text-2xl font-semibold text-sahakum-navy-900">{text.locationContact}</h2></div>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2"><Label>{text.city} *</Label><Input className={inputClass} value={form.city} onChange={event => update('city', event.target.value)} /></label>
            <label className="space-y-2"><Label>{text.country} *</Label><Input className={inputClass} value={form.country} onChange={event => update('country', event.target.value)} /></label>
            <label className="space-y-2"><Label>{text.streetAddress}</Label><Input className={inputClass} value={form.address} onChange={event => update('address', event.target.value)} /></label>
            <label className="space-y-2"><Label>{text.postalCode}</Label><Input className={inputClass} value={form.postalCode} onChange={event => update('postalCode', event.target.value)} /></label>
            <label className="space-y-2"><Label>{text.region}</Label><Input className={inputClass} value={form.region} onChange={event => update('region', event.target.value)} /></label>
            <label className="space-y-2"><Label>{text.serviceArea}</Label><select className="h-10 w-full rounded-none border border-sweden-neutral-300 bg-white px-3" value={form.serviceArea} onChange={event => update('serviceArea', event.target.value)}>{['LOCAL', 'NATIONWIDE', 'ONLINE', 'INTERNATIONAL'].map(area => <option key={area} value={area}>{serviceAreaLabel(area, locale)}</option>)}</select></label>
            <label className="space-y-2"><Label>{text.phone}</Label><Input className={inputClass} value={form.phone} onChange={event => update('phone', event.target.value)} /></label>
            <label className="space-y-2"><Label>{text.publicEmail}</Label><Input type="email" className={inputClass} value={form.email} onChange={event => update('email', event.target.value)} /></label>
            <label className="space-y-2"><Label>{text.website}</Label><Input className={inputClass} value={form.website} onChange={event => update('website', event.target.value)} placeholder="https://" /></label>
            <label className="space-y-2"><Label>Facebook</Label><Input className={inputClass} value={form.facebookUrl} onChange={event => update('facebookUrl', event.target.value)} placeholder="https://facebook.com/…" /></label>
            <label className="space-y-2"><Label>Instagram</Label><Input className={inputClass} value={form.instagramUrl} onChange={event => update('instagramUrl', event.target.value)} placeholder="https://instagram.com/…" /></label>
          </div>
        </section>

        <section className="border border-sweden-neutral-200 bg-white p-6 md:p-8">
          <div className="mb-6 border-b border-sweden-neutral-200 pb-4"><p className="text-sm font-medium text-sweden-blue-600">4</p><h2 className="text-2xl font-semibold text-sahakum-navy-900">{text.privacyPreview}</h2></div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <label className="space-y-2"><Label>{text.publicLocation}</Label><select className="h-10 w-full rounded-none border border-sweden-neutral-300 bg-white px-3" value={form.locationVisibility} onChange={event => update('locationVisibility', event.target.value)}>{['CITY_ONLY', 'EXACT', 'ONLINE_ONLY'].map(visibility => <option key={visibility} value={visibility}>{locationVisibilityLabel(visibility, locale)}</option>)}</select></label>
              <label className="flex min-h-11 items-center gap-3 border border-sweden-neutral-300 p-4"><input type="checkbox" checked={form.displayOwnerName} onChange={event => update('displayOwnerName', event.target.checked)} /><span><strong className="block">{text.showName}</strong><span className="text-sm text-gray-600">{text.showNameHelp}</span></span></label>
            </div>
            <div className="border border-sweden-neutral-200 bg-sahakum-navy-50 p-5">
              <p className="mb-4 flex items-center gap-2 text-sm font-medium text-sweden-blue-700"><Eye className="h-4 w-4" />{text.cardPreview}</p>
              <div className="bg-white p-5 shadow-sweden-sm">
                <div className="mb-4 flex h-24 items-center justify-center bg-sahakum-navy-800">{form.logoUrl ? <Image src={form.logoUrl} alt="" width={128} height={80} unoptimized className="max-h-20 max-w-full object-contain" /> : <Building2 className="h-12 w-12 text-sahakum-gold-300" />}</div>
                <h3 className="text-xl font-semibold text-sahakum-navy-900">{form.name || text.businessNameFallback}</h3>
                <p className="mt-2 text-sm text-gray-600">{form.summary || text.summaryFallback}</p>
                <p className="mt-4 text-sm text-sahakum-navy-700">{form.city || text.cityFallback}, {form.country}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 mt-8 flex flex-wrap justify-end gap-3 border-t border-sweden-neutral-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <Button variant="outline" className="rounded-none" disabled={saving} onClick={() => save('save')}><Save className="h-4 w-4" />{text.saveDraft}</Button>
        <Button className="rounded-none bg-sahakum-gold-500 text-sahakum-navy-900 hover:bg-sahakum-gold-600" disabled={saving} onClick={() => save('submit')}><Send className="h-4 w-4" />{text.submitReview}</Button>
      </div>
    </div>
  )
}
