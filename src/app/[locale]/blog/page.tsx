import Link from 'next/link'
import { Container } from '@/components/layout/grid'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo'
import { SwedenH1, SwedenH2, SwedenBody } from '@/components/ui/sweden-typography'
import { SwedishCard, SwedishCardHeader, SwedishCardContent, SwedishCardTitle } from '@/components/ui/swedish-card'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { type Language } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

interface BlogPageProps {
  params: { locale: string }
  searchParams: { page?: string; category?: string }
}

// Translations for blog
const blogTranslations = {
  sv: {
    title: 'Blogg',
    subtitle: 'Nyheter, berättelser och insikter från vår gemenskap',
    readMore: 'Läs mer',
    publishedOn: 'Publicerad',
    by: 'av',
    noPostsFound: 'Inga inlägg hittades',
    noPostsDescription: 'Det finns inga publicerade blogginlägg just nu. Kom tillbaka senare!',
    loadingPosts: 'Laddar inlägg...'
  },
  en: {
    title: 'Blog',
    subtitle: 'News, stories and insights from our community',
    readMore: 'Read more',
    publishedOn: 'Published on',
    by: 'by',
    noPostsFound: 'No posts found',
    noPostsDescription: 'There are no published blog posts at the moment. Check back later!',
    loadingPosts: 'Loading posts...'
  },
  km: {
    title: 'ប្លុក',
    subtitle: 'ព័ត៌មាន រឿងរ៉ាវ និងការយល់ដឹងពីសហគមន៍របស់យើង',
    readMore: 'អានបន្ថែម',
    publishedOn: 'បានបោះពុម្ពនៅ',
    by: 'ដោយ',
    noPostsFound: 'រកមិនឃើញប្រកាស',
    noPostsDescription: 'មិនមានប្រកាសប្លុកដែលបានបោះពុម្ពនៅពេលនេះទេ។ សូមពិនិត្យមកវិញពេលក្រោយ!',
    loadingPosts: 'កំពុងផ្ទុកប្រកាស...'
  }
}

