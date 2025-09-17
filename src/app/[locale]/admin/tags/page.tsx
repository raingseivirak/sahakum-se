'use client'

import { useState, useEffect } from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tags,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Save,
  Globe,
} from "lucide-react"

interface TagsPageProps {
  params: { locale: string }
}

interface TagTranslation {
  id: string
  language: string
  name: string
}

interface Tag {
  id: string
  slug: string
  translations: TagTranslation[]
  _count?: {
    content: number
  }
}

export default function TagsPage({ params }: TagsPageProps) {
  const fontClass = 'font-sweden'
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  const [formData, setFormData] = useState({
    slug: '',
    translations: {
      sv: { language: 'sv', name: '' },
      en: { language: 'en', name: '' },
      km: { language: 'km', name: '' },
    }
  })

  const [activeTab, setActiveTab] = useState('sv')

  const fetchTags = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/tags')
      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }
      const data = await response.json()
      setTags(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createTag = async () => {
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

      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: formData.slug,
          translations
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create tag')
      }

      const newTag = await response.json()
      setTags(prev => [...prev, newTag])
      setIsCreateDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error('Failed to create tag:', err)
      alert(err instanceof Error ? err.message : 'Failed to create tag')
    }
  }

  const updateTag = async () => {
    if (!editingTag) return

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

      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: formData.slug,
          translations
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update tag')
      }

      const updatedTag = await response.json()
      setTags(prev => prev.map(tag => tag.id === editingTag.id ? updatedTag : tag))
      setIsEditDialogOpen(false)
      setEditingTag(null)
      resetForm()
    } catch (err) {
      console.error('Failed to update tag:', err)
      alert(err instanceof Error ? err.message : 'Failed to update tag')
    }
  }

  const deleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete tag')
      }

      setTags(prev => prev.filter(tag => tag.id !== id))
    } catch (err) {
      console.error('Failed to delete tag:', err)
      alert(err instanceof Error ? err.message : 'Failed to delete tag')
    }
  }

  const resetForm = () => {
    setFormData({
      slug: '',
      translations: {
        sv: { language: 'sv', name: '' },
        en: { language: 'en', name: '' },
        km: { language: 'km', name: '' },
      }
    })
    setActiveTab('sv')
  }

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag)

    // Populate form with tag data
    const translationsMap: any = {
      sv: { language: 'sv', name: '' },
      en: { language: 'en', name: '' },
      km: { language: 'km', name: '' },
    }

    tag.translations.forEach((t: TagTranslation) => {
      if (translationsMap[t.language]) {
        translationsMap[t.language] = {
          language: t.language,
          name: t.name,
        }
      }
    })

    setFormData({
      slug: tag.slug,
      translations: translationsMap
    })

    setIsEditDialogOpen(true)
  }

  const updateTranslation = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang as keyof typeof prev.translations],
          name: value
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
    updateTranslation(lang, value)

    // Auto-generate slug from English name if slug is empty
    if (lang === 'en' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const getTranslation = (translations: TagTranslation[], language: string) => {
    return translations.find(t => t.language === language)?.name ||
           translations.find(t => t.language === 'en')?.name ||
           translations[0]?.name || 'Untitled'
  }

  const languages = [
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
  ]

  const filteredTags = tags.filter(tag =>
    searchTerm === '' ||
    tag.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.translations.some(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  useEffect(() => {
    fetchTags()
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${fontClass}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sahakum-navy mx-auto mb-4"></div>
          <p>Loading tags...</p>
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
                <BreadcrumbPage className={fontClass}>Tags</BreadcrumbPage>
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
              Tags
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Manage content tags for better organization and discovery
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className={fontClass}>
                <Plus className="mr-2 h-4 w-4" />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className={fontClass}>Create New Tag</DialogTitle>
                <DialogDescription className={fontClass}>
                  Add a new tag with multilingual support
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-slug" className={fontClass}>Tag Slug</Label>
                  <Input
                    id="tag-slug"
                    placeholder="tag-url-slug"
                    className={fontClass}
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={fontClass}>Tag Names</Label>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      {languages.map((lang) => (
                        <TabsTrigger key={lang.code} value={lang.code} className={fontClass}>
                          <span className="mr-2">{lang.flag}</span>
                          {lang.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {languages.map((lang) => (
                      <TabsContent key={lang.code} value={lang.code}>
                        <Input
                          placeholder={`Enter tag name in ${lang.name}`}
                          className={lang.code === 'km' ? 'font-khmer' : fontClass}
                          value={formData.translations[lang.code as keyof typeof formData.translations]?.name || ''}
                          onChange={(e) => handleNameChange(lang.code, e.target.value)}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className={fontClass}>
                  Cancel
                </Button>
                <Button onClick={createTag} className={fontClass}>
                  <Save className="mr-2 h-4 w-4" />
                  Create Tag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Tag Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) {
              setEditingTag(null)
              resetForm()
            }
          }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className={fontClass}>Edit Tag</DialogTitle>
                <DialogDescription className={fontClass}>
                  Update tag information with multilingual support
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-tag-slug" className={fontClass}>Tag Slug</Label>
                  <Input
                    id="edit-tag-slug"
                    placeholder="tag-url-slug"
                    className={fontClass}
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={fontClass}>Tag Names</Label>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      {languages.map((lang) => (
                        <TabsTrigger key={lang.code} value={lang.code} className={fontClass}>
                          <span className="mr-2">{lang.flag}</span>
                          {lang.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {languages.map((lang) => (
                      <TabsContent key={lang.code} value={lang.code}>
                        <Input
                          placeholder={`Enter tag name in ${lang.name}`}
                          className={lang.code === 'km' ? 'font-khmer' : fontClass}
                          value={formData.translations[lang.code as keyof typeof formData.translations]?.name || ''}
                          onChange={(e) => handleNameChange(lang.code, e.target.value)}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className={fontClass}>
                  Cancel
                </Button>
                <Button onClick={updateTag} className={fontClass}>
                  <Save className="mr-2 h-4 w-4" />
                  Update Tag
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className={`text-destructive ${fontClass}`}>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>Search Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-8 ${fontClass}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags Table */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>Tags ({filteredTags.length})</CardTitle>
            <CardDescription className={fontClass}>
              All content tags in your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTags.length === 0 ? (
              <div className="text-center py-8">
                <Tags className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className={`mt-4 text-lg font-semibold ${fontClass}`}>No tags found</h3>
                <p className={`mt-2 text-muted-foreground ${fontClass}`}>
                  {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first tag'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsCreateDialogOpen(true)} className={`mt-4 ${fontClass}`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tag
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={fontClass}>Name</TableHead>
                    <TableHead className={fontClass}>Slug</TableHead>
                    <TableHead className={fontClass}>Content Count</TableHead>
                    <TableHead className={fontClass}>Languages</TableHead>
                    <TableHead className={fontClass}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTags.map(tag => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tags className="h-4 w-4" />
                          <span className={fontClass}>{getTranslation(tag.translations, params.locale)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className={`text-sm ${fontClass}`}>{tag.slug}</code>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${fontClass}`}>
                          {tag._count?.content || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {tag.translations.map(translation => {
                            const lang = languages.find(l => l.code === translation.language)
                            return lang ? (
                              <Badge key={translation.language} variant="outline" className="text-xs">
                                {lang.flag}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={`bg-white border border-gray-200 shadow-lg rounded-md p-1 z-50 ${fontClass}`}>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(tag)}
                              className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteTag(tag.id)}
                              className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer text-destructive ${fontClass}`}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}