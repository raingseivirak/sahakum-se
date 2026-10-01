import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/grid'
import { SwedenH1, SwedenLead } from '@/components/ui/sweden-typography'
import { BusinessCard } from '@/components/business/business-card'
import { businessInclude, categoryName } from '@/lib/business-directory'
import { Search } from 'lucide-react'
import { BusinessServiceArea, type Prisma } from '@prisma/client'
import { getBusinessTranslations, serviceAreaLabel } from '@/lib/business-translations'

interface Props {
  params: { locale: string }
  searchParams: { q?: string; category?: string; city?: string; serviceArea?: string }
}

export default async function ConnectionsPage({ params, searchParams }: Props) {
  const locale = params.locale
  const text = getBusinessTranslations(locale)
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

  const hasFilters = Boolean(q || category || city || serviceArea)

  return (
    <main className={locale === 'km' ? 'font-khmer' : 'font-sweden'}>
      <section className="bg-sahakum-navy-900 py-14 text-white">
        <Container size="wide">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-sahakum-gold-300">{text.directoryEyebrow}</p>
          <SwedenH1 className="mb-4 text-white" locale={supportedLocale}>{text.directoryTitle}</SwedenH1>
          <SwedenLead className="max-w-3xl text-white/85" locale={supportedLocale}>{text.directoryLead}</SwedenLead>
        </Container>
      </section>
      <section className="bg-sahakum-navy-50 py-10">
        <Container size="wide">
          <form className="grid gap-4 border border-sweden-neutral-200 bg-white p-6 md:grid-cols-2 lg:grid-cols-6" action={`/${locale}/connections`}>
            <label className="lg:col-span-2">
              <span className="mb-2 block text-sm font-medium text-sahakum-navy-900">{text.searchLabel}</span>
              <input name="q" defaultValue={q} placeholder={text.searchPlaceholder} className="h-11 w-full border border-sweden-neutral-300 px-3 focus:border-sweden-blue-500 focus:outline-none" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-sahakum-navy-900">{text.allCategories}</span>
              <select name="category" defaultValue={category} className="h-11 w-full border border-sweden-neutral-300 bg-white px-3 focus:border-sweden-blue-500 focus:outline-none">
                <option value="">{text.allCategories}</option>
                {categories.map(item => <option key={item.id} value={item.slug}>{categoryName(item, locale)}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-sahakum-navy-900">{text.allServiceAreas}</span>
              <select name="serviceArea" defaultValue={serviceArea} className="h-11 w-full border border-sweden-neutral-300 bg-white px-3 focus:border-sweden-blue-500 focus:outline-none">
                <option value="">{text.allServiceAreas}</option>
                {Object.values(BusinessServiceArea).map(area => <option key={area} value={area}>{serviceAreaLabel(area, locale)}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-sahakum-navy-900">{text.city}</span>
              <input name="city" defaultValue={city} placeholder={text.cityPlaceholder} className="h-11 w-full border border-sweden-neutral-300 px-3 focus:border-sweden-blue-500 focus:outline-none" />
            </label>
            <div className="flex items-end">
              <button className="flex h-11 w-full items-center justify-center gap-2 bg-sahakum-gold-500 px-5 font-semibold text-sahakum-navy-900 hover:bg-sahakum-gold-600"><Search className="h-4 w-4" />{text.search}</button>
            </div>
          </form>
          <div className="my-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4"><p className="text-sahakum-navy-700"><strong>{businesses.length}</strong> {businesses.length === 1 ? text.oneBusiness : text.businesses}</p>{hasFilters && <Link href={`/${locale}/connections`} className="text-sm font-medium text-sweden-blue-700 underline underline-offset-4">{text.clearFilters}</Link>}</div>
            <Link href={`/${locale}/my-account/connections/new`} className="font-semibold text-sweden-blue-700 underline underline-offset-4">{text.registerBusiness}</Link>
          </div>
          {businesses.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map(business => <BusinessCard key={business.id} business={business} locale={locale} />)}
            </div>
          ) : <div className="border-l-4 border-sahakum-gold-500 bg-white p-8 text-sahakum-navy-700"><p className="font-semibold">{text.noResults}</p><p className="mt-1 text-sm text-sahakum-navy-600">{text.noResultsHelp}</p></div>}
        </Container>
      </section>
    </main>
  )
}
