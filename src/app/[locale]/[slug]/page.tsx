import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/grid'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { LanguageAvailabilityNotice } from '@/components/ui/language-availability-notice'
import { CopyLinkButton } from '@/components/ui/copy-link-button'
import { createSafeHTML } from '@/lib/sanitize'
import { Footer } from '@/components/layout/footer'

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 300 // Revalidate every 5 minutes

interface PageProps {
  params: {
    locale: string
    slug: string
  }
}

async function getPage(slug: string, locale: string) {
  try {
    const page = await prisma.contentItem.findFirst({
      where: {
        slug: slug,
        type: 'PAGE',
        status: 'PUBLISHED'
      },
      include: {
        translations: {
          where: {
            language: locale
          }
        }
      }
    })

    if (!page || page.translations.length === 0) {
      return null
    }

    return {
      ...page,
      translation: page.translations[0]
    }
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const fontClass = params.locale === 'km' ? 'font-khmer' : 'font-sweden'

  const page = await getPage(params.slug, params.locale)

  if (!page) {
    notFound()
  }

  return (
    <div className={`min-h-screen bg-swedenBrand-neutral-white ${fontClass}`}>
      {/* Official Sweden Brand Skip Navigation */}
      <SwedenSkipNav locale={params.locale} />

      {/* Scroll-Aware Header */}
      <ScrollAwareHeader
        locale={params.locale}
        showBlogLink={false}
        stickyContent={{
          title: page.translation.title,
          excerpt: page.translation.excerpt
        }}
        translations={{
          sign_in: params.locale === 'km' ? 'ចូលប្រើប្រាស់' : params.locale === 'sv' ? 'Logga in' : 'Sign In',
          sign_out: params.locale === 'km' ? 'ចាកចេញ' : params.locale === 'sv' ? 'Logga ut' : 'Sign Out',
          admin: params.locale === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : params.locale === 'sv' ? 'Administratörspanel' : 'Admin Dashboard',
          profile: params.locale === 'km' ? 'ប្រវត្តិរូបផ្ទាល់ខ្លួន' : params.locale === 'sv' ? 'Min profil' : 'Profile',
          settings: params.locale === 'km' ? 'ការកំណត់' : params.locale === 'sv' ? 'Inställningar' : 'Settings'
        }}
        currentUrl={`/${params.locale}/${params.slug}`}
      />

      {/* Page Content with Sweden Brand Header */}
      <main id="main-content">
        <section className="relative bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--color-sweden-neutral-700)] text-white overflow-hidden">
          <Container size="wide" className="py-12 lg:py-16 relative">
            <div className="relative">
              <div className="max-w-sweden-content">
                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <h1 className={`text-white mb-6 text-4xl lg:text-6xl font-semibold leading-[1.29] tracking-[-0.36px] ${fontClass}`}>
                    <span className="inline-block">
                      {page.translation.title}
                    </span>
                  </h1>
                </div>
                {page.translation.excerpt && (
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <p className={`text-white/90 mb-6 text-xl lg:text-2xl font-medium leading-[1.42] tracking-[-0.36px] max-w-4xl ${fontClass}`}>
                      {page.translation.excerpt}
                    </p>
                  </div>
                )}

                {/* Page Sharing */}
                <div className="flex flex-wrap items-center gap-6 text-[var(--sahakum-gold)] mb-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                  <CopyLinkButton
                    url={`${typeof window !== 'undefined' ? window.location.origin : 'https://www.sahakumkhmer.se'}/${params.locale}/${params.slug}`}
                    title={page.translation.title}
                    copyText={params.locale === 'km' ? 'ចម្លងតំណ' : params.locale === 'en' ? 'Copy Link' : 'Kopiera länk'}
                    copiedText={params.locale === 'km' ? 'បានចម្លងតំណ!' : params.locale === 'en' ? 'Link Copied!' : 'Länk kopierad!'}
                    shareText={params.locale === 'km' ? 'ចែករំលែកទំព័រ' : params.locale === 'en' ? 'Share Page' : 'Dela sida'}
                    className="subtle-link-button"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Page Content */}
        <section className="py-8 lg:py-12">
          <Container size="wide">
            <div className="w-full">
              <LanguageAvailabilityNotice
                currentLocale={params.locale}
                slug={params.slug}
                className="mb-6"
              />

              {/* Swedish Sticky Layout - Like Join Page */}
              <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
                {/* Featured Image - Sticky Side Panel */}
                {page.featuredImg && (
                  <div className="lg:col-span-2">
                    <div className="sticky top-8">
                      <img
                        src={page.featuredImg}
                        alt={page.translation.title}
                        className="w-full h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] object-cover shadow-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Article Content - Scrollable */}
                <div className={page.featuredImg ? "lg:col-span-3" : "lg:col-span-5"}>
                  <article
                    className={`prose prose-sweden prose-sm max-w-none ${fontClass}`}
                    data-language={params.locale}
                    dangerouslySetInnerHTML={createSafeHTML(page.translation.content)}
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export async function generateStaticParams() {
  try {
    const pages = await prisma.contentItem.findMany({
      where: {
        type: 'PAGE',
        status: 'PUBLISHED'
      },
      include: {
        translations: true
      }
    })

    const params = []

    for (const page of pages) {
      for (const translation of page.translations) {
        params.push({
          locale: translation.language,
          slug: page.slug
        })
      }
    }

    return params
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export async function generateMetadata({ params }: PageProps) {
  const page = await getPage(params.slug, params.locale)

  if (!page) {
    return {
      title: 'Page Not Found'
    }
  }

  // Generate excerpt from content if no meta description exists
  const generateExcerpt = (content: string, maxLength: number = 160): string => {
    const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength).trim() + '...'
      : textContent
  }

  const title = page.translation.title
  const description = page.translation.metaDescription ||
                     page.translation.excerpt ||
                     generateExcerpt(page.translation.content)

  // Site info with multilingual support
  const siteInfo = {
    sv: { name: 'Sahakum Khmer', tagline: 'Kambodjanernas gemenskap i Sverige' },
    en: { name: 'Sahakum Khmer', tagline: 'Cambodian Community in Sweden' },
    km: { name: 'សហគមខ្មែរ', tagline: 'សហគមន៍ខ្មែរនៅស៊ុយអែត' }
  }

  const currentSite = siteInfo[params.locale as keyof typeof siteInfo] || siteInfo.en
  const fullTitle = `${title} | ${currentSite.name}`

  // Canonical URL
  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.sahakumkhmer.se'
  const canonicalUrl = `${baseUrl}/${params.locale}/${params.slug}`

  // Enhanced image handling with fallbacks
  const getImageUrl = (imagePath?: string | null): string => {
    if (imagePath) {
      if (imagePath.startsWith('http')) return imagePath
      return imagePath.startsWith('/') ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`
    }
    return `${baseUrl}/media/images/sahakum-social-share.jpg`
  }

  const imageUrl = getImageUrl(page.featuredImg)

  return {
    title: fullTitle,
    description,

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // Open Graph tags
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: currentSite.name,
      locale: params.locale,
      type: 'article',
      publishedTime: page.publishedAt || undefined,
      modifiedTime: page.updatedAt || undefined,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/jpeg',
        }
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: title.length > 70 ? title.substring(0, 67) + '...' : title,
      description: description.length > 200 ? description.substring(0, 197) + '...' : description,
      creator: '@sahakumkhmer',
      site: '@sahakumkhmer',
      images: [imageUrl],
    },

    // SEO
    robots: {
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

    // Additional metadata
    other: {
      'theme-color': '#0D1931',
      'msapplication-TileColor': '#0D1931',
    }
  }
}