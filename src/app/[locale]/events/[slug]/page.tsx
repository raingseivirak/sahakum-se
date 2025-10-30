import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Globe,
  Monitor,
  Mail,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EventRegistrationForm } from '@/components/events/event-registration-form'
import { createSafeHTML } from '@/lib/sanitize'
import { Container } from '@/components/layout/grid'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { LanguageAvailabilityNotice } from '@/components/ui/language-availability-notice'
import { CopyLinkButton } from '@/components/ui/copy-link-button'
import { Footer } from '@/components/layout/footer'

interface EventPageProps {
  params: { locale: string; slug: string }
  searchParams: { preview?: string }
}

export async function generateMetadata({ params, searchParams }: EventPageProps): Promise<Metadata> {
  const { locale, slug } = params
  const event = await getEvent(slug, locale, searchParams.preview)

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

  // Handle both single translation and translations array
  const translation = event.translation ||
    (event.translations?.find((t: any) => t.language === locale)) ||
    (event.translations?.[0])

  return {
    title: translation?.seoTitle || translation?.title || 'Event',
    description: translation?.metaDescription || translation?.excerpt || '',
    openGraph: {
      title: translation?.title || 'Event',
      description: translation?.excerpt || '',
      images: event.featuredImg ? [{ url: event.featuredImg }] : [],
    },
  }
}

