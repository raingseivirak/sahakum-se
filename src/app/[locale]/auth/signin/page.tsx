'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo'
import { LogIn, Eye, EyeOff } from 'lucide-react'

interface SignInPageProps {
  params: { locale: string }
}

export default function SignInPage({ params }: SignInPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { locale } = params
  const callbackUrl = searchParams.get('callbackUrl') || `/${locale}/admin`

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
        setError('Invalid email or password')
      } else {
        // Get the session to ensure user is logged in
        const session = await getSession()
        if (session) {
          router.push(callbackUrl)
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side - Creative background */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-sahakum-navy-900 via-sahakum-navy-800 to-sahakum-navy-700">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-sahakum-gold-500"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-2 border-sahakum-gold-400"></div>
          <div className="absolute bottom-32 left-1/4 w-20 h-20 border-2 border-sahakum-gold-300"></div>
          <div className="absolute bottom-20 right-1/3 w-16 h-16 border-2 border-sahakum-gold-500"></div>
        </div>

        {/* Content overlay */}
        <div className="relative flex flex-col justify-center px-12 text-white">
          <h2 className="text-4xl font-sweden font-bold mb-6 text-sahakum-gold-500">
            Welcome to
          </h2>
          <h3 className="text-3xl font-sweden mb-4">
            Sahakum Khmer
          </h3>
          <p className="text-lg font-sweden opacity-90 leading-relaxed">
            Connecting the Cambodian community in Sweden through culture, support, and shared experiences.
          </p>

          {/* Decorative line */}
          <div className="mt-8 w-24 h-1 bg-sahakum-gold-500"></div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-sm w-full mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <SwedenBrandLogo
                locale={locale}
                size="sm"
                variant="horizontal"
                colorScheme="light"
              />
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 text-sm text-red-700 font-sweden">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                    {error}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="font-sweden text-sahakum-navy-900 text-sm font-medium">
                  Email Address
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
                    className="font-sweden h-12 border-2 border-gray-200 focus:border-sahakum-gold-500 focus:ring-0 rounded-none bg-gray-50 focus:bg-white transition-all"
                    placeholder="admin@sahakumkhmer.se"
                  />
                  <div className="absolute left-0 bottom-0 h-0.5 bg-sahakum-gold-500 transition-all duration-300 w-0 focus-within:w-full"></div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="font-sweden text-sahakum-navy-900 text-sm font-medium">
                  Password
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
                    className="font-sweden h-12 pr-12 border-2 border-gray-200 focus:border-sahakum-gold-500 focus:ring-0 rounded-none bg-gray-50 focus:bg-white transition-all"
                    placeholder="Enter your password"
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Access Portal
                    </>
                  )}
                </span>
              </Button>
            </form>
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