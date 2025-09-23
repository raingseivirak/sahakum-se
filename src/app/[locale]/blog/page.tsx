import Link from 'next/link'
import { Container } from '@/components/layout/grid'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo'
import { SwedenH1, SwedenH2, SwedenBody } from '@/components/ui/sweden-typography'
import { SwedishCard, SwedishCardHeader, SwedishCardContent, SwedishCardTitle } from '@/components/ui/swedish-card'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { UserMenu } from '@/components/layout/user-menu'
import { Footer } from '@/components/layout/footer'
import { type Language } from '@/lib/constants'
import { prisma } from '@/lib/prisma'

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 300 // Revalidate every 5 minutes

interface BlogPageProps {
  params: { locale: string }
  searchParams: { page?: string; category?: string; tag?: string }
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
    loadingPosts: 'Laddar inlägg...',
    sign_in: 'Logga in',
    sign_out: 'Logga ut',
    admin: 'Administratörspanel',
    profile: 'Min profil',
    settings: 'Inställningar'
  },
  en: {
    title: 'Blog',
    subtitle: 'News, stories and insights from our community',
    readMore: 'Read more',
    publishedOn: 'Published on',
    by: 'by',
    noPostsFound: 'No posts found',
    noPostsDescription: 'There are no published blog posts at the moment. Check back later!',
    loadingPosts: 'Loading posts...',
    sign_in: 'Sign In',
    sign_out: 'Sign Out',
    admin: 'Admin Dashboard',
    profile: 'Profile',
    settings: 'Settings'
  },
  km: {
    title: 'ប្លុក',
    subtitle: 'ព័ត៌មាន រឿងរ៉ាវ និងការយល់ដឹងពីសហគមន៍របស់យើង',
    readMore: 'អានបន្ថែម',
    publishedOn: 'បានបោះពុម្ពនៅ',
    by: 'ដោយ',
    noPostsFound: 'រកមិនឃើញប្រកាស',
    noPostsDescription: 'មិនមានប្រកាសប្លុកដែលបានបោះពុម្ពនៅពេលនេះទេ។ សូមពិនិត្យមកវិញពេលក្រោយ!',
    loadingPosts: 'កំពុងផ្ទុកប្រកាស...',
    sign_in: 'ចូលប្រើប្រាស់',
    sign_out: 'ចាកចេញ',
    admin: 'ផ្ទាំងគ្រប់គ្រង',
    profile: 'ប្រវត្តិរូបផ្ទាល់ខ្លួន',
    settings: 'ការកំណត់'
  }
}

