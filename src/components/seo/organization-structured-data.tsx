'use client'

export function OrganizationStructuredData() {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://www.sahakumkhmer.se'

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sahakum Khmer",
    "alternateName": "សហគមខ្មែរ",
    "description": "Cambodian Community in Sweden - We help Cambodians integrate into Swedish society through community activities, cultural exchange and support.",
    "url": baseUrl,
    "logo": `${baseUrl}/media/images/sahakum-logo.png`,
    "image": `${baseUrl}/media/images/sahakum-social-share.jpg`,
    "sameAs": [
      // Add social media links when available
      // "https://facebook.com/sahakumkhmer",
      // "https://instagram.com/sahakumkhmer",
      // "https://twitter.com/sahakumkhmer"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SE",
      "addressLocality": "Stockholm"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "General Inquiries",
      "availableLanguage": ["Swedish", "English", "Khmer"]
    },
    "foundingDate": "2024",
    "keywords": "Cambodia, Sweden, Community, Culture, Integration, Khmer, Association",
    "areaServed": {
      "@type": "Country",
      "name": "Sweden"
    },
    "knowsAbout": [
      "Cambodian Culture",
      "Swedish Integration",
      "Community Support",
      "Cultural Exchange",
      "Immigration Support"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}