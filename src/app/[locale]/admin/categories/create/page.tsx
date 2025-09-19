'use client'

import { useState } from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { useRouter } from "next/navigation"
import { useCategories } from "@/hooks/use-categories"

interface CreateCategoryProps {
  params: { locale: string }
}

export default function CreateCategory({ params }: CreateCategoryProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
  const { categories, createCategory, loading, error } = useCategories()

  const [formData, setFormData] = useState({
    slug: '',
    type: 'general',
    parentId: '',
    translations: {
      sv: { language: 'sv', name: '', description: '' },
      en: { language: 'en', name: '', description: '' },
      km: { language: 'km', name: '', description: '' },
    }
  })

  const [activeTab, setActiveTab] = useState('sv')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      const translations = Object.values(formData.translations).filter(t => t.name.trim() !== '')

      if (translations.length === 0) {
        alert('Please add at least one translation')
        return
      }

      if (!formData.slug.trim()) {
        alert('Please enter a slug')
        return
      }

      const categoryData = {
        slug: formData.slug,
        type: formData.type,
        parentId: formData.parentId || undefined,
        translations
      }

      await createCategory(categoryData)
      router.push(`/${params.locale}/admin/categories`)
    } catch (err) {
      console.error('Failed to create category:', err)
    } finally {
      setIsSaving(false)
    }
  }

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

    // Auto-generate slug from English name if slug is empty
    if (lang === 'en' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const languages = [
    { code: 'sv', name: 'Svenska', flag: '/media/images/sv_flag.png' },
    { code: 'en', name: 'English', flag: '/media/images/en_flag.png' },
    { code: 'km', name: 'ខ្មែរ', flag: '/media/images/km_flag.png' },
  ]

  const categoryTypes = [
    { value: 'general', label: 'General' },
    { value: 'event-type', label: 'Event Type' },
    { value: 'recipe-type', label: 'Recipe Type' },
  ]

  // Filter categories for parent selection (exclude same type to prevent issues)
  const parentCategories = categories.filter(cat => cat.type === formData.type)

  const getTranslation = (translations: any[], language: string) => {
    return translations.find(t => t.language === language)?.name ||
           translations.find(t => t.language === 'en')?.name ||
           translations[0]?.name || 'Untitled'
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
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>Create</BreadcrumbPage>
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
              Create New Category
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Create a new category to organize your content
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/categories`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Link>
            </Button>
            <Button
              className={fontClass}
              onClick={handleSubmit}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className={`text-destructive ${fontClass}`}>{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          {/* Main Content */}
          <div className="md:col-span-3 space-y-4">
            {/* Category Settings */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Category Settings</CardTitle>
                <CardDescription className={fontClass}>
                  Basic category configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slug" className={fontClass}>Category Slug</Label>
                    <Input
                      id="slug"
                      placeholder="category-url-slug"
                      className={fontClass}
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                    <p className="text-sm text-muted-foreground">
                      The URL slug for this category
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className={fontClass}>Category Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value, parentId: '' }))}>
                      <SelectTrigger className={fontClass}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className={`bg-white border border-input shadow-lg ${fontClass}`}>
                        {categoryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className={fontClass}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent" className={fontClass}>Parent Category (Optional)</Label>
                  <Select value={formData.parentId || "none"} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value === "none" ? "" : value }))}>
                    <SelectTrigger className={fontClass}>
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent className={`bg-white border border-input shadow-lg ${fontClass}`}>
                      <SelectItem value="none" className={fontClass}>None (Root Category)</SelectItem>
                      {parentCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className={fontClass}>
                          {getTranslation(category.translations, params.locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Create a hierarchical structure by selecting a parent category
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Multilingual Content */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                  <Globe className="h-5 w-5" />
                  Multilingual Content
                </CardTitle>
                <CardDescription className={fontClass}>
                  Add category names and descriptions for each language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    {languages.map((lang) => (
                      <TabsTrigger key={lang.code} value={lang.code} className={fontClass}>
                        <img src={lang.flag} alt={`${lang.name} flag`} className="mr-2 w-4 h-3 object-cover rounded-sm" />
                        {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {languages.map((lang) => (
                    <TabsContent key={lang.code} value={lang.code} className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${lang.code}`} className={fontClass}>
                            Category Name ({lang.name}) *
                          </Label>
                          <Input
                            id={`name-${lang.code}`}
                            placeholder={`Enter category name in ${lang.name}`}
                            className={lang.code === 'km' ? 'font-khmer' : fontClass}
                            value={formData.translations[lang.code as keyof typeof formData.translations]?.name || ''}
                            onChange={(e) => handleNameChange(lang.code, e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`description-${lang.code}`} className={fontClass}>
                            Description ({lang.name})
                          </Label>
                          <Textarea
                            id={`description-${lang.code}`}
                            placeholder={`Enter category description in ${lang.name}`}
                            className={lang.code === 'km' ? 'font-khmer' : fontClass}
                            value={formData.translations[lang.code as keyof typeof formData.translations]?.description || ''}
                            onChange={(e) => updateTranslation(lang.code, 'description', e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground">
                            Optional description for this category
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className={`w-full ${fontClass}`}
                  onClick={handleSubmit}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Creating...' : 'Create Category'}
                </Button>
              </CardContent>
            </Card>

            {/* Translation Progress */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Translation Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {languages.map((lang) => {
                  const translation = formData.translations[lang.code as keyof typeof formData.translations]
                  const hasContent = translation?.name?.trim()
                  return (
                    <div key={lang.code} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span className={`text-sm ${fontClass}`}>{lang.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${hasContent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {hasContent ? 'Complete' : 'Empty'}
                      </span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Category Hierarchy Preview */}
            {formData.parentId && (
              <Card>
                <CardHeader>
                  <CardTitle className={fontClass}>Hierarchy Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      <span className={fontClass}>
                        {parentCategories.find(c => c.id === formData.parentId)?.translations.find(t => t.language === params.locale)?.name || 'Parent'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <span className={`text-muted-foreground ${fontClass}`}>
                        {formData.translations[params.locale as keyof typeof formData.translations]?.name || 'New Category'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}