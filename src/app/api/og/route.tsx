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

// Pretend to be a modern desktop browser so Google Fonts serves the latest
// woff2 / ttf URLs rather than ancient legacy fallbacks.
const FONT_FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
}

/**
 * Resolve a Google Fonts file URL for *exactly* the characters we need.
 *
 * Using the `text=` query param sidesteps two problems with the default CSS
 * endpoint:
 *   1. The CSS contains one `@font-face` per Unicode subset (Cyrillic, Greek,
 *      Vietnamese, Latin Extended, Latin…). If we naively grab the first
 *      `url()` we may get a font that contains *zero* of our actual glyphs.
 *   2. Full font files are ~100KB+ each; subsetting brings that down to a few
 *      KB and makes the edge isolate snappier.
 */
async function fetchGoogleFontForText(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  // Dedupe characters so the request is stable + the smallest possible payload.
  const uniqueChars = Array.from(new Set(text.split(''))).join('')
  if (!uniqueChars) return null

  const cssUrl =
    `https://fonts.googleapis.com/css2` +
    `?family=${encodeURIComponent(family)}:wght@${weight}` +
    `&text=${encodeURIComponent(uniqueChars)}` +
    `&display=swap`

  const cssRes = await fetch(cssUrl, { headers: FONT_FETCH_HEADERS })
  if (!cssRes.ok) {
    throw new Error(`Failed to fetch Google Fonts CSS for ${family}: ${cssRes.status}`)
  }
  const css = await cssRes.text()
  const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)
  if (!match) {
    throw new Error(`No gstatic font URL in CSS for ${family}`)
  }
  const fontRes = await fetch(match[1])
  if (!fontRes.ok) {
    throw new Error(`Failed to fetch font binary for ${family}: ${fontRes.status}`)
  }
  return fontRes.arrayBuffer()
}

const KHMER_CHAR_RE = /[\u1780-\u17FF\u19E0-\u19FF]/
const LATIN_CHAR_RE = /[\u0020-\u024F\u2000-\u206F\u00B7\u2022]/

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawTitle = searchParams.get('title')?.trim() || 'Sahakum Khmer'
    const rawSubtitle = searchParams.get('subtitle')?.trim() || ''
    const rawLocale = searchParams.get('locale') || 'en'
    const debug = searchParams.get('debug') === '1'
    const minimal = searchParams.get('minimal') === '1'

    if (minimal) {
      // Render the simplest possible Image — no fonts, no gradients, no
      // absolute positioning. If this is also 0 bytes the problem is
      // somewhere outside our markup.
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0D1931',
              color: '#ffffff',
              fontSize: 64,
            }}
          >
            Hello
          </div>
        ),
        { width: 1200, height: 630 }
      )
    }
    const locale = rawLocale === 'sv' || rawLocale === 'km' ? rawLocale : 'en'

    const title = rawTitle.length > 100 ? `${rawTitle.slice(0, 97)}...` : rawTitle
    const subtitle =
      rawSubtitle.length > 180 ? `${rawSubtitle.slice(0, 177)}...` : rawSubtitle

    const siteName = SITE_NAMES[locale]
    const tagline = TAGLINES[locale]

    // Compose the union of all characters that will appear on the card.
    // We request only those glyphs from Google Fonts so we always get a font
    // file that actually contains what we want to render.
    const allText = `${siteName}${tagline}${title}${subtitle}sahakumkhmer.seENGLISHSVENSKAខ្មែរ`
    const latinChars = Array.from(allText).filter((c) => LATIN_CHAR_RE.test(c)).join('')
    const khmerChars = Array.from(allText).filter((c) => KHMER_CHAR_RE.test(c)).join('')

    // Fetching the fonts can fail (network glitch, Google Fonts hiccup); we
    // don't want a font outage to take down all our social previews, so
    // absorb errors and skip that font — Satori falls back to its built-in.
    //
    // Load both 400 (regular) and 700 (bold) — the card mixes the two and
    // Satori may refuse to render text in a weight it doesn't have on hand.
    const [latinRegSettled, latinBoldSettled, khmerRegSettled, khmerBoldSettled] =
      await Promise.allSettled([
        latinChars ? fetchGoogleFontForText('Inter', 400, latinChars) : Promise.resolve(null),
        latinChars ? fetchGoogleFontForText('Inter', 700, latinChars) : Promise.resolve(null),
        khmerChars ? fetchGoogleFontForText('Noto Sans Khmer', 400, khmerChars) : Promise.resolve(null),
        khmerChars ? fetchGoogleFontForText('Noto Sans Khmer', 700, khmerChars) : Promise.resolve(null),
      ])
    const latinRegular = latinRegSettled.status === 'fulfilled' ? latinRegSettled.value : null
    const latinBold = latinBoldSettled.status === 'fulfilled' ? latinBoldSettled.value : null
    const khmerRegular = khmerRegSettled.status === 'fulfilled' ? khmerRegSettled.value : null
    const khmerBold = khmerBoldSettled.status === 'fulfilled' ? khmerBoldSettled.value : null

    if (debug) {
      return new Response(
        JSON.stringify(
          {
            locale,
            title,
            subtitle,
            latinChars,
            khmerChars,
            latinRegular: { status: latinRegSettled.status, bytes: latinRegular?.byteLength ?? null },
            latinBold: { status: latinBoldSettled.status, bytes: latinBold?.byteLength ?? null },
            khmerRegular: { status: khmerRegSettled.status, bytes: khmerRegular?.byteLength ?? null },
            khmerBold: { status: khmerBoldSettled.status, bytes: khmerBold?.byteLength ?? null },
          },
          null,
          2
        ),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    for (const settled of [latinRegSettled, latinBoldSettled, khmerRegSettled, khmerBoldSettled]) {
      if (settled.status === 'rejected') {
        console.warn('[og] font fetch failed:', settled.reason)
      }
    }

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
              display: 'flex',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 16,
              backgroundColor: SAHAKUM_GOLD,
            }}
          />

          {/* Header: site name + tagline */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
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
                display: 'flex',
                marginTop: 8,
                fontSize: 22,
                color: 'rgba(255,255,255,0.7)',
                fontFamily: locale === 'km' ? 'NotoKhmer, Inter' : 'Inter, NotoKhmer',
              }}
            >
              {tagline}
            </div>
          </div>

          {/* Title + subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1040 }}>
            <div
              style={{
                display: 'flex',
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
                  display: 'flex',
                  marginTop: 24,
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
                display: 'flex',
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
                fontSize: 20,
                color: SAHAKUM_GOLD,
                fontFamily: locale === 'km' ? 'NotoKhmer, Inter' : 'Inter, NotoKhmer',
                fontWeight: 700,
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
          ...(latinRegular
            ? [{ name: 'Inter', data: latinRegular, style: 'normal' as const, weight: 400 as const }]
            : []),
          ...(latinBold
            ? [{ name: 'Inter', data: latinBold, style: 'normal' as const, weight: 700 as const }]
            : []),
          ...(khmerRegular
            ? [{ name: 'NotoKhmer', data: khmerRegular, style: 'normal' as const, weight: 400 as const }]
            : []),
          ...(khmerBold
            ? [{ name: 'NotoKhmer', data: khmerBold, style: 'normal' as const, weight: 700 as const }]
            : []),
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
