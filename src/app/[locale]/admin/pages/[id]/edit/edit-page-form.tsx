"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SwedenEditor } from "@/components/editor/sweden-editor"
import { MediaSelector } from "@/components/ui/media-selector"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Save,
  Eye,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"

const pageSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featuredImg: z.string().optional(),
  translations: z.object({
    sv: z.object({
      title: z.string().min(1, "Swedish title is required"),
      content: z.string(),
      excerpt: z.string().optional(),
      metaDescription: z.string().optional(),
    }),
    en: z.object({
      title: z.string().min(1, "English title is required"),
      content: z.string(),
      excerpt: z.string().optional(),
      metaDescription: z.string().optional(),
    }),
    km: z.object({
      title: z.string().optional(),
      content: z.string().optional(),
      excerpt: z.string().optional(),
      metaDescription: z.string().optional(),
    }),
  })
})

type PageFormData = z.infer<typeof pageSchema>

interface EditPageFormProps {
  locale: string
  pageId: string
}

export function EditPageForm({ locale, pageId }: EditPageFormProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const languages = [
    { code: 'sv', name: 'Svenska', flag: '/media/images/sv_flag.png' },
    { code: 'en', name: 'English', flag: '/media/images/en_flag.png' },
    { code: 'km', name: 'ខ្មែរ', flag: '/media/images/km_flag.png' },
  ]

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      slug: "",
      status: "DRAFT",
      featuredImg: "",
      translations: {
        sv: { title: "", content: "", excerpt: "", metaDescription: "" },
        en: { title: "", content: "", excerpt: "", metaDescription: "" },
        km: { title: "", content: "", excerpt: "", metaDescription: "" },
      }
    }
  })

  // Fetch existing page data
  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await fetch(`/api/pages/${pageId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch page")
        }
        const pageData = await response.json()

        // Transform API data to form format
        const translationsData = {
          sv: { title: "", content: "", excerpt: "", metaDescription: "" },
          en: { title: "", content: "", excerpt: "", metaDescription: "" },
          km: { title: "", content: "", excerpt: "", metaDescription: "" },
        }

        // Fill in existing translations
        pageData.translations.forEach((translation: any) => {
          if (translation.language in translationsData) {
            translationsData[translation.language as keyof typeof translationsData] = {
              title: translation.title || "",
              content: translation.content || "",
              excerpt: translation.excerpt || "",
              metaDescription: translation.metaDescription || "",
            }
          }
        })

        // Set form values
        form.reset({
          slug: pageData.slug,
          status: pageData.status,
          featuredImg: pageData.featuredImg || "",
          translations: translationsData
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load page")
      } finally {
        setIsFetching(false)
      }
    }

    fetchPage()
  }, [pageId, form])

  const onSubmit = async (data: PageFormData) => {
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Transform data for API
      const translations = Object.entries(data.translations)
        .filter(([_, translation]) => translation.title && translation.title.trim() !== "")
        .map(([language, translation]) => ({
          language,
          title: translation.title!,
          content: translation.content || "",
          excerpt: translation.excerpt || "",
          metaDescription: translation.metaDescription || "",
        }))

      if (translations.length === 0) {
        throw new Error("At least one translation is required")
      }

      const payload = {
        slug: data.slug,
        status: data.status,
        featuredImg: data.featuredImg || null,
        translations
      }

      const response = await fetch(`/api/pages/${pageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update page")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/${locale}/admin/pages`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className={`ml-2 ${fontClass}`}>Loading page...</span>
      </div>
    )
  }

  if (success) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className={fontClass}>
          Page updated successfully! Redirecting to pages list...
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Page Settings */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>Page Settings</CardTitle>
            <CardDescription className={fontClass}>
              Basic page configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fontClass}>Page Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="page-url-slug"
                        className={fontClass}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fontClass}>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={fontClass}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="featuredImg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fontClass}>Featured Image</FormLabel>
                  <FormControl>
                    <MediaSelector
                      value={field.value}
                      onSelect={field.onChange}
                      placeholder="Enter image URL or select from media library"
                      buttonText="Browse Images"
                      accept="images"
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Select an image from your media library or enter a URL. This will be displayed on the page and in social media previews.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              Edit content for each language
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sv" className="w-full">
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
                  <FormField
                    control={form.control}
                    name={`translations.${lang.code as keyof PageFormData['translations']}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>
                          Title ({lang.name})
                          {(lang.code === 'sv' || lang.code === 'en') && <span className="text-red-500">*</span>}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={`Enter title in ${lang.name}`}
                            className={lang.code === 'km' ? 'font-khmer' : fontClass}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`translations.${lang.code as keyof PageFormData['translations']}.excerpt`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Meta Description ({lang.name})</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={`Enter meta description in ${lang.name}`}
                            className={lang.code === 'km' ? 'font-khmer' : fontClass}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`translations.${lang.code as keyof PageFormData['translations']}.content`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Content ({lang.name})</FormLabel>
                        <FormControl>
                          <SwedenEditor
                            content={field.value || ''}
                            onChange={field.onChange}
                            language={lang.code as 'sv' | 'en' | 'km'}
                            placeholder={`Start writing page content in ${lang.name}...`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className={fontClass} disabled={isLoading} type="button">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className={fontClass}>Page Preview</DialogTitle>
                <DialogDescription className={fontClass}>
                  This is how your page will look when published
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <Tabs defaultValue="sv" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    {languages.map((lang) => (
                      <TabsTrigger key={lang.code} value={lang.code} className={fontClass}>
                        <img src={lang.flag} alt={`${lang.name} flag`} className="mr-2 w-4 h-3 object-cover rounded-sm" />
                        {lang.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {languages.map((lang) => {
                    const translation = form.watch(`translations.${lang.code as keyof PageFormData['translations']}`)
                    return (
                      <TabsContent key={lang.code} value={lang.code} className="mt-4">
                        {translation?.title ? (
                          <div className="space-y-4">
                            <h1 className={`text-3xl font-bold ${lang.code === 'km' ? 'font-khmer' : fontClass}`}>
                              {translation.title}
                            </h1>
                            {translation.excerpt && (
                              <p className={`text-lg text-muted-foreground ${lang.code === 'km' ? 'font-khmer' : fontClass}`}>
                                {translation.excerpt}
                              </p>
                            )}
                            <div
                              className={`prose prose-sweden max-w-none ${lang.code === 'km' ? 'font-khmer' : fontClass}`}
                              data-language={lang.code}
                              dangerouslySetInnerHTML={{ __html: translation.content || '' }}
                            />
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className={`text-muted-foreground ${fontClass}`}>
                              No content available for {lang.name}
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    )
                  })}
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
          <Button type="submit" className={`bg-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/90 text-white ${fontClass}`} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Updating..." : "Update Page"}
          </Button>
        </div>
      </form>
    </Form>
  )
}