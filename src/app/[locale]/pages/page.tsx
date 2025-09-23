import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/grid'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { SwedishCard, SwedishCardHeader, SwedishCardContent, SwedishCardTitle } from '@/components/ui/swedish-card'
import { SwedenH1, SwedenBody } from '@/components/ui/sweden-typography'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'
import Image from 'next/image'

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 300 // Revalidate every 5 minutes

const translations = {
  sv: {
    "pages.title": "Alla sidor",
    "pages.subtitle": "Utforska allt innehåll på vår webbplats",
    "pages.description": "Hitta alla tillgängliga sidor och artiklar sorterade efter språk.",
    "pages.no_content": "Inget innehåll tillgängligt för tillfället.",
    "pages.read_more": "Läs mer",
    "nav.sign_in": "Logga in",
    "nav.sign_out": "Logga ut",
    "nav.admin": "Administratörspanel",
    "nav.profile": "Min profil",
    "nav.settings": "Inställningar"
  },
  en: {
    "pages.title": "All Pages",
    "pages.subtitle": "Explore all content on our website",
    "pages.description": "Find all available pages and articles organized by language.",
    "pages.no_content": "No content available at the moment.",
    "pages.read_more": "Read more",
    "nav.sign_in": "Sign In",
    "nav.sign_out": "Sign Out",
    "nav.admin": "Admin Dashboard",
    "nav.profile": "Profile",
    "nav.settings": "Settings"
  },
  km: {
    "pages.title": "ទំព័រទាំងអស់",
    "pages.subtitle": "ស្វែងរកមាតិកាទាំងអស់នៅលើគេហទំព័ររបស់យើង",
    "pages.description": "រកមើលទំព័រ និងអត្ថបទទាំងអស់ដែលបានរៀបចំតាមភាសា។",
    "pages.no_content": "មិនមានមាតិកាអ្វីទេនៅពេលនេះ។",
    "pages.read_more": "អានបន្ថែម",
    "nav.sign_in": "ចូលប្រើប្រាស់",
    "nav.sign_out": "ចាកចេញ",
    "nav.admin": "ផ្ទាំងគ្រប់គ្រង",
    "nav.profile": "ប្រវត្តិរូបផ្ទាល់ខ្លួន",
    "nav.settings": "ការកំណត់"
  }
}

interface PagesListProps {
  params: { locale: keyof typeof translations }
}

async function getPages(locale: string) {
  try {
    const pages = await prisma.contentItem.findMany({
      where: {
        type: 'PAGE',
        status: 'PUBLISHED'
      },
      include: {
        translations: {
          where: {
            language: locale
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return pages.filter(page => page.translations.length > 0).map(page => ({
      ...page,
      translation: page.translations[0]
    }))
  } catch (error) {
    console.error('Error fetching pages:', error)
    return []
  }
}

export default async function PagesListPage({ params }: PagesListProps) {
  const t = (key: string) => translations[params.locale]?.[key] || translations.en[key] || key
  const fontClass = params.locale === 'km' ? 'font-khmer' : 'font-sweden'

  const pages = await getPages(params.locale)

  return (
    <div className={`min-h-screen bg-swedenBrand-neutral-white ${fontClass}`}>
      {/* Official Sweden Brand Skip Navigation */}
      <SwedenSkipNav locale={params.locale} />

      {/* Scroll-Aware Header */}
      <ScrollAwareHeader
        locale={params.locale}
        showBlogLink={false}
        stickyContent={{
          title: t('pages.title'),
          excerpt: t('pages.description')
        }}
        translations={{
          sign_in: t('nav.sign_in'),
          sign_out: t('nav.sign_out'),
          admin: t('nav.admin'),
          profile: t('nav.profile'),
          settings: t('nav.settings')
        }}
        currentUrl={`/${params.locale}/pages`}
      />

      {/* Hero Section - Clean Sophisticated Sahakum style */}
      <section className="relative bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--color-sweden-neutral-700)] text-white overflow-hidden">
        <Container size="wide" className="py-12 lg:py-16 relative">
          <div className="max-w-sweden-content">
            {/* Enhanced animated welcome message */}
            <div className="animate-fade-in-up">
              <SwedenH1 className="text-white mb-4 text-4xl lg:text-5xl" locale={params.locale}>
                <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  {t('pages.title')}
                </span>
              </SwedenH1>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <SwedenBody className="text-white/90 mb-6 max-w-3xl text-base lg:text-lg leading-relaxed" locale={params.locale}>
                {t('pages.subtitle')}
              </SwedenBody>
            </div>
          </div>
        </Container>
      </section>

      {/* Pages Grid */}
      <section className="py-8 lg:py-12">
        <Container size="wide">
          {pages.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => (
                <SwedishCard key={page.id} className="h-full">
                  {page.featuredImg && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={page.featuredImg}
                        alt={page.translation.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <SwedishCardHeader>
                    <SwedishCardTitle className={fontClass}>
                      {page.translation.title}
                    </SwedishCardTitle>
                  </SwedishCardHeader>
                  <SwedishCardContent className="flex-1 flex flex-col">
                    {page.translation.excerpt && (
                      <p className={`text-[var(--sahakum-navy)]/70 mb-4 flex-1 ${fontClass}`}>
                        {page.translation.excerpt}
                      </p>
                    )}
                    <Link
                      href={`/${params.locale}/${page.slug}`}
                      className={`inline-flex items-center text-[var(--sahakum-gold)] hover:text-[var(--sahakum-navy)] transition-colors duration-200 font-medium ${fontClass}`}
                    >
                      {t('pages.read_more')} →
                    </Link>
                  </SwedishCardContent>
                </SwedishCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className={`text-[var(--sahakum-navy)]/70 text-lg ${fontClass}`}>
                {t('pages.no_content')}
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'sv' },
    { locale: 'km' }
  ]
}

export async function generateMetadata({ params }: PagesListProps) {
  const t = (key: string) => translations[params.locale]?.[key] || translations.en[key] || key

  return {
    title: t('pages.title'),
    description: t('pages.description'),
    openGraph: {
      title: t('pages.title'),
      description: t('pages.description'),
      locale: params.locale
    }
  }
}