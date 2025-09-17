"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  FileText,
  Save,
  Eye,
  ArrowLeft,
  Globe,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

const pageSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
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

interface CreatePageProps {
  params: { locale: string }
}

export default function CreatePage({ params }: CreatePageProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const languages = [
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
  ]

  const form = useForm<PageFormData>({
    resolver: zodResolver(pageSchema),
    defaultValues: {
      slug: "",
      status: "DRAFT",
      translations: {
        sv: { title: "", content: "", excerpt: "", metaDescription: "" },
        en: { title: "", content: "", excerpt: "", metaDescription: "" },
        km: { title: "", content: "", excerpt: "", metaDescription: "" },
      }
    }
  })

  const onSubmit = async (data: PageFormData) => {
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Transform data for API
      const translations = Object.entries(data.translations)
        .filter(([_, translation]) => translation.title.trim() !== "")
        .map(([language, translation]) => ({
          language,
          title: translation.title,
          content: translation.content,
          excerpt: translation.excerpt || "",
          metaDescription: translation.metaDescription || "",
        }))

      const payload = {
        slug: data.slug,
        status: data.status,
        translations
      }

      const response = await fetch("/api/pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create page")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/${params.locale}/admin/pages`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
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
                <BreadcrumbLink href={`/${params.locale}/admin/pages`} className={fontClass}>
                  Pages
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
              Create New Page
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Create a new page with multilingual content
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/pages`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Pages
              </Link>
            </Button>
            <Button variant="outline" className={fontClass}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button className={fontClass}>
              <Save className="mr-2 h-4 w-4" />
              Save Page
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {/* Main Content */}
          <div className="md:col-span-3 space-y-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="slug" className={fontClass}>Page Slug</Label>
                    <Input
                      id="slug"
                      placeholder="page-url-slug"
                      className={fontClass}
                    />
                    <p className="text-sm text-muted-foreground">
                      The URL slug for this page
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className={fontClass}>Status</Label>
                    <Select>
                      <SelectTrigger className={fontClass}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  Create content for each language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="sv" className="w-full">
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
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`description-${lang.code}`} className={fontClass}>
                            Meta Description ({lang.name})
                          </Label>
                          <Textarea
                            id={`description-${lang.code}`}
                            placeholder={`Enter meta description in ${lang.name}`}
                            className={lang.code === 'km' ? 'font-khmer' : fontClass}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`content-${lang.code}`} className={fontClass}>
                            Content ({lang.name})
                          </Label>
                          <Textarea
                            id={`content-${lang.code}`}
                            placeholder={`Enter page content in ${lang.name}`}
                            className={`min-h-[300px] ${lang.code === 'km' ? 'font-khmer' : fontClass}`}
                          />
                          <p className="text-sm text-muted-foreground">
                            Rich text editor would be integrated here
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
            {/* Publish Options */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${fontClass}`}>Status:</span>
                  <Badge variant="secondary">Draft</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${fontClass}`}>Visibility:</span>
                  <span className={`text-sm text-muted-foreground ${fontClass}`}>Public</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button className={`w-full ${fontClass}`}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button variant="outline" className={`w-full ${fontClass}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Language Progress */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Translation Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {languages.map((lang) => (
                  <div key={lang.code} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span className={`text-sm ${fontClass}`}>{lang.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Not started
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="featured-image" className={fontClass}>Featured Image</Label>
                  <Button variant="outline" className={`w-full ${fontClass}`}>
                    Upload Image
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excerpt" className={fontClass}>Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Brief description for search engines"
                    className={fontClass}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}