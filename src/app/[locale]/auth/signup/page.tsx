'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo'
import { UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react'

const RESIDENCE_STATUS_OPTIONS = [
  { value: 'STUDENT', label: { en: 'Student', sv: 'Student', km: 'និស្សិត' } },
  { value: 'WORK_PERMIT', label: { en: 'Work Permit', sv: 'Arbetstillstånd', km: 'អនុញ្ញាតការងារ' } },
  { value: 'PERMANENT_RESIDENT', label: { en: 'Permanent Resident', sv: 'Permanent uppehållstillstånd', km: 'អ្នករស់នៅអចិន្ត្រៃយ៍' } },
  { value: 'CITIZEN', label: { en: 'Citizen', sv: 'Medborgare', km: 'ពលរដ្ឋ' } },
  { value: 'EU_CITIZEN', label: { en: 'EU Citizen', sv: 'EU-medborgare', km: 'ពលរដ្ឋអឺរ៉ុប' } },
  { value: 'ASYLUM_SEEKER', label: { en: 'Asylum Seeker', sv: 'Asylsökande', km: 'អ្នកស្វែងរកសិទ្ធិជ្រកកោន' } },
  { value: 'OTHER', label: { en: 'Other', sv: 'Annat', km: 'ផ្សេងទៀត' } },
]

const translations: Record<string, Record<string, string>> = {
  en: {
    'title': 'Create Account',
    'subtitle': 'Join the Sahakum Khmer community',
    'firstName': 'First Name',
    'lastName': 'Last Name',
    'email': 'Email Address',
    'password': 'Password',
    'confirmPassword': 'Confirm Password',
    'firstNamePlaceholder': 'Your first name',
    'lastNamePlaceholder': 'Your last name',
    'emailPlaceholder': 'your.email@example.com',
    'passwordPlaceholder': 'Min. 8 characters',
    'confirmPlaceholder': 'Repeat your password',
    'signUp': 'Create Account',
    'signingUp': 'Creating account...',
    'orContinueWith': 'Or continue with email',
    'alreadyHaveAccount': 'Already have an account?',
    'signIn': 'Sign In',
    'wantMembership': 'Want to become a member?',
    'applyHere': 'Apply for membership',
    'errorAllFields': 'All fields are required',
    'errorInvalidEmail': 'Please enter a valid email address',
    'errorPasswordShort': 'Password must be at least 8 characters',
    'errorPasswordMismatch': 'Passwords do not match',
    'errorEmailTaken': 'An account with this email already exists',
    'errorGeneric': 'Something went wrong. Please try again.',
    'signInWithGoogle': 'Sign up with Google',
    'signInWithFacebook': 'Sign up with Facebook',
    'home': 'Home',
    'welcome': 'Welcome to',
    'orgName': 'Sahakum Khmer',
    'orgDesc': 'Connecting the Cambodian community in Sweden through culture, support, and shared experiences.',
    'applyMembership': 'Apply for membership',
    'applyMembershipDesc': 'Submit a membership application along with your account',
    'residenceStatus': 'Residence Status in Sweden',
    'residenceStatusPlaceholder': 'Select your residence status',
    'membershipSubmitted': 'Your membership application has been submitted!',
  },
  sv: {
    'title': 'Skapa konto',
    'subtitle': 'Gå med i Sahakum Khmer-gemenskapen',
    'firstName': 'Förnamn',
    'lastName': 'Efternamn',
    'email': 'E-postadress',
    'password': 'Lösenord',
    'confirmPassword': 'Bekräfta lösenord',
    'firstNamePlaceholder': 'Ditt förnamn',
    'lastNamePlaceholder': 'Ditt efternamn',
    'emailPlaceholder': 'din.email@exempel.com',
    'passwordPlaceholder': 'Minst 8 tecken',
    'confirmPlaceholder': 'Upprepa ditt lösenord',
    'signUp': 'Skapa konto',
    'signingUp': 'Skapar konto...',
    'orContinueWith': 'Eller fortsätt med e-post',
    'alreadyHaveAccount': 'Har du redan ett konto?',
    'signIn': 'Logga in',
    'wantMembership': 'Vill du bli medlem?',
    'applyHere': 'Ansök om medlemskap',
    'errorAllFields': 'Alla fält krävs',
    'errorInvalidEmail': 'Ange en giltig e-postadress',
    'errorPasswordShort': 'Lösenordet måste vara minst 8 tecken',
    'errorPasswordMismatch': 'Lösenorden matchar inte',
    'errorEmailTaken': 'Ett konto med denna e-post finns redan',
    'errorGeneric': 'Något gick fel. Försök igen.',
    'signInWithGoogle': 'Registrera med Google',
    'signInWithFacebook': 'Registrera med Facebook',
    'home': 'Hem',
    'welcome': 'Välkommen till',
    'orgName': 'Sahakum Khmer',
    'orgDesc': 'Vi förenar den kambodjanska gemenskapen i Sverige genom kultur, stöd och delade upplevelser.',
    'applyMembership': 'Ansök om medlemskap',
    'applyMembershipDesc': 'Skicka in en medlemsansökan tillsammans med ditt konto',
    'residenceStatus': 'Uppehållsstatus i Sverige',
    'residenceStatusPlaceholder': 'Välj din uppehållsstatus',
    'membershipSubmitted': 'Din medlemsansökan har skickats in!',
  },
  km: {
    'title': 'បង្កើតគណនី',
    'subtitle': 'ចូលរួមជាមួយសហគមន៍សហគមខ្មែរ',
    'firstName': 'នាមខ្លួន',
    'lastName': 'នាមត្រកូល',
    'email': 'អាសយដ្ឋានអ៊ីម៉ែល',
    'password': 'ពាក្យសម្ងាត់',
    'confirmPassword': 'បញ្ជាក់ពាក្យសម្ងាត់',
    'firstNamePlaceholder': 'នាមខ្លួនរបស់អ្នក',
    'lastNamePlaceholder': 'នាមត្រកូលរបស់អ្នក',
    'emailPlaceholder': 'your.email@example.com',
    'passwordPlaceholder': 'យ៉ាងតិច ៨ តួអក្សរ',
    'confirmPlaceholder': 'វាយពាក្យសម្ងាត់ម្តងទៀត',
    'signUp': 'បង្កើតគណនី',
    'signingUp': 'កំពុងបង្កើតគណនី...',
    'orContinueWith': 'ឬបន្តជាមួយអ៊ីម៉ែល',
    'alreadyHaveAccount': 'មានគណនីរួចហើយ?',
    'signIn': 'ចូល',
    'wantMembership': 'ចង់ក្លាយជាសមាជិក?',
    'applyHere': 'ដាក់ពាក្យសុំសមាជិកភាព',
    'errorAllFields': 'ត្រូវការវាលទាំងអស់',
    'errorInvalidEmail': 'សូមវាយអាសយដ្ឋានអ៊ីម៉ែលត្រឹមត្រូវ',
    'errorPasswordShort': 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួអក្សរ',
    'errorPasswordMismatch': 'ពាក្យសម្ងាត់មិនត្រូវគ្នា',
    'errorEmailTaken': 'គណនីជាមួយអ៊ីម៉ែលនេះមានរួចហើយ',
    'errorGeneric': 'មានអ្វីមួយខុសប្រក្រតី។ សូមព្យាយាមម្តងទៀត។',
    'signInWithGoogle': 'ចុះឈ្មោះជាមួយ Google',
    'signInWithFacebook': 'ចុះឈ្មោះជាមួយ Facebook',
    'home': 'ទំព័រដើម',
    'welcome': 'សូមស្វាគមន៍មកកាន់',
    'orgName': 'សហគមខ្មែរ',
    'orgDesc': 'ភ្ជាប់សហគមន៍ខ្មែរនៅស៊ុយអែតតាមរយៈវប្បធម៌ ការគាំទ្រ និងបទពិសោធន៍រួមគ្នា។',
    'applyMembership': 'ដាក់ពាក្យសុំសមាជិកភាព',
    'applyMembershipDesc': 'ដាក់ពាក្យសុំសមាជិកភាពរួមជាមួយគណនីរបស់អ្នក',
    'residenceStatus': 'ស្ថានភាពលំនៅដ្ឋាននៅស៊ុយអែត',
    'residenceStatusPlaceholder': 'ជ្រើសរើសស្ថានភាពលំនៅដ្ឋានរបស់អ្នក',
    'membershipSubmitted': 'ពាក្យសុំសមាជិកភាពរបស់អ្នកត្រូវបានដាក់ស្នើ!',
  },
}

interface SignUpPageProps {
  params: { locale: string }
}

function SignUpPageContent({ params }: SignUpPageProps) {
  const { locale } = params
  const t = (key: string) => translations[locale]?.[key] || translations.en[key] || key
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [applyMembership, setApplyMembership] = useState(true)
  const [residenceStatus, setResidenceStatus] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError(t('errorAllFields'))
      return
    }

    if (password.length < 8) {
      setError(t('errorPasswordShort'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch'))
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          language: locale,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        if (data.error === 'EMAIL_TAKEN') {
          setError(t('errorEmailTaken'))
        } else if (data.error === 'INVALID_EMAIL') {
          setError(t('errorInvalidEmail'))
        } else if (data.error === 'PASSWORD_TOO_SHORT') {
          setError(t('errorPasswordShort'))
        } else {
          setError(t('errorGeneric'))
        }
        return
      }

      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('errorGeneric'))
        return
      }

      if (applyMembership) {
        await fetch('/api/membership-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            residenceStatus: residenceStatus || undefined,
            preferredLanguage: locale,
          }),
        })
      }

      router.push(callbackUrl)
    } catch {
      setError(t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Creative background */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-sahakum-navy-900 via-sahakum-navy-800 to-sahakum-navy-700">
        <div className="absolute top-4 right-4 z-10">
          <Link
            href={`/${locale}`}
            className="group p-3 text-white/60 hover:text-sahakum-gold-400 transition-colors duration-200"
            title={t('home')}
          >
            <ArrowLeft className="h-5 w-5 transform rotate-45 group-hover:rotate-0 transition-transform duration-200" />
          </Link>
        </div>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-sahakum-gold-500"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-sahakum-gold-400"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-sahakum-gold-300"></div>
          <div className="absolute bottom-20 right-1/3 w-16 h-16 border-2 border-sahakum-gold-500"></div>
        </div>

        <div className="relative flex flex-col justify-center px-12 text-white">
          <h2 className={`text-4xl ${fontClass} font-bold mb-6 text-sahakum-gold-500`}>
            {t('welcome')}
          </h2>
          <h3 className={`text-3xl ${fontClass} mb-4`}>
            {t('orgName')}
          </h3>
          <p className={`text-lg ${fontClass} opacity-90 leading-relaxed`}>
            {t('orgDesc')}
          </p>
          <div className="mt-8 w-24 h-1 bg-sahakum-gold-500"></div>
        </div>
      </div>

      {/* Right side - Sign-up form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-12 overflow-y-auto">
        <div className="max-w-sm w-full mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="relative">
            <div className="flex justify-start mb-4">
              <SwedenBrandLogo
                locale={locale}
                size="sm"
                variant="horizontal"
                colorScheme="light"
              />
            </div>
            <div className="absolute top-0 right-0 lg:hidden">
              <Link
                href={`/${locale}`}
                className="group p-2 text-gray-500 hover:text-sahakum-gold-500 transition-colors duration-200"
                title={t('home')}
              >
                <ArrowLeft className="h-4 w-4 transform rotate-45 group-hover:rotate-0 transition-transform duration-200" />
              </Link>
            </div>
          </div>

          {/* Sign-up Form */}
          <div className="bg-white p-5 sm:p-8 shadow-lg">
            <h1 className={`text-xl font-bold text-sahakum-navy-900 mb-1 ${fontClass}`}>
              {t('title')}
            </h1>
            <p className={`text-sm text-gray-500 mb-5 ${fontClass}`}>
              {t('subtitle')}
            </p>

            {/* Membership opt-in — shown at the top so it applies to all signup methods */}
            <div className="border-2 border-[var(--sahakum-gold)] bg-amber-50/40 p-4 mb-5 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyMembership}
                  onChange={(e) => setApplyMembership(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--sahakum-gold)] cursor-pointer flex-shrink-0"
                />
                <div>
                  <span className={`text-sm font-semibold text-sahakum-navy-900 ${fontClass}`}>
                    {t('applyMembership')}
                  </span>
                  <p className={`text-xs text-gray-500 mt-0.5 ${fontClass}`}>
                    {t('applyMembershipDesc')}
                  </p>
                </div>
              </label>

              {applyMembership && (
                <div className="space-y-1.5 pl-7">
                  <Label className={`${fontClass} text-sahakum-navy-900 text-xs font-medium`}>
                    {t('residenceStatus')}
                  </Label>
                  <select
                    value={residenceStatus}
                    onChange={(e) => setResidenceStatus(e.target.value)}
                    className={`w-full h-10 border-2 border-gray-200 focus:border-sahakum-gold-500 focus:outline-none px-3 bg-white text-sm ${fontClass}`}
                  >
                    <option value="">{t('residenceStatusPlaceholder')}</option>
                    {RESIDENCE_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label[locale as keyof typeof opt.label] || opt.label.en}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* OAuth buttons */}
            {(process.env.NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED === 'true' ||
              process.env.NEXT_PUBLIC_OAUTH_FACEBOOK_ENABLED === 'true') && (
              <div className="space-y-3 mb-6">
                {process.env.NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED === 'true' && (
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 ${fontClass} rounded-none`}
                    onClick={() => {
                      if (applyMembership) {
                        localStorage.setItem('pendingMembership', JSON.stringify({ residenceStatus, preferredLanguage: locale }))
                      }
                      signIn('google', { callbackUrl })
                    }}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t('signInWithGoogle')}
                  </Button>
                )}
                {process.env.NEXT_PUBLIC_OAUTH_FACEBOOK_ENABLED === 'true' && (
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full h-12 border-2 border-gray-200 hover:border-[#1877F2] hover:bg-[#1877F2]/5 active:bg-[#1877F2]/10 ${fontClass} rounded-none`}
                    onClick={() => {
                      if (applyMembership) {
                        localStorage.setItem('pendingMembership', JSON.stringify({ residenceStatus, preferredLanguage: locale }))
                      }
                      signIn('facebook', { callbackUrl })
                    }}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    {t('signInWithFacebook')}
                  </Button>
                )}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={`px-2 bg-white text-gray-500 ${fontClass}`}>{t('orContinueWith')}</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className={`p-4 bg-red-50 border-l-4 border-red-400 text-sm text-red-700 ${fontClass}`}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                    {error}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className={`${fontClass} text-sahakum-navy-900 text-sm font-medium`}>
                    {t('firstName')}
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`${fontClass} h-11 border-2 border-gray-200 focus:border-sahakum-gold-500 focus:ring-0 rounded-none bg-gray-50 focus:bg-white transition-all`}
                    placeholder={t('firstNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className={`${fontClass} text-sahakum-navy-900 text-sm font-medium`}>
                    {t('lastName')}
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`${fontClass} h-11 border-2 border-gray-200 focus:border-sahakum-gold-500 focus:ring-0 rounded-none bg-gray-50 focus:bg-white transition-all`}
                    placeholder={t('lastNamePlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className={`${fontClass} text-sahakum-navy-900 text-sm font-medium`}>
                  {t('email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${fontClass} h-11 border-2 border-gray-200 focus:border-sahakum-gold-500 focus:ring-0 rounded-none bg-gray-50 focus:bg-white transition-all`}
                  placeholder={t('emailPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={`${fontClass} text-sahakum-navy-900 text-sm font-medium`}>
                  {t('password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${fontClass} h-11 pr-12 border-2 border-gray-200 focus:border-sahakum-gold-500 focus:ring-0 rounded-none bg-gray-50 focus:bg-white transition-all`}
                    placeholder={t('passwordPlaceholder')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-sahakum-gold-50 rounded-none transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={`${fontClass} text-sahakum-navy-900 text-sm font-medium`}>
                  {t('confirmPassword')}
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${fontClass} h-11 border-2 border-gray-200 focus:border-sahakum-gold-500 focus:ring-0 rounded-none bg-gray-50 focus:bg-white transition-all`}
                  placeholder={t('confirmPlaceholder')}
                />
              </div>

              <Button
                type="submit"
                className={`w-full h-12 bg-sahakum-gold-500 hover:bg-sahakum-gold-600 active:bg-sahakum-gold-700 text-white ${fontClass} font-semibold mt-2 sm:mt-4 rounded-none relative overflow-hidden group transition-all duration-300`}
                disabled={loading}
              >
                <div className="absolute inset-0 bg-sahakum-gold-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('signingUp')}
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t('signUp')}
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-3 text-center">
              <p className={`text-sm text-gray-600 ${fontClass}`}>
                {t('alreadyHaveAccount')}{' '}
                <Link
                  href={`/${locale}/auth/signin`}
                  className="text-sahakum-gold-600 hover:underline font-medium"
                >
                  {t('signIn')}
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className={`text-xs text-gray-400 ${fontClass}`}>
            &copy; 2024 Sahakum Khmer Community
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage({ params }: SignUpPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sahakum-navy mx-auto"></div>
          <p className="mt-2 text-sahakum-navy font-sweden">Loading...</p>
        </div>
      </div>
    }>
      <SignUpPageContent params={params} />
    </Suspense>
  )
}
