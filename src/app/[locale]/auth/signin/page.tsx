'use client'

import { useState, Suspense } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { type Language } from '@/lib/constants'
import { LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react'

const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: 'Welcome to',
    orgName: 'Sahakum Khmer',
    orgDesc: 'Connecting the Cambodian community in Sweden through culture, support, and shared experiences.',
    email: 'Email Address',
    emailPlaceholder: 'your.email@example.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    signInWithGoogle: 'Sign in with Google',
    signInWithFacebook: 'Sign in with Facebook',
    orContinueWith: 'Or continue with email',
    errorInvalid: 'Invalid email or password',
    errorGeneric: 'An error occurred. Please try again.',
    errorNotFound: 'No account found with this email.',
    errorLinked: 'This email is already linked to another sign-in method. Please use your email and password.',
    createAccount: 'Create an account',
    applyMembership: 'Apply for membership',
  },
  sv: {
    welcome: 'Välkommen till',
    orgName: 'Sahakum Khmer',
    orgDesc: 'Vi förenar den kambodjanska gemenskapen i Sverige genom kultur, stöd och delade upplevelser.',
    email: 'E-postadress',
    emailPlaceholder: 'din.email@exempel.com',
    password: 'Lösenord',
    passwordPlaceholder: 'Ange ditt lösenord',
    signIn: 'Logga in',
    signingIn: 'Loggar in...',
    noAccount: 'Har du inget konto?',
    signUp: 'Registrera dig',
    signInWithGoogle: 'Logga in med Google',
    signInWithFacebook: 'Logga in med Facebook',
    orContinueWith: 'Eller fortsätt med e-post',
    errorInvalid: 'Fel e-postadress eller lösenord',
    errorGeneric: 'Ett fel uppstod. Försök igen.',
    errorNotFound: 'Inget konto hittades med denna e-post.',
    errorLinked: 'Denna e-post är kopplad till en annan inloggningsmetod. Använd e-post och lösenord.',
    createAccount: 'Skapa ett konto',
    applyMembership: 'Ansök om medlemskap',
  },
  km: {
    welcome: 'សូមស្វាគមន៍មកកាន់',
    orgName: 'សហគមខ្មែរ',
    orgDesc: 'ភ្ជាប់សហគមន៍ខ្មែរនៅស៊ុយអែតតាមរយៈវប្បធម៌ ការគាំទ្រ និងបទពិសោធន៍រួមគ្នា។',
    email: 'អាសយដ្ឋានអ៊ីម៉ែល',
    emailPlaceholder: 'your.email@example.com',
    password: 'ពាក្យសម្ងាត់',
    passwordPlaceholder: 'បញ្ចូលពាក្យសម្ងាត់របស់អ្នក',
    signIn: 'ចូល',
    signingIn: 'កំពុងចូល...',
    noAccount: 'មិនទាន់មានគណនី?',
    signUp: 'ចុះឈ្មោះ',
    signInWithGoogle: 'ចូលជាមួយ Google',
    signInWithFacebook: 'ចូលជាមួយ Facebook',
    orContinueWith: 'ឬបន្តជាមួយអ៊ីម៉ែល',
    errorInvalid: 'អ៊ីម៉ែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ',
    errorGeneric: 'មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។',
    errorNotFound: 'រកមិនឃើញគណនីជាមួយអ៊ីម៉ែលនេះ។',
    errorLinked: 'អ៊ីម៉ែលនេះត្រូវបានភ្ជាប់ជាមួយវិធីចូលផ្សេង។ សូមប្រើអ៊ីម៉ែល និងពាក្យសម្ងាត់។',
    createAccount: 'បង្កើតគណនី',
    applyMembership: 'ដាក់ពាក្យសុំសមាជិកភាព',
  },
}

interface SignInPageProps {
  params: { locale: string }
}

