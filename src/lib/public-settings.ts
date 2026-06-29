import { prisma } from '@/lib/prisma'

/**
 * Server-side helper for reading the "public-safe" portion of the
 * `Setting` table — organization info, contact info, social links and
 * site config that are safe to render in the public site.
 *
 * Mirrors the cached pattern used by `PermissionService` in
 * `src/lib/permissions.ts` so we don't hammer the DB on every page render.
 *
 * NEVER expose the `permissions` category through this helper — those
 * settings drive backend access control.
 */

export interface OrganizationSettings {
  name: string
  description: string | null
  mission: string | null
  vision: string | null
  logo: string | null
}

export interface ContactSettings {
  email: string | null
  phone: string | null
  address: string | null
  officeHours: string | null
}

export interface SocialSettings {
  facebook: string | null
  instagram: string | null
  youtube: string | null
  linkedin: string | null
}

export interface SiteSettings {
  title: string | null
  description: string | null
  keywords: string | null
  defaultLanguage: string | null
  twitterHandle: string | null
}

export interface PublicSettings {
  organization: OrganizationSettings
  contact: ContactSettings
  social: SocialSettings
  site: SiteSettings
}

const DEFAULT_SETTINGS: PublicSettings = {
  organization: {
    name: 'Sahakum Khmer',
    description: null,
    mission: null,
    vision: null,
    logo: null,
  },
  contact: {
    email: null,
    phone: null,
    address: null,
    officeHours: null,
  },
  social: {
    facebook: null,
    instagram: null,
    youtube: null,
    linkedin: null,
  },
  site: {
    title: null,
    description: null,
    keywords: null,
    defaultLanguage: null,
    twitterHandle: null,
  },
}

// Public-safe categories. Anything outside this list is never exposed.
const PUBLIC_CATEGORIES = ['organization', 'contact', 'social', 'site'] as const

// In-memory cache shared across requests in the same Node process / edge isolate
let cache: PublicSettings | null = null
let cacheExpiry = 0
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

function nonEmpty(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

function ensureProtocol(url: string | null): string | null {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

function buildSettings(rows: Array<{ key: string; value: string | null }>): PublicSettings {
  const map = new Map<string, string | null>()
  for (const row of rows) {
    map.set(row.key, row.value)
  }

  return {
    organization: {
      name: nonEmpty(map.get('org_name') ?? null) ?? 'Sahakum Khmer',
      description: nonEmpty(map.get('org_description') ?? null),
      mission: nonEmpty(map.get('org_mission') ?? null),
      vision: nonEmpty(map.get('org_vision') ?? null),
      logo: nonEmpty(map.get('org_logo') ?? null),
    },
    contact: {
      email: nonEmpty(map.get('contact_email') ?? null),
      phone: nonEmpty(map.get('contact_phone') ?? null),
      address: nonEmpty(map.get('contact_address') ?? null),
      officeHours: nonEmpty(map.get('office_hours') ?? null),
    },
    social: {
      facebook: ensureProtocol(nonEmpty(map.get('social_facebook') ?? null)),
      instagram: ensureProtocol(nonEmpty(map.get('social_instagram') ?? null)),
      youtube: ensureProtocol(nonEmpty(map.get('social_youtube') ?? null)),
      linkedin: ensureProtocol(nonEmpty(map.get('social_linkedin') ?? null)),
    },
    site: {
      title: nonEmpty(map.get('site_title') ?? null),
      description: nonEmpty(map.get('site_description') ?? null),
      keywords: nonEmpty(map.get('site_keywords') ?? null),
      defaultLanguage: nonEmpty(map.get('default_language') ?? null),
      twitterHandle: nonEmpty(map.get('social_twitter_handle') ?? null),
    },
  }
}

/**
 * Read the public-safe settings from the DB (cached for 5 min in memory).
 * Always resolves: when the DB is unreachable or unseeded, returns sensible
 * defaults so the public site never crashes.
 */
export async function getPublicSettings(): Promise<PublicSettings> {
  const now = Date.now()
  if (cache && now < cacheExpiry) {
    return cache
  }

  try {
    const rows = await prisma.setting.findMany({
      where: { category: { in: [...PUBLIC_CATEGORIES] } },
      select: { key: true, value: true },
    })

    cache = buildSettings(rows)
    cacheExpiry = now + CACHE_DURATION_MS
    return cache
  } catch (error) {
    console.error('[public-settings] failed to read settings, returning defaults', error)
    // Don't poison the cache on error — let the next request retry.
    return DEFAULT_SETTINGS
  }
}

/** Invalidate the cache after admin saves. Wire from the settings PUT/POST handler when convenient. */
export function invalidatePublicSettingsCache(): void {
  cache = null
  cacheExpiry = 0
}

/** Convenience: derive a list of "non-empty" social profile URLs for things like sameAs / footer rendering. */
export function getSocialUrls(settings: SocialSettings): Array<{ platform: 'facebook' | 'instagram' | 'youtube' | 'linkedin'; url: string }> {
  const out: Array<{ platform: 'facebook' | 'instagram' | 'youtube' | 'linkedin'; url: string }> = []
  if (settings.facebook) out.push({ platform: 'facebook', url: settings.facebook })
  if (settings.instagram) out.push({ platform: 'instagram', url: settings.instagram })
  if (settings.youtube) out.push({ platform: 'youtube', url: settings.youtube })
  if (settings.linkedin) out.push({ platform: 'linkedin', url: settings.linkedin })
  return out
}
