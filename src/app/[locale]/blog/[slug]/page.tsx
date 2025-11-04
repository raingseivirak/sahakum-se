import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/grid'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { LanguageAvailabilityNotice } from '@/components/ui/language-availability-notice'
import { CopyLinkButton } from '@/components/ui/copy-link-button'
import { createSafeHTML } from '@/lib/sanitize'
import { Footer } from '@/components/layout/footer'
import { ArticleStructuredData } from '@/components/seo/article-structured-data'

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
      {/* SEO Structured Data */}
      <ArticleStructuredData
        title={post.translation.title}
        description={post.translation.excerpt || post.translation.metaDescription || ''}
        author={post.author.name}
        publishedDate={post.publishedAt || post.createdAt}
        modifiedDate={post.updatedAt || undefined}
        imageUrl={post.featuredImg || undefined}
        locale={params.locale}
        slug={decodedSlug}
        categories={post.categories.map(c => c.name)}
        tags={post.tags.map(t => t.name)}
      />

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
        translations={{
          sign_in: params.locale === 'km' ? 'ចូលប្រើប្រាស់' : params.locale === 'sv' ? 'Logga in' : 'Sign In',
          sign_out: params.locale === 'km' ? 'ចាកចេញ' : params.locale === 'sv' ? 'Logga ut' : 'Sign Out',
          admin: params.locale === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : params.locale === 'sv' ? 'Administratörspanel' : 'Admin Dashboard',
          profile: params.locale === 'km' ? 'ប្រវត្តិរូបផ្ទាល់ខ្លួន' : params.locale === 'sv' ? 'Min profil' : 'Profile',
          settings: params.locale === 'km' ? 'ការកំណត់' : params.locale === 'sv' ? 'Inställningar' : 'Settings'
        }}
        currentUrl={`/${params.locale}/blog/${params.slug}`}
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
        {/* Clean Hero Section */}
        <section className="relative bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--color-sweden-neutral-700)] text-white overflow-hidden">

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

                  {/* Subtle Copy Link Button */}
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-[var(--sahakum-gold)] rounded-full"></div>
                    <CopyLinkButton
                      url={`${typeof window !== 'undefined' ? window.location.origin : 'https://www.sahakumkhmer.se'}/${params.locale}/blog/${encodeURIComponent(decodedSlug)}`}
                      title={post.translation.title}
                      copyText={params.locale === 'km' ? 'ចម្លងតំណ' : params.locale === 'en' ? 'Copy Link' : 'Kopiera länk'}
                      copiedText={params.locale === 'km' ? 'បានចម្លងតំណ!' : params.locale === 'en' ? 'Link Copied!' : 'Länk kopierad!'}
                      shareText={params.locale === 'km' ? 'ចែករំលែកអត្ថបទ' : params.locale === 'en' ? 'Share Article' : 'Dela artikel'}
                      className="subtle-link-button"
                    />
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
            <div className="w-full">
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
                    dangerouslySetInnerHTML={createSafeHTML(post.translation.content)}
                  />

                  {/* Categories & Tags - Swedish Design System */}
                  {(post.categories.length > 0 || post.tags.length > 0) && (
                    <div className="mt-12 pt-8 border-t-2 border-[var(--sahakum-navy)] space-y-6">
                      {post.categories.length > 0 && (
                        <div>
                          <h3 className={`text-base font-bold uppercase tracking-wide text-[var(--sahakum-navy)] mb-4 ${fontClass}`}>
                            {params.locale === 'km' ? 'ប្រភេទ' : params.locale === 'en' ? 'Categories' : 'Kategorier'}
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {post.categories.map((category) => (
                              <span
                                key={category.slug}
                                className={`text-sm bg-[var(--sahakum-navy)] text-white px-4 py-2 font-semibold uppercase tracking-wide ${fontClass}`}
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {post.tags.length > 0 && (
                        <div>
                          <h3 className={`text-base font-bold uppercase tracking-wide text-[var(--sahakum-navy)] mb-4 ${fontClass}`}>
                            {params.locale === 'km' ? 'ស្លាក' : params.locale === 'en' ? 'Tags' : 'Taggar'}
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {post.tags.map((tag) => (
                              <span
                                key={tag.slug}
                                className={`text-sm border-2 border-[var(--sahakum-navy)] text-[var(--sahakum-navy)] px-4 py-2 font-semibold ${fontClass}`}
                              >
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 300 // Revalidate every 5 minutes

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

  // Generate excerpt from content if no meta description or excerpt exists
  const generateExcerpt = (content: string, maxLength: number = 160): string => {
    // Strip HTML tags and get plain text
    const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    return textContent.length > maxLength
      ? textContent.substring(0, maxLength).trim() + '...'
      : textContent
  }

  const title = post.translation.title
  const description = post.translation.metaDescription ||
                     post.translation.excerpt ||
                     generateExcerpt(post.translation.content)

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
  const canonicalUrl = `${baseUrl}/${params.locale}/blog/${encodeURIComponent(decodedSlug)}`

  // Enhanced image handling with fallbacks
  const getImageUrl = (imagePath?: string | null): string => {
    if (imagePath) {
      // If it's already a full URL, return as-is
      if (imagePath.startsWith('http')) return imagePath
      // If it's a relative path, make it absolute
      return imagePath.startsWith('/') ? `${baseUrl}${imagePath}` : `${baseUrl}/${imagePath}`
    }
    // Fallback to site logo/default image
    return `${baseUrl}/media/images/sahakum-social-share.jpg`
  }

  const imageUrl = getImageUrl(post.featuredImg)

  return {
    title: fullTitle,
    description,

    // Basic meta tags
    keywords: post.tags.map(tag => tag.name).join(', '),
    authors: [{ name: post.author.name }],
    creator: post.author.name,
    publisher: currentSite.name,

    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
    },

    // Open Graph tags (Facebook, LinkedIn, WhatsApp, Telegram, Discord)
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: currentSite.name,
      locale: params.locale,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      authors: [post.author.name],
      section: post.categories.length > 0 ? post.categories[0].name : undefined,
      tags: post.tags.map(tag => tag.name),
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

    // Twitter Card (X/Twitter)
    twitter: {
      card: 'summary_large_image',
      title: title.length > 70 ? title.substring(0, 67) + '...' : title,
      description: description.length > 200 ? description.substring(0, 197) + '...' : description,
      creator: `@sahakumkhmer`, // Replace with actual Twitter handle if available
      site: `@sahakumkhmer`,    // Replace with actual Twitter handle if available
      images: [imageUrl],
    },

    // Additional meta tags for better SEO
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

    // Article-specific structured data hints
    other: {
      'article:author': post.author.name,
      'article:published_time': post.publishedAt || undefined,
      'article:modified_time': post.updatedAt || undefined,
      'article:section': post.categories.length > 0 ? post.categories[0].name : undefined,
      'article:tag': post.tags.map(tag => tag.name).join(','),

      // Theme color for mobile browsers (Sahakum Navy)
      'theme-color': '#0D1931',
      'msapplication-TileColor': '#0D1931',

      // Additional social sharing meta
      'og:site_name': currentSite.name,
      'og:locale': params.locale,
    }
  }
}