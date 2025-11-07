'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function ChangePasswordPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Translations
  const texts = {
    title: {
      en: 'Change Password',
      sv: 'Ändra Lösenord',
      km: 'ប្តូរពាក្យសម្ងាត់'
    },
    description: {
      en: 'Update your password to keep your account secure',
      sv: 'Uppdatera ditt lösenord för att hålla ditt konto säkert',
      km: 'ធ្វើបច្ចុប្បន្នភាពពាក្យសម្ងាត់របស់អ្នកដើម្បីរក្សាគណនីរបស់អ្នកឱ្យមានសុវត្ថិភាព'
    },
    currentPassword: {
      en: 'Current Password',
      sv: 'Nuvarande Lösenord',
      km: 'ពាក្យសម្ងាត់បច្ចុប្បន្ន'
    },
    newPassword: {
      en: 'New Password',
      sv: 'Nytt Lösenord',
      km: 'ពាក្យសម្ងាត់ថ្មី'
    },
    confirmPassword: {
      en: 'Confirm New Password',
      sv: 'Bekräfta Nytt Lösenord',
      km: 'បញ្ជាក់ពាក្យសម្ងាត់ថ្មី'
    },
    requirements: {
      en: 'Password Requirements:',
      sv: 'Lösenordskrav:',
      km: 'តម្រូវការពាក្យសម្ងាត់:'
    },
    requirement1: {
      en: 'At least 8 characters long',
      sv: 'Minst 8 tecken långt',
      km: 'យ៉ាងតិច 8 តួអក្សរ'
    },
    requirement2: {
      en: 'Different from current password',
      sv: 'Annorlunda än nuvarande lösenord',
      km: 'ខុសពីពាក្យសម្ងាត់បច្ចុប្បន្ន'
    },
    requirement3: {
      en: 'Passwords must match',
      sv: 'Lösenorden måste matcha',
      km: 'ពាក្យសម្ងាត់ត្រូវតែដូចគ្នា'
    },
    changePassword: {
      en: 'Change Password',
      sv: 'Ändra Lösenord',
      km: 'ប្តូរពាក្យសម្ងាត់'
    },
    cancel: {
      en: 'Cancel',
      sv: 'Avbryt',
      km: 'បោះបង់'
    },
    successMessage: {
      en: 'Password changed successfully! Redirecting to profile...',
      sv: 'Lösenordet har ändrats! Omdirigerar till profil...',
      km: 'បានប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ! កំពុងបញ្ជូនទៅកាន់ប្រវត្តិរូប...'
    },
    passwordMismatch: {
      en: 'New passwords do not match',
      sv: 'Nya lösenord matchar inte',
      km: 'ពាក្យសម្ងាត់ថ្មីមិនដូចគ្នាទេ'
    },
    passwordTooShort: {
      en: 'Password must be at least 8 characters',
      sv: 'Lösenordet måste vara minst 8 tecken',
      km: 'ពាក្យសម្ងាត់ត្រូវតែមានយ៉ាងតិច 8 តួអក្សរ'
    }
  }

  const t = (key: keyof typeof texts) => texts[key][locale as keyof typeof texts.title] || texts[key].en

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validate
    if (newPassword.length < 8) {
      setError(t('passwordTooShort'))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/my-account/profile`)
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' }
    if (password.length < 8) return { strength: 1, label: 'Weak', color: 'bg-red-500' }
    if (password.length < 12) return { strength: 2, label: 'Medium', color: 'bg-[var(--sahakum-gold)]' }
    return { strength: 3, label: 'Strong', color: 'bg-[var(--sahakum-navy)]' }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-semibold text-[var(--sahakum-navy)] ${fontClass}`}>
          {t('title')}
        </h1>
        <p className={`mt-2 text-muted-foreground ${fontClass}`}>
          {t('description')}
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 border-[var(--sahakum-navy)] bg-[var(--sahakum-navy)]/5">
            <CheckCircle2 className="h-4 w-4 text-[var(--sahakum-navy)]" />
            <AlertDescription className={fontClass}>
              {t('successMessage')}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className={fontClass}>
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border border-gray-200 rounded-none">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
              <Lock className="h-5 w-5" />
              {t('title')}
            </CardTitle>
            <CardDescription className={fontClass}>
              {t('description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label htmlFor="currentPassword" className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${fontClass}`}>
                  {t('currentPassword')}
                </label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className={`pr-10 font-sweden`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="newPassword" className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${fontClass}`}>
                  {t('newPassword')}
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className={`pr-10 font-sweden`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    {passwordStrength.label && (
                      <p className={`text-xs text-muted-foreground font-sweden`}>
                        {passwordStrength.label}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${fontClass}`}>
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`pr-10 font-sweden`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Requirements */}
              <div className="rounded-none border border-gray-200 bg-gray-50 p-4">
                <p className={`text-sm font-medium mb-2 ${fontClass}`}>
                  {t('requirements')}
                </p>
                <ul className={`text-sm text-muted-foreground space-y-1 ${fontClass}`}>
                  <li className="flex items-center gap-2">
                    <span className={newPassword.length >= 8 ? 'text-[var(--sahakum-navy)]' : ''}>
                      {newPassword.length >= 8 ? '✓' : '○'}
                    </span>
                    {t('requirement1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={newPassword && newPassword !== currentPassword ? 'text-[var(--sahakum-navy)]' : ''}>
                      {newPassword && newPassword !== currentPassword ? '✓' : '○'}
                    </span>
                    {t('requirement2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={newPassword && confirmPassword && newPassword === confirmPassword ? 'text-[var(--sahakum-navy)]' : ''}>
                      {newPassword && confirmPassword && newPassword === confirmPassword ? '✓' : '○'}
                    </span>
                    {t('requirement3')}
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-gold)]/90 ${fontClass}`}
                >
                  {isLoading ? 'Changing...' : t('changePassword')}
                </Button>
                <Link href={`/${locale}/my-account/profile`}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    className={fontClass}
                  >
                    {t('cancel')}
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
