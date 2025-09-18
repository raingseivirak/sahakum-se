import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/grid'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { LanguageAvailabilityNotice } from '@/components/ui/language-availability-notice'

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
              </div>
            </div>
          </Container>
        </section>

        {/* Page Content */}
        <section className="py-8 lg:py-12">
          <Container size="wide">
            <div className="max-w-sweden-content mx-auto">
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
                    dangerouslySetInnerHTML={{ __html: page.translation.content || '' }}
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Footer - Consistent with homepage */}
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

  return {
    title: page.translation.title,
    description: page.translation.metaDescription || page.translation.excerpt || page.translation.title,
    openGraph: {
      title: page.translation.title,
      description: page.translation.metaDescription || page.translation.excerpt,
      locale: params.locale,
      images: page.featuredImg ? [page.featuredImg] : undefined
    }
  }
}