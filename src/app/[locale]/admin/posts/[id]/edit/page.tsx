'use client'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Newspaper,
  Save,
  Eye,
  ArrowLeft,
  Globe,
  Calendar,
  Tag,
  User,
  Search,
  X,
} from "lucide-react"
import Link from "next/link"
import { SwedenEditor } from "@/components/editor/sweden-editor"
import { MediaSelector } from "@/components/ui/media-selector"
import { ContentActivityLog } from "@/components/admin/content-activity-log"
import { usePosts } from "@/hooks/use-posts"
import { useCategories } from "@/hooks/use-categories"
import { useTags } from "@/hooks/use-tags"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"

interface EditPostProps {
  params: { locale: string; id: string }
}

export default function EditPost({ params }: EditPostProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
  const { updatePost, loading, error } = usePosts()
  const { categories, loading: categoriesLoading } = useCategories()
  const { tags, loading: tagsLoading } = useTags()

  const [formData, setFormData] = useState({
    slug: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    publishedAt: '',
    featuredImg: '',
    categoryIds: [] as string[],
    tagIds: [] as string[],
    translations: {
      sv: { language: 'sv', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
      en: { language: 'en', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
      km: { language: 'km', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
    }
  })

  const [activeTab, setActiveTab] = useState('sv')
  const [isSaving, setIsSaving] = useState(false)
  const [postLoading, setPostLoading] = useState(true)
  const [tagSearch, setTagSearch] = useState('')

  // Load post data
  useEffect(() => {
    if (!params.id) return

    let isMounted = true

    const loadPost = async () => {
      try {
        setPostLoading(true)
        const response = await fetch(`/api/posts/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch post')
        }
        const post = await response.json()

        if (post && isMounted) {
          // Initialize translations object
          const translations = {
            sv: { language: 'sv', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
            en: { language: 'en', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
            km: { language: 'km', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
          }

          // Populate with existing translations
          post.translations?.forEach((translation: any) => {
            if (translations[translation.language as keyof typeof translations]) {
              translations[translation.language as keyof typeof translations] = {
                language: translation.language,
                title: translation.title || '',
                content: translation.content || '',
                excerpt: translation.excerpt || '',
                metaDescription: translation.metaDescription || '',
                seoTitle: translation.seoTitle || '',
              }
            }
          })

          // Extract category and tag IDs
          const categoryIds = post.categories?.map((cat: any) => cat.category.id) || []
          const tagIds = post.tags?.map((tag: any) => tag.tag.id) || []

          setFormData({
            slug: post.slug || '',
            status: post.status || 'DRAFT',
            publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : '',
            featuredImg: post.featuredImg || '',
            categoryIds,
            tagIds,
            translations
          })
        }
      } catch (err) {
        console.error('Failed to load post:', err)
      } finally {
        if (isMounted) {
          setPostLoading(false)
        }
      }
    }

    loadPost()

    return () => {
      isMounted = false
    }
  }, [params.id])

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      const translations = Object.values(formData.translations).filter(t => t.title.trim() !== '')

      if (translations.length === 0) {
        alert('Please add at least one translation')
        return
      }

      if (!formData.slug.trim()) {
        alert('Please enter a slug')
        return
      }

      const postData = {
        slug: formData.slug,
        status: formData.status,
        publishedAt: formData.publishedAt || undefined,
        featuredImg: formData.featuredImg || undefined,
        categoryIds: formData.categoryIds,
        tagIds: formData.tagIds,
        translations
      }

      await updatePost(params.id, postData)
      router.push(`/${params.locale}/admin/posts`)
    } catch (err) {
      console.error('Failed to update post:', err)
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

  const handlePreview = () => {
    if (formData.slug && params.id) {
      // Open preview in new tab with the post ID as preview parameter
      const previewUrl = `/${params.locale}/blog/${encodeURIComponent(formData.slug)}?preview=${params.id}`
      window.open(previewUrl, '_blank')
    }
  }

  const languages = [
    { code: 'sv', name: 'Svenska', flag: '/media/images/sv_flag.png' },
    { code: 'en', name: 'English', flag: '/media/images/en_flag.png' },
    { code: 'km', name: 'ខ្មែរ', flag: '/media/images/km_flag.png' },
  ]

  // Helper function to get category name in current locale
  const getCategoryName = (category: any, locale: string) => {
    const translation = category.translations.find((t: any) => t.language === locale)
    return translation?.name || category.slug
  }

  // Helper function to get tag name in current locale
  const getTagName = (tag: any, locale: string) => {
    const translation = tag.translations.find((t: any) => t.language === locale)
    return translation?.name || tag.slug
  }

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return tags
    return tags.filter(tag =>
      getTagName(tag, params.locale).toLowerCase().includes(tagSearch.toLowerCase()) ||
      tag.slug.toLowerCase().includes(tagSearch.toLowerCase())
    )
  }, [tags, tagSearch, params.locale])

  // Helper to toggle tag selection
  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }))
  }

  if (postLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${fontClass}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sahakum-navy mx-auto mb-4"></div>
          <p>Loading post...</p>
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
                <BreadcrumbLink href={`/${params.locale}/admin/posts`} className={fontClass}>
                  Posts
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>Edit</BreadcrumbPage>
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
              Edit Post
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Update blog post with multilingual content
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/posts`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Posts
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {/* Main Content */}
          <div className="md:col-span-3 space-y-4">
            {/* Post Settings */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Post Settings</CardTitle>
                <CardDescription className={fontClass}>
                  Basic post configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slug" className={fontClass}>Post Slug</Label>
                    <Input
                      id="slug"
                      placeholder="post-url-slug"
                      className={fontClass}
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                    <p className="text-sm text-muted-foreground">
                      The URL slug for this post
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className={fontClass}>Status</Label>
                    <Select value={formData.status.toLowerCase()} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value.toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }))}>
                      <SelectTrigger className={fontClass}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className={`bg-white border border-input shadow-lg ${fontClass}`}>
                        <SelectItem value="draft" className={fontClass}>Draft</SelectItem>
                        <SelectItem value="published" className={fontClass}>Published</SelectItem>
                        <SelectItem value="archived" className={fontClass}>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="publish-date" className={fontClass}>Publish Date</Label>
                  <Input
                    id="publish-date"
                    type="datetime-local"
                    className={fontClass}
                    value={formData.publishedAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to publish immediately
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
                  Update content for each language
                </CardDescription>
              </CardHeader>
              <CardContent>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg h-auto">
                    {languages.map((lang) => {
                      const translation = formData.translations[lang.code as keyof typeof formData.translations]
                      const hasContent = translation?.title?.trim() || translation?.content?.trim()
                      const isActive = activeTab === lang.code

                      return (
                        <TabsTrigger
                          key={lang.code}
                          value={lang.code}
                          className={`${fontClass} flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-3`}
                        >
                          <img
                            src={lang.flag}
                            alt={`${lang.name} flag`}
                            className="w-4 h-3 object-cover rounded-sm"
                          />
                          <span className="font-medium">{lang.name}</span>
                          {hasContent && isActive && (
                            <div className="w-2 h-2 bg-[var(--sahakum-gold)] rounded-full"></div>
                          )}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  {languages.map((lang) => {
                    const translation = formData.translations[lang.code as keyof typeof formData.translations]
                    const hasContent = translation?.title?.trim() || translation?.content?.trim()

                    return (
                      <TabsContent
                        key={lang.code}
                        value={lang.code}
                        className="space-y-4 mt-4"
                      >

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor={`title-${lang.code}`} className={fontClass}>
                              Title ({lang.name})
                            </Label>
                            <Input
                              id={`title-${lang.code}`}
                              placeholder={`Enter title in ${lang.name}`}
                              className={lang.code === 'km' ? 'font-khmer' : fontClass}
                              value={formData.translations[lang.code as keyof typeof formData.translations]?.title || ''}
                              onChange={(e) => updateTranslation(lang.code, 'title', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`excerpt-${lang.code}`} className={fontClass}>
                              Excerpt ({lang.name})
                            </Label>
                            <Textarea
                              id={`excerpt-${lang.code}`}
                              placeholder={`Enter post excerpt in ${lang.name}`}
                              className={lang.code === 'km' ? 'font-khmer' : fontClass}
                              value={formData.translations[lang.code as keyof typeof formData.translations]?.excerpt || ''}
                              onChange={(e) => updateTranslation(lang.code, 'excerpt', e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">
                              Brief summary for previews and SEO
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`content-${lang.code}`} className={fontClass}>
                              Content ({lang.name})
                            </Label>
                            <SwedenEditor
                              content={formData.translations[lang.code as keyof typeof formData.translations]?.content || ''}
                              onChange={(content) => updateTranslation(lang.code, 'content', content)}
                              language={lang.code as 'sv' | 'en' | 'km'}
                              placeholder={`Enter post content in ${lang.name}`}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    )
                  })}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publish Options */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${fontClass}`}>Status:</span>
                  <Badge variant={formData.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {formData.status === 'DRAFT' ? 'Draft' : formData.status === 'PUBLISHED' ? 'Published' : 'Archived'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${fontClass}`}>Visibility:</span>
                  <span className={`text-sm text-muted-foreground ${fontClass}`}>Public</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${fontClass}`}>Author:</span>
                  <span className={`text-sm text-muted-foreground ${fontClass}`}>Admin</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button
                    className={`w-full bg-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/90 text-white ${fontClass}`}
                    onClick={handleSubmit}
                    disabled={isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Update Post'}
                  </Button>
                  <Button variant="outline" className={`w-full ${fontClass}`} onClick={handlePreview}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Categories & Tags */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className={fontClass}>Categories</Label>
                  <Select
                    value={formData.categoryIds[0] || ""}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoryIds: value ? [value] : [] }))}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger className={fontClass}>
                      <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent className={`bg-white border border-input shadow-lg ${fontClass}`}>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className={fontClass}>
                          {getCategoryName(category, params.locale)} ({category.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {categories.length} categories available
                  </p>
                </div>
                <div className="space-y-3">
                  <Label className={fontClass}>Tags</Label>
                  {tagsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading tags...</div>
                  ) : (
                    <div className="space-y-3">
                      {/* Selected Tags Display */}
                      {formData.tagIds.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs text-muted-foreground">Selected tags:</div>
                          <div className="flex flex-wrap gap-1">
                            {formData.tagIds.map((tagId) => {
                              const tag = tags.find(t => t.id === tagId)
                              if (!tag) return null
                              return (
                                <Badge
                                  key={tagId}
                                  variant="default"
                                  className="flex items-center gap-1 cursor-pointer hover:bg-sahakum-navy/80"
                                  onClick={() => toggleTag(tagId)}
                                >
                                  {getTagName(tag, params.locale)}
                                  <X className="h-3 w-3" />
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Search Input */}
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search tags..."
                          className={`pl-8 ${fontClass}`}
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                        />
                      </div>

                      {/* Available Tags */}
                      <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                        {filteredTags.length === 0 ? (
                          <div className="text-sm text-muted-foreground text-center py-2">
                            {tagSearch ? 'No tags found' : 'No tags available'}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {filteredTags.map((tag) => {
                              const isSelected = formData.tagIds.includes(tag.id)
                              return (
                                <Badge
                                  key={tag.id}
                                  variant={isSelected ? "default" : "outline"}
                                  className={`cursor-pointer hover:bg-sahakum-navy/10 transition-colors ${fontClass} ${
                                    isSelected ? 'bg-sahakum-navy hover:bg-sahakum-navy/80' : ''
                                  }`}
                                  onClick={() => toggleTag(tag.id)}
                                >
                                  {getTagName(tag, params.locale)}
                                </Badge>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {formData.tagIds.length} selected • {filteredTags.length} available
                        {tagSearch && ` • filtering "${tagSearch}"`}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Language Progress */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Translation Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {languages.map((lang) => {
                  const translation = formData.translations[lang.code as keyof typeof formData.translations]
                  const hasContent = translation?.title?.trim() || translation?.content?.trim()
                  return (
                    <div key={lang.code} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={lang.flag} alt={`${lang.name} flag`} className="w-4 h-3 object-cover rounded-sm" />
                        <span className={`text-sm ${fontClass}`}>{lang.name}</span>
                      </div>
                      <Badge variant={hasContent ? "default" : "outline"} className="text-xs">
                        {hasContent ? "Complete" : "Not started"}
                      </Badge>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <MediaSelector
                  value={formData.featuredImg}
                  onSelect={(url) => setFormData(prev => ({ ...prev, featuredImg: url }))}
                  placeholder="Select featured image"
                  buttonText="Browse Images"
                  accept="images"
                  className={fontClass}
                />
                <p className="text-sm text-muted-foreground">
                  Recommended size: 1200x630px
                </p>
              </CardContent>
            </Card>

            {/* Activity Log */}
            <ContentActivityLog
              resourceType="POST"
              resourceId={params.id}
              title={formData.translations.en?.title || formData.translations.sv?.title || formData.translations.km?.title}
              className={fontClass}
            />
          </div>
        </div>
      </div>
    </div>
  )
}