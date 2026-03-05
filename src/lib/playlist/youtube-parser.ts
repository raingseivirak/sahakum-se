export interface YouTubeVideoInfo {
  videoId: string
  url: string
  thumbnailUrl: string
  embedUrl: string
}

const YOUTUBE_URL_PATTERNS = [
  /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
]

export function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim()

  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = trimmed.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function parseYouTubeUrl(input: string): YouTubeVideoInfo | null {
  const videoId = extractYouTubeId(input)
  if (!videoId) return null

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  }
}

export function isValidYouTubeUrl(input: string): boolean {
  return extractYouTubeId(input) !== null
}

/**
 * Fetch video title via YouTube oEmbed (free, no API key needed).
 * Returns null on failure instead of throwing.
 */
export async function fetchVideoTitle(videoId: string): Promise<string | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const response = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) })
    if (!response.ok) return null

    const data = await response.json()
    return data.title || null
  } catch {
    return null
  }
}
