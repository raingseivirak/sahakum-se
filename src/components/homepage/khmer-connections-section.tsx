import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/grid'
import { SwedenH2, SwedenBody } from '@/components/ui/sweden-typography'
import { SwedenButton } from '@/components/ui/sweden-motion'
import { BusinessCard } from '@/components/business/business-card'
import { businessInclude } from '@/lib/business-directory'

export async function KhmerConnectionsSection({ locale }: { locale: string }) {
  const supportedLocale = (['en', 'sv', 'km'].includes(locale) ? locale : 'en') as 'en' | 'sv' | 'km'
  const businesses = await prisma.business.findMany({
    where: { status: 'APPROVED' },
    include: businessInclude,
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
    take: 6,
  })

  const copy = {
    en: { title: 'Khmer Connections', description: 'Discover Khmer-owned businesses and services in Sweden.', explore: 'Explore all businesses', register: 'Register your business' },
    sv: { title: 'Khmer Connections', description: 'Upptäck khmerägda företag och tjänster i Sverige.', explore: 'Utforska alla företag', register: 'Registrera ditt företag' },
    km: { title: 'Khmer Connections', description: 'ស្វែងរកអាជីវកម្ម និងសេវាកម្មរបស់ជនជាតិខ្មែរនៅប្រទេសស៊ុយអែត។', explore: 'មើលអាជីវកម្មទាំងអស់', register: 'ចុះឈ្មោះអាជីវកម្មរបស់អ្នក' },
  }[locale as 'en' | 'sv' | 'km'] || null

  const text = copy || { title: 'Khmer Connections', description: 'Discover Khmer-owned businesses and services in Sweden.', explore: 'Explore all businesses', register: 'Register your business' }

  return (
    <section className="bg-sahakum-navy-50 py-16 lg:py-24">
      <Container size="wide">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <SwedenH2 className="mb-3 text-sahakum-navy-900" locale={supportedLocale}>{text.title}</SwedenH2>
            <SwedenBody className="max-w-2xl text-sahakum-navy-600" locale={supportedLocale}>{text.description}</SwedenBody>
          </div>
          <div className="flex flex-wrap gap-3">
            <SwedenButton asChild variant="secondary"><Link href={`/${locale}/connections`}>{text.explore}</Link></SwedenButton>
            <SwedenButton asChild><Link href={`/${locale}/my-account/connections/new`}>{text.register}</Link></SwedenButton>
          </div>
        </div>
        {businesses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map(business => <BusinessCard key={business.id} business={business} locale={locale} />)}
          </div>
        ) : (
          <div className="border-l-4 border-sahakum-gold-500 bg-white p-6 text-sahakum-navy-700">
            {locale === 'sv' ? 'Bli först med att registrera ditt företag i Khmer Connections.' : locale === 'km' ? 'ក្លាយជាអ្នកដំបូងដែលចុះឈ្មោះអាជីវកម្មនៅក្នុង Khmer Connections។' : 'Be the first to register your business in Khmer Connections.'}
          </div>
        )}
      </Container>
    </section>
  )
}
