import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { SwedishCard, SwedishCardHeader, SwedishCardContent, SwedishCardTitle } from '@/components/ui/swedish-card';
import { SwedenH2, SwedenBody } from '@/components/ui/sweden-typography';
import { SwedenButton } from '@/components/ui/sweden-motion';
import { Badge } from '@/components/ui/badge';

interface UpcomingEventsSectionProps {
  locale: string;
}

const translations = {
  sv: {
    title: 'Kommande evenemang',
    subtitle: 'Delta i våra gemenskapsaktiviteter och kulturella evenemang',
    viewAll: 'Visa alla evenemang',
    free: 'Gratis',
    register: 'Anmäl dig',
    spotsLeft: 'platser kvar',
    full: 'Fullbokad',
    noEvents: 'Inga kommande evenemang just nu',
  },
  en: {
    title: 'Upcoming Events',
    subtitle: 'Join our community activities and cultural events',
    viewAll: 'View all events',
    free: 'Free',
    register: 'Register',
    spotsLeft: 'spots left',
    full: 'Full',
    noEvents: 'No upcoming events at this time',
  },
  km: {
    title: 'ព្រឹត្តិការណ៍ខាងមុខ',
    subtitle: 'ចូលរួមសកម្មភាពសហគមន៍ និងព្រឹត្តិការណ៍វប្បធម៌របស់យើង',
    viewAll: 'មើលព្រឹត្តិការណ៍ទាំងអស់',
    free: 'ឥតគិតថ្លៃ',
    register: 'ចុះឈ្មោះ',
    spotsLeft: 'កន្លែងនៅសល់',
    full: 'ពេញហើយ',
    noEvents: 'គ្មានព្រឹត្តិការណ៍ខាងមុខនៅពេលនេះ',
  }
};

async function getUpcomingEvents(locale: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/public/events?language=${locale}&time=upcoming&limit=3`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return { events: [] };
  }

  return response.json();
}

export async function UpcomingEventsSection({ locale }: UpcomingEventsSectionProps) {
  const { events } = await getUpcomingEvents(locale);
  const t = translations[locale as keyof typeof translations] || translations.en;
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden';

  return (
    <section className={`py-16 bg-white ${fontClass}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <SwedenH2 className="text-sahakum-navy mb-4">{t.title}</SwedenH2>
          <SwedenBody className="text-gray-600 max-w-2xl mx-auto">
            {t.subtitle}
          </SwedenBody>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className={`text-gray-600 ${fontClass}`}>{t.noEvents}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event: any) => {
              const translation = event.translation || event.translations?.[0];

              return (
                <SwedishCard key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-[var(--duration-sweden-base)]">
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
                  <SwedishCardHeader>
                    <SwedishCardTitle className={`text-lg ${fontClass}`}>
                      {translation?.title || 'Untitled'}
                    </SwedishCardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {event.isFree && (
                        <Badge className="bg-green-500 text-white text-xs">{t.free}</Badge>
                      )}
                      {event.isFull && (
                        <Badge variant="destructive" className="text-xs">{t.full}</Badge>
                      )}
                      {!event.isFull && event.spotsRemaining && event.spotsRemaining <= 10 && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                          {event.spotsRemaining} {t.spotsLeft}
                        </Badge>
                      )}
                    </div>
                  </SwedishCardHeader>
                  <SwedishCardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="h-4 w-4 mt-0.5 text-sahakum-navy flex-shrink-0" />
                        <div className={fontClass}>
                          <div className="font-medium">
                            {new Date(event.startDate).toLocaleDateString(locale, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          {!event.allDay && (
                            <div className="text-muted-foreground text-xs">
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
                          <div className={`text-muted-foreground ${fontClass}`}>
                            {event.city}
                          </div>
                        </div>
                      )}

                      {translation?.excerpt && (
                        <p className={`text-sm text-muted-foreground line-clamp-2 ${fontClass}`}>
                          {translation.excerpt}
                        </p>
                      )}

                      <SwedenButton asChild variant="default" size="sm" className="w-full">
                        <Link href={`/${locale}/events/${event.slug}`}>
                          {t.register}
                        </Link>
                      </SwedenButton>
                    </div>
                  </SwedishCardContent>
                </SwedishCard>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        {events.length > 0 && (
          <div className="text-center">
            <SwedenButton asChild variant="outline" size="lg">
              <Link href={`/${locale}/events`}>
                {t.viewAll} →
              </Link>
            </SwedenButton>
          </div>
        )}
      </div>
    </section>
  );
}
