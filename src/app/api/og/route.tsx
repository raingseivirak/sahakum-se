import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

/**
 * Dynamic Open Graph image endpoint.
 *
 * Renders a 1200×630 branded social card for any page that does not have its
 * own featured image. The card text adapts to the page's language so social
 * previews always look correct on Facebook / LinkedIn / X / WhatsApp etc.
 *
 * Query params:
 *   - title    (required) — main heading
 *   - subtitle (optional) — short description
 *   - locale   (optional) — 'en' | 'sv' | 'km' (default: 'en')
 */

const SAHAKUM_NAVY = '#0D1931'
const SAHAKUM_GOLD = '#D4932F'

const TAGLINES: Record<string, string> = {
  en: 'Community • Culture • Integration',
  sv: 'Gemenskap • Kultur • Integration',
  km: 'សហគមន៍ • វប្បធម៌ • សមាហរណកម្ម',
}

const SITE_NAMES: Record<string, string> = {
  en: 'Sahakum Khmer',
  sv: 'Sahakum Khmer',
  km: 'សហគមខ្មែរ',
}

// Cache fetched fonts for the lifetime of the edge isolate
let latinFontCache: ArrayBuffer | null = null
let khmerFontCache: ArrayBuffer | null = null

async function loadLatinFont(): Promise<ArrayBuffer> {
  if (latinFontCache) return latinFontCache
  // Inter (open licence, supports Latin extended incl. Swedish diacritics)
  const res = await fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50ojIw2-cBrn4.woff'
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch Latin font: ${res.status}`)
  }
  latinFontCache = await res.arrayBuffer()
  return latinFontCache
}

async function loadKhmerFont(): Promise<ArrayBuffer> {
  if (khmerFontCache) return khmerFontCache
  // Noto Sans Khmer (Google Fonts) — covers the Khmer script
  const res = await fetch(
    'https://fonts.gstatic.com/s/notosanskhmer/v32/ijw9s4roRME5LLRxjsRb-gssOenAyendxrgV2c-Zw-9vbVUti_Z_dWgtWYuNAJz4kAbrddiAcasGw9EWdkBdQ.ttf'
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch Khmer font: ${res.status}`)
  }
  khmerFontCache = await res.arrayBuffer()
  return khmerFontCache
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawTitle = searchParams.get('title')?.trim() || 'Sahakum Khmer'
    const rawSubtitle = searchParams.get('subtitle')?.trim() || ''
    const rawLocale = searchParams.get('locale') || 'en'
    const locale = rawLocale === 'sv' || rawLocale === 'km' ? rawLocale : 'en'

    const title = rawTitle.length > 100 ? `${rawTitle.slice(0, 97)}...` : rawTitle
    const subtitle =
      rawSubtitle.length > 180 ? `${rawSubtitle.slice(0, 177)}...` : rawSubtitle

    const siteName = SITE_NAMES[locale]
    const tagline = TAGLINES[locale]

    const [latinFont, khmerFont] = await Promise.all([
      loadLatinFont(),
      loadKhmerFont(),
    ])

    const titleFontFamily = locale === 'km' ? 'NotoKhmer, Inter' : 'Inter, NotoKhmer'
    const bodyFontFamily = locale === 'km' ? 'NotoKhmer, Inter' : 'Inter, NotoKhmer'

    const titleSize = title.length > 60 ? 56 : title.length > 32 ? 68 : 84

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: SAHAKUM_NAVY,
            backgroundImage: `linear-gradient(135deg, ${SAHAKUM_NAVY} 0%, #1a2547 70%, #2a3560 100%)`,
            padding: '72px 80px',
            fontFamily: bodyFontFamily,
            color: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Gold accent bar on the left edge */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 16,
              backgroundColor: SAHAKUM_GOLD,
            }}
          />

          {/* Header: site name + tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: SAHAKUM_GOLD,
                fontFamily: locale === 'km' ? 'NotoKhmer, Inter' : 'Inter, NotoKhmer',
                letterSpacing: locale === 'km' ? 0 : 1,
              }}
            >
              {siteName}
            </div>
            <div
              style={{
                fontSize: 22,
                color: 'rgba(255,255,255,0.7)',
                fontFamily: locale === 'km' ? 'NotoKhmer, Inter' : 'Inter, NotoKhmer',
              }}
            >
              {tagline}
            </div>
          </div>

          {/* Title + subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1040 }}>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 700,
                lineHeight: locale === 'km' ? 1.35 : 1.15,
                color: '#ffffff',
                fontFamily: titleFontFamily,
                letterSpacing: locale === 'km' ? 0 : -1,
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  fontSize: 28,
                  lineHeight: 1.4,
                  color: 'rgba(255,255,255,0.85)',
                  fontFamily: bodyFontFamily,
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>

          {/* Footer: domain */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              paddingTop: 24,
            }}
          >
            <div
              style={{
                fontSize: 22,
                color: 'rgba(255,255,255,0.65)',
                fontFamily: 'Inter, NotoKhmer',
              }}
            >
              sahakumkhmer.se
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 20,
                color: SAHAKUM_GOLD,
                fontFamily: locale === 'km' ? 'NotoKhmer, Inter' : 'Inter, NotoKhmer',
                fontWeight: 600,
                textTransform: locale === 'km' ? 'none' : 'uppercase',
                letterSpacing: locale === 'km' ? 0 : 2,
              }}
            >
              {locale === 'km' ? 'ខ្មែរ' : locale === 'sv' ? 'Svenska' : 'English'}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: latinFont,
            style: 'normal',
            weight: 400,
          },
          {
            name: 'NotoKhmer',
            data: khmerFont,
            style: 'normal',
            weight: 400,
          },
        ],
        headers: {
          // Cache for 24h at the CDN edge; stale-while-revalidate for a week
          'Cache-Control':
            'public, immutable, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    )
  } catch (error) {
    console.error('[og] failed to render image', error)
    return new Response('Failed to generate OG image', { status: 500 })
  }
}
