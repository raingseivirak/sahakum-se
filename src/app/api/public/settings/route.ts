import { NextResponse } from 'next/server'
import { getPublicSettings } from '@/lib/public-settings'

export const dynamic = 'force-dynamic'

/**
 * Public read-only endpoint exposing the safe portion of the site settings
 * (organization info, contact details, social media URLs, basic site config).
 *
 * Used by:
 *  - Server components that prefer fetching over importing the helper
 *  - Any future client-side widget that needs live contact / social data
 *
 * IMPORTANT: This endpoint must never return the `permissions` category or any
 * other admin-only setting. The underlying helper already filters categories.
 */
export async function GET() {
  try {
    const settings = await getPublicSettings()

    return NextResponse.json(settings, {
      headers: {
        // Cache for 5 min at the CDN edge; browsers may stale-while-revalidate for an hour.
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    console.error('[api/public/settings] failed', error)
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 },
    )
  }
}
