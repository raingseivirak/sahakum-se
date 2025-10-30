import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users, Clock, Globe, Monitor } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Container } from '@/components/layout/grid'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { Footer } from '@/components/layout/footer'

interface EventsPageProps {
  params: { locale: string }
  searchParams: { category?: string; time?: string; page?: string }
}

export async function generateMetadata({ params }: EventsPageProps): Promise<Metadata> {
  const { locale } = params

  const titles: { [key: string]: string } = {
    sv: 'Evenemang | Sahakum Khmer',
    en: 'Events | Sahakum Khmer',
    km: 'ព្រឹត្តិការណ៍ | Sahakum Khmer',
  }

  const descriptions: { [key: string]: string } = {
    sv: 'Upptäck och delta i våra kommande evenemang, workshops och sammankomster',
    en: 'Discover and join our upcoming events, workshops, and gatherings',
    km: 'រកឃើញ និងចូលរួមព្រឹត្តិការណ៍ ប្រជុំ និងសិក្ខាសាលារបស់យើងខាងមុខ',
  }

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  }
}

async function getEvents(locale: string, category?: string, time: string = 'upcoming', page: number = 1) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const params = new URLSearchParams({
    language: locale,
    time,
    page: page.toString(),
    limit: '12'
  })

  if (category) {
    params.append('category', category)
  }

  const response = await fetch(`${baseUrl}/api/public/events?${params}`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    return { events: [], pagination: { total: 0, page: 1, limit: 12, totalPages: 0 } }
  }

  return response.json()
}