async function getPosts(locale: string, page: number = 1, category?: string) {
  try {
    const limit = 6
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      type: 'POST',
      status: 'PUBLISHED',
      translations: {
        some: {
          language: locale
        }
      }
    }

    // Get total count
    const total = await prisma.contentItem.count({ where })

    // Get posts
    const posts = await prisma.contentItem.findMany({
      where,
      include: {
        author: {
          select: { name: true, email: true }
        },
        translations: {
          where: { language: locale }
        },
        categories: {
          include: {
            category: {
              include: {
                translations: {
                  where: { language: locale }
                }
              }
            }
          }
        },
        tags: {
          include: {
            tag: {
              include: {
                translations: {
                  where: { language: locale }
                }
              }
            }
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip,
      take: limit
    })

    // Transform to match API format
    const transformedPosts = posts.map(post => ({
      ...post,
      translation: post.translations[0] || null,
      categories: post.categories.map(c => ({
        slug: c.category.slug,
        name: c.category.translations[0]?.title || c.category.slug
      })),
      tags: post.tags.map(t => ({
        slug: t.tag.slug,
        name: t.tag.translations[0]?.title || t.tag.slug
      }))
    }))

    const totalPages = Math.ceil(total / limit)

    return {
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { posts: [], pagination: { page: 1, totalPages: 0, hasNext: false, hasPrev: false } }
  }
}

function formatDate(dateString: string, locale: string): string {
  const date = new Date(dateString)

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }

  return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : locale, options).format(date)
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const t = (key: string) => blogTranslations[params.locale as keyof typeof blogTranslations]?.[key] || blogTranslations.sv[key] || key

  const page = parseInt(searchParams.page || '1')
  const category = searchParams.category

  const { posts, pagination } = await getPosts(params.locale, page, category)

  // Determine font class based on locale
  const fontClass = params.locale === 'km' ? 'font-khmer' : 'font-sweden'

  return (
    <div className={`min-h-screen bg-swedenBrand-neutral-white ${fontClass}`}>
      {/* Official Sweden Brand Skip Navigation */}
      <SwedenSkipNav locale={params.locale} />

      {/* Header - Consistent with homepage Swedish Brand styling */}
      <header className="bg-[var(--sahakum-navy)] text-white shadow-lg border-b border-[var(--sahakum-gold)]/20">
        <Container size="wide">
          <nav className="flex items-center justify-between py-4 lg:py-6">
            {/* Swedish Brand Logo */}
            <Link href={`/${params.locale}`} className="block">
              <SwedenBrandLogo
                locale={params.locale}
                size="md"
                variant="horizontal"
                className="hover:opacity-90 transition-opacity duration-200"
              />
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link
                href={`/${params.locale}`}
                className="text-white hover:text-[var(--sahakum-gold)] transition-colors duration-200 text-sm font-medium"
              >
                {params.locale === 'sv' ? 'Hem' :
                 params.locale === 'km' ? 'ទំព័រដើម' : 'Home'}
              </Link>
              <LanguageSwitcher
                currentLocale={params.locale as Language}
                variant="compact"
              />
            </div>
          </nav>
        </Container>
      </header>

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section - Clean Sophisticated Sahakum style */}
        <section className="relative bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--color-sweden-neutral-700)] text-white overflow-hidden">
          <Container size="wide" className="py-12 lg:py-16 relative">
            <div className="max-w-sweden-content">
              {/* Enhanced animated welcome message */}
              <div className="animate-fade-in-up">
                <SwedenH1 className="text-white mb-4 text-4xl lg:text-5xl" locale={params.locale}>
                  <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {t('title')}
                  </span>
                </SwedenH1>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <SwedenBody className="text-white/90 mb-6 max-w-3xl text-base lg:text-lg leading-relaxed" locale={params.locale}>
                  {t('subtitle')}
                </SwedenBody>
              </div>
            </div>
          </Container>
        </section>

        {/* Blog Posts */}
        <section className="py-8 lg:py-12">
          <Container size="wide">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <SwedenH2 className="text-sahakum-navy-900 mb-4" locale={params.locale}>
                  {t('noPostsFound')}
                </SwedenH2>
                <SwedenBody className="text-sahakum-navy-600" locale={params.locale}>
                  {t('noPostsDescription')}
                </SwedenBody>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post: any) => (
                  <SwedishCard key={post.id} href={`/${params.locale}/blog/${post.slug}`} variant="borderless" className="group hover:shadow-xl h-full !rounded-none">
                    {post.featuredImg && (
                      <div className="aspect-video bg-gray-200 overflow-hidden">
                        <img
                          src={post.featuredImg}
                          alt={post.translation?.title || ''}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}
                    <SwedishCardHeader>
                      <SwedishCardTitle className="text-[var(--sahakum-navy)] group-hover:text-[var(--sahakum-gold)] transition-colors duration-200" locale={params.locale}>
                        {post.translation?.title}
                      </SwedishCardTitle>
                      <div className="flex items-center space-x-2 text-sm text-sahakum-navy-600">
                        <span>{formatDate(post.publishedAt, params.locale)}</span>
                        <span>•</span>
                        <span>{t('by')} {post.author.name}</span>
                      </div>
                    </SwedishCardHeader>
                    <SwedishCardContent>
                      {post.translation?.excerpt && (
                        <p className={`text-[var(--sahakum-navy-600)] leading-relaxed mb-4 ${fontClass}`}>
                          {post.translation.excerpt}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {post.categories?.slice(0, 2).map((category: any) => (
                          <span
                            key={category.slug}
                            className="text-xs bg-[var(--sahakum-gold)]/20 text-[var(--sahakum-navy)] px-2 py-1"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </SwedishCardContent>
                  </SwedishCard>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
                {pagination.hasPrev && (
                  <a
                    href={`/${params.locale}/blog?page=${pagination.page - 1}${category ? `&category=${category}` : ''}`}
                    className="px-4 py-2 bg-[var(--sahakum-gold)] text-white rounded-sm hover:bg-[var(--sahakum-gold-600)] transition-colors"
                  >
                    ←
                  </a>
                )}

                <span className="text-sahakum-navy-600">
                  {pagination.page} / {pagination.totalPages}
                </span>

                {pagination.hasNext && (
                  <a
                    href={`/${params.locale}/blog?page=${pagination.page + 1}${category ? `&category=${category}` : ''}`}
                    className="px-4 py-2 bg-[var(--sahakum-gold)] text-white rounded-sm hover:bg-[var(--sahakum-gold-600)] transition-colors"
                  >
                    →
                  </a>
                )}
              </div>
            )}
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