"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  AlertCircle,
  User,
  Shield,
  Loader2,
} from "lucide-react"

const userEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR"]),
})

type UserEditFormData = z.infer<typeof userEditSchema>

interface EditUserFormProps {
  locale: string
  userId: string
}

export function EditUserForm({ locale, userId }: EditUserFormProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "EDITOR",
    },
  })

  // Load existing user data
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) {
          throw new Error("Failed to load user")
        }

        const data = await response.json()
        const user = data.user

        // Update form with user data
        form.reset({
          name: user.name || "",
          email: user.email || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          role: user.role,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user")
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [userId, form])

  const onSubmit = async (data: UserEditFormData) => {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update user")
      }

      // Redirect back to users list
      router.push(`/${locale}/admin/users`)
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
        <span className={`ml-2 ${fontClass}`}>Loading user...</span>
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
          {/* Main User Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
                <CardDescription className={fontClass}>
                  Basic user account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={fontClass}>Display Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          className={fontClass}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className={fontClass}>
                        This name will be displayed in the admin interface
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={fontClass}>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@email.com"
                          className={fontClass}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className={fontClass}>
                        Used for login and notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
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
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Role & Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                  <Shield className="h-5 w-5" />
                  Role & Permissions
                </CardTitle>
                <CardDescription className={fontClass}>
                  User role and access level
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={fontClass}>Role *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className={fontClass}>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={`bg-white border border-gray-200 shadow-lg ${fontClass}`}>
                          <SelectItem value="ADMIN" className={`hover:bg-gray-100 ${fontClass}`}>
                            <div className="flex flex-col">
                              <span className={fontClass}>Administrator</span>
                              <span className={`text-xs text-muted-foreground ${fontClass}`}>Full system access</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="EDITOR" className={`hover:bg-gray-100 ${fontClass}`}>
                            <div className="flex flex-col">
                              <span className={fontClass}>Editor</span>
                              <span className={`text-xs text-muted-foreground ${fontClass}`}>Content management</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="AUTHOR" className={`hover:bg-gray-100 ${fontClass}`}>
                            <div className="flex flex-col">
                              <span className={fontClass}>Author</span>
                              <span className={`text-xs text-muted-foreground ${fontClass}`}>Content creation only</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className={fontClass}>
                        Determines what the user can access and modify
                      </FormDescription>
                      <FormMessage />
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
                    "Updating User..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update User
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