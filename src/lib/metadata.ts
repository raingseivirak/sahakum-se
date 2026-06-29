import type { Metadata } from 'next'
import { pickCanonicalBaseUrl } from '@/lib/url-sanitize'

/**
 * Centralised metadata builder for the public site.
 *
 * Goals:
 *  - Every public page produces a valid Open Graph + Twitter card
 *  - Card title / description / locale all adapt to the current language
 *  - When a page does not have its own featured image, we fall back to a
 *    dynamically generated branded OG image (see `/api/og`) so social
 *    previews never collapse to just the favicon / logo.
 *
 * Use this helper from `generateMetadata` in any page under `src/app/[locale]/...`.
 */

export type AppLocale = 'en' | 'sv' | 'km'

export const SUPPORTED_LOCALES: AppLocale[] = ['en', 'sv', 'km']

const OG_LOCALE_MAP: Record<AppLocale, string> = {
  en: 'en_US',
  sv: 'sv_SE',
  km: 'km_KH',
}

const SITE_INFO: Record<AppLocale, { name: string; tagline: string }> = {
  sv: { name: 'Sahakum Khmer', tagline: 'Kambodjanernas gemenskap i Sverige' },
  en: { name: 'Sahakum Khmer', tagline: 'Cambodian Community in Sweden' },
  km: { name: 'សហគមខ្មែរ', tagline: 'សហគមន៍ខ្មែរនៅស៊ុយអែត' },
}

/**
 * Resolve the canonical site base URL — production domain in prod, env override otherwise.
 *
 * Any env value pointing at an ephemeral host (`*.vercel.app`, ngrok, localhost…) is
 * skipped so that `og:image`, canonical, and alternate URLs embedded in HTML always
 * point at `www.sahakumkhmer.se`, not at whichever Vercel preview rendered the page.
 */
export function getBaseUrl(): string {
  return pickCanonicalBaseUrl([
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ])
}

export function normalizeLocale(locale: string | undefined | null): AppLocale {
  if (locale === 'sv' || locale === 'en' || locale === 'km') return locale
  return 'en'
}

export function getOgLocale(locale: string): string {
  return OG_LOCALE_MAP[normalizeLocale(locale)]
}

export function getSiteInfo(locale: string) {
  return SITE_INFO[normalizeLocale(locale)]
}

/**
 * Resolve a possibly-relative image path to an absolute URL.
 * Returns `null` when no usable image is provided.
 */
export function resolveImageUrl(imagePath?: string | null): string | null {
  if (!imagePath) return null
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  const baseUrl = getBaseUrl()
  return imagePath.startsWith('/') ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`
}

/**
 * Build the URL of a dynamically rendered OG image at `/api/og`.
 *
 * The endpoint accepts `title`, `subtitle`, and `locale` and returns a
 * 1200×630 branded card — this guarantees every page has a meaningful
 * social preview even without an explicit featured image.
 */
export function getDynamicOgImageUrl(params: {
  title: string
  description?: string
  locale: string
}): string {
  const baseUrl = getBaseUrl()
  const search = new URLSearchParams({
    title: params.title.slice(0, 120),
    locale: normalizeLocale(params.locale),
  })
  if (params.description) {
    search.set('subtitle', params.description.slice(0, 200))
  }
  return `${baseUrl}/api/og?${search.toString()}`
}

export interface BuildPageMetadataInput {
  locale: string
  /** Page title (already localised). Will be suffixed with " | Sahakum Khmer". */
  title: string
  /** Page description / excerpt (already localised). */
  description: string
  /**
   * URL path **relative to the locale root**, e.g. `/board` or `/blog/my-post`.
   * Leading slash is optional. Pass empty string for the homepage.
   */
  path?: string
  /**
   * Featured image — relative path (e.g. `/media/images/foo.png`) or absolute URL.
   * When omitted, we generate a branded OG card at runtime so the share preview
   * never falls back to just the logo / favicon.
   */
  image?: string | null
  /** `'website'` (default) or `'article'` for blog posts / events / initiatives. */
  type?: 'website' | 'article'
  publishedTime?: string | Date | null
  modifiedTime?: string | Date | null
  authors?: string[]
  tags?: string[]
  /** Whether crawlers may index the page. Defaults to `true`. */
  index?: boolean
  /** Append a localised site-name suffix to the title. Defaults to `true`. */
  appendSiteName?: boolean
}

/**
 * Build a complete Next.js `Metadata` object with locale-aware Open Graph
 * + Twitter card data, alternate language URLs, and a guaranteed share image.
 */
export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const locale = normalizeLocale(input.locale)
  const baseUrl = getBaseUrl()
  const site = getSiteInfo(locale)
  const rawPath = input.path ?? ''
  const cleanPath = rawPath
    ? (rawPath.startsWith('/') ? rawPath : `/${rawPath}`)
    : ''
  const canonicalUrl = `${baseUrl}/${locale}${cleanPath}`

  const fullTitle = input.appendSiteName === false
    ? input.title
    : `${input.title} | ${site.name}`

  const resolvedImage = resolveImageUrl(input.image)
  const imageUrl = resolvedImage ?? getDynamicOgImageUrl({
    title: input.title,
    description: input.description,
    locale,
  })

  const languageAlternates: Record<string, string> = {}
  for (const altLocale of SUPPORTED_LOCALES) {
    languageAlternates[altLocale] = `${baseUrl}/${altLocale}${cleanPath}`
  }
  languageAlternates['x-default'] = `${baseUrl}/en${cleanPath}`

  const toIso = (value: string | Date | null | undefined): string | undefined => {
    if (!value) return undefined
    if (value instanceof Date) return value.toISOString()
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
  }

  const ogType = input.type ?? 'website'

  const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: fullTitle,
    description: input.description,

    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },

    openGraph: {
      title: fullTitle,
      description: input.description,
      url: canonicalUrl,
      siteName: site.name,
      locale: getOgLocale(locale),
      alternateLocale: SUPPORTED_LOCALES
        .filter((l) => l !== locale)
        .map((l) => getOgLocale(l)),
      type: ogType,
      ...(ogType === 'article'
        ? {
            publishedTime: toIso(input.publishedTime),
            modifiedTime: toIso(input.modifiedTime),
            authors: input.authors,
            tags: input.tags,
          }
        : {}),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title:
        input.title.length > 70 ? `${input.title.slice(0, 67)}...` : input.title,
      description:
        input.description.length > 200
          ? `${input.description.slice(0, 197)}...`
          : input.description,
      site: '@sahakumkhmer',
      creator: '@sahakumkhmer',
      images: [imageUrl],
    },

    robots: input.index === false
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },

    other: {
      'theme-color': '#0D1931',
      'msapplication-TileColor': '#0D1931',
    },
  }

  return metadata
}
