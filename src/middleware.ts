import { NextRequest, NextResponse } from "next/server"
import { withAuth } from "next-auth/middleware"
import createIntlMiddleware from 'next-intl/middleware'

const locales = ['sv', 'en', 'km']

// Public paths that should not be localized
const publicPaths = ['/sitemap.xml', '/robots.txt']

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'sv'
})

async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware completely for sitemap and robots
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Generate nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // Handle internationalization first for all routes
  const intlResponse = intlMiddleware(request)

  // Add security headers for all responses
  const response = intlResponse || NextResponse.next()

  // Add nonce to headers so it can be accessed in components
  response.headers.set('x-nonce', nonce)

  // Content Security Policy with nonce
  const isDevelopment = process.env.NODE_ENV === 'development'
  const cspPolicy = [
    "default-src 'self'",
    // Scripts: In development, allow unsafe-inline for Next.js hot reload
    // In production, use nonce-based approach for security
    isDevelopment
      ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com blob:`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://*.googletagmanager.com blob:`,
    // Workers: Allow PDF.js worker from self and blob
    "worker-src 'self' blob:",
    // Styles: For TipTap compatibility, we need unsafe-inline without nonce
    // This is a necessary compromise for rich text editor functionality
    "style-src 'self' 'unsafe-inline'",
    // Images: allow data URLs for editor and external images
    "img-src 'self' data: blob: https:",
    // Fonts: allow data URLs for Sweden Sans
    "font-src 'self' data:",
    // Connections: API calls and analytics
    "connect-src 'self' https://*.google-analytics.com https://*.googletagmanager.com blob:",
    // Media: uploaded content
    "media-src 'self' blob:",
    // Block objects for security
    "object-src 'none'",
    // Restrict base URI
    "base-uri 'self'",
    // Form submissions
    "form-action 'self'",
    // Prevent clickjacking
    "frame-ancestors 'none'",
    // Upgrade insecure requests in production
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"])
  ].join('; ')

  response.headers.set('Content-Security-Policy', cspPolicy)

  // Anti-bot and privacy headers
  if (pathname.includes("/admin") || pathname.includes("/auth") || pathname.includes("/api")) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, nocache, nosnippet, noimageindex')
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  // For admin routes, check authentication and role
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

        // Check if user has admin access (AUTHOR and higher roles)
        if (!["AUTHOR", "MODERATOR", "EDITOR", "BOARD", "ADMIN"].includes(token.role)) {
          return NextResponse.redirect(new URL("/", req.url))
        }

        return response
      },
      {
        callbacks: {
          authorized: ({ token }) => !!token,
        },
      }
    )(request)
  }

  // For member portal routes (/my-account/*), check authentication
  if (pathname.includes("/my-account")) {
    return withAuth(
      function authMiddleware(req) {
        const token = req.nextauth.token

        // If no token, redirect to sign in
        if (!token) {
          const signInUrl = new URL("/auth/signin", req.url)
          signInUrl.searchParams.set("callbackUrl", req.url)
          return NextResponse.redirect(signInUrl)
        }

        // All authenticated users can access member portal
        return response
      },
      {
        callbacks: {
          authorized: ({ token }) => !!token,
        },
      }
    )(request)
  }

  // For all other routes, return the response with headers
  return response
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
     * - sitemap.xml (sitemap)
     * - robots.txt (robots file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|fonts|media|sitemap.xml|robots.txt).*)",
  ],
}