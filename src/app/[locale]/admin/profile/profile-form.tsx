"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, CheckCircle, AlertCircle, User, Lock } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

interface ProfileFormProps {
  locale: string
}

export function ProfileForm({ locale }: ProfileFormProps) {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      firstName: '',
      lastName: '',
    }
  })

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  })

  // Load user data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/admin/profile')
        if (response.ok) {
          const data = await response.json()
          console.log('Profile data received:', data.user)

          // Reset form with user data
          const formData = {
            name: data.user.name || '',
            email: data.user.email || '',
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
          }
          console.log('Resetting form with:', formData)

          profileForm.reset(formData)

          // Force a re-render to ensure UI updates
          setTimeout(() => {
            console.log('Form values after reset:', profileForm.getValues())
          }, 100)
        } else {
          console.error('Profile API failed:', response.status)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      }
    }

    if (session) {
      loadProfile()
    }
  }, [session, profileForm])

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: result.message })
        // Update the session with new data
        await update()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsPasswordLoading(true)
    setPasswordMessage(null)

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', ...data }),
      })

      const result = await response.json()

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: result.message })
        passwordForm.reset()
      } else {
        setPasswordMessage({ type: 'error', text: result.error || 'Failed to change password' })
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const getTexts = (locale: string) => ({
    profile: locale === 'km' ? 'ព័ត៌មានគណនី' : locale === 'sv' ? 'Kontoinformation' : 'Account Information',
    profileDesc: locale === 'km' ? 'កែសម្រួលព័ត៌មានផ្ទាល់ខ្លួនរបស់អ្នក' : locale === 'sv' ? 'Redigera din personliga information' : 'Edit your personal information',
    security: locale === 'km' ? 'សុវត្ថិភាព' : locale === 'sv' ? 'Säkerhet' : 'Security',
    securityDesc: locale === 'km' ? 'ប្តូរពាក្យសម្ងាត់របស់អ្នក' : locale === 'sv' ? 'Ändra ditt lösenord' : 'Change your password',
    name: locale === 'km' ? 'ឈ្មោះ' : locale === 'sv' ? 'Namn' : 'Name',
    email: locale === 'km' ? 'អ៊ីមែល' : locale === 'sv' ? 'E-post' : 'Email',
    firstName: locale === 'km' ? 'នាមខ្លួន' : locale === 'sv' ? 'Förnamn' : 'First Name',
    lastName: locale === 'km' ? 'នាមត្រកូល' : locale === 'sv' ? 'Efternamn' : 'Last Name',
    currentPassword: locale === 'km' ? 'ពាក្យសម្ងាត់បច្ចុប្បន្ន' : locale === 'sv' ? 'Nuvarande lösenord' : 'Current Password',
    newPassword: locale === 'km' ? 'ពាក្យសម្ងាត់ថ្មី' : locale === 'sv' ? 'Nytt lösenord' : 'New Password',
    confirmPassword: locale === 'km' ? 'បញ្ជាក់ពាក្យសម្ងាត់' : locale === 'sv' ? 'Bekräfta lösenord' : 'Confirm Password',
    updateProfile: locale === 'km' ? 'កែប្រែព័ត៌មាន' : locale === 'sv' ? 'Uppdatera profil' : 'Update Profile',
    changePassword: locale === 'km' ? 'ប្តូរពាក្យសម្ងាត់' : locale === 'sv' ? 'Ändra lösenord' : 'Change Password',
  })

  const texts = getTexts(locale)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="inline-flex bg-gray-100 p-1 rounded-lg h-auto">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 font-sweden data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-4"
          >
            <User className="h-4 w-4" />
            {texts.profile}
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center gap-2 font-sweden data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md py-2 px-4"
          >
            <Lock className="h-4 w-4" />
            {texts.security}
          </TabsTrigger>
        </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="font-sweden">{texts.profile}</CardTitle>
                <CardDescription className="font-sweden">{texts.profileDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                {message && (
                  <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    {message.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}

                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sweden">{texts.name}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your name"
                              className="mt-1 font-sweden"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sweden">{texts.email}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              className="mt-1 font-sweden"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sweden">{texts.firstName}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="First name"
                                className="mt-1 font-sweden"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-sweden">{texts.lastName}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Last name"
                                className="mt-1 font-sweden"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading} variant="outline" className="font-sweden">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {texts.updateProfile}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="font-sweden">{texts.security}</CardTitle>
                <CardDescription className="font-sweden">{texts.securityDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                {passwordMessage && (
                  <Alert className={`mb-4 ${passwordMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    {passwordMessage.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={passwordMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                      {passwordMessage.text}
                    </AlertDescription>
                  </Alert>
                )}

                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sweden">{texts.currentPassword}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter current password"
                              className="mt-1 font-sweden"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sweden">{texts.newPassword}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter new password"
                              className="mt-1 font-sweden"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sweden">{texts.confirmPassword}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              className="mt-1 font-sweden"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isPasswordLoading} variant="outline" className="font-sweden">
                        {isPasswordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {texts.changePassword}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  )
}