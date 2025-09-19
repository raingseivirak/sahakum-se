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

// Predefined community categories - matches admin categories
const COMMUNITY_CATEGORIES = {
  'living-sweden': {
    sv: { name: 'Bo i Sverige', icon: '🏠', description: 'Boende, vård, byråkrati' },
    en: { name: 'Living in Sweden', icon: '🏠', description: 'Housing, healthcare, bureaucracy' },
    km: { name: 'រស់នៅស៊ុយអែត', icon: '🏠', description: 'លំនៅដ្ឋាន សុខភាព អាជ្ញាធរ' }
  },
  'culture-heritage': {
    sv: { name: 'Kultur & Arv', icon: '🎭', description: 'Festivaler, traditioner, språk' },
    en: { name: 'Culture & Heritage', icon: '🎭', description: 'Festivals, traditions, language' },
    km: { name: 'វប្បធម៌ និងបេតិកភណ្ឌ', icon: '🎭', description: 'ពិធីបុណ្យ ប្រពៃណី ភាសា' }
  },
  'work-business': {
    sv: { name: 'Arbete & Företag', icon: '💼', description: 'Jobb, entreprenörskap, nätverk' },
    en: { name: 'Work & Business', icon: '💼', description: 'Jobs, entrepreneurship, networking' },
    km: { name: 'ការងារ និងអាជីវកម្ម', icon: '💼', description: 'ការងារ សហគ្រិនភាព បណ្តាញ' }
  },
  'community': {
    sv: { name: 'Gemenskapsberättelser', icon: '👨‍👩‍👧‍👦', description: 'Personliga resor, intervjuer' },
    en: { name: 'Community Stories', icon: '👨‍👩‍👧‍👦', description: 'Personal journeys, interviews' },
    km: { name: 'រឿងរ៉ាវសហគមន៍', icon: '👨‍👩‍👧‍👦', description: 'ដំណើរជីវិត បទសម្ភាសន៍' }
  },
  'news': {
    sv: { name: 'Nyheter & Uppdateringar', icon: '📰', description: 'Evenemang, policyändringar' },
    en: { name: 'News & Updates', icon: '📰', description: 'Events, policy changes' },
    km: { name: 'ព័ត៌មាន និងការអាប់ដេត', icon: '📰', description: 'ព្រឹត្តិការណ៍ ការផ្លាស់ប្តូរគោលនយោបាយ' }
  },
  'guides': {
    sv: { name: 'Guider & Resurser', icon: '📚', description: 'Hur-till artiklar, användbara länkar' },
    en: { name: 'Guides & Resources', icon: '📚', description: 'How-to articles, useful links' },
    km: { name: 'មគ្គុទេសក៍ និងធនធាន', icon: '📚', description: 'អត្ថបទណែនាំ តំណភ្ជាប់មានប្រយោជន៍' }
  }
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

async function getPosts(locale: string, page: number = 1, category?: string) {
  try {
    const limit = 12 // Increased for better layout
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

    // Transform to match API format with enhanced data
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
      })),
      readingTime: calculateReadingTime(post.translations[0]?.content || ''),
      excerpt: post.translations[0]?.excerpt || post.translations[0]?.content?.substring(0, 150) + '...' || ''
    }))

    const totalPages = Math.ceil(total / limit)

    return {
      posts: transformedPosts,
      featuredPost: transformedPosts.find(p => p.featuredImg) || transformedPosts[0],
      recentPosts: transformedPosts.slice(0, 6),
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
    return {
      posts: [],
      featuredPost: null,
      recentPosts: [],
      pagination: { page: 1, totalPages: 0, hasNext: false, hasPrev: false }
    }
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

        {/* Featured Article Hero Section */}
        {posts.length > 0 && (
          <section className="py-8 lg:py-12 bg-gradient-to-br from-[var(--sahakum-gold)]/5 to-white">
            <Container size="wide">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Featured Article Content */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-[var(--sahakum-navy)]/70">
                      <span className="bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)] px-2 py-1 text-xs font-medium">
                        {params.locale === 'sv' ? 'UTVALDA' :
                         params.locale === 'km' ? 'ពិសេស' : 'FEATURED'}
                      </span>
                      <span>{formatDate(posts[0].publishedAt, params.locale)}</span>
                      <span>•</span>
                      <span>{posts[0].readingTime} {params.locale === 'sv' ? 'min' : params.locale === 'km' ? 'នាទី' : 'min'}</span>
                    </div>

                    <SwedishCardTitle as="h2" size="lg" className="text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] transition-colors" locale={params.locale}>
                      <Link href={`/${params.locale}/blog/${posts[0].slug}`}>
                        {posts[0].translation?.title}
                      </Link>
                    </SwedishCardTitle>

                    <p className={`text-[var(--sahakum-navy)]/80 text-lg leading-relaxed ${fontClass}`}>
                      {posts[0].excerpt}
                    </p>

                    <div className="flex items-center space-x-2 text-sm text-[var(--sahakum-navy)]/60">
                      <span>{t('by')} {posts[0].author.name}</span>
                      {posts[0].categories?.slice(0, 2).map((category: any) => (
                        <span key={category.slug} className="px-2 py-1 bg-[var(--sahakum-navy)]/10 text-[var(--sahakum-navy)]">
                          {category.name}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/${params.locale}/blog/${posts[0].slug}`}
                      className={`inline-flex items-center text-[var(--sahakum-gold)] hover:text-[var(--sahakum-navy)] transition-colors font-medium ${fontClass}`}
                    >
                      {t('readMore')} →
                    </Link>
                  </div>
                </div>

                {/* Featured Article Image */}
                {posts[0].featuredImg && (
                  <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                    <img
                      src={posts[0].featuredImg}
                      alt={posts[0].translation?.title || ''}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            </Container>
          </section>
        )}

        {/* Category Filter Tabs */}
        <section className="py-6 bg-white border-b border-[var(--sahakum-gold)]/20">
          <Container size="wide">
            <div className="flex flex-wrap gap-2 justify-center">
              <button className={`px-4 py-2 transition-colors duration-200 ${!category ? 'bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)]' : 'bg-gray-100 text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-gold)]/20'} ${fontClass}`}>
                {params.locale === 'sv' ? 'Alla' : params.locale === 'km' ? 'ទាំងអស់' : 'All'}
              </button>
              {Object.entries(COMMUNITY_CATEGORIES).map(([slug, categoryData]) => {
                const localizedCategory = categoryData[params.locale as keyof typeof categoryData] || categoryData.en
                return (
                  <button
                    key={slug}
                    className={`px-4 py-2 transition-colors duration-200 ${category === slug ? 'bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)]' : 'bg-gray-100 text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-gold)]/20'} ${fontClass}`}
                  >
                    {localizedCategory.name}
                  </button>
                )
              })}
            </div>
          </Container>
        </section>

        {/* Recent Articles Section */}
        <section className="py-8 lg:py-12">
          <Container size="wide">
            <div className="mb-8">
              <SwedenH2 className="text-[var(--sahakum-navy)] mb-4" locale={params.locale}>
                {params.locale === 'sv' ? 'Senaste artiklarna' :
                 params.locale === 'km' ? 'អត្ថបទថ្មីៗ' : 'Recent Articles'}
              </SwedenH2>
            </div>

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
              <>
                {/* Featured Articles Row (first 3 after featured) */}
                {posts.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {posts.slice(1, 4).map((post: any) => (
                      <SwedishCard key={post.id} href={`/${params.locale}/blog/${post.slug}`} variant="borderless" className="group hover:shadow-xl h-full">
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
                          <div className="flex items-center space-x-2 text-xs text-[var(--sahakum-navy)]/60 mb-2">
                            <span>{formatDate(post.publishedAt, params.locale)}</span>
                            <span>•</span>
                            <span>{post.readingTime} {params.locale === 'sv' ? 'min' : params.locale === 'km' ? 'នាទី' : 'min'}</span>
                          </div>
                          <SwedishCardTitle size="sm" className="text-[var(--sahakum-navy)] group-hover:text-[var(--sahakum-gold)] transition-colors duration-200" locale={params.locale}>
                            {post.translation?.title}
                          </SwedishCardTitle>
                        </SwedishCardHeader>
                        <SwedishCardContent>
                          {post.translation?.excerpt && (
                            <p className={`text-[var(--sahakum-navy-600)] leading-relaxed mb-4 text-sm ${fontClass}`}>
                              {post.translation.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {post.categories?.slice(0, 1).map((category: any) => (
                                <span
                                  key={category.slug}
                                  className="text-xs bg-[var(--sahakum-gold)]/20 text-[var(--sahakum-navy)] px-2 py-1"
                                >
                                  {category.name}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-[var(--sahakum-navy)]/60">{t('by')} {post.author.name}</span>
                          </div>
                        </SwedishCardContent>
                      </SwedishCard>
                    ))}
                  </div>
                )}

                {/* Remaining Articles Grid */}
                {posts.length > 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.slice(4).map((post: any) => (
                      <SwedishCard key={post.id} href={`/${params.locale}/blog/${post.slug}`} variant="borderless" className="group hover:shadow-xl h-full">
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
                          <div className="flex items-center space-x-2 text-xs text-[var(--sahakum-navy)]/60 mb-2">
                            <span>{formatDate(post.publishedAt, params.locale)}</span>
                            <span>•</span>
                            <span>{post.readingTime} {params.locale === 'sv' ? 'min' : params.locale === 'km' ? 'នាទី' : 'min'}</span>
                          </div>
                          <SwedishCardTitle size="sm" className="text-[var(--sahakum-navy)] group-hover:text-[var(--sahakum-gold)] transition-colors duration-200" locale={params.locale}>
                            {post.translation?.title}
                          </SwedishCardTitle>
                        </SwedishCardHeader>
                        <SwedishCardContent>
                          {post.translation?.excerpt && (
                            <p className={`text-[var(--sahakum-navy-600)] leading-relaxed mb-4 text-sm ${fontClass}`}>
                              {post.translation.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {post.categories?.slice(0, 1).map((category: any) => (
                                <span
                                  key={category.slug}
                                  className="text-xs bg-[var(--sahakum-gold)]/20 text-[var(--sahakum-navy)] px-2 py-1"
                                >
                                  {category.name}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-[var(--sahakum-navy)]/60">{t('by')} {post.author.name}</span>
                          </div>
                        </SwedishCardContent>
                      </SwedishCard>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Load More Button */}
            {pagination.hasNext && (
              <div className="text-center mt-12">
                <a
                  href={`/${params.locale}/blog?page=${pagination.page + 1}${category ? `&category=${category}` : ''}`}
                  className={`inline-flex items-center px-8 py-3 bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-gold)]/90 transition-colors duration-200 font-medium ${fontClass}`}
                >
                  {params.locale === 'sv' ? 'Ladda fler artiklar' :
                   params.locale === 'km' ? 'ផ្ទុកអត្ថបទបន្ថែម' : 'Load More Articles'}
                </a>
              </div>
            )}

            {/* Pagination for screen readers */}
            {pagination.totalPages > 1 && (
              <nav aria-label="Blog pagination" className="sr-only">
                {pagination.hasPrev && (
                  <a href={`/${params.locale}/blog?page=${pagination.page - 1}${category ? `&category=${category}` : ''}`}>
                    Previous page
                  </a>
                )}
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                {pagination.hasNext && (
                  <a href={`/${params.locale}/blog?page=${pagination.page + 1}${category ? `&category=${category}` : ''}`}>
                    Next page
                  </a>
                )}
              </nav>
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