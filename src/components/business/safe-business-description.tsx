'use client'

import { createSafeHTML } from '@/lib/sanitize'

export function SafeBusinessDescription({ html }: { html: string }) {
  return <div className="prose prose-sweden max-w-none" dangerouslySetInnerHTML={createSafeHTML(html)} />
}

