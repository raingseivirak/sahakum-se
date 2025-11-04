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

interface InitiativeFormProps {
  locale: string
}

export function InitiativeForm({ locale }: InitiativeFormProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
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

  const form = useForm<InitiativeFormData>({
    resolver: zodResolver(initiativeSchema),
    defaultValues: {
      slug: "",
      status: "DRAFT",
      visibility: "PUBLIC",
      category: "OTHER",
      startDate: "",
      endDate: "",
      featuredImage: "",
      projectLeadId: "",
      translations: {
        sv: { title: "", shortDescription: "", description: "" },
        en: { title: "", shortDescription: "", description: "" },
        km: { title: "", shortDescription: "", description: "" },
      }
    }
  })

  const onSubmit = async (data: InitiativeFormData) => {
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

      const response = await fetch("/api/initiatives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create initiative")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/${locale}/admin/initiatives`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className={fontClass}>
          Initiative created successfully! Redirecting to initiatives list...
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
                      <Input
                        {...field}
                        placeholder="khmer-new-year-2025"
                        className={fontClass}
                      />
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={fontClass}>
                          <SelectValue placeholder="Select status" />
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={fontClass}>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="PUBLIC" className={fontClass}>Public</SelectItem>
                        <SelectItem value="MEMBERS_ONLY" className={fontClass}>Members Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription className={fontClass}>
                      Public initiatives are visible to everyone, members-only to logged-in users
                    </FormDescription>
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={fontClass}>
                          <SelectValue placeholder="Select category" />
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
                      <Input
                        {...field}
                        type="date"
                        className={fontClass}
                      />
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
                      <Input
                        {...field}
                        type="date"
                        className={fontClass}
                      />
                    </FormControl>
                    <FormDescription className={fontClass}>
                      Leave empty for ongoing initiatives
                    </FormDescription>
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
                      defaultValue={field.value}
                      disabled={loadingUsers}
                    >
                      <FormControl>
                        <SelectTrigger className={fontClass}>
                          <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select project lead"} />
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
                    <FormDescription className={fontClass}>
                      Select the user who will lead this initiative
                    </FormDescription>
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
              Add content in different languages (at least one required)
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
                            placeholder="Initiative title"
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
                            placeholder="Brief description for cards (160 characters)"
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
                            placeholder="Write the full initiative description..."
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
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${locale}/admin/initiatives`)}
            disabled={isLoading}
            className={fontClass}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className={fontClass}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Initiative
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