// Helper function to build filter URL
function buildFilterUrl(locale: string, currentParams: URLSearchParams, newCategory?: string, newTag?: string, newPage?: number) {
  const params = new URLSearchParams()

  if (newCategory) params.set('category', newCategory)
  else if (currentParams.get('category') && !newTag) params.set('category', currentParams.get('category')!)

  if (newTag) params.set('tag', newTag)
  else if (currentParams.get('tag') && !newCategory) params.set('tag', currentParams.get('tag')!)

  if (newPage && newPage > 1) params.set('page', newPage.toString())

  const queryString = params.toString()
  return `/${locale}/blog${queryString ? `?${queryString}` : ''}`
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

async function getPosts(locale: string, page: number = 1, category?: string, tag?: string) {
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

    // Add category filter
    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category
          }
        }
      }
    }

    // Add tag filter
    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag
          }
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
        type: c.category.type,
        name: c.category.translations[0]?.name || c.category.slug
      })),
      tags: post.tags.map(t => ({
        slug: t.tag.slug,
        name: t.tag.translations[0]?.name || t.tag.slug
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

// Fetch available categories for filtering
async function getCategories(locale: string) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        translations: {
          where: { language: locale }
        },
        _count: {
          select: {
            contentItems: {
              where: {
                contentItem: {
                  type: 'POST',
                  status: 'PUBLISHED'
                }
              }
            }
          }
        }
      },
      orderBy: [
        { type: 'asc' },
        { slug: 'asc' }
      ]
    })

    return categories.filter(cat => cat._count.contentItems > 0).map(cat => ({
      slug: cat.slug,
      type: cat.type,
      name: cat.translations[0]?.name || cat.slug,
      count: cat._count.contentItems
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

// Fetch available tags for filtering
async function getTags(locale: string) {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        translations: {
          where: { language: locale }
        },
        _count: {
          select: {
            contentItems: {
              where: {
                contentItem: {
                  type: 'POST',
                  status: 'PUBLISHED'
                }
              }
            }
          }
        }
      },
      orderBy: {
        slug: 'asc'
      }
    })

    return tags.filter(tag => tag._count.contentItems > 0).map(tag => ({
      slug: tag.slug,
      name: tag.translations[0]?.name || tag.slug,
      count: tag._count.contentItems
    }))
  } catch (error) {
    console.error('Error fetching tags:', error)
    return []
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
  const tag = searchParams.tag

  // Fetch data in parallel
  const [{ posts, pagination }, categories, tags] = await Promise.all([
    getPosts(params.locale, page, category, tag),
    getCategories(params.locale),
    getTags(params.locale)
  ])

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
              <UserMenu
                locale={params.locale as Language}
                translations={{
                  sign_in: t('sign_in'),
                  sign_out: t('sign_out'),
                  admin: t('admin'),
                  profile: t('profile'),
                  settings: t('settings')
                }}
                currentUrl={`/${params.locale}/blog`}
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

                    <SwedishCardTitle as="h2" size="lg" className="text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] transition-colors text-3xl lg:text-4xl xl:text-5xl" locale={params.locale}>
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

        {/* Swedish Design Filter Section */}
        <section className="py-8 bg-gradient-to-br from-[var(--sahakum-gold)]/5 to-white border-b border-[var(--sahakum-gold)]/20">
          <Container size="wide">
            <div className="space-y-6">
              {/* Filter Header */}
              <div className="text-center">
                <h2 className={`text-xl font-medium text-[var(--sahakum-navy)] mb-2 ${fontClass}`}>
                  {params.locale === 'sv' ? 'Filtrera artiklar' :
                   params.locale === 'km' ? 'ច្រោះអត្ថបទ' : 'Filter Articles'}
                </h2>
                {(category || tag) && (
                  <p className={`text-sm text-[var(--sahakum-navy)]/70 ${fontClass}`}>
                    {params.locale === 'sv' ? 'Visar filtrerade resultat' :
                     params.locale === 'km' ? 'បង្ហាញលទ្ធផលច្រោះ' : 'Showing filtered results'}
                    {category && ` • ${categories.find(c => c.slug === category)?.name}`}
                    {tag && ` • ${tags.find(t => t.slug === tag)?.name}`}
                  </p>
                )}
              </div>

              {/* Categories Filter */}
              <div className="space-y-3">
                <h3 className={`text-sm font-medium text-[var(--sahakum-navy)] uppercase tracking-wider ${fontClass}`}>
                  {params.locale === 'sv' ? 'Kategorier' :
                   params.locale === 'km' ? 'ប្រភេទ' : 'Categories'}
                </h3>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {/* All Categories Button */}
                  <a
                    href={buildFilterUrl(params.locale, new URLSearchParams(Object.entries(searchParams).map(([k, v]) => [k, v!])))}
                    className={`inline-block px-4 py-2 text-sm font-medium transition-all duration-200 border ${
                      !category && !tag
                        ? 'bg-[var(--sahakum-navy)] text-white border-[var(--sahakum-navy)] shadow-sm'
                        : 'bg-white text-[var(--sahakum-navy)] border-[var(--sahakum-navy)]/20 hover:border-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/10'
                    } ${fontClass}`}
                  >
                    {params.locale === 'sv' ? 'Alla' : params.locale === 'km' ? 'ទាំងអស់' : 'All'} ({posts.length + (pagination.totalPages - 1) * 12})
                  </a>

                  {/* Category Buttons */}
                  {categories.map((cat) => (
                    <a
                      key={cat.slug}
                      href={buildFilterUrl(params.locale, new URLSearchParams(), cat.slug)}
                      className={`inline-block px-4 py-2 text-sm font-medium transition-all duration-200 border ${
                        category === cat.slug
                          ? 'bg-[var(--sahakum-navy)] text-white border-[var(--sahakum-navy)] shadow-sm'
                          : 'bg-white text-[var(--sahakum-navy)] border-[var(--sahakum-navy)]/20 hover:border-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/10'
                      } ${fontClass}`}
                    >
                      {cat.name} ({cat.count})
                    </a>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              {tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className={`text-sm font-medium text-[var(--sahakum-navy)] uppercase tracking-wider ${fontClass}`}>
                    {params.locale === 'sv' ? 'Taggar' :
                     params.locale === 'km' ? 'ស្លាក' : 'Tags'}
                  </h3>
                  <div className="flex flex-wrap gap-1 justify-center lg:justify-start">
                    {tags.slice(0, 12).map((tagItem) => (
                      <a
                        key={tagItem.slug}
                        href={buildFilterUrl(params.locale, new URLSearchParams(), undefined, tagItem.slug)}
                        className={`inline-block px-3 py-1 text-xs font-medium transition-all duration-200 border rounded-full ${
                          tag === tagItem.slug
                            ? 'bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)] border-[var(--sahakum-gold)] shadow-sm'
                            : 'bg-white text-[var(--sahakum-navy)]/80 border-[var(--sahakum-navy)]/20 hover:border-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/10'
                        } ${fontClass}`}
                      >
                        {tagItem.name} ({tagItem.count})
                      </a>
                    ))}
                    {tags.length > 12 && (
                      <span className={`text-xs text-[var(--sahakum-navy)]/60 px-2 py-1 ${fontClass}`}>
                        +{tags.length - 12} {params.locale === 'sv' ? 'fler' : params.locale === 'km' ? 'ច្រើនទៀត' : 'more'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {(category || tag) && (
                <div className="text-center">
                  <a
                    href={`/${params.locale}/blog`}
                    className={`inline-flex items-center text-sm text-[var(--sahakum-navy)]/70 hover:text-[var(--sahakum-gold)] transition-colors duration-200 ${fontClass}`}
                  >
                    ✕ {params.locale === 'sv' ? 'Rensa filter' :
                         params.locale === 'km' ? 'លុបការច្រោះ' : 'Clear filters'}
                  </a>
                </div>
              )}
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
                      <SwedishCard key={post.id} variant="borderless" className="group hover:shadow-xl h-full">
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
                            <Link href={`/${params.locale}/blog/${post.slug}`}>
                              {post.translation?.title}
                            </Link>
                          </SwedishCardTitle>
                        </SwedishCardHeader>
                        <SwedishCardContent>
                          {post.translation?.excerpt && (
                            <p className={`text-[var(--sahakum-navy-600)] leading-relaxed mb-4 text-sm ${fontClass}`}>
                              {post.translation.excerpt}
                            </p>
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {post.categories?.slice(0, 1).map((category: any) => (
                                  <a
                                    key={category.slug}
                                    href={buildFilterUrl(params.locale, new URLSearchParams(), category.slug)}
                                    className="text-xs bg-[var(--sahakum-gold)]/20 text-[var(--sahakum-navy)] px-2 py-1 hover:bg-[var(--sahakum-gold)]/30 transition-colors"
                                  >
                                    {category.name}
                                  </a>
                                ))}
                              </div>
                              <span className="text-xs text-[var(--sahakum-navy)]/60">{t('by')} {post.author.name}</span>
                            </div>
                            {post.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 3).map((tagItem: any) => (
                                  <a
                                    key={tagItem.slug}
                                    href={buildFilterUrl(params.locale, new URLSearchParams(), undefined, tagItem.slug)}
                                    className="text-xs bg-[var(--sahakum-navy)]/10 text-[var(--sahakum-navy)]/80 px-2 py-1 rounded-full hover:bg-[var(--sahakum-navy)]/20 transition-colors"
                                  >
                                    #{tagItem.name}
                                  </a>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-xs text-[var(--sahakum-navy)]/60">+{post.tags.length - 3}</span>
                                )}
                              </div>
                            )}
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
                      <SwedishCard key={post.id} variant="borderless" className="group hover:shadow-xl h-full">
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
                            <Link href={`/${params.locale}/blog/${post.slug}`}>
                              {post.translation?.title}
                            </Link>
                          </SwedishCardTitle>
                        </SwedishCardHeader>
                        <SwedishCardContent>
                          {post.translation?.excerpt && (
                            <p className={`text-[var(--sahakum-navy-600)] leading-relaxed mb-4 text-sm ${fontClass}`}>
                              {post.translation.excerpt}
                            </p>
                          )}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {post.categories?.slice(0, 1).map((category: any) => (
                                  <a
                                    key={category.slug}
                                    href={buildFilterUrl(params.locale, new URLSearchParams(), category.slug)}
                                    className="text-xs bg-[var(--sahakum-gold)]/20 text-[var(--sahakum-navy)] px-2 py-1 hover:bg-[var(--sahakum-gold)]/30 transition-colors"
                                  >
                                    {category.name}
                                  </a>
                                ))}
                              </div>
                              <span className="text-xs text-[var(--sahakum-navy)]/60">{t('by')} {post.author.name}</span>
                            </div>
                            {post.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 3).map((tagItem: any) => (
                                  <a
                                    key={tagItem.slug}
                                    href={buildFilterUrl(params.locale, new URLSearchParams(), undefined, tagItem.slug)}
                                    className="text-xs bg-[var(--sahakum-navy)]/10 text-[var(--sahakum-navy)]/80 px-2 py-1 rounded-full hover:bg-[var(--sahakum-navy)]/20 transition-colors"
                                  >
                                    #{tagItem.name}
                                  </a>
                                ))}
                                {post.tags.length > 3 && (
                                  <span className="text-xs text-[var(--sahakum-navy)]/60">+{post.tags.length - 3}</span>
                                )}
                              </div>
                            )}
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
                  href={buildFilterUrl(params.locale, new URLSearchParams(Object.entries(searchParams).map(([k, v]) => [k, v!])), category, tag, pagination.page + 1)}
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
                  <a href={buildFilterUrl(params.locale, new URLSearchParams(Object.entries(searchParams).map(([k, v]) => [k, v!])), category, tag, pagination.page - 1)}>
                    Previous page
                  </a>
                )}
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                {pagination.hasNext && (
                  <a href={buildFilterUrl(params.locale, new URLSearchParams(Object.entries(searchParams).map(([k, v]) => [k, v!])), category, tag, pagination.page + 1)}>
                    Next page
                  </a>
                )}
              </nav>
            )}
          </Container>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}