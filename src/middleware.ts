import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"
import createIntlMiddleware from 'next-intl/middleware'

const locales = ['sv', 'en', 'km']

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'sv'
})

async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle internationalization first for all routes
  const intlResponse = intlMiddleware(request)

  // For admin routes, check authentication
  if (pathname.includes("/admin")) {
    return withAuth(
      function authMiddleware(req) {
        const token = req.nextauth.token

        // If no token, redirect to sign in
        if (!token) {
          const signInUrl = new URL("/auth/signin", req.url)
          signInUrl.searchParams.set("callbackUrl", req.url)
          return NextResponse.redirect(signInUrl)
        }

        // Check if user has admin or editor role
        if (token.role !== "ADMIN" && token.role !== "EDITOR") {
          return NextResponse.redirect(new URL("/", req.url))
        }

        return intlResponse
      },
      {
        callbacks: {
          authorized: ({ token }) => !!token,
        },
      }
    )(request)
  }

  // For all other routes, just return the intl response
  return intlResponse
}

export default middleware

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - fonts (font files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|fonts|media).*)",
  ],
}