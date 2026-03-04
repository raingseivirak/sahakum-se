import { NextResponse } from 'next/server'

/**
 * Debug route to verify OAuth env vars are loaded.
 * Only works in development. Safe - never exposes actual secret values.
 * DELETE this file before deploying to production.
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 404 })
  }

  const baseUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '') // strip trailing slash
  const googleCallback = `${baseUrl}/api/auth/callback/google`
  const facebookCallback = `${baseUrl}/api/auth/callback/facebook`

  const gId = process.env.GOOGLE_CLIENT_ID?.trim()
  const gSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
  const googleIdValid = gId?.endsWith('.apps.googleusercontent.com') ?? false
  const googleSecretValid = gSecret?.startsWith('GOCSPX-') ?? false

  return NextResponse.json({
    oauth: {
      googleClientId: gId ? '✅ set' : '❌ missing',
      googleClientSecret: gSecret ? '✅ set' : '❌ missing',
      googleFormatCheck: {
        clientIdLooksCorrect: gId ? googleIdValid : 'n/a',
        clientSecretLooksCorrect: gSecret ? googleSecretValid : 'n/a',
        warning: (!googleIdValid || !googleSecretValid) && (gId || gSecret)
          ? 'Client ID should end with .apps.googleusercontent.com, Secret should start with GOCSPX-. Check you did not swap them.'
          : null,
      },
      facebookClientId: process.env.FACEBOOK_CLIENT_ID ? '✅ set' : '❌ missing',
      facebookClientSecret: process.env.FACEBOOK_CLIENT_SECRET ? '✅ set' : '❌ missing',
    },
    nextauth: {
      url: process.env.NEXTAUTH_URL || '❌ not set (default: http://localhost:3000)',
      secret: process.env.NEXTAUTH_SECRET ? '✅ set' : '❌ missing',
    },
    important: {
      copyThisToGoogleConsole: googleCallback,
      copyThisToFacebookConsole: facebookCallback,
    },
    callbackUrls: {
      google: googleCallback,
      facebook: facebookCallback,
    },
  })
}
