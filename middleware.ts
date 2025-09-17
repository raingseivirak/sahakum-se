import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['sv', 'en', 'km'],

  // Used when no locale matches
  defaultLocale: 'sv'
});

export default function middleware(request: NextRequest) {
  // Skip middleware for auth and api routes
  if (request.nextUrl.pathname.startsWith('/auth') ||
      request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all paths except auth and api
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - files with extensions
     */
    '/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ]
};