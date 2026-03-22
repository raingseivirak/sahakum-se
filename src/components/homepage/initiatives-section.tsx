import Link from 'next/link'
import Image from 'next/image'
import { SwedenH2, SwedenBody } from '@/components/ui/sweden-typography'
import { SwedishCard, SwedishCardHeader, SwedishCardContent, SwedishCardTitle } from '@/components/ui/swedish-card'
import { SwedenButton } from '@/components/ui/sweden-motion'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, CheckSquare, Lightbulb } from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface InitiativesSectionProps {
  locale: string
}

const categoryLabels: Record<string, Record<string, string>> = {
  CULTURAL_EVENT: { en: "Cultural Event", sv: "Kulturellt Evenemang", km: "ពិធីវប្បធម៌" },
  BUSINESS: { en: "Business", sv: "Affärer", km: "អាជីវកម្ម" },
  EDUCATION: { en: "Education", sv: "Utbildning", km: "ការអប់រំ" },
  TRANSLATION: { en: "Translation", sv: "Översättning", km: "ការបកប្រែ" },
  SOCIAL: { en: "Social", sv: "Socialt", km: "សង្គម" },
  OTHER: { en: "Other", sv: "Annat", km: "ផ្សេងៗ" },
}

const sectionContent: Record<string, { title: string; description: string; viewAll: string; readMore: string; members: string; tasks: string }> = {
  sv: { title: 'Våra Initiativ', description: 'Upptäck de projekt och initiativ som formar vår gemenskap', viewAll: 'Se alla initiativ', readMore: 'Läs mer', members: 'medlemmar', tasks: 'uppgifter' },
  en: { title: 'Our Initiatives', description: 'Discover the projects and initiatives shaping our community', viewAll: 'View all initiatives', readMore: 'Read more', members: 'members', tasks: 'tasks' },
  km: { title: 'គម្រោងរបស់យើង', description: 'ស្វែងយល់អំពីគម្រោងដែលកំពុងកសាងសហគមន៍របស់យើង', viewAll: 'មើលគម្រោងទាំងអស់', readMore: 'អានបន្ថែម', members: 'សមាជិក', tasks: 'កិច្ចការ' },
}

export async function InitiativesSection({ locale }: InitiativesSectionProps) {
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'
  const content = sectionContent[locale] || sectionContent.en

  const rawInitiatives = await prisma.initiative.findMany({
    where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
    include: {
      translations: { where: { language: locale } },
      _count: { select: { members: true, tasks: true, updates: true } }
    },
    orderBy: { startDate: 'desc' },
    take: 3
  })

  if (rawInitiatives.length === 0) return null

  const initiatives = rawInitiatives.map(i => ({
    id: i.id,
    slug: i.slug,
    category: i.category,
    startDate: i.startDate.toISOString(),
    featuredImage: i.featuredImage,
    translation: i.translations[0] || null,
    _count: i._count
  }))

  return (
    <section className={`py-16 bg-white ${fontClass}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Lightbulb className="h-8 w-8 text-[var(--sahakum-gold)] mr-3" />
            <SwedenH2 className="text-[var(--sahakum-navy)] mb-0" locale={locale}>
              {content.title}
            </SwedenH2>
          </div>
          <SwedenBody className="text-gray-600 max-w-2xl mx-auto" locale={locale}>
            {content.description}
          </SwedenBody>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initiatives.map((initiative, index) => (
            <SwedishCard key={initiative.id} className="overflow-hidden hover:shadow-lg transition-all duration-[var(--duration-sweden-base)]">
              {initiative.featuredImage && (
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  <Image
                    src={initiative.featuredImage}
                    alt={initiative.translation?.title || 'Initiative'}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}

              <SwedishCardHeader>
                <SwedishCardTitle className={`text-lg ${fontClass}`}>
                  {initiative.translation?.title || 'Untitled'}
                </SwedishCardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-[var(--sahakum-navy)] border-[var(--sahakum-navy)]">
                    {categoryLabels[initiative.category]?.[locale] || initiative.category}
                  </Badge>
                </div>
              </SwedishCardHeader>

              <SwedishCardContent>
                <div className="space-y-3">
                  {initiative.translation?.shortDescription && (
                    <p className={`text-sm text-muted-foreground line-clamp-2 ${fontClass}`}>
                      {initiative.translation.shortDescription}
                    </p>
                  )}

                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="h-4 w-4 mt-0.5 text-sahakum-navy flex-shrink-0" />
                    <div className={fontClass}>
                      <div className="font-medium">
                        {new Date(initiative.startDate).toLocaleDateString(
                          locale === 'sv' ? 'sv-SE' : 'en-US',
                          { year: 'numeric', month: 'long' }
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className={fontClass}>{initiative._count.members} {content.members}</span>
                    </div>
                    {initiative._count.tasks > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckSquare className="h-4 w-4" />
                        <span className={fontClass}>{initiative._count.tasks} {content.tasks}</span>
                      </div>
                    )}
                  </div>

                  <SwedenButton asChild variant="default" size="sm" className="w-full">
                    <Link href={`/${locale}/initiatives/${initiative.slug}`}>
                      {content.readMore}
                    </Link>
                  </SwedenButton>
                </div>
              </SwedishCardContent>
            </SwedishCard>
          ))}
        </div>

        <div className="text-center mt-8">
          <SwedenButton asChild variant="outline" size="lg">
            <Link href={`/${locale}/initiatives`}>
              {content.viewAll} →
            </Link>
          </SwedenButton>
        </div>
      </div>
    </section>
  )
}
