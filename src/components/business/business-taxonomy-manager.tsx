'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Category { id: string; nameEn: string; nameSv: string; nameKm: string; active: boolean }
interface Tag { id: string; name: string }

export function BusinessTaxonomyManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [category, setCategory] = useState({ nameEn: '', nameSv: '', nameKm: '' })
  const [tag, setTag] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/business-options')
    const data = await response.json() as { categories: Category[]; tags: Tag[]; error?: string }
    if (!response.ok) return setError(data.error || 'Could not load categories and tags')
    setCategories(data.categories)
    setTags(data.tags)
  }, [])
  useEffect(() => { load() }, [load])

  async function create(payload: object) {
    setError('')
    const response = await fetch('/api/admin/business-options', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await response.json() as { error?: string }
    if (!response.ok) return setError(data.error || 'Could not create option')
    setCategory({ nameEn: '', nameSv: '', nameKm: '' })
    setTag('')
    load()
  }

  async function toggleCategory(item: Category) {
    const response = await fetch(`/api/admin/business-options/category/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !item.active }) })
    if (!response.ok) { const data = await response.json() as { error?: string }; return setError(data.error || 'Could not update category') }
    load()
  }

  async function deleteTag(item: Tag) {
    const response = await fetch(`/api/admin/business-options/tag/${item.id}`, { method: 'DELETE' })
    if (!response.ok) { const data = await response.json() as { error?: string }; return setError(data.error || 'Could not delete tag') }
    load()
  }

  return <section className="mt-10 border-t border-sweden-neutral-300 pt-8 font-sweden"><h2 className="text-2xl font-semibold text-sahakum-navy-900">Categories and tags</h2><p className="mt-1 text-gray-600">Control the choices members use when registering a business.</p>{error && <div className="mt-5 border-l-4 border-red-600 bg-red-50 p-4 text-red-800">{error}</div>}<div className="mt-6 grid gap-8 lg:grid-cols-2"><div className="border border-sweden-neutral-200 bg-white p-6"><h3 className="mb-4 text-lg font-semibold">Categories</h3><div className="grid gap-3"><Input className="rounded-none" placeholder="English name" value={category.nameEn} onChange={event => setCategory(current => ({ ...current, nameEn: event.target.value }))} /><Input className="rounded-none" placeholder="Swedish name" value={category.nameSv} onChange={event => setCategory(current => ({ ...current, nameSv: event.target.value }))} /><Input className="rounded-none" placeholder="Khmer name" value={category.nameKm} onChange={event => setCategory(current => ({ ...current, nameKm: event.target.value }))} /><Button className="rounded-none" onClick={() => create({ type: 'category', ...category })}>Add category</Button></div><div className="mt-5 divide-y divide-sweden-neutral-200">{categories.map(item => <div key={item.id} className="flex items-center justify-between gap-3 py-3"><span>{item.nameEn} {!item.active && <small className="text-gray-500">(hidden)</small>}</span><Button size="sm" variant="ghost" onClick={() => toggleCategory(item)}>{item.active ? 'Hide' : 'Activate'}</Button></div>)}</div></div><div className="border border-sweden-neutral-200 bg-white p-6"><h3 className="mb-4 text-lg font-semibold">Tags</h3><div className="flex gap-2"><Input className="rounded-none" placeholder="Tag name" value={tag} onChange={event => setTag(event.target.value)} /><Button className="rounded-none" onClick={() => create({ type: 'tag', name: tag })}>Add</Button></div><div className="mt-5 flex flex-wrap gap-2">{tags.map(item => <span key={item.id} className="inline-flex items-center gap-2 bg-sahakum-navy-50 px-3 py-2 text-sm">{item.name}<button type="button" aria-label={`Delete ${item.name}`} className="text-red-700" onClick={() => deleteTag(item)}>×</button></span>)}</div></div></div></section>
}