async function getEvent(slug: string, locale: string, previewId?: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  if (previewId) {
    // Preview mode - fetch from admin API
    const response = await fetch(`${baseUrl}/api/events/${previewId}?language=${locale}`, {
      cache: 'no-store'
    })

    if (!response.ok) {
      return null
    }

    return response.json()
  }

  // Public mode - fetch from public API
  const response = await fetch(`${baseUrl}/api/public/events/${slug}?language=${locale}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { locale, slug } = params
  const event = await getEvent(slug, locale, searchParams.preview)

  if (!event) {
    notFound()
  }

  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'
  // Handle both single translation and translations array
  const translation = event.translation ||
    (event.translations?.find((t: any) => t.language === locale)) ||
    (event.translations?.[0])

  const translations: { [key: string]: any } = {
    sv: {
      backToEvents: 'Tillbaka till evenemang',
      eventDetails: 'Evenemangsinformation',
      dateTime: 'Datum & Tid',
      location: 'Plats',
      registration: 'Anmälan',
      organizer: 'Arrangör',
      contact: 'Kontakt',
      price: 'Pris',
      free: 'Gratis',
      registrationClosed: 'Anmälan stängd',
      registrationDeadline: 'Sista anmälningsdag',
      eventPassed: 'Detta evenemang har redan ägt rum',
      spotsLeft: 'platser kvar',
      full: 'Fullbokad',
      membersOnly: 'Endast för medlemmar',
      public: 'Öppen för alla',
      registerNow: 'Anmäl dig nu',
      capacity: 'Kapacitet',
      allDay: 'Heldag',
      physical: 'Fysisk plats',
      virtual: 'Virtuellt',
      hybrid: 'Hybrid (Fysisk + Virtuell)',
      virtualLink: 'Gå med online',
      externalUrl: 'Mer information',
    },
    en: {
      backToEvents: 'Back to events',
      eventDetails: 'Event Details',
      dateTime: 'Date & Time',
      location: 'Location',
      registration: 'Registration',
      organizer: 'Organizer',
      contact: 'Contact',
      price: 'Price',
      free: 'Free',
      registrationClosed: 'Registration closed',
      registrationDeadline: 'Registration deadline',
      eventPassed: 'This event has already passed',
      spotsLeft: 'spots left',
      full: 'Full',
      membersOnly: 'Members only',
      public: 'Open to all',
      registerNow: 'Register now',
      capacity: 'Capacity',
      allDay: 'All day',
      physical: 'Physical location',
      virtual: 'Virtual',
      hybrid: 'Hybrid (Physical + Virtual)',
      virtualLink: 'Join online',
      externalUrl: 'More information',
    },
    km: {
      backToEvents: 'ត្រឡប់ទៅព្រឹត្តិការណ៍',
      eventDetails: 'ព័ត៌មានលម្អិតអំពីព្រឹត្តិការណ៍',
      dateTime: 'កាលបរិច្ឆេទ និងពេលវេលា',
      location: 'ទីតាំង',
      registration: 'ការចុះឈ្មោះ',
      organizer: 'អ្នករៀបចំ',
      contact: 'ទំនាក់ទំនង',
      price: 'តម្លៃ',
      free: 'ឥតគិតថ្លៃ',
      registrationClosed: 'បិទការចុះឈ្មោះ',
      registrationDeadline: 'ថ្ងៃផុតកំណត់ចុះឈ្មោះ',
      eventPassed: 'ព្រឹត្តិការណ៍នេះបានកន្លងផុតហើយ',
      spotsLeft: 'កន្លែងនៅសល់',
      full: 'ពេញហើយ',
      membersOnly: 'សមាជិកប៉ុណ្ណោះ',
      public: 'សាធារណៈ',
      registerNow: 'ចុះឈ្មោះឥឡូវនេះ',
      capacity: 'សមត្ថភាព',
      allDay: 'ពេញមួយថ្ងៃ',
      physical: 'ទីតាំងផ្ទាល់',
      virtual: 'តាមអនឡាញ',
      hybrid: 'លទ្ធផលរួម (ផ្ទាល់ + អនឡាញ)',
      virtualLink: 'ចូលរួមតាមអនឡាញ',
      externalUrl: 'ព័ត៌មានបន្ថែម',
    },
  }

  const t = translations[locale] || translations.en

  const getLocationTypeLabel = () => {
    switch (event.locationType) {
      case 'PHYSICAL':
        return t.physical
      case 'VIRTUAL':
        return t.virtual
      case 'HYBRID':
        return t.hybrid
      default:
        return event.locationType
    }
  }

  const getLocationIcon = () => {
    switch (event.locationType) {
      case 'PHYSICAL':
        return <MapPin className="h-5 w-5" />
      case 'VIRTUAL':
        return <Monitor className="h-5 w-5" />
      case 'HYBRID':
        return <Globe className="h-5 w-5" />
      default:
        return <MapPin className="h-5 w-5" />
    }
  }

  const canRegister = event.registrationEnabled && !event.registrationClosed && !event.eventPassed && !event.isFull

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 ${fontClass}`}>
      <SwedenSkipNav locale={locale} />
      <ScrollAwareHeader locale={locale} currentUrl={`/${locale}/events/${slug}`} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--color-sweden-neutral-700)] text-white overflow-hidden">
        {event.featuredImg && (
          <div className="absolute inset-0 opacity-10">
            <Image
              src={event.featuredImg}
              alt={translation?.title || 'Event'}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <Container size="wide" className="py-12 lg:py-16 relative">
          <div className="max-w-4xl">
            {/* Back Navigation */}
            <Link
              href={`/${locale}/events`}
              className={`inline-flex items-center text-sm text-white/70 hover:text-white transition-colors mb-6 group ${fontClass}`}
            >
              <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span>
              {t.backToEvents}
            </Link>

            {/* Event Badges */}
            <div className="flex flex-wrap gap-2 mb-6 animate-fade-in-up">
              {event.isFree && (
                <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1.5 rounded-sm font-medium border border-green-500/30">
                  {t.free}
                </span>
              )}
              {!event.isFree && event.price && (
                <span className="text-xs bg-[var(--sahakum-gold)]/20 text-[var(--sahakum-gold)] px-3 py-1.5 rounded-sm font-medium border border-[var(--sahakum-gold)]/30">
                  {event.price} {event.currency}
                </span>
              )}
              <span className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-sm font-medium border border-white/20">
                {getLocationTypeLabel()}
              </span>
              {event.registrationEnabled && (
                <span className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-sm font-medium border border-white/20">
                  {event.registrationType === 'MEMBERS_ONLY' ? t.membersOnly : t.public}
                </span>
              )}
            </div>

            {/* Event Title */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h1 className={`text-4xl lg:text-6xl font-semibold leading-[1.29] tracking-[-0.36px] text-white mb-6 ${fontClass}`}>
                {translation?.title || 'Untitled Event'}
              </h1>
            </div>

            {/* Event Meta */}
            <div className="flex flex-wrap items-center gap-6 text-[var(--sahakum-gold)] mb-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5" />
                <div className="text-sm">
                  <span className="text-white/90 font-medium">
                    {new Date(event.startDate).toLocaleDateString(locale, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {!event.allDay && (
                    <span className="ml-2 text-white/70">
                      {new Date(event.startDate).toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
              </div>
              {event.organizer && (
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5" />
                  <span className="text-sm text-white/90 font-medium">{event.organizer}</span>
                </div>
              )}
            </div>

            {/* Event Excerpt */}
            {translation?.excerpt && (
              <p className={`text-lg text-white/90 max-w-3xl animate-fade-in-up ${fontClass}`} style={{ animationDelay: '0.6s' }}>
                {translation.excerpt}
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <Container size="wide" className="py-8">
        <div className="w-full">
          {/* Language Availability Notice */}
          <LanguageAvailabilityNotice
            currentLocale={locale}
            slug={slug}
            type="event"
            className="mb-6"
          />

          <div className="grid gap-8 md:grid-cols-3">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Event Status Alerts */}
            {event.eventPassed && (
              <div className="flex items-center gap-2 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className={`text-gray-700 ${fontClass}`}>{t.eventPassed}</span>
              </div>
            )}

            {event.registrationEnabled && event.registrationClosed && !event.eventPassed && (
              <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <XCircle className="h-5 w-5 text-yellow-600" />
                <span className={`text-yellow-700 ${fontClass}`}>{t.registrationClosed}</span>
              </div>
            )}

            {event.registrationEnabled && event.isFull && !event.registrationClosed && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-300 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className={`text-red-700 ${fontClass}`}>{t.full}</span>
              </div>
            )}

            {/* Content with Featured Image Layout - Like Blog Posts */}
            {translation?.content && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Featured Image - Sticky Side Panel */}
                    {event.featuredImg && (
                      <div className="lg:col-span-2">
                        <div className="sticky top-8">
                          <img
                            src={event.featuredImg}
                            alt={translation?.title || 'Event'}
                            className="w-full h-64 md:h-80 lg:h-96 object-cover shadow-lg"
                          />
                        </div>
                      </div>
                    )}

                    {/* Event Content - Scrollable */}
                    <div className={event.featuredImg ? "lg:col-span-3" : "lg:col-span-5"}>
                      <div
                        className={`prose prose-sweden prose-lg max-w-none ${fontClass}`}
                        data-language={locale}
                        dangerouslySetInnerHTML={createSafeHTML(translation.content)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categories & Tags - Swedish Design System */}
            {(event.categories.length > 0 || event.tags.length > 0) && (
              <div className="mt-8 pt-8 border-t-2 border-[var(--sahakum-navy)] space-y-6">
                {event.categories.length > 0 && (
                  <div>
                    <h3 className={`text-base font-bold uppercase tracking-wide text-[var(--sahakum-navy)] mb-4 ${fontClass}`}>
                      {locale === 'km' ? 'ប្រភេទ' : locale === 'sv' ? 'Kategorier' : 'Categories'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {event.categories.map((cat: any) => {
                        const catTranslation = cat.category.translations.find((t: any) => t.language === locale)
                        return (
                          <span
                            key={cat.categoryId}
                            className={`text-sm bg-[var(--sahakum-navy)] text-white px-4 py-2 font-semibold uppercase tracking-wide ${fontClass}`}
                          >
                            {catTranslation?.name || cat.category.slug}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
                {event.tags.length > 0 && (
                  <div>
                    <h3 className={`text-base font-bold uppercase tracking-wide text-[var(--sahakum-navy)] mb-4 ${fontClass}`}>
                      {locale === 'km' ? 'ស្លាក' : locale === 'sv' ? 'Taggar' : 'Tags'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {event.tags.map((tag: any) => {
                        const tagTranslation = tag.tag.translations.find((t: any) => t.language === locale)
                        return (
                          <span
                            key={tag.tagId}
                            className={`text-sm border-2 border-[var(--sahakum-navy)] text-[var(--sahakum-navy)] px-4 py-2 font-semibold ${fontClass}`}
                          >
                            #{tagTranslation?.name || tag.tag.slug}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Registration Form */}
            {canRegister && (
              <div id="register" className="mt-12 -mx-4 md:mx-0">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-[var(--sahakum-navy)] to-[var(--sahakum-navy-800)] text-white px-8 py-10 relative overflow-hidden">
                  {/* Decorative Element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--sahakum-gold)] opacity-5 rounded-full -mr-32 -mt-32"></div>

                  <div className="relative max-w-3xl">
                    <div className="inline-flex items-center space-x-2 mb-4">
                      <div className="w-1 h-8 bg-[var(--sahakum-gold)]"></div>
                      <span className={`text-sm uppercase tracking-wider font-semibold text-[var(--sahakum-gold)] ${fontClass}`}>
                        {t.registration}
                      </span>
                    </div>
                    <h2 className={`text-4xl md:text-5xl font-bold mb-3 ${fontClass}`}>
                      {t.registerNow}
                    </h2>
                    <p className={`text-lg text-white/90 ${fontClass}`}>
                      {event.registrationType === 'MEMBERS_ONLY'
                        ? t.membersOnly
                        : t.public}
                    </p>
                    {event.spotsRemaining && event.spotsRemaining <= 10 && (
                      <div className="mt-4 inline-flex items-center bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 text-yellow-200">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span className={`font-semibold ${fontClass}`}>
                          {event.spotsRemaining} {t.spotsLeft}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Section */}
                <div className="bg-white border-x border-b border-gray-200 px-8 py-10">
                  <div className="max-w-3xl">
                    <EventRegistrationForm
                      eventId={event.id}
                      eventSlug={event.slug}
                      registrationType={event.registrationType}
                      locale={locale}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className={fontClass}>{t.eventDetails}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-sahakum-navy mt-0.5" />
                  <div>
                    <div className={`font-semibold ${fontClass}`}>{t.dateTime}</div>
                    <div className={`text-sm ${fontClass}`}>
                      {new Date(event.startDate).toLocaleDateString(locale, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    {!event.allDay && (
                      <div className={`text-sm text-muted-foreground ${fontClass}`}>
                        {new Date(event.startDate).toLocaleTimeString(locale, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' - '}
                        {new Date(event.endDate).toLocaleTimeString(locale, {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                    {event.allDay && (
                      <div className={`text-sm text-muted-foreground ${fontClass}`}>
                        {t.allDay}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="flex items-start gap-3">
                  {getLocationIcon()}
                  <div className="flex-1">
                    <div className={`font-semibold ${fontClass}`}>{t.location}</div>
                    <div className={`text-sm ${fontClass}`}>{getLocationTypeLabel()}</div>

                    {(event.locationType === 'PHYSICAL' || event.locationType === 'HYBRID') && (
                      <div className={`text-sm mt-2 ${fontClass}`}>
                        {event.venueName && <div className="font-medium">{event.venueName}</div>}
                        {event.address && <div>{event.address}</div>}
                        {(event.postalCode || event.city) && (
                          <div>
                            {event.postalCode} {event.city}
                          </div>
                        )}
                        {event.country && <div>{event.country}</div>}
                      </div>
                    )}

                    {(event.locationType === 'VIRTUAL' || event.locationType === 'HYBRID') && event.virtualUrl && (
                      <Button asChild variant="outline" size="sm" className={`mt-2 ${fontClass}`}>
                        <a href={event.virtualUrl} target="_blank" rel="noopener noreferrer">
                          <Monitor className="mr-2 h-4 w-4" />
                          {t.virtualLink}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Price */}
                {!event.isFree && event.price && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-sahakum-navy mt-0.5" />
                      <div>
                        <div className={`font-semibold ${fontClass}`}>{t.price}</div>
                        <div className={`text-sm ${fontClass}`}>
                          {event.price} {event.currency}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {event.isFree && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className={`font-semibold ${fontClass}`}>{t.price}</div>
                        <div className={`text-sm text-green-600 ${fontClass}`}>{t.free}</div>
                      </div>
                    </div>
                  </>
                )}

                {/* Registration Info */}
                {event.registrationEnabled && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-sahakum-navy mt-0.5" />
                      <div className="flex-1">
                        <div className={`font-semibold ${fontClass}`}>{t.registration}</div>
                        {event.registrationDeadline && (
                          <div className={`text-sm text-muted-foreground ${fontClass}`}>
                            {t.registrationDeadline}:{' '}
                            {new Date(event.registrationDeadline).toLocaleDateString(locale)}
                          </div>
                        )}
                        {event.maxCapacity && (
                          <div className={`text-sm ${fontClass}`}>
                            {t.capacity}: {event.maxCapacity}
                            {event.spotsRemaining !== undefined && (
                              <span className="ml-2 text-muted-foreground">
                                ({event.spotsRemaining} {t.spotsLeft})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Organizer */}
                {event.organizer && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-sahakum-navy mt-0.5" />
                      <div>
                        <div className={`font-semibold ${fontClass}`}>{t.organizer}</div>
                        <div className={`text-sm ${fontClass}`}>{event.organizer}</div>
                      </div>
                    </div>
                  </>
                )}

                {/* Contact */}
                {event.contactEmail && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-sahakum-navy mt-0.5" />
                      <div>
                        <div className={`font-semibold ${fontClass}`}>{t.contact}</div>
                        <a
                          href={`mailto:${event.contactEmail}`}
                          className={`text-sm text-sahakum-gold hover:underline ${fontClass}`}
                        >
                          {event.contactEmail}
                        </a>
                      </div>
                    </div>
                  </>
                )}

                {/* External URL */}
                {event.externalUrl && (
                  <>
                    <Separator />
                    <Button asChild variant="outline" className={`w-full ${fontClass}`}>
                      <a href={event.externalUrl} target="_blank" rel="noopener noreferrer">
                        {t.externalUrl}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Registration Link */}
            {canRegister && (
              <div className="bg-gradient-to-br from-[var(--sahakum-gold)] to-[var(--sahakum-gold)]/80 p-6 text-[var(--sahakum-navy)]">
                <div className="flex items-start space-x-3 mb-4">
                  <CheckCircle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${fontClass}`}>{t.registration}</h3>
                    <p className={`text-sm opacity-90 ${fontClass}`}>
                      {event.registrationType === 'MEMBERS_ONLY' ? t.membersOnly : t.public}
                    </p>
                  </div>
                </div>
                {event.spotsRemaining && event.spotsRemaining <= 10 && (
                  <div className={`text-xs bg-white/30 px-3 py-2 mb-4 font-semibold ${fontClass}`}>
                    ⚠️ {event.spotsRemaining} {t.spotsLeft}
                  </div>
                )}
                <a
                  href="#register"
                  className={`inline-flex items-center justify-between w-full bg-white hover:bg-white/90 text-[var(--sahakum-navy)] font-bold px-4 py-3 transition-all hover:shadow-md ${fontClass}`}
                >
                  <span>{t.registerNow}</span>
                  <span className="text-xl">→</span>
                </a>
              </div>
            )}
          </div>
        </div>
        </div>
      </Container>

      <Footer locale={locale} />
    </div>
  )
}
