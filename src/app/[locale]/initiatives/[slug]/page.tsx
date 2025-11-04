import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Container } from "@/components/layout/grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, CheckSquare, Lock, User } from "lucide-react"
import { createSafeHTML } from "@/lib/sanitize"
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { LanguageAvailabilityNotice } from '@/components/ui/language-availability-notice'
import { Footer } from '@/components/layout/footer'
import { InitiativeSidebar } from './initiative-sidebar'

interface InitiativePageProps {
  params: { locale: string; slug: string }
}

async function getInitiative(slug: string, locale: string) {
  try {
    const initiative = await prisma.initiative.findUnique({
      where: { slug },
      include: {
        projectLead: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
        translations: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        tasks: {
          where: {
            status: {
              not: "COMPLETED",
            },
          },
          select: {
            id: true,
            titleEn: true,
            titleSv: true,
            titleKm: true,
            status: true,
            priority: true,
          },
          orderBy: [
            { status: "asc" },
            { priority: "desc" },
          ],
        },
        updates: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            publishedAt: "desc",
          },
          take: 5,
        },
        _count: {
          select: {
            members: true,
            tasks: true,
            updates: true,
          },
        },
      },
    })

    if (!initiative || initiative.status !== 'PUBLISHED') {
      return null
    }

    // Get translation for requested language or fallback
    const translation =
      initiative.translations.find((t) => t.language === locale) ||
      initiative.translations.find((t) => t.language === "en") ||
      initiative.translations.find((t) => t.language === "sv") ||
      initiative.translations[0]

    return {
      ...initiative,
      translation,
    }
  } catch (error) {
    console.error("Error fetching initiative:", error)
    return null
  }
}

export async function generateMetadata({ params }: InitiativePageProps): Promise<Metadata> {
  const initiative = await getInitiative(params.slug, params.locale)

  if (!initiative || !initiative.translation) {
    return {
      title: 'Initiative Not Found',
    }
  }

  return {
    title: `${initiative.translation.title} | Sahakum Khmer`,
    description: initiative.translation.shortDescription || initiative.translation.title,
  }
}

