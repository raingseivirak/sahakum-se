"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, Eye, EyeOff } from "lucide-react"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
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
        if (session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR") {
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
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