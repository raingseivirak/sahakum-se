"use client"

import { useState, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { LogIn, Eye, EyeOff } from "lucide-react"

function SignInContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/en/admin"
  const urlError = searchParams.get("error")
  const fontClass = 'font-sweden'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Get the session to check user role
        const session = await getSession()
        if (["ADMIN", "BOARD", "EDITOR", "MODERATOR", "AUTHOR"].includes(session?.user?.role)) {
          router.push("/en/admin")
        } else {
          router.push("/en")
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: '#F3F4F6'}}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-sm flex items-center justify-center" style={{backgroundColor: '#D4932F'}}>
            <span className="text-white font-bold text-lg">SK</span>
          </div>
          <h2 className={`mt-6 text-3xl font-bold ${fontClass}`} style={{color: '#0D1931'}}>
            Sahakum Khmer CMS
          </h2>
          <p className={`mt-2 text-sm ${fontClass}`} style={{color: '#4B5563'}}>
            Sign in to your admin account
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className={`text-center ${fontClass}`}>Sign In</CardTitle>
            <CardDescription className={`text-center ${fontClass}`}>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* OAuth buttons - shown when providers are configured */}
            {(process.env.NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED === "true" ||
              process.env.NEXT_PUBLIC_OAUTH_FACEBOOK_ENABLED === "true") && (
              <div className="space-y-3 mb-6">
                {process.env.NEXT_PUBLIC_OAUTH_GOOGLE_ENABLED === "true" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full font-sweden border-2"
                    onClick={() => signIn("google", { callbackUrl })}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </Button>
                )}
                {process.env.NEXT_PUBLIC_OAUTH_FACEBOOK_ENABLED === "true" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full font-sweden border-2"
                    onClick={() => signIn("facebook", { callbackUrl })}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Sign in with Facebook
                  </Button>
                )}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500 font-sweden">Or continue with email</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {(error || urlError === 'AccountNotFound' || urlError === 'OAuthAccountNotLinked') && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {error || (urlError === 'AccountNotFound'
                      ? 'No account found with this email. Please apply for membership first.'
                      : urlError === 'OAuthAccountNotLinked'
                      ? 'This email is already linked to another sign-in method. Please use your email and password.'
                      : '')}
                    {!error && urlError === 'AccountNotFound' && (
                      <Link href="/en/join" className="block mt-2 text-[#D4932F] hover:underline font-medium">
                        Apply for membership →
                      </Link>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className={fontClass}>
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fontClass}
                  placeholder="email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={fontClass}>
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
                    className={`${fontClass} pr-10`}
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-sweden-neutral-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-sweden-neutral-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full text-white font-semibold ${fontClass}`}
                style={{backgroundColor: '#D4932F'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#c27f26'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#D4932F'}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className={`text-xs ${fontClass}`} style={{color: '#6B7280'}}>
            © 2024 Sahakum Khmer. Built with Next.js and Sweden Brand Guidelines.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4932F] mx-auto" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}