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
} from "lucide-react"
import Link from "next/link"
import { SwedenEditor } from "@/components/editor/sweden-editor"
import { MediaSelector } from "@/components/ui/media-selector"
import { usePosts } from "@/hooks/use-posts"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface EditPostProps {
  params: { locale: string; id: string }
}

export default function EditPost({ params }: EditPostProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
  const { getPost, updatePost, loading, error } = usePosts()

  const [formData, setFormData] = useState({
    slug: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    publishedAt: '',
    featuredImg: '',
    translations: {
      sv: { language: 'sv', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
      en: { language: 'en', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
      km: { language: 'km', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
    }
  })

  const [activeTab, setActiveTab] = useState('sv')
  const [isSaving, setIsSaving] = useState(false)
  const [postLoading, setPostLoading] = useState(true)

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

          setFormData({
            slug: post.slug || '',
            status: post.status || 'DRAFT',
            publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : '',
            featuredImg: post.featuredImg || '',
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
    if (post) {
      // Open preview in new tab with the post ID as preview parameter
      const previewUrl = `/${params.locale}/blog/${encodeURIComponent(post.slug)}?preview=${post.id}`
      window.open(previewUrl, '_blank')
    }
  }

  const languages = [
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
  ]

  const categories = [
    'Community',
    'Culture',
    'Education',
    'Events',
    'Food',
    'Integration',
    'News',
    'Projects',
  ]

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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className={fontClass} disabled={isSaving} type="button">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className={fontClass}>Post Preview</DialogTitle>
                  <DialogDescription className={fontClass}>
                    This is how your blog post will look when published
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <Tabs defaultValue="sv" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      {languages.map((lang) => (
                        <TabsTrigger key={lang.code} value={lang.code} className={fontClass}>
                          <span className="mr-2">{lang.flag}</span>
                          {lang.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {languages.map((lang) => {
                      const translation = formData.translations[lang.code as keyof typeof formData.translations]
                      return (
                        <TabsContent key={lang.code} value={lang.code} className="mt-4">
                          <div className={`prose prose-sweden prose-lg max-w-none ${lang.code === 'km' ? 'font-khmer' : fontClass}`}>
                            <h1 className={`text-3xl font-bold mb-4 ${lang.code === 'km' ? 'font-khmer' : fontClass}`}>
                              {translation?.title || `No title in ${lang.name}`}
                            </h1>
                            {translation?.excerpt && (
                              <p className={`text-xl text-gray-600 mb-6 ${lang.code === 'km' ? 'font-khmer' : fontClass}`}>
                                {translation.excerpt}
                              </p>
                            )}
                            <div
                              className={`prose prose-sweden prose-lg max-w-none ${lang.code === 'km' ? 'font-khmer' : fontClass}`}
                              dangerouslySetInnerHTML={{ __html: translation?.content || `<p>No content in ${lang.name}</p>` }}
                            />
                          </div>
                        </TabsContent>
                      )
                    })}
                  </Tabs>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              className={fontClass}
              onClick={handleSubmit}
              disabled={isSaving}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Update Post'}
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category" className={fontClass}>Category</Label>
                    <Select>
                      <SelectTrigger className={fontClass}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className={`bg-white border border-input shadow-lg ${fontClass}`}>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()} className={fontClass}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags" className={fontClass}>Tags</Label>
                    <Input
                      id="tags"
                      placeholder="tag1, tag2, tag3"
                      className={fontClass}
                    />
                    <p className="text-sm text-muted-foreground">
                      Separate tags with commas
                    </p>
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
                  <TabsList className="grid w-full grid-cols-3">
                    {languages.map((lang) => (
                      <TabsTrigger key={lang.code} value={lang.code} className={fontClass}>
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {languages.map((lang) => (
                    <TabsContent key={lang.code} value={lang.code} className="space-y-4">
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
                  ))}
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
                    className={`w-full ${fontClass}`}
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
                  <Label className={fontClass}>Category</Label>
                  <Select>
                    <SelectTrigger className={fontClass}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className={`bg-white border border-input shadow-lg ${fontClass}`}>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()} className={fontClass}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className={fontClass}>Popular Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {['community', 'culture', 'integration', 'food', 'education'].map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        <Tag className="w-2 h-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
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
                        <span>{lang.flag}</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}