"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
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
  UserCheck,
  Globe,
} from "lucide-react"

const memberSchema = z.object({
  memberNumber: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  firstNameKhmer: z.string().optional(),
  lastNameKhmer: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default("Sweden"),
  memberType: z.enum(["REGULAR", "BOARD", "VOLUNTEER", "HONORARY", "LIFETIME"]),
  joinedDate: z.string().min(1, "Joined date is required"),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
  emergencyContact: z.string().optional(),
})

type MemberFormData = z.infer<typeof memberSchema>

interface MemberFormProps {
  locale: string
}

export function MemberForm({ locale }: MemberFormProps) {
  const fontClass = 'font-sweden'
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      memberNumber: "",
      firstName: "",
      lastName: "",
      firstNameKhmer: "",
      lastNameKhmer: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "Sweden",
      memberType: "REGULAR",
      joinedDate: new Date().toISOString().split('T')[0], // Today's date
      isActive: true,
      notes: "",
      emergencyContact: "",
    },
  })

  const onSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create member")
      }

      // Redirect back to members list
      router.push(`/${locale}/admin/members`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Member Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
                  <UserCheck className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription className={fontClass}>
                  Basic member information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>First Name *</FormLabel>
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
                        <FormLabel className={fontClass}>Last Name *</FormLabel>
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

                {/* Khmer Names Section */}
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 ${fontClass}`}>
                    <Globe className="h-4 w-4" />
                    <span className="font-medium">Khmer Names (Optional)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstNameKhmer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={fontClass}>First Name (Khmer)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="ឈ្មោះដំបូង"
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
                      name="lastNameKhmer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={fontClass}>Last Name (Khmer)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="នាមត្រកូល"
                              className={fontClass}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john.doe@email.com"
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+46 70 123 45 67"
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

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Address Information</CardTitle>
                <CardDescription className={fontClass}>
                  Member's residential address details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={fontClass}>Street Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123 Main Street"
                          className={fontClass}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>City</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Stockholm"
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
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Postal Code</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 45"
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
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={fontClass}>Country</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Sweden"
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

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Additional Information</CardTitle>
                <CardDescription className={fontClass}>
                  Emergency contact and internal notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={fontClass}>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Name and phone number of emergency contact"
                          className={fontClass}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className={fontClass}>
                        Contact person in case of emergencies
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={fontClass}>Internal Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes about this member..."
                          className={fontClass}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className={fontClass}>
                        Internal notes visible only to administrators
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Membership Details */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>Membership Details</CardTitle>
                <CardDescription className={fontClass}>
                  Membership type and status information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="memberNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={fontClass}>Member Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional member ID"
                          className={fontClass}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className={fontClass}>
                        Optional unique member identifier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="memberType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={fontClass}>Member Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={fontClass}>
                            <SelectValue placeholder="Select member type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="REGULAR">Regular Member</SelectItem>
                          <SelectItem value="BOARD">Board Member</SelectItem>
                          <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
                          <SelectItem value="HONORARY">Honorary Member</SelectItem>
                          <SelectItem value="LIFETIME">Lifetime Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="joinedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={fontClass}>Joined Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className={fontClass}>
                          Active Member
                        </FormLabel>
                        <FormDescription className={fontClass}>
                          Member is currently active in the association
                        </FormDescription>
                      </div>
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
                  className={`w-full ${fontClass}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Adding Member..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Add Member
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