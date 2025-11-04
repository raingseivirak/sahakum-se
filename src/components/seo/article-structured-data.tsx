'use client'

interface ArticleStructuredDataProps {
  title: string
  description: string
  author: string
  publishedDate: string
  modifiedDate?: string
  imageUrl?: string
  locale: string
  slug: string
  categories?: string[]
  tags?: string[]
}

export function ArticleStructuredData({
  title,
  description,
  author,
  publishedDate,
  modifiedDate,
  imageUrl,
  locale,
  slug,
  categories = [],
  tags = []
}: ArticleStructuredDataProps) {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://www.sahakumkhmer.se'

  const articleUrl = `${baseUrl}/${locale}/blog/${encodeURIComponent(slug)}`
  const defaultImage = `${baseUrl}/media/images/sahakum-social-share.jpg`

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": imageUrl || defaultImage,
    "datePublished": publishedDate,
    "dateModified": modifiedDate || publishedDate,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Sahakum Khmer",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/media/images/sahakum-logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "url": articleUrl,
    "inLanguage": locale,
    ...(categories.length > 0 && { "articleSection": categories.join(', ') }),
    ...(tags.length > 0 && { "keywords": tags.join(', ') })
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}