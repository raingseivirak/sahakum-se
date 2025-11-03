'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  FolderOpen,
  Save,
  ArrowLeft,
  Globe,
} from "lucide-react"
import Link from "next/link"

interface CategoryEditPageProps {
  params: { locale: string; id: string }
}

interface CategoryTranslation {
  id?: string
  language: string
  name: string
  description?: string
}

interface Category {
  id: string
  slug: string
  type: string
  parentId?: string
  translations: CategoryTranslation[]
  parent?: {
    id: string
    translations: CategoryTranslation[]
  }
}

export default function CategoryEditPage({ params }: CategoryEditPageProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('sv')

  const [formData, setFormData] = useState({
    slug: '',
    type: '',
    parentId: '',
    translations: {
      sv: { language: 'sv', name: '', description: '' },
      en: { language: 'en', name: '', description: '' },
      km: { language: 'km', name: '', description: '' },
    }
  })

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch category')
      }
      const data = await response.json()
      setCategory(data)

      // Populate form data
      const translationsMap: any = {
        sv: { language: 'sv', name: '', description: '' },
        en: { language: 'en', name: '', description: '' },
        km: { language: 'km', name: '', description: '' },
      }

      data.translations.forEach((t: CategoryTranslation) => {
        if (translationsMap[t.language]) {
          translationsMap[t.language] = {
            id: t.id,
            language: t.language,
            name: t.name,
            description: t.description || '',
          }
        }
      })

      setFormData({
        slug: data.slug,
        type: data.type,
        parentId: data.parentId || '',
        translations: translationsMap
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      const data = await response.json()
      // Filter out current category and its children to prevent circular references
      setCategories(data.filter((cat: Category) => cat.id !== params.id && cat.parentId !== params.id))
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchCategory(), fetchCategories()])
      setLoading(false)
    }
    loadData()
  }, [params.id])

  const updateTranslation = (lang: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang as keyof typeof prev.translations],
          [field]: value
        }
      }
    }))
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (lang: string, value: string) => {
    updateTranslation(lang, 'name', value)

    // Auto-generate slug from English name if slug hasn't been manually changed
    if (lang === 'en' && formData.slug === generateSlug(formData.translations.en.name)) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const translations = Object.values(formData.translations).filter(t => t.name.trim() !== '')

      if (translations.length === 0) {
        setError('Please add at least one translation')
        return
      }

      if (!formData.slug.trim()) {
        setError('Please enter a slug')
        return
      }

      const response = await fetch(`/api/categories/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: formData.slug,
          type: formData.type,
          parentId: formData.parentId || null,
          translations
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update category')
      }

      router.push(`/${params.locale}/admin/categories`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  const getTranslation = (translations: CategoryTranslation[], language: string) => {
    return translations.find(t => t.language === language)?.name ||
           translations.find(t => t.language === 'en')?.name ||
           translations[0]?.name || 'Untitled'
  }

  const categoryTypes = [
    { value: 'general', label: 'General' },
    { value: 'event-type', label: 'Event Type' },
    { value: 'recipe-type', label: 'Recipe Type' },
  ]

  const languages = [
    { code: 'sv', name: 'Svenska' },
    { code: 'en', name: 'English' },
    { code: 'km', name: 'ខ្មែរ' },
  ]

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${fontClass}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sahakum-navy mx-auto mb-4"></div>
          <p>Loading category...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${fontClass}`}>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${params.locale}/admin`} className={fontClass}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${params.locale}/admin/categories`} className={fontClass}>
                  Categories
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>Edit Category</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className={`text-3xl font-bold tracking-tight text-sahakum-navy ${fontClass}`}>
              Edit Category
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Update category information and translations
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/categories`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Link>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
              <FolderOpen className="h-5 w-5" />
              Category Information
            </CardTitle>
            <CardDescription className={fontClass}>
              Update the category details and multilingual content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category-slug" className={fontClass}>Category Slug</Label>
                <Input
                  id="category-slug"
                  placeholder="category-url-slug"
                  className={fontClass}
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-type" className={fontClass}>Category Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className={fontClass}>
                    <SelectValue placeholder="Select category type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent-category" className={fontClass}>Parent Category (Optional)</Label>
              <Select value={formData.parentId || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value === "none" ? "" : value }))}>
                <SelectTrigger className={fontClass}>
                  <SelectValue placeholder="Select parent category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent (Top level)</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {getTranslation(category.translations, params.locale)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Multilingual Content */}
            <div className="space-y-2">
              <Label className={fontClass}>Category Names & Descriptions</Label>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg h-auto">
                  {languages.map((lang) => (
                    <TabsTrigger
                      key={lang.code}
                      value={lang.code}
                      className={`${lang.code === 'km' ? 'font-khmer' : fontClass} data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3`}
                    >
                      {lang.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {languages.map((lang) => (
                  <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                    <div className="space-y-2">
                      <Label className={fontClass}>Name in {lang.name}</Label>
                      <Input
                        placeholder={`Enter category name in ${lang.name}`}
                        className={lang.code === 'km' ? 'font-khmer' : fontClass}
                        value={formData.translations[lang.code as keyof typeof formData.translations]?.name || ''}
                        onChange={(e) => handleNameChange(lang.code, e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={fontClass}>Description in {lang.name}</Label>
                      <Textarea
                        placeholder={`Enter category description in ${lang.name}`}
                        className={lang.code === 'km' ? 'font-khmer' : fontClass}
                        value={formData.translations[lang.code as keyof typeof formData.translations]?.description || ''}
                        onChange={(e) => updateTranslation(lang.code, 'description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving} className={`bg-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/90 text-white ${fontClass}`}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}