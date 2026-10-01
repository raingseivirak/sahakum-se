import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/grid'
import { SwedenH1, SwedenLead } from '@/components/ui/sweden-typography'
import { BusinessCard } from '@/components/business/business-card'
import { businessInclude, categoryName } from '@/lib/business-directory'
import { Search } from 'lucide-react'
import { BusinessServiceArea, type Prisma } from '@prisma/client'

interface Props {
  params: { locale: string }
  searchParams: { q?: string; category?: string; city?: string; serviceArea?: string }
}

export default async function ConnectionsPage({ params, searchParams }: Props) {
  const locale = params.locale
  const supportedLocale = (['en', 'sv', 'km'].includes(locale) ? locale : 'en') as 'en' | 'sv' | 'km'
  const q = searchParams.q?.trim() || ''
  const category = searchParams.category || ''
  const city = searchParams.city?.trim() || ''
  const serviceArea = searchParams.serviceArea || ''

  const where: Prisma.BusinessWhereInput = { status: 'APPROVED' }
  if (q) where.OR = [
    { name: { contains: q, mode: 'insensitive' } },
    { summary: { contains: q, mode: 'insensitive' } },
    { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
  ]
  if (category) where.category = { slug: category }
  if (city) where.city = { contains: city, mode: 'insensitive' }
  if (Object.values(BusinessServiceArea).includes(serviceArea as BusinessServiceArea)) {
    where.serviceArea = serviceArea as BusinessServiceArea
  }

  const [businesses, categories] = await Promise.all([
    prisma.business.findMany({ where, include: businessInclude, orderBy: [{ featured: 'desc' }, { name: 'asc' }] }),
    prisma.businessCategory.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
  ])

  const text = locale === 'sv'
    ? { title: 'Khmer Connections', lead: 'Upptäck khmerägda företag och tjänster i Sverige.', search: 'Sök företag eller tjänst', city: 'Stad', all: 'Alla kategorier', area: 'Alla serviceområden', submit: 'Sök', register: 'Registrera ditt företag', results: 'företag', empty: 'Inga företag matchade din sökning.' }
    : locale === 'km'
      ? { title: 'Khmer Connections', lead: 'ស្វែងរកអាជីវកម្ម និងសេវាកម្មរបស់ជនជាតិខ្មែរនៅប្រទេសស៊ុយអែត។', search: 'ស្វែងរកអាជីវកម្ម ឬសេវាកម្ម', city: 'ទីក្រុង', all: 'ប្រភេទទាំងអស់', area: 'តំបន់សេវាកម្មទាំងអស់', submit: 'ស្វែងរក', register: 'ចុះឈ្មោះអាជីវកម្ម', results: 'អាជីវកម្ម', empty: 'រកមិនឃើញអាជីវកម្មដែលត្រូវគ្នាទេ។' }
      : { title: 'Khmer Connections', lead: 'Discover Khmer-owned businesses and services in Sweden.', search: 'Search businesses or services', city: 'City', all: 'All categories', area: 'All service areas', submit: 'Search', register: 'Register your business', results: 'businesses', empty: 'No businesses matched your search.' }

  return (
    <main className={locale === 'km' ? 'font-khmer' : 'font-sweden'}>
      <section className="bg-sahakum-navy-900 py-14 text-white">
        <Container size="wide">
          <SwedenH1 className="mb-4 text-white" locale={supportedLocale}>{text.title}</SwedenH1>
          <SwedenLead className="max-w-3xl text-white/85" locale={supportedLocale}>{text.lead}</SwedenLead>
        </Container>
      </section>
      <section className="bg-sahakum-navy-50 py-10">
        <Container size="wide">
          <form className="grid gap-4 border border-sweden-neutral-200 bg-white p-6 md:grid-cols-2 lg:grid-cols-6" action={`/${locale}/connections`}>
            <label className="lg:col-span-2">
              <span className="mb-2 block text-sm font-medium text-sahakum-navy-900">{text.search}</span>
              <input name="q" defaultValue={q} className="h-11 w-full border border-sweden-neutral-300 px-3 focus:border-sweden-blue-500 focus:outline-none" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-sahakum-navy-900">{text.all}</span>
              <select name="category" defaultValue={category} className="h-11 w-full border border-sweden-neutral-300 bg-white px-3 focus:border-sweden-blue-500 focus:outline-none">
                <option value="">{text.all}</option>
                {categories.map(item => <option key={item.id} value={item.slug}>{categoryName(item, locale)}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-sahakum-navy-900">{text.area}</span>
              <select name="serviceArea" defaultValue={serviceArea} className="h-11 w-full border border-sweden-neutral-300 bg-white px-3 focus:border-sweden-blue-500 focus:outline-none">
                <option value="">{text.area}</option>
                <option value="LOCAL">Local</option>
                <option value="NATIONWIDE">Nationwide</option>
                <option value="ONLINE">Online</option>
                <option value="INTERNATIONAL">International</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-sahakum-navy-900">{text.city}</span>
              <input name="city" defaultValue={city} className="h-11 w-full border border-sweden-neutral-300 px-3 focus:border-sweden-blue-500 focus:outline-none" />
            </label>
            <div className="flex items-end">
              <button className="flex h-11 w-full items-center justify-center gap-2 bg-sahakum-gold-500 px-5 font-semibold text-sahakum-navy-900 hover:bg-sahakum-gold-600"><Search className="h-4 w-4" />{text.submit}</button>
            </div>
          </form>
          <div className="my-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sahakum-navy-700"><strong>{businesses.length}</strong> {text.results}</p>
            <Link href={`/${locale}/my-account/connections/new`} className="font-semibold text-sweden-blue-600 underline underline-offset-4">{text.register}</Link>
          </div>
          {businesses.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map(business => <BusinessCard key={business.id} business={business} locale={locale} />)}
            </div>
          ) : <div className="border-l-4 border-sahakum-gold-500 bg-white p-8 text-sahakum-navy-700">{text.empty}</div>}
        </Container>
      </section>
    </main>
  )
}
