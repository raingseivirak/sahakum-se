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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MediaSelector } from "@/components/ui/media-selector"
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
  Loader2,
  AlertCircle,
} from "lucide-react"

const serviceSchema = z.object({
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9\-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  url: z.string().min(1, "URL is required"),
  type: z.enum(["INTERNAL", "BLOG", "EXTERNAL", "CUSTOM"]),
  featuredImg: z.string().optional(),
  colorTheme: z.string().optional(),
  active: z.boolean().default(true),
  order: z.coerce.number().default(0),
  translations: z.object({
    sv: z.object({
      title: z.string().min(1, "Swedish title is required"),
      description: z.string().optional(),
      buttonText: z.string().default("Utforska"),
    }),
    en: z.object({
      title: z.string().min(1, "English title is required"),
      description: z.string().optional(),
      buttonText: z.string().default("Explore"),
    }),
    km: z.object({
      title: z.string().min(1, "Khmer title is required"),
      description: z.string().optional(),
      buttonText: z.string().default("ស្វែងរក"),
    }),
  }),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface EditServiceFormProps {
  locale: string
  serviceId: string
}

export function EditServiceForm({ locale, serviceId }: EditServiceFormProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      slug: "",
      url: "",
      type: "INTERNAL",
      featuredImg: "",
      colorTheme: "navy",
      active: true,
      order: 0,
      translations: {
        sv: {
          title: "",
          description: "",
          buttonText: "Utforska",
        },
        en: {
          title: "",
          description: "",
          buttonText: "Explore",
        },
        km: {
          title: "",
          description: "",
          buttonText: "ស្វែងរក",
        },
      },
    },
  })

  // Load existing service data
  useEffect(() => {
    async function loadService() {
      try {
        const response = await fetch(`/api/services/${serviceId}`)
        if (!response.ok) {
          throw new Error("Failed to load service")
        }

        const data = await response.json()
        const service = data.service

        // Transform translations array to object format
        const translationsObject = {
          sv: service.translations.find((t: any) => t.language === 'sv') || { title: "", description: "", buttonText: "Utforska" },
          en: service.translations.find((t: any) => t.language === 'en') || { title: "", description: "", buttonText: "Explore" },
          km: service.translations.find((t: any) => t.language === 'km') || { title: "", description: "", buttonText: "ស្វែងរក" },
        }

        // Update form with service data
        form.reset({
          slug: service.slug,
          url: service.url,
          type: service.type,
          featuredImg: service.featuredImg || "",
          colorTheme: service.colorTheme || "navy",
          active: service.active,
          order: service.order,
          translations: translationsObject,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load service")
      } finally {
        setIsLoading(false)
      }
    }

    loadService()
  }, [serviceId, form])

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true)
    setError("")

    try {
      // Transform data for API
      const apiData = {
        slug: data.slug,
        url: data.url,
        type: data.type,
        featuredImg: data.featuredImg || null,
        colorTheme: data.colorTheme || null,
        active: data.active,
        order: data.order,
        translations: [
          {
            language: "sv" as const,
            title: data.translations.sv.title,
            description: data.translations.sv.description || "",
            buttonText: data.translations.sv.buttonText,
          },
          {
            language: "en" as const,
            title: data.translations.en.title,
            description: data.translations.en.description || "",
            buttonText: data.translations.en.buttonText,
          },
          {
            language: "km" as const,
            title: data.translations.km.title,
            description: data.translations.km.description || "",
            buttonText: data.translations.km.buttonText,
          },
        ],
      }

      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update service")
      }

      // Redirect back to services list
      router.push(`/${locale}/admin/services`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className={`ml-2 ${fontClass}`}>Loading service...</span>
      </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Service Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Service Configuration</CardTitle>
                <CardDescription className={fontClass}>
                  Basic service information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Slug</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="community"
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
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="/community or https://external.com"
                            className={fontClass}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={fontClass}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className={`bg-white ${fontClass}`}>
                            <SelectItem value="INTERNAL" className={fontClass}>Internal Page</SelectItem>
                            <SelectItem value="BLOG" className={fontClass}>Blog Section</SelectItem>
                            <SelectItem value="EXTERNAL" className={fontClass}>External Link</SelectItem>
                            <SelectItem value="CUSTOM" className={fontClass}>Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colorTheme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Color Theme</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={fontClass}>
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className={`bg-white ${fontClass}`}>
                            <SelectItem value="navy" className={fontClass}>Navy</SelectItem>
                            <SelectItem value="gold" className={fontClass}>Gold</SelectItem>
                            <SelectItem value="blue" className={fontClass}>Blue</SelectItem>
                            <SelectItem value="custom" className={fontClass}>Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Sort Order</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            className={fontClass}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Multilingual Content */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Content Translations</CardTitle>
                <CardDescription className={fontClass}>
                  Provide content in all supported languages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="en" className={fontClass}>English</TabsTrigger>
                    <TabsTrigger value="sv" className={fontClass}>Svenska</TabsTrigger>
                    <TabsTrigger value="km" className={fontClass}>ខ្មែរ</TabsTrigger>
                  </TabsList>

                  <TabsContent value="en" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="translations.en.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={fontClass}>Title (English)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Community"
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
                      name="translations.en.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={fontClass}>Description (English)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Community through cooking, events and cultural activities."
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
                      name="translations.en.buttonText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={fontClass}>Button Text (English)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Explore"
                              className={fontClass}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="sv" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="translations.sv.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={fontClass}>Title (Swedish)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Gemenskap"
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
                      name="translations.sv.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={fontClass}>Description (Swedish)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Gemenskap genom matlagning, evenemang och kulturella aktiviteter."
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
                      name="translations.sv.buttonText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={fontClass}>Button Text (Swedish)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Utforska"
                              className={fontClass}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="km" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="translations.km.title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={fontClass}>Title (Khmer)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="សហគមន៍"
                              className="font-khmer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="translations.km.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={fontClass}>Description (Khmer)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="សហគមន៍តាមរយៈការធ្វើម្ហូប ព្រឹត្តិការណ៍ និងសកម្មភាពវប្បធម៌។"
                              className="font-khmer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="translations.km.buttonText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={fontClass}>Button Text (Khmer)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ស្វែងរក"
                              className="font-khmer"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Featured Image</CardTitle>
                <CardDescription className={fontClass}>
                  Optional image for the service card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="featuredImg"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MediaSelector
                          value={field.value || ""}
                          onSelect={field.onChange}
                          accept="images"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Status</CardTitle>
                <CardDescription className={fontClass}>
                  Service visibility and status settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className={`text-base ${fontClass}`}>Active Service</FormLabel>
                        <div className={`text-sm text-muted-foreground ${fontClass}`}>
                          Enable this service to show it on the homepage
                        </div>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-[var(--sahakum-navy)] focus:ring-[var(--sahakum-navy)]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  type="submit"
                  className={`w-full bg-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/90 text-white ${fontClass}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Updating..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Service
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}