/**
 * Shared URL sanitisation for places where we never want to expose an
 * ephemeral / preview hostname to end users.
 *
 * Examples of where this matters:
 *  - `og:image` / canonical URLs embedded in HTML scraped by social platforms
 *  - links inside outgoing emails that may sit in inboxes for years
 *
 * Anything that resolves to `*.vercel.app`, ngrok tunnels, localhost, or a raw
 * IP is treated as "ephemeral" and rejected; callers should fall back to the
 * canonical domain instead.
 */

export const CANONICAL_SITE_URL = 'https://www.sahakumkhmer.se'

const EPHEMERAL_HOST_PATTERNS: RegExp[] = [
  /\.vercel\.app$/i,
  /\.vercel\.sh$/i,
  /\.ngrok(?:-free)?\.app$/i,
  /\.ngrok\.io$/i,
]

export function isEphemeralHost(hostname: string): boolean {
  if (!hostname) return true
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') return true
  if (hostname.endsWith('.local')) return true
  return EPHEMERAL_HOST_PATTERNS.some((re) => re.test(hostname))
}

/**
 * Returns `protocol//host` if the input parses as a URL whose host is not
 * ephemeral. Returns `null` for any unusable value so callers can fall through
 * to the next candidate.
 */
export function sanitizeBaseUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    if (isEphemeralHost(url.hostname)) return null
    return `${url.protocol}//${url.host}`
  } catch {
    return null
  }
}

/**
 * Walk a list of candidate base URLs (typically env vars), returning the first
 * one that passes sanitisation. Falls back to {@link CANONICAL_SITE_URL}.
 */
export function pickCanonicalBaseUrl(candidates: Array<string | null | undefined>): string {
  for (const candidate of candidates) {
    const sanitised = sanitizeBaseUrl(candidate)
    if (sanitised) return sanitised
  }
  return CANONICAL_SITE_URL
}
