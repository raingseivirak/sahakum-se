import Link from 'next/link'
import Image from 'next/image'
import { SwedenH2, SwedenBody } from '@/components/ui/sweden-typography'
import { Container } from '@/components/layout/grid'
import { prisma } from '@/lib/prisma'

interface ServicesSectionProps {
  locale: string
  className?: string
}

const getColorTheme = (theme: string | null): string => {
  const themes: Record<string, string> = {
    'navy': 'from-sahakum-navy-600 to-sahakum-navy-700',
    'gold': 'from-sahakum-gold-500 to-sahakum-gold-600',
    'blue': 'from-sweden-blue-500 to-sweden-blue-600',
    'custom': 'from-sahakum-navy-600 to-sahakum-gold-600'
  }
  return themes[theme ?? 'navy'] || themes.navy
}

export async function ServicesSection({ locale, className = '' }: ServicesSectionProps) {
  const rawServices = await prisma.service.findMany({
    where: { active: true },
    include: {
      translations: { where: { language: locale } }
    },
    orderBy: { order: 'asc' }
  })

  const services = rawServices.map(s => ({
    id: s.id,
    slug: s.slug,
    icon: s.icon,
    featuredImg: s.featuredImg,
    colorTheme: s.colorTheme,
    order: s.order,
    translation: s.translations[0] || { title: s.slug, description: '', buttonText: 'Learn More' }
  }))

  if (services.length === 0) return null

  return (
    <section className={`py-16 lg:py-24 bg-sahakum-navy-50 ${className}`}>
      <Container size="wide">
        <div className="text-center mb-16">
          <SwedenH2 className="text-sahakum-navy-900 mb-6" locale={locale}>
            {locale === 'sv' ? 'Våra tjänster' :
             locale === 'km' ? 'សេវាកម្មរបស់យើង' :
             'Our services'}
          </SwedenH2>
          <SwedenBody className="text-sahakum-navy-600 max-w-3xl mx-auto" locale={locale}>
            {locale === 'sv' ? 'Vi erbjuder stöd och gemenskap för att hjälpa dig att trivas i Sverige' :
             locale === 'km' ? 'យើងផ្តល់ការគាំទ្រ និងសហគមន៍ដើម្បីជួយអ្នកទទួលបានជោគជ័យនៅស៊ុយអែត' :
             'We offer support and community to help you thrive in Sweden'}
          </SwedenBody>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const colorTheme = getColorTheme(service.colorTheme)

            return (
              <Link
                key={service.id}
                href={`/${locale}/${service.slug === 'blog' ? 'blog' : service.slug === 'membership' ? 'join' : service.slug}`}
                className="group block bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  {service.featuredImg ? (
                    <Image
                      src={service.featuredImg}
                      alt={service.translation.title}
                      fill
                      priority={index === 0}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${colorTheme} overflow-hidden`}>
                      <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <pattern id={`service-${service.slug}`} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5"/>
                              <circle cx="40" cy="40" r="20" fill="none" stroke="white" strokeWidth="0.3"/>
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill={`url(#service-${service.slug})`}/>
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                    <h3 className={`text-white text-xl lg:text-2xl font-semibold mb-2 group-hover:text-sahakum-gold-200 transition-colors duration-200 ${
                      locale === 'km' ? 'font-khmer text-khmer-heading' : 'font-sweden text-sweden-heading'
                    }`}>
                      {service.translation.title}
                    </h3>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-6">
                  <p className={`text-sahakum-navy-600 text-base lg:text-lg leading-relaxed mb-4 ${
                    locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'
                  }`}>
                    {service.translation.description}
                  </p>
                  <div className="inline-flex items-center bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-navy)] text-[var(--sahakum-navy)] hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 group-hover:scale-105">
                    <span className={locale === 'km' ? 'font-khmer' : 'font-sweden'}>
                      {service.translation.buttonText}
                    </span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