async function getCategories() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/categories`, {
    cache: 'no-store'
  })

  if (!response.ok) {
    return []
  }

  return response.json()
}

export default async function EventsPage({ params, searchParams }: EventsPageProps) {
  const { locale } = params
  const { category, time = 'upcoming', page = '1' } = searchParams
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  const { events, pagination } = await getEvents(locale, category, time, parseInt(page))
  const categories = await getCategories()

  const translations: { [key: string]: any } = {
    sv: {
      title: 'Evenemang',
      subtitle: 'Upptäck och delta i våra kommande evenemang',
      upcoming: 'Kommande',
      past: 'Tidigare',
      all: 'Alla',
      allCategories: 'Alla kategorier',
      free: 'Gratis',
      registration: 'Anmälan',
      registrationRequired: 'Anmälan krävs',
      noRegistration: 'Ingen anmälan',
      membersOnly: 'Endast medlemmar',
      public: 'Offentlig',
      spotsLeft: 'platser kvar',
      full: 'Fullbokad',
      noEvents: 'Inga evenemang hittades',
      viewDetails: 'Se detaljer',
      physical: 'Fysisk',
      virtual: 'Virtuell',
      hybrid: 'Hybrid',
    },
    en: {
      title: 'Events',
      subtitle: 'Discover and join our upcoming events',
      upcoming: 'Upcoming',
      past: 'Past',
      all: 'All',
      allCategories: 'All categories',
      free: 'Free',
      registration: 'Registration',
      registrationRequired: 'Registration required',
      noRegistration: 'No registration',
      membersOnly: 'Members only',
      public: 'Public',
      spotsLeft: 'spots left',
      full: 'Full',
      noEvents: 'No events found',
      viewDetails: 'View details',
      physical: 'Physical',
      virtual: 'Virtual',
      hybrid: 'Hybrid',
    },
    km: {
      title: 'ព្រឹត្តិការណ៍',
      subtitle: 'រកឃើញ និងចូលរួមព្រឹត្តិការណ៍របស់យើងខាងមុខ',
      upcoming: 'ខាងមុខ',
      past: 'កន្លងមក',
      all: 'ទាំងអស់',
      allCategories: 'ប្រភេទទាំងអស់',
      free: 'ឥតគិតថ្លៃ',
      registration: 'ការចុះឈ្មោះ',
      registrationRequired: 'ត្រូវការចុះឈ្មោះ',
      noRegistration: 'មិនចាំបាច់ចុះឈ្មោះ',
      membersOnly: 'សមាជិកប៉ុណ្ណោះ',
      public: 'សាធារណៈ',
      spotsLeft: 'កន្លែងនៅសល់',
      full: 'ពេញហើយ',
      noEvents: 'រកមិនឃើញព្រឹត្តិការណ៍',
      viewDetails: 'មើលព័ត៌មានលម្អិត',
      physical: 'ផ្ទាល់',
      virtual: 'តាមអនឡាញ',
      hybrid: 'លទ្ធផលរួម',
    },
  }

  const t = translations[locale] || translations.en

  const getLocationIcon = (locationType: string) => {
    switch (locationType) {
      case 'PHYSICAL':
        return <MapPin className="h-4 w-4" />
      case 'VIRTUAL':
        return <Monitor className="h-4 w-4" />
      case 'HYBRID':
        return <Globe className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getLocationLabel = (locationType: string) => {
    switch (locationType) {
      case 'PHYSICAL':
        return t.physical
      case 'VIRTUAL':
        return t.virtual
      case 'HYBRID':
        return t.hybrid
      default:
        return locationType
    }
  }

  const getCategoryName = (cat: any) => {
    const translation = cat.translations.find((tr: any) => tr.language === locale)
    return translation?.name || cat.slug
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 ${fontClass}`}>
      <SwedenSkipNav locale={locale} />
      <ScrollAwareHeader locale={locale} currentUrl={`/${locale}/events`} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--color-sweden-neutral-700)] text-white overflow-hidden py-16 lg:py-20">
        <Container size="wide" className="relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6 animate-fade-in-up">
              <Calendar className="h-12 w-12 lg:h-16 lg:w-16 mr-4 text-[var(--sahakum-gold)]" />
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.29] tracking-[-0.36px] ${fontClass}`}>
                {t.title}
              </h1>
            </div>
            <p className={`text-lg lg:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in-up ${fontClass}`} style={{ animationDelay: '0.2s' }}>
              {t.subtitle}
            </p>
          </div>
        </Container>
      </section>

      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Tabs value={time} className="w-full md:w-auto">
              <TabsList className="grid w-full md:w-auto grid-cols-3">
                <TabsTrigger value="upcoming" asChild>
                  <Link href={`/${locale}/events?time=upcoming${category ? `&category=${category}` : ''}`}>
                    {t.upcoming}
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="all" asChild>
                  <Link href={`/${locale}/events?time=all${category ? `&category=${category}` : ''}`}>
                    {t.all}
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="past" asChild>
                  <Link href={`/${locale}/events?time=past${category ? `&category=${category}` : ''}`}>
                    {t.past}
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 flex-wrap">
              <Button variant={!category ? "default" : "outline"} asChild size="sm">
                <Link href={`/${locale}/events?time=${time}`} className={fontClass}>
                  {t.allCategories}
                </Link>
              </Button>
              {categories.slice(0, 5).map((cat: any) => (
                <Button
                  key={cat.id}
                  variant={category === cat.slug ? "default" : "outline"}
                  asChild
                  size="sm"
                >
                  <Link href={`/${locale}/events?time=${time}&category=${cat.slug}`} className={fontClass}>
                    {getCategoryName(cat)}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className={`text-2xl font-bold text-gray-900 mb-2 ${fontClass}`}>{t.noEvents}</h2>
            <p className="text-gray-600">
              {time === 'upcoming' && 'Check back soon for new events'}
              {time === 'past' && 'No past events to display'}
              {time === 'all' && 'No events available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => {
              // Handle both single translation and translations array
              const translation = event.translation ||
                (event.translations?.find((t: any) => t.language === locale)) ||
                (event.translations?.[0])

              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.featuredImg && (
                    <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                      <Image
                        src={event.featuredImg}
                        alt={translation?.title || 'Event'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className={`text-xl mb-2 ${fontClass}`}>
                          {translation?.title || 'Untitled'}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {event.isFree && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          {t.free}
                        </Badge>
                      )}
                      {!event.isFree && event.price && (
                        <Badge variant="outline" className="bg-sahakum-gold/10 text-sahakum-gold border-sahakum-gold/30">
                          {event.price} {event.currency}
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getLocationIcon(event.locationType)}
                        {getLocationLabel(event.locationType)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-4 w-4 mt-0.5 text-sahakum-navy flex-shrink-0" />
                        <div>
                          <div className={`font-medium ${fontClass}`}>
                            {new Date(event.startDate).toLocaleDateString(locale, {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          {!event.allDay && (
                            <div className={`text-muted-foreground ${fontClass}`}>
                              {new Date(event.startDate).toLocaleTimeString(locale, {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {event.locationType !== 'VIRTUAL' && event.city && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-sahakum-navy flex-shrink-0" />
                          <div className={fontClass}>
                            {event.venueName && <div className="font-medium">{event.venueName}</div>}
                            <div className="text-muted-foreground">{event.city}</div>
                          </div>
                        </div>
                      )}

                      {event.registrationEnabled && (
                        <div className="flex items-start gap-2 text-sm">
                          <Users className="h-4 w-4 mt-0.5 text-sahakum-navy flex-shrink-0" />
                          <div>
                            {event.isFull ? (
                              <Badge variant="destructive" className="text-xs">{t.full}</Badge>
                            ) : event.spotsRemaining && event.spotsRemaining <= 10 ? (
                              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                                {event.spotsRemaining} {t.spotsLeft}
                              </Badge>
                            ) : (
                              <span className={`text-muted-foreground ${fontClass}`}>
                                {event.registrationType === 'MEMBERS_ONLY' ? t.membersOnly : t.public}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {translation?.excerpt && (
                        <p className={`text-sm text-muted-foreground line-clamp-2 ${fontClass}`}>
                          {translation.excerpt}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className={`w-full ${fontClass}`}>
                      <Link href={`/${locale}/events/${event.slug}`}>
                        {t.viewDetails}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {pagination.page > 1 && (
              <Button variant="outline" asChild>
                <Link href={`/${locale}/events?time=${time}${category ? `&category=${category}` : ''}&page=${pagination.page - 1}`}>
                  Previous
                </Link>
              </Button>
            )}
            <span className={`px-4 py-2 ${fontClass}`}>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            {pagination.page < pagination.totalPages && (
              <Button variant="outline" asChild>
                <Link href={`/${locale}/events?time=${time}${category ? `&category=${category}` : ''}&page=${pagination.page + 1}`}>
                  Next
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <Footer locale={locale} />
    </div>
  )
}
