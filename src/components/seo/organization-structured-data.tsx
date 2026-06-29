import { getBaseUrl } from '@/lib/metadata'
import { getPublicSettings, getSocialUrls } from '@/lib/public-settings'

/**
 * schema.org Organization JSON-LD.
 *
 * Server component: reads contact + social info from the DB so Google's
 * Knowledge Panel / rich results stay in sync with whatever the admin has
 * configured in `/admin/settings`.
 */
export async function OrganizationStructuredData() {
  const baseUrl = getBaseUrl()
  const settings = await getPublicSettings()
  const socialUrls = getSocialUrls(settings.social).map(({ url }) => url)

  // Address: the admin enters a free-form multi-line string. We can't reliably
  // parse it into street / postal-code / city without forcing a structured form,
  // so we send it as `streetAddress` and leave country/locality as known defaults.
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressCountry: 'SE',
    addressLocality: 'Stockholm',
  }
  if (settings.contact.address) {
    address.streetAddress = settings.contact.address.replace(/\r?\n+/g, ', ')
  }

  const contactPoint: Record<string, unknown> = {
    '@type': 'ContactPoint',
    contactType: 'General Inquiries',
    availableLanguage: ['Swedish', 'English', 'Khmer'],
  }
  if (settings.contact.email) contactPoint.email = settings.contact.email
  if (settings.contact.phone) contactPoint.telephone = settings.contact.phone

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.organization.name,
    alternateName: 'សហគមខ្មែរ',
    description:
      settings.organization.description ||
      'Cambodian Community in Sweden - We help Cambodians integrate into Swedish society through community activities, cultural exchange and support.',
    url: baseUrl,
    logo: settings.organization.logo
      ? (settings.organization.logo.startsWith('http')
          ? settings.organization.logo
          : `${baseUrl}${settings.organization.logo.startsWith('/') ? '' : '/'}${settings.organization.logo}`)
      : `${baseUrl}/media/images/logo.svg`,
    address,
    contactPoint,
    foundingDate: '2024',
    keywords:
      settings.site.keywords ||
      'Cambodia, Sweden, Community, Culture, Integration, Khmer, Association',
    areaServed: {
      '@type': 'Country',
      name: 'Sweden',
    },
    knowsAbout: [
      'Cambodian Culture',
      'Swedish Integration',
      'Community Support',
      'Cultural Exchange',
      'Immigration Support',
    ],
  }

  if (socialUrls.length > 0) {
    structuredData.sameAs = socialUrls
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
