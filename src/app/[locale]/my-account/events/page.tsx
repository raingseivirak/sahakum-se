import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "My Events | Sahakum Khmer",
  description: "View events you're registered for"
}

interface MyEventsPageProps {
  params: { locale: string }
}

export default async function MyEventsPage({ params }: MyEventsPageProps) {
  const session = await getServerSession(authOptions)
  const locale = params.locale
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  if (!session) {
    return null
  }

  // Get user's event registrations
  const registrations = await prisma.eventRegistration.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      event: {
        include: {
          translations: {
            where: {
              language: locale,
            },
          },
        },
      },
    },
    orderBy: {
      event: {
        startDate: 'asc',
      },
    },
  })

  const now = new Date()

  // Separate upcoming and past events
  const upcomingEvents = registrations.filter(
    r => r.status === 'CONFIRMED' && new Date(r.event.endDate) >= now
  )
  const pastEvents = registrations.filter(
    r => r.status === 'CONFIRMED' && new Date(r.event.endDate) < now
  )
  const pendingEvents = registrations.filter(
    r => r.status === 'PENDING'
  )
  const cancelledEvents = registrations.filter(
    r => r.status === 'CANCELLED'
  )

  const texts = {
    title: {
      en: 'My Events',
      sv: 'Mina Evenemang',
      km: 'ព្រឹត្តិការណ៍របស់ខ្ញុំ'
    },
    description: {
      en: 'Events you have registered for',
      sv: 'Evenemang du har registrerat dig för',
      km: 'ព្រឹត្តិការណ៍ដែលអ្នកបានចុះឈ្មោះ'
    },
    upcoming: {
      en: 'Upcoming Events',
      sv: 'Kommande Evenemang',
      km: 'ព្រឹត្តិការណ៍នាពេលខាងមុខ'
    },
    past: {
      en: 'Past Events',
      sv: 'Tidigare Evenemang',
      km: 'ព្រឹត្តិការណ៍កន្លងមក'
    },
    pending: {
      en: 'Pending Confirmation',
      sv: 'Väntar på Bekräftelse',
      km: 'រង់ចាំការបញ្ជាក់'
    },
    cancelled: {
      en: 'Cancelled',
      sv: 'Avbokade',
      km: 'បានលុបចោល'
    },
    noUpcoming: {
      en: 'You have no upcoming events',
      sv: 'Du har inga kommande evenemang',
      km: 'អ្នកគ្មានព្រឹត្តិការណ៍នាពេលខាងមុខទេ'
    },
    noPast: {
      en: 'You have no past events',
      sv: 'Du har inga tidigare evenemang',
      km: 'អ្នកគ្មានព្រឹត្តិការណ៍កន្លងមកទេ'
    },
    noPending: {
      en: 'You have no pending registrations',
      sv: 'Du har inga väntande registreringar',
      km: 'អ្នកគ្មានការចុះឈ្មោះរង់ចាំទេ'
    },
    registeredOn: {
      en: 'Registered on',
      sv: 'Registrerad den',
      km: 'បានចុះឈ្មោះនៅ'
    },
    attendees: {
      en: 'attendees',
      sv: 'deltagare',
      km: 'អ្នកចូលរួម'
    },
    viewDetails: {
      en: 'View Details',
      sv: 'Visa Detaljer',
      km: 'មើលព័ត៌មានលម្អិត'
    }
  }

  const t = (key: keyof typeof texts) => texts[key][locale as keyof typeof texts.title] || texts[key].en

  const getEventTitle = (event: any) => {
    return event.translations[0]?.title || 'Untitled Event'
  }

  const getEventDescription = (event: any) => {
    return event.translations[0]?.description || ''
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(locale === 'sv' ? 'sv-SE' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const EventCard = ({ registration }: { registration: any }) => {
    const event = registration.event
    return (
      <Link href={`/${locale}/events/${event.slug}`}>
        <Card className="border border-gray-200 rounded-none hover:shadow-lg transition-shadow cursor-pointer">
          {event.featuredImage && (
            <div className="h-48 bg-gray-200 overflow-hidden">
              <img
                src={event.featuredImage}
                alt={getEventTitle(event)}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className={`text-xl ${fontClass}`}>
                {getEventTitle(event)}
              </CardTitle>
              {event.isFeatured && (
                <Badge className="bg-[var(--sahakum-gold)]">Featured</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date and Time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-[var(--sahakum-gold)]" />
                <span className={fontClass}>
                  {formatDate(event.startDate)}
                  {event.endDate && new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString() && (
                    <> - {formatDate(event.endDate)}</>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-[var(--sahakum-gold)]" />
                <span className={fontClass}>
                  {formatTime(event.startDate)}
                  {event.endDate && <> - {formatTime(event.endDate)}</>}
                </span>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-[var(--sahakum-gold)]" />
                <span className={fontClass}>{event.location}</span>
              </div>
            )}

            {/* Capacity */}
            {event.maxCapacity && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className={fontClass}>
                  {event.currentAttendees || 0} / {event.maxCapacity} {t('attendees')}
                </span>
              </div>
            )}

            {/* Registration Date */}
            <div className={`text-xs text-muted-foreground pt-2 border-t border-gray-200 ${fontClass}`}>
              {t('registeredOn')} {formatDate(registration.registeredAt)}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-semibold text-[var(--sahakum-navy)] ${fontClass}`}>
          {t('title')}
        </h1>
        <p className={`mt-2 text-muted-foreground ${fontClass}`}>
          {t('description')}
        </p>
      </div>

      {/* Pending Registrations */}
      {pendingEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className={`text-2xl font-semibold text-[var(--sahakum-navy)] ${fontClass}`}>
            {t('pending')} ({pendingEvents.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {pendingEvents.map((registration) => (
              <EventCard key={registration.id} registration={registration} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h2 className={`text-2xl font-semibold text-[var(--sahakum-navy)] ${fontClass}`}>
          {t('upcoming')} ({upcomingEvents.length})
        </h2>
        {upcomingEvents.length === 0 ? (
          <Card className="border border-gray-200 rounded-none">
            <CardContent className="py-12">
              <p className={`text-center text-muted-foreground ${fontClass}`}>
                {t('noUpcoming')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {upcomingEvents.map((registration) => (
              <EventCard key={registration.id} registration={registration} />
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className={`text-2xl font-semibold text-[var(--sahakum-navy)] ${fontClass}`}>
            {t('past')} ({pastEvents.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {pastEvents.map((registration) => (
              <EventCard key={registration.id} registration={registration} />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Events */}
      {cancelledEvents.length > 0 && (
        <div className="space-y-4">
          <h2 className={`text-2xl font-semibold text-gray-500 ${fontClass}`}>
            {t('cancelled')} ({cancelledEvents.length})
          </h2>
          <div className="grid gap-6 md:grid-cols-2 opacity-60">
            {cancelledEvents.map((registration) => (
              <EventCard key={registration.id} registration={registration} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
