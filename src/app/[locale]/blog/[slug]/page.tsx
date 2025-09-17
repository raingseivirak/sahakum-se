import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/grid'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { LanguageAvailabilityNotice } from '@/components/ui/language-availability-notice'

interface BlogPostPageProps {
  params: {
    locale: string
    slug: string
  }
  searchParams: {
    preview?: string
  }
}

async function getPostAvailableLanguages(slug: string) {
  try {
    const post = await prisma.contentItem.findFirst({
      where: {
        slug: slug,
        type: 'POST',
        status: 'PUBLISHED'
      },
      include: {
        translations: {
          select: {
            language: true
          }
        }
      }
    })

    return post ? post.translations.map(t => t.language) : []
  } catch (error) {
    console.error('Error fetching post languages:', error)
    return []
  }
}

async function getPost(slug: string, locale: string, isPreview = false, previewId?: string) {
  try {
    let whereClause: any = {
      type: 'POST'
    }

    // If preview mode with ID, fetch by ID instead of slug
    if (isPreview && previewId) {
      whereClause.id = previewId
    } else {
      whereClause.slug = slug
      // Only require PUBLISHED status if not in preview mode
      if (!isPreview) {
        whereClause.status = 'PUBLISHED'
      }
    }

    const post = await prisma.contentItem.findFirst({
      where: whereClause,
      include: {
        translations: {
          // Always get all translations, then filter in code
        },
        author: {
          select: {
            name: true,
            email: true
          }
        },
        categories: {
          include: {
            category: {
              include: {
                translations: {
                  where: {
                    language: locale
                  }
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
                  where: {
                    language: locale
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!post) {
      return null
    }


    // Try to find the translation for the requested locale, or fall back to first available
    let translation = post.translations.find(t => t.language === locale)

    // If no translation found for the requested locale, return null for non-preview requests
    // This ensures we only show posts that have content in the requested language
    if (!translation && !isPreview) {
      return null
    }

    // For preview mode, fall back to any available translation
    if (!translation) {
      translation = post.translations[0]
    }


    if (!translation) {
      return null
    }
    return {
      ...post,
      translation,
      categories: post.categories.map(cc => ({
        slug: cc.category.slug,
        name: cc.category.translations[0]?.name || cc.category.slug
      })),
      tags: post.tags.map(ct => ({
        slug: ct.tag.slug,
        name: ct.tag.translations[0]?.name || ct.tag.slug
      }))
    }
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
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

export default async function BlogPostPage({ params, searchParams }: BlogPostPageProps) {
  const fontClass = params.locale === 'km' ? 'font-khmer' : 'font-sweden'
  const isPreview = searchParams.preview === 'true' || !!searchParams.preview
  const previewId = typeof searchParams.preview === 'string' && searchParams.preview !== 'true' ? searchParams.preview : undefined

  // URL decode the slug to handle spaces and special characters
  const decodedSlug = decodeURIComponent(params.slug)
  const post = await getPost(decodedSlug, params.locale, isPreview, previewId)

  if (!post) {
    // Check if the post exists in other languages (only for non-preview mode)
    if (!isPreview) {
      const availableLanguages = await getPostAvailableLanguages(decodedSlug)
      if (availableLanguages.length > 0) {
        // Redirect to the first available language
        const firstLanguage = availableLanguages[0]
        const redirectUrl = `/${firstLanguage}/blog/${encodeURIComponent(decodedSlug)}`
        redirect(redirectUrl)
      }
    }
    notFound()
  }

  return (
    <div className={`min-h-screen bg-swedenBrand-neutral-white ${fontClass}`}>
      {/* Official Sweden Brand Skip Navigation */}
      <SwedenSkipNav locale={params.locale} />

      {/* Scroll-Aware Header */}
      <ScrollAwareHeader
        locale={params.locale}
        showBlogLink={true}
        stickyContent={{
          title: post.translation.title,
          author: post.author.name,
          publishedAt: post.publishedAt!
        }}
      />

      {/* Preview Banner */}
      {isPreview && (
        <div className="bg-yellow-500 text-black py-2 px-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <span className="font-semibold">⚠️ PREVIEW MODE</span>
            <span>This is a preview of your blog post</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main id="main-content">
        {/* Enhanced Hero Section */}
        <section className="relative bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--sweden-blue-700)] text-white overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--sahakum-gold)]/5 via-transparent to-[var(--sahakum-gold)]/5 animate-pulse"></div>

          {/* Subtle geometric pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FECB00' fill-opacity='0.6'%3E%3Cpath d='M30 10 L40 25 L30 40 L20 25 Z'/%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>

          {/* Floating geometric accents */}
          <div className="absolute top-1/4 right-1/4 w-16 h-16 border border-[var(--sahakum-gold)]/20 rotate-45 animate-bounce" style={{ animationDuration: '3s' }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-8 h-8 bg-[var(--sahakum-gold)]/10 rotate-12 animate-pulse" style={{ animationDelay: '1s' }}></div>

          <Container size="wide" className="py-8 lg:py-12 relative">
            <div className="relative">
              <div className="max-w-sweden-content">
                {/* Post Categories */}
                {post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up">
                    {post.categories.map((category) => (
                      <span
                        key={category.slug}
                        className="text-xs bg-[var(--sahakum-gold)]/20 text-[var(--sahakum-gold)] px-3 py-1.5 rounded-sm font-medium border border-[var(--sahakum-gold)]/30"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <h1 className={`font-sweden text-4xl lg:text-6xl font-semibold leading-[1.29] tracking-[-0.36px] text-white mb-6 ${fontClass}`}>
                    <span className="inline-block">
                      {post.translation.title}
                    </span>
                  </h1>
                </div>

                {/* Enhanced Post Meta with better visual hierarchy */}
                <div className="flex flex-wrap items-center gap-6 text-[var(--sahakum-gold)] mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[var(--sahakum-gold)] rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">
                        {params.locale === 'km' ? 'បានបោះពុម្ពនៅ' : params.locale === 'en' ? 'Published on' : 'Publicerad'}
                      </span>
                      <span className="ml-2 text-white/90">
                        {formatDate(post.publishedAt!, params.locale)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[var(--sahakum-gold)] rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">
                        {params.locale === 'km' ? 'ដោយ' : params.locale === 'en' ? 'By' : 'Av'}
                      </span>
                      <span className="ml-2 text-white/90 font-medium">{post.author.name}</span>
                    </div>
                  </div>
                </div>

                {post.translation.excerpt && (
                  <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <p className={`font-sweden text-xl lg:text-2xl font-medium leading-[1.42] tracking-[-0.36px] text-white/90 mb-6 max-w-4xl ${fontClass}`}>
                      {post.translation.excerpt}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>

        {/* Post Content */}
        <section className="py-8 lg:py-12">
          <Container size="wide">
            <div className="max-w-sweden-content mx-auto">
              <LanguageAvailabilityNotice
                currentLocale={params.locale}
                slug={`blog/${decodedSlug}`}
                className="mb-6"
              />

              {/* Swedish Sticky Layout - Like Join Page */}
              <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
                {/* Featured Image - Sticky Side Panel */}
                {post.featuredImg && (
                  <div className="lg:col-span-2">
                    <div className="sticky top-8">
                      <img
                        src={post.featuredImg}
                        alt={post.translation.title}
                        className="w-full h-64 md:h-80 lg:h-96 object-cover shadow-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Article Content - Scrollable */}
                <div className={post.featuredImg ? "lg:col-span-3" : "lg:col-span-5"}>
                  <article
                    className={`prose prose-sweden prose-lg max-w-none ${fontClass}`}
                    data-language={params.locale}
                    dangerouslySetInnerHTML={{ __html: post.translation.content || '' }}
                  />

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-200">
                      <h3 className={`text-lg font-semibold text-[var(--sahakum-navy)] mb-4 ${fontClass}`}>
                        {params.locale === 'km' ? 'ស្លាក' : params.locale === 'en' ? 'Tags' : 'Taggar'}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag.slug}
                            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-sm"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
    const posts = await prisma.contentItem.findMany({
      where: {
        type: 'POST',
        status: 'PUBLISHED'
      },
      include: {
        translations: true
      }
    })

    const params = []

    for (const post of posts) {
      for (const translation of post.translations) {
        params.push({
          locale: translation.language,
          slug: post.slug
        })
      }
    }

    return params
  } catch (error) {
    console.error('Error generating static params for blog posts:', error)
    return []
  }
}

export async function generateMetadata({ params, searchParams }: BlogPostPageProps) {
  const isPreview = searchParams.preview === 'true' || !!searchParams.preview
  const previewId = typeof searchParams.preview === 'string' && searchParams.preview !== 'true' ? searchParams.preview : undefined
  const decodedSlug = decodeURIComponent(params.slug)
  const post = await getPost(decodedSlug, params.locale, isPreview, previewId)

  if (!post) {
    // For metadata generation, we don't redirect, just return default metadata
    // The redirect will happen in the page component
    return {
      title: 'Post Not Found'
    }
  }

  return {
    title: post.translation.title,
    description: post.translation.metaDescription || post.translation.excerpt || post.translation.title,
    openGraph: {
      title: post.translation.title,
      description: post.translation.metaDescription || post.translation.excerpt,
      locale: params.locale,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: post.featuredImg ? [post.featuredImg] : undefined
    }
  }
}