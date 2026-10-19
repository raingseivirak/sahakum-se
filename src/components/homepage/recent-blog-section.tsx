import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/layout/grid'
import { prisma } from '@/lib/prisma'

const translations = {
  sv: {
    title: 'Senaste från bloggen',
    viewAll: 'Visa alla artiklar',
    readMore: 'Läs mer',
  },
  en: {
    title: 'Latest from our blog',
    viewAll: 'View all articles',
    readMore: 'Read more',
  },
  km: {
    title: 'អត្ថបទថ្មីៗពីប្លុករបស់យើង',
    viewAll: 'មើលអត្ថបទទាំងអស់',
    readMore: 'អានបន្ថែម',
  },
}

export async function RecentBlogSection({ locale }: { locale: string }) {
  const now = new Date()
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  const posts = await prisma.contentItem.findMany({
    where: {
      type: 'POST',
      status: 'PUBLISHED',
      publishedAt: { gte: cutoff, lte: now },
      translations: { some: { language: locale } },
    },
    select: {
      id: true,
      slug: true,
      featuredImg: true,
      publishedAt: true,
      translations: {
        where: { language: locale },
        select: { title: true, excerpt: true },
      },
    },
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    take: 3,
  })

  if (posts.length === 0) return null

  const t = translations[locale as keyof typeof translations] || translations.en
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  return (
    <section aria-labelledby="recent-blog-heading" className={`bg-gray-50 py-10 lg:py-12 ${fontClass}`}>
      <Container size="wide">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 id="recent-blog-heading" className={`text-2xl lg:text-3xl font-semibold text-sahakum-navy ${locale === 'km' ? 'text-khmer-heading' : 'text-sweden-heading'}`}>
            {t.title}
          </h2>
          <Link
            href={`/${locale}/blog`}
            className="text-sm font-medium text-sahakum-navy underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {t.viewAll} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => {
            const translation = post.translations[0]

            return (
              <article key={post.id} className="h-full">
                <Link
                  href={`/${locale}/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden border border-gray-200 bg-white transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {post.featuredImg && (
                    <div className="relative h-40 overflow-hidden bg-gray-100">
                      <Image
                        src={post.featuredImg}
                        alt=""
                        fill
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt.toISOString()} className="mb-2 text-xs text-gray-500">
                        {post.publishedAt.toLocaleDateString(locale, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          timeZone: 'Europe/Stockholm',
                        })}
                      </time>
                    )}
                    <h3 className="mb-2 text-lg font-semibold text-sahakum-navy group-hover:underline">
                      {translation.title}
                    </h3>
                    {translation.excerpt && (
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {translation.excerpt}
                      </p>
                    )}
                    <span className="mt-auto text-sm font-medium text-sahakum-navy">
                      {t.readMore} <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              </article>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
