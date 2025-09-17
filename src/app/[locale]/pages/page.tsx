import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/grid'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { SwedishCard, SwedishCardHeader, SwedishCardContent, SwedishCardTitle } from '@/components/ui/swedish-card'
import Link from 'next/link'
import Image from 'next/image'

const translations = {
  sv: {
    "pages.title": "Alla sidor",
    "pages.subtitle": "Utforska allt innehåll på vår webbplats",
    "pages.description": "Hitta alla tillgängliga sidor och artiklar sorterade efter språk.",
    "pages.no_content": "Inget innehåll tillgängligt för tillfället.",
    "pages.read_more": "Läs mer"
  },
  en: {
    "pages.title": "All Pages",
    "pages.subtitle": "Explore all content on our website",
    "pages.description": "Find all available pages and articles organized by language.",
    "pages.no_content": "No content available at the moment.",
    "pages.read_more": "Read more"
  },
  km: {
    "pages.title": "ទំព័រទាំងអស់",
    "pages.subtitle": "ស្វែងរកមាតិកាទាំងអស់នៅលើគេហទំព័ររបស់យើង",
    "pages.description": "រកមើលទំព័រ និងអត្ថបទទាំងអស់ដែលបានរៀបចំតាមភាសា។",
    "pages.no_content": "មិនមានមាតិកាអ្វីទេនៅពេលនេះ។",
    "pages.read_more": "អានបន្ថែម"
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
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--sweden-blue-700)] text-white overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--sahakum-gold)]/5 via-transparent to-[var(--sahakum-gold)]/5 animate-pulse"></div>

        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FECB00' fill-opacity='0.6'%3E%3Cpath d='M30 10 L40 25 L30 40 L20 25 Z'/%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>

        <Container size="wide">
          <div className="py-12 lg:py-16 relative">
            <div className="max-w-sweden-content">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h1 className={`text-white mb-4 text-4xl lg:text-5xl font-semibold leading-[1.29] tracking-[-0.36px] ${fontClass}`}>
                  {t('pages.title')}
                </h1>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <p className={`text-[var(--sahakum-gold)] mb-4 text-lg lg:text-xl font-medium ${fontClass}`}>
                  {t('pages.subtitle')}
                </p>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <p className={`text-white/90 mb-6 text-base lg:text-lg leading-relaxed max-w-3xl ${fontClass}`}>
                  {t('pages.description')}
                </p>
              </div>
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
      <footer className="bg-[var(--sahakum-navy)] text-white py-12 border-t border-[var(--sahakum-gold)]/20">
        <Container size="wide">
          <div className="text-center">
            <p className={`text-[var(--sahakum-gold)] mb-0 ${fontClass}`}>
              © 2025 Sahakum Khmer. {params.locale === 'km' ? 'រក្សាសិទ្ធិគ្រប់យ៉ាង។' :
                                   params.locale === 'en' ? 'All rights reserved.' :
                                   'Alla rättigheter förbehållna.'}
            </p>
          </div>
        </Container>
      </footer>
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