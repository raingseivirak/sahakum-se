'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Languages, Plus, Tags, X } from 'lucide-react'

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

  return <section className="space-y-4 font-sweden">
    <div><h2 className="text-2xl font-semibold text-sahakum-navy-900">Directory options</h2><p className="text-sm text-muted-foreground">Control the categories and discovery tags available to members.</p></div>
    {error && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader><div className="flex items-center gap-2"><Languages className="h-5 w-5 text-sweden-blue-700" /><CardTitle>Categories</CardTitle></div><CardDescription>Each category has a public name in English, Swedish and Khmer.</CardDescription></CardHeader>
        <CardContent>
          <div className="grid gap-3 rounded-md border bg-muted/30 p-4"><Input placeholder="English name" value={category.nameEn} onChange={event => setCategory(current => ({ ...current, nameEn: event.target.value }))} /><Input placeholder="Swedish name" value={category.nameSv} onChange={event => setCategory(current => ({ ...current, nameSv: event.target.value }))} /><Input placeholder="Khmer name" value={category.nameKm} onChange={event => setCategory(current => ({ ...current, nameKm: event.target.value }))} /><Button className="justify-self-start" onClick={() => create({ type: 'category', ...category })}><Plus className="mr-2 h-4 w-4" />Add category</Button></div>
          <div className="mt-5 divide-y rounded-md border">{categories.map(item => <div key={item.id} className="flex items-center justify-between gap-3 px-4 py-3"><div><div className="flex items-center gap-2 font-medium">{item.nameEn}{!item.active && <Badge variant="secondary">Hidden</Badge>}</div><p className="mt-0.5 text-xs text-muted-foreground">{item.nameSv} · {item.nameKm}</p></div><Button size="sm" variant="ghost" onClick={() => toggleCategory(item)}>{item.active ? 'Hide' : 'Activate'}</Button></div>)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div className="flex items-center gap-2"><Tags className="h-5 w-5 text-sweden-blue-700" /><CardTitle>Tags</CardTitle></div><CardDescription>Tags help visitors discover services by language and availability.</CardDescription></CardHeader>
        <CardContent><div className="flex gap-2 rounded-md border bg-muted/30 p-4"><Input placeholder="Tag name" value={tag} onChange={event => setTag(event.target.value)} /><Button onClick={() => create({ type: 'tag', name: tag })}><Plus className="mr-2 h-4 w-4" />Add</Button></div><div className="mt-5 flex flex-wrap gap-2">{tags.map(item => <Badge key={item.id} variant="secondary" className="gap-1.5 px-3 py-2 text-sm font-normal">{item.name}<button type="button" aria-label={`Delete ${item.name}`} className="rounded-sm text-muted-foreground hover:text-red-700" onClick={() => deleteTag(item)}><X className="h-3.5 w-3.5" /></button></Badge>)}</div></CardContent>
      </Card>
    </div>
  </section>
}
