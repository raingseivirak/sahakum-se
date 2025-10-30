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
import { Checkbox } from "@/components/ui/checkbox"
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
  Calendar,
  Save,
  ArrowLeft,
  MapPin,
  Globe,
  Monitor,
  Users,
  DollarSign,
} from "lucide-react"
import Link from "next/link"
import { SwedenEditor } from "@/components/editor/sweden-editor"
import { MediaSelector } from "@/components/ui/media-selector"
import { useEvents } from "@/hooks/use-events"
import { useCategories } from "@/hooks/use-categories"
import { useTags } from "@/hooks/use-tags"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"

interface EditEventProps {
  params: { locale: string; id: string }
}

export default function EditEvent({ params }: EditEventProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
  const { updateEvent, getEvent, loading: eventsLoading, error: eventsError } = useEvents()
  const { categories, loading: categoriesLoading } = useCategories()
  const { tags, loading: tagsLoading } = useTags()

  const [formData, setFormData] = useState({
    slug: '',
    startDate: '',
    endDate: '',
    allDay: false,
    locationType: 'PHYSICAL' as 'PHYSICAL' | 'VIRTUAL' | 'HYBRID',
    venueName: '',
    address: '',
    postalCode: '',
    city: '',
    country: 'Sweden',
    virtualUrl: '',
    registrationEnabled: false,
    registrationType: 'PUBLIC' as 'PUBLIC' | 'MEMBERS_ONLY',
    registrationDeadline: '',
    maxCapacity: '',
    isFree: true,
    price: '',
    currency: 'SEK',
    organizer: '',
    contactEmail: '',
    externalUrl: '',
    featuredImg: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    publishedAt: '',
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
  const [isLoading, setIsLoading] = useState(true)

  // Fetch event data on mount
  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true)
      try {
        const event = await getEvent(params.id)

        // Format dates for datetime-local inputs
        const formatDateTimeLocal = (date: string | null) => {
          if (!date) return ''
          const d = new Date(date)
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const hours = String(d.getHours()).padStart(2, '0')
          const minutes = String(d.getMinutes()).padStart(2, '0')
          return `${year}-${month}-${day}T${hours}:${minutes}`
        }

        // Build translations object
        const translationsMap: any = {
          sv: { language: 'sv', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
          en: { language: 'en', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
          km: { language: 'km', title: '', content: '', excerpt: '', metaDescription: '', seoTitle: '' },
        }

        event.translations.forEach((t: any) => {
          translationsMap[t.language] = {
            language: t.language,
            title: t.title || '',
            content: t.content || '',
            excerpt: t.excerpt || '',
            metaDescription: t.metaDescription || '',
            seoTitle: t.seoTitle || '',
          }
        })

        setFormData({
          slug: event.slug,
          startDate: formatDateTimeLocal(event.startDate),
          endDate: formatDateTimeLocal(event.endDate),
          allDay: event.allDay,
          locationType: event.locationType,
          venueName: event.venueName || '',
          address: event.address || '',
          postalCode: event.postalCode || '',
          city: event.city || '',
          country: event.country || 'Sweden',
          virtualUrl: event.virtualUrl || '',
          registrationEnabled: event.registrationEnabled,
          registrationType: event.registrationType || 'PUBLIC',
          registrationDeadline: formatDateTimeLocal(event.registrationDeadline),
          maxCapacity: event.maxCapacity ? String(event.maxCapacity) : '',
          isFree: event.isFree,
          price: event.price ? String(event.price) : '',
          currency: event.currency || 'SEK',
          organizer: event.organizer || '',
          contactEmail: event.contactEmail || '',
          externalUrl: event.externalUrl || '',
          featuredImg: event.featuredImg || '',
          status: event.status,
          publishedAt: formatDateTimeLocal(event.publishedAt),
          categoryIds: event.categories.map((c: any) => c.categoryId),
          tagIds: event.tags.map((t: any) => t.tagId),
          translations: translationsMap,
        })
      } catch (err) {
        console.error('Failed to fetch event:', err)
        alert(`Failed to load event: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (!formData.startDate || !formData.endDate) {
        alert('Please enter start and end dates')
        return
      }

      const eventData = {
        slug: formData.slug,
        startDate: formData.startDate,
        endDate: formData.endDate,
        allDay: formData.allDay,
        locationType: formData.locationType,
        venueName: formData.venueName || undefined,
        address: formData.address || undefined,
        postalCode: formData.postalCode || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        virtualUrl: formData.virtualUrl || undefined,
        registrationEnabled: formData.registrationEnabled,
        registrationType: formData.registrationEnabled ? formData.registrationType : undefined,
        registrationDeadline: formData.registrationDeadline || undefined,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined,
        isFree: formData.isFree,
        price: !formData.isFree && formData.price ? parseFloat(formData.price) : undefined,
        currency: formData.currency || undefined,
        organizer: formData.organizer || undefined,
        contactEmail: formData.contactEmail || undefined,
        externalUrl: formData.externalUrl || undefined,
        featuredImg: formData.featuredImg || null,
        status: formData.status,
        publishedAt: formData.publishedAt || undefined,
        categoryIds: formData.categoryIds,
        tagIds: formData.tagIds,
        translations
      }

      await updateEvent(params.id, eventData)
      router.push(`/${params.locale}/admin/events`)
    } catch (err) {
      console.error('Failed to update event:', err)
      alert(`Failed to update event: ${err instanceof Error ? err.message : 'Unknown error'}`)
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

  const languages = [
    { code: 'sv', name: 'Svenska', flag: '/media/images/sv_flag.png' },
    { code: 'en', name: 'English', flag: '/media/images/en_flag.png' },
    { code: 'km', name: 'ខ្មែរ', flag: '/media/images/km_flag.png' },
  ]

  const getCategoryName = (category: any, locale: string) => {
    const translation = category.translations.find((t: any) => t.language === locale)
    return translation?.name || category.slug
  }

  const getTagName = (tag: any, locale: string) => {
    const translation = tag.translations.find((t: any) => t.language === locale)
    return translation?.name || tag.slug
  }

  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }))
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${fontClass}`}>
        <div className="text-center">
          <Calendar className="h-12 w-12 animate-pulse mx-auto mb-4 text-sahakum-navy" />
          <p className="text-lg">Loading event...</p>
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${params.locale}/admin/events`} className={fontClass}>
                  Events
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>Edit Event</BreadcrumbPage>
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
              Edit Event
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Update event details and settings
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/events`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving} className={fontClass}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Basic Information</CardTitle>
                <CardDescription className={fontClass}>
                  Core event details and scheduling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug" className={fontClass}>Slug *</Label>
                    <Input
                      id="slug"
                      placeholder="khmer-new-year-2025"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className={fontClass}
                    />
                    <p className="text-sm text-muted-foreground">
                      URL-friendly identifier (e.g., khmer-new-year-2025)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className={fontClass}>Start Date & Time *</Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        className={fontClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className={fontClass}>End Date & Time *</Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        className={fontClass}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allDay"
                      checked={formData.allDay}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allDay: checked as boolean }))}
                    />
                    <Label htmlFor="allDay" className={`${fontClass} cursor-pointer`}>
                      All-day event
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organizer" className={fontClass}>Organizer</Label>
                    <Input
                      id="organizer"
                      placeholder="Sahakum Khmer"
                      value={formData.organizer}
                      onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                      className={fontClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className={fontClass}>Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="info@sahakumkhmer.se"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                      className={fontClass}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Location</CardTitle>
                <CardDescription className={fontClass}>
                  Where the event will take place
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className={fontClass}>Location Type *</Label>
                  <Select
                    value={formData.locationType}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, locationType: value }))}
                  >
                    <SelectTrigger className={fontClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="PHYSICAL" className={fontClass}>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          Physical Location
                        </div>
                      </SelectItem>
                      <SelectItem value="VIRTUAL" className={fontClass}>
                        <div className="flex items-center">
                          <Monitor className="mr-2 h-4 w-4" />
                          Virtual/Online
                        </div>
                      </SelectItem>
                      <SelectItem value="HYBRID" className={fontClass}>
                        <div className="flex items-center">
                          <Globe className="mr-2 h-4 w-4" />
                          Hybrid (Physical + Virtual)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.locationType === 'PHYSICAL' || formData.locationType === 'HYBRID') && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="venueName" className={fontClass}>Venue Name</Label>
                      <Input
                        id="venueName"
                        placeholder="Community Center"
                        value={formData.venueName}
                        onChange={(e) => setFormData(prev => ({ ...prev, venueName: e.target.value }))}
                        className={fontClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className={fontClass}>Address</Label>
                      <Input
                        id="address"
                        placeholder="Götgatan 123"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        className={fontClass}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className={fontClass}>Postal Code</Label>
                        <Input
                          id="postalCode"
                          placeholder="118 46"
                          value={formData.postalCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                          className={fontClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className={fontClass}>City</Label>
                        <Input
                          id="city"
                          placeholder="Stockholm"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className={fontClass}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className={fontClass}>Country</Label>
                      <Input
                        id="country"
                        placeholder="Sweden"
                        value={formData.country}
                        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        className={fontClass}
                      />
                    </div>
                  </>
                )}

                {(formData.locationType === 'VIRTUAL' || formData.locationType === 'HYBRID') && (
                  <div className="space-y-2">
                    <Label htmlFor="virtualUrl" className={fontClass}>Virtual URL</Label>
                    <Input
                      id="virtualUrl"
                      placeholder="https://zoom.us/j/123456789"
                      value={formData.virtualUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, virtualUrl: e.target.value }))}
                      className={fontClass}
                    />
                    <p className="text-sm text-muted-foreground">
                      Zoom, Teams, or other virtual meeting link
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Registration */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Registration</CardTitle>
                <CardDescription className={fontClass}>
                  Manage event registration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="registrationEnabled"
                    checked={formData.registrationEnabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, registrationEnabled: checked as boolean }))}
                  />
                  <Label htmlFor="registrationEnabled" className={`${fontClass} cursor-pointer`}>
                    Enable registration for this event
                  </Label>
                </div>

                {formData.registrationEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label className={fontClass}>Who can register?</Label>
                      <Select
                        value={formData.registrationType}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, registrationType: value }))}
                      >
                        <SelectTrigger className={fontClass}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="PUBLIC" className={fontClass}>
                            Public (Anyone can register)
                          </SelectItem>
                          <SelectItem value="MEMBERS_ONLY" className={fontClass}>
                            Members Only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationDeadline" className={fontClass}>Registration Deadline</Label>
                      <Input
                        id="registrationDeadline"
                        type="datetime-local"
                        value={formData.registrationDeadline}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                        className={fontClass}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxCapacity" className={fontClass}>Maximum Capacity</Label>
                      <Input
                        id="maxCapacity"
                        type="number"
                        placeholder="Leave empty for unlimited"
                        value={formData.maxCapacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxCapacity: e.target.value }))}
                        className={fontClass}
                      />
                      <p className="text-sm text-muted-foreground">
                        Leave empty for unlimited capacity
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Pricing</CardTitle>
                <CardDescription className={fontClass}>
                  Event pricing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFree: checked as boolean }))}
                  />
                  <Label htmlFor="isFree" className={`${fontClass} cursor-pointer`}>
                    Free event
                  </Label>
                </div>

                {!formData.isFree && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className={fontClass}>Price</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="100.00"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        className={fontClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency" className={fontClass}>Currency</Label>
                      <Select
                        value={formData.currency}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger className={fontClass}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="SEK">SEK</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Translations */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Content & Translations</CardTitle>
                <CardDescription className={fontClass}>
                  Add event content in multiple languages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    {languages.map(lang => (
                      <TabsTrigger
                        key={lang.code}
                        value={lang.code}
                        className={fontClass}
                      >
                        {lang.name}
                        {formData.translations[lang.code as keyof typeof formData.translations].title && (
                          <Badge variant="outline" className="ml-2 h-5 px-1 text-xs">✓</Badge>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {languages.map(lang => (
                    <TabsContent key={lang.code} value={lang.code} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${lang.code}`} className={fontClass}>
                          Title ({lang.name}) {lang.code === 'sv' && '*'}
                        </Label>
                        <Input
                          id={`title-${lang.code}`}
                          placeholder="Event title"
                          value={formData.translations[lang.code as keyof typeof formData.translations].title}
                          onChange={(e) => updateTranslation(lang.code, 'title', e.target.value)}
                          className={lang.code === 'km' ? 'font-khmer' : fontClass}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`content-${lang.code}`} className={fontClass}>
                          Content ({lang.name})
                        </Label>
                        <SwedenEditor
                          content={formData.translations[lang.code as keyof typeof formData.translations].content}
                          onChange={(value) => updateTranslation(lang.code, 'content', value)}
                          locale={lang.code}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`excerpt-${lang.code}`} className={fontClass}>
                          Excerpt ({lang.name})
                        </Label>
                        <Textarea
                          id={`excerpt-${lang.code}`}
                          placeholder="Short summary for preview cards"
                          value={formData.translations[lang.code as keyof typeof formData.translations].excerpt}
                          onChange={(e) => updateTranslation(lang.code, 'excerpt', e.target.value)}
                          rows={3}
                          className={lang.code === 'km' ? 'font-khmer' : fontClass}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`seoTitle-${lang.code}`} className={fontClass}>
                          SEO Title ({lang.name})
                        </Label>
                        <Input
                          id={`seoTitle-${lang.code}`}
                          placeholder="Custom title for search engines"
                          value={formData.translations[lang.code as keyof typeof formData.translations].seoTitle}
                          onChange={(e) => updateTranslation(lang.code, 'seoTitle', e.target.value)}
                          className={lang.code === 'km' ? 'font-khmer' : fontClass}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`metaDescription-${lang.code}`} className={fontClass}>
                          Meta Description ({lang.name})
                        </Label>
                        <Textarea
                          id={`metaDescription-${lang.code}`}
                          placeholder="Description for search engines"
                          value={formData.translations[lang.code as keyof typeof formData.translations].metaDescription}
                          onChange={(e) => updateTranslation(lang.code, 'metaDescription', e.target.value)}
                          rows={2}
                          className={lang.code === 'km' ? 'font-khmer' : fontClass}
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Publishing */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className={fontClass}>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className={fontClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.status === 'PUBLISHED' && (
                  <div className="space-y-2">
                    <Label htmlFor="publishedAt" className={fontClass}>Publish Date</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                      className={fontClass}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <MediaSelector
                  value={formData.featuredImg}
                  onSelect={(url) => setFormData(prev => ({ ...prev, featuredImg: url }))}
                  buttonText="Select Featured Image"
                  placeholder="No image selected"
                />
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading categories...</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${category.id}`}
                          checked={formData.categoryIds.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({ ...prev, categoryIds: [...prev.categoryIds, category.id] }))
                            } else {
                              setFormData(prev => ({ ...prev, categoryIds: prev.categoryIds.filter(id => id !== category.id) }))
                            }
                          }}
                        />
                        <Label htmlFor={`cat-${category.id}`} className={`${fontClass} cursor-pointer`}>
                          {getCategoryName(category, params.locale)}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                {tagsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading tags...</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {formData.tagIds.map((tagId) => {
                        const tag = tags.find(t => t.id === tagId)
                        if (!tag) return null
                        return (
                          <Badge
                            key={tagId}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => toggleTag(tagId)}
                          >
                            {getTagName(tag, params.locale)}
                          </Badge>
                        )
                      })}
                    </div>
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                      {tags
                        .filter(tag => !formData.tagIds.includes(tag.id))
                        .map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="cursor-pointer hover:bg-secondary"
                            onClick={() => toggleTag(tag.id)}
                          >
                            {getTagName(tag, params.locale)}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