function SignInPageContent({ params }: SignInPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = params
  const t = (key: string) => translations[locale]?.[key] ?? translations.en[key] ?? key
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}/admin`
  const urlError = searchParams.get('error')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('errorInvalid'))
      } else {
        // Get the session to ensure user is logged in
        const session = await getSession()
        if (session) {
          router.push(callbackUrl)
        }
      }
    } catch (error) {
      setError(t('errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Creative background */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-sahakum-navy-900 via-sahakum-navy-800 to-sahakum-navy-700">
        {/* Subtle corner home link - desktop only */}
        <div className="absolute top-4 right-4 z-10">
          <Link
            href={`/${locale}`}
            className="group p-3 text-white/60 hover:text-sahakum-gold-400 transition-colors duration-200"
            title="Go to Homepage"
          >
            <ArrowLeft className="h-5 w-5 transform rotate-45 group-hover:rotate-0 transition-transform duration-200" />
          </Link>
        </div>

        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-sahakum-gold-500"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-sahakum-gold-400"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-sahakum-gold-300"></div>
          <div className="absolute bottom-20 right-1/3 w-16 h-16 border-2 border-sahakum-gold-500"></div>
        </div>

        {/* Content overlay */}
        <div className="relative flex flex-col justify-center px-12 text-white">
          <h2 className={`text-4xl font-bold mb-6 text-sahakum-gold-500 ${fontClass}`}>
            {t('welcome')}
          </h2>
          <h3 className={`text-3xl mb-4 ${fontClass}`}>
            {t('orgName')}
          </h3>
          <p className={`text-lg opacity-90 leading-relaxed ${fontClass}`}>
            {t('orgDesc')}
          </p>
          <div className="mt-8 w-24 h-1 bg-sahakum-gold-500"></div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-sm w-full mx-auto space-y-8">
          {/* Header */}
          <div className="relative">
            <div className="flex justify-start mb-6">
              <SwedenBrandLogo
                locale={locale}
                size="sm"
                variant="horizontal"
                colorScheme="light"
              />
            </div>

            {/* Mobile home link + language switcher */}
            <div className="absolute top-0 right-0 flex items-center gap-1">
              <LanguageSwitcher currentLocale={locale as Language} variant="compact" />
              <div className="lg:hidden">
                <Link
                  href={`/${locale}`}
                  className="group p-2 text-gray-500 hover:text-sahakum-gold-500 transition-colors duration-200"
                  title="Go to Homepage"
                >
                  <ArrowLeft className="h-4 w-4 transform rotate-45 group-hover:rotate-0 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white p-8 shadow-lg">
            {/* OAuth buttons - shown when providers are configured */}
            {(process.env.NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED === "true" ||
              process.env.NEXT_PUBLIC_OAUTH_FACEBOOK_ENABLED === "true") && (
              <div className="space-y-3 mb-6">
                {process.env.NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED === "true" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-sweden rounded-none"
                    onClick={() => signIn("google", { callbackUrl })}
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
                {process.env.NEXT_PUBLIC_OAUTH_FACEBOOK_ENABLED === "true" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-2 border-gray-200 hover:border-[#1877F2] hover:bg-[#1877F2]/5 font-sweden rounded-none"
                    onClick={() => signIn("facebook", { callbackUrl })}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {(error || urlError === 'AccountNotFound' || urlError === 'OAuthAccountNotLinked') && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 text-sm text-red-700 font-sweden">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                    {error || (urlError === 'AccountNotFound'
                      ? t('errorNotFound')
                      : urlError === 'OAuthAccountNotLinked'
                      ? t('errorLinked')
                      : '')}
                  </div>
                  {!error && urlError === 'AccountNotFound' && (
                    <div className="mt-2 space-y-1">
                      <Link href={`/${locale}/auth/signup`} className={`block text-sahakum-gold-600 hover:underline font-medium ${fontClass}`}>
                        {t('createAccount')} →
                      </Link>
                      <Link href={`/${locale}/join`} className={`block text-sahakum-gold-600 hover:underline font-medium ${fontClass}`}>
                        {t('applyMembership')} →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className={`${fontClass} text-sahakum-navy-900 text-sm font-medium`}>
                  {t('email')}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${fontClass} h-12 border-2 border-gray-200 focus:border-sahakum-gold-500 focus:ring-0 rounded-none bg-gray-50 focus:bg-white transition-all`}
                    placeholder={t('emailPlaceholder')}
                  />
                  <div className="absolute left-0 bottom-0 h-0.5 bg-sahakum-gold-500 transition-all duration-300 w-0 focus-within:w-full"></div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className={`${fontClass} text-sahakum-navy-900 text-sm font-medium`}>
                  {t('password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${fontClass} h-12 pr-12 border-2 border-gray-200 focus:border-sahakum-gold-500 focus:ring-0 rounded-none bg-gray-50 focus:bg-white transition-all`}
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

              <Button
                type="submit"
                className="w-full h-12 bg-sahakum-gold-500 hover:bg-sahakum-gold-600 text-white font-sweden font-semibold mt-8 rounded-none relative overflow-hidden group transition-all duration-300"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-sahakum-gold-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <span className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('signingIn')}
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {t('signIn')}
                    </>
                  )}
                </span>
              </Button>
            </form>

            {/* Sign-up link */}
            <div className="mt-6 text-center">
              <p className={`text-sm text-gray-600 ${fontClass}`}>
                {t('noAccount')}{' '}
                <Link href={`/${locale}/auth/signup`} className="text-sahakum-gold-600 hover:underline font-medium">
                  {t('signUp')}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400 font-sweden">
            © 2024 Sahakum Khmer Community
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage({ params }: SignInPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sahakum-navy mx-auto"></div>
          <p className="mt-2 text-sahakum-navy font-sweden">Loading...</p>
        </div>
      </div>
    }>
      <SignInPageContent params={params} />
    </Suspense>
  )
}