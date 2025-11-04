"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SwedenEditor } from "@/components/editor/sweden-editor"
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
  FormDescription,
} from "@/components/ui/form"
import {
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"

const initiativeSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  visibility: z.enum(["PUBLIC", "MEMBERS_ONLY"]),
  category: z.enum(["CULTURAL_EVENT", "BUSINESS", "EDUCATION", "TRANSLATION", "SOCIAL", "OTHER"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  featuredImage: z.string().optional(),
  projectLeadId: z.string().min(1, "Project lead is required"),
  translations: z.object({
    sv: z.object({
      title: z.string().optional(),
      shortDescription: z.string().optional(),
      description: z.string().optional(),
    }),
    en: z.object({
      title: z.string().optional(),
      shortDescription: z.string().optional(),
      description: z.string().optional(),
    }),
    km: z.object({
      title: z.string().optional(),
      shortDescription: z.string().optional(),
      description: z.string().optional(),
    }),
  })
})

type InitiativeFormData = z.infer<typeof initiativeSchema>

interface User {
  id: string
  name: string | null
  email: string
  role: string
}

interface Initiative {
  id: string
  slug: string
  status: string
  visibility: string
  category: string
  startDate: string
  endDate?: string
  featuredImage?: string
  projectLeadId: string
  translations: Array<{
    language: string
    title: string
    shortDescription: string
    description: string
  }>
}

interface DetailsTabProps {
  initiative: Initiative
  locale: string
  onUpdate: () => void
}

export function InitiativeDetailsTab({ initiative, locale, onUpdate }: DetailsTabProps) {
  const fontClass = 'font-sweden'
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  const languages = [
    { code: 'sv', name: 'Svenska' },
    { code: 'en', name: 'English' },
    { code: 'km', name: 'ខ្មែរ' },
  ]

  const categories = [
    { value: 'CULTURAL_EVENT', label: 'Cultural Event' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'TRANSLATION', label: 'Translation' },
    { value: 'SOCIAL', label: 'Social' },
    { value: 'OTHER', label: 'Other' },
  ]

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await response.json()
      // Extract users array from response
      const usersList = data.users || data
      // Any user can be a project lead
      setUsers(usersList)
    } catch (err) {
      console.error("Error fetching users:", err)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Prepare default values from initiative data
  const getTranslationData = (lang: string) => {
    const translation = initiative.translations.find(t => t.language === lang)
    return {
      title: translation?.title || "",
      shortDescription: translation?.shortDescription || "",
      description: translation?.description || "",
    }
  }

  const form = useForm<InitiativeFormData>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      slug: initiative.slug,
      status: initiative.status as any,
      visibility: initiative.visibility as any,
      category: initiative.category as any,
      startDate: initiative.startDate ? new Date(initiative.startDate).toISOString().split('T')[0] : "",
      endDate: initiative.endDate ? new Date(initiative.endDate).toISOString().split('T')[0] : "",
      featuredImage: initiative.featuredImage || "",
      projectLeadId: initiative.projectLeadId,
      translations: {
        sv: getTranslationData('sv'),
        en: getTranslationData('en'),
        km: getTranslationData('km'),
      }
    }
  })

  const onSubmit = async (data: InitiativeFormData) => {
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const translations = Object.entries(data.translations)
        .filter(([_, translation]) => translation.title && translation.title.trim() !== "")
        .map(([language, translation]) => ({
          language,
          title: translation.title!,
          shortDescription: translation.shortDescription || "",
          description: translation.description || "",
        }))

      if (translations.length === 0) {
        throw new Error("At least one translation is required")
      }

      const payload = {
        slug: data.slug,
        status: data.status,
        visibility: data.visibility,
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate || null,
        featuredImage: data.featuredImage || null,
        projectLeadId: data.projectLeadId,
        translations
      }

      const response = await fetch(`/api/initiatives/${initiative.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update initiative")
      }

      setSuccess(true)
      onUpdate()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
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

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className={`text-green-600 ${fontClass}`}>
              Initiative updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Initiative Settings */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>Initiative Settings</CardTitle>
            <CardDescription className={fontClass}>
              Basic initiative configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fontClass}>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} className={fontClass} />
                    </FormControl>
                    <FormMessage className={fontClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fontClass}>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={fontClass}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="DRAFT" className={fontClass}>Draft</SelectItem>
                        <SelectItem value="PUBLISHED" className={fontClass}>Published</SelectItem>
                        <SelectItem value="ARCHIVED" className={fontClass}>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className={fontClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fontClass}>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={fontClass}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="PUBLIC" className={fontClass}>Public</SelectItem>
                        <SelectItem value="MEMBERS_ONLY" className={fontClass}>Members Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className={fontClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fontClass}>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={fontClass}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value} className={fontClass}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className={fontClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fontClass}>Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className={fontClass} />
                    </FormControl>
                    <FormMessage className={fontClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fontClass}>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" className={fontClass} />
                    </FormControl>
                    <FormMessage className={fontClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectLeadId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={fontClass}>Project Lead</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingUsers}
                    >
                      <FormControl>
                        <SelectTrigger className={fontClass}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id} className={fontClass}>
                            {user.name || user.email} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className={fontClass} />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="featuredImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={fontClass}>Featured Image</FormLabel>
                  <FormControl>
                    <MediaSelector
                      value={field.value || ""}
                      onSelect={field.onChange}
                      accept="images"
                    />
                  </FormControl>
                  <FormMessage className={fontClass} />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Translations */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>Content Translations</CardTitle>
            <CardDescription className={fontClass}>
              Edit content in different languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="en" className="w-full">
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
                <TabsContent key={lang.code} value={lang.code} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name={`translations.${lang.code}.title` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Title</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className={lang.code === 'km' ? 'font-khmer' : fontClass}
                          />
                        </FormControl>
                        <FormMessage className={fontClass} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`translations.${lang.code}.shortDescription` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Short Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={3}
                            maxLength={160}
                            className={lang.code === 'km' ? 'font-khmer' : fontClass}
                          />
                        </FormControl>
                        <FormDescription className={fontClass}>
                          {field.value?.length || 0}/160 characters
                        </FormDescription>
                        <FormMessage className={fontClass} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`translations.${lang.code}.description` as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Full Description</FormLabel>
                        <FormControl>
                          <SwedenEditor
                            content={field.value || ""}
                            onChange={field.onChange}
                            locale={lang.code}
                          />
                        </FormControl>
                        <FormMessage className={fontClass} />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className={fontClass}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