export default async function InitiativePage({ params }: InitiativePageProps) {
  // Check authentication directly on the server
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session

  const initiativeData = await getInitiative(params.slug, params.locale)

  if (!initiativeData || !initiativeData.translation) {
    notFound()
  }

  // Add the isLoggedIn flag to the initiative data
  const initiative = {
    ...initiativeData,
    isLoggedIn,
  }

  const locale = params.locale
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: { en: string; sv: string; km: string } } = {
      CULTURAL_EVENT: { en: "Cultural Event", sv: "Kulturellt Evenemang", km: "ពិធីវប្បធម៌" },
      BUSINESS: { en: "Business", sv: "Affärer", km: "អាជីវកម្ម" },
      EDUCATION: { en: "Education", sv: "Utbildning", km: "ការអប់រំ" },
      TRANSLATION: { en: "Translation", sv: "Översättning", km: "ការបកប្រែ" },
      SOCIAL: { en: "Social", sv: "Socialt", km: "សង្គម" },
      OTHER: { en: "Other", sv: "Annat", km: "ផ្សេងៗ" },
    }
    return labels[category]?.[locale as keyof typeof labels.BUSINESS] || category
  }

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const backToInitiatives = {
    sv: "Tillbaka till initiativ",
    en: "Back to initiatives",
    km: "ត្រឡប់ទៅគម្រោង"
  }[locale] || "Back to initiatives"

  const headerTranslations = {
    sign_in: locale === 'sv' ? 'Logga in' : locale === 'km' ? 'ចូល' : 'Sign in',
    sign_out: locale === 'sv' ? 'Logga ut' : locale === 'km' ? 'ចេញ' : 'Sign out',
    admin: locale === 'sv' ? 'Admin' : locale === 'km' ? 'អ្នកគ្រប់គ្រង' : 'Admin',
    profile: locale === 'sv' ? 'Min profil' : locale === 'km' ? 'ប្រវត្តិរូប' : 'My Profile',
    settings: locale === 'sv' ? 'Inställningar' : locale === 'km' ? 'ការកំណត់' : 'Settings',
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 ${fontClass}`}>
      <SwedenSkipNav locale={locale} />
      <ScrollAwareHeader
        locale={locale}
        currentUrl={`/${locale}/initiatives/${params.slug}`}
        translations={headerTranslations}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--color-sweden-neutral-700)] text-white overflow-hidden py-16 lg:py-20">
        <Container size="wide" className="relative">
          <div className="max-w-4xl">
            {/* Back Navigation */}
            <Link
              href={`/${locale}/initiatives`}
              className={`inline-flex items-center text-sm text-white/70 hover:text-white transition-colors mb-6 group ${fontClass}`}
            >
              <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span>
              {backToInitiatives}
            </Link>

            {/* Initiative Badges */}
            <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up">
              <span className={`text-xs bg-white/10 text-white px-3 py-1.5 rounded-sm font-medium border border-white/20 ${fontClass}`}>
                {getCategoryLabel(initiative.category)}
              </span>
              {initiative.visibility === "MEMBERS_ONLY" && (
                <span className={`text-xs bg-purple-500/20 text-white px-3 py-1.5 rounded-sm font-medium border border-purple-300/30 ${fontClass}`}>
                  <Lock className="h-3 w-3 mr-1 inline-block" />
                  {locale === 'sv' ? 'Endast medlemmar' : locale === 'km' ? 'សមាជិកប៉ុណ្ណោះ' : 'Members Only'}
                </span>
              )}
            </div>

            <h1 className={`text-4xl md:text-5xl font-semibold leading-[1.29] tracking-[-0.36px] text-white mb-4 animate-fade-in-up whitespace-normal overflow-visible ${fontClass}`} style={{ animationDelay: '0.2s' }}>
              {initiative.translation.title}
            </h1>

            <p className={`text-xl text-white/90 mb-6 animate-fade-in-up ${fontClass}`} style={{ animationDelay: '0.4s' }}>
              {initiative.translation.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-[var(--sahakum-gold)] mb-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5" />
                <div className="text-sm">
                  <span className={`text-white/90 font-medium ${fontClass}`}>
                    {formatDate(initiative.startDate)}
                    {initiative.endDate && ` - ${formatDate(initiative.endDate)}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5" />
                <span className={`text-sm text-white/90 font-medium ${fontClass}`}>{initiative._count.members} members</span>
              </div>
              {initiative._count.tasks > 0 && (
                <div className="flex items-center space-x-3">
                  <CheckSquare className="h-5 w-5" />
                  <span className={`text-sm text-white/90 font-medium ${fontClass}`}>{initiative._count.tasks} tasks</span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Image */}
      {initiative.featuredImage && (
        <div className="w-full h-96 bg-gray-200">
          <img
            src={initiative.featuredImage}
            alt={initiative.translation.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Content */}
      <section className="py-16">
        <Container size="standard">
          {/* Language Availability Notice */}
          <LanguageAvailabilityNotice
            currentLocale={locale}
            slug={params.slug}
            type="initiative"
            className="mb-6"
          />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Description */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-gray-200 rounded-none">
                <CardContent className="pt-6">
                  <h2 className={`text-3xl font-semibold text-[var(--sahakum-navy)] mb-6 ${fontClass}`}>
                    {locale === 'sv' ? 'Om initiativet' : locale === 'km' ? 'អំពីគម្រោង' : 'About this initiative'}
                  </h2>
                  <article
                    className={`prose prose-sweden prose-lg max-w-none ${fontClass}`}
                    data-language={params.locale}
                    dangerouslySetInnerHTML={createSafeHTML(initiative.translation.description || '')}
                  />

                  {/* Category - Swedish Design System */}
                  <div className="mt-8 pt-8 border-t-2 border-[var(--sahakum-navy)]">
                    <h3 className={`text-base font-bold uppercase tracking-wide text-[var(--sahakum-navy)] mb-4 ${fontClass}`}>
                      {locale === 'km' ? 'ប្រភេទ' : locale === 'sv' ? 'Kategori' : 'Category'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      <span className={`text-sm bg-[var(--sahakum-navy)] text-white px-4 py-2 font-semibold uppercase tracking-wide ${fontClass}`}>
                        {getCategoryLabel(initiative.category)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Lead */}
              <Card className="border border-gray-200 rounded-none">
                <CardHeader>
                  <CardTitle className={fontClass}>
                    {locale === 'sv' ? 'Projektledare' : locale === 'km' ? 'ប្រធានគម្រោង' : 'Project Lead'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    {initiative.projectLead.profileImage ? (
                      <img
                        src={initiative.projectLead.profileImage}
                        alt={initiative.projectLead.name}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-[var(--sahakum-navy)]/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-[var(--sahakum-navy)]" />
                      </div>
                    )}
                    <span className={`font-medium ${fontClass}`}>
                      {initiative.projectLead.name}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Client-side authentication-aware sidebar */}
              <InitiativeSidebar
                locale={locale}
                fontClass={fontClass}
                slug={params.slug}
                initiativeId={initiative.id}
                members={initiative.members}
                tasks={initiative.tasks}
              />
            </div>
          </div>
        </Container>
      </section>

      <Footer locale={locale} />
    </div>
  )
}
