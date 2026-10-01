import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Building2, ExternalLink, Globe2, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/grid'
import { businessInclude, categoryName } from '@/lib/business-directory'
import { SafeBusinessDescription } from '@/components/business/safe-business-description'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Image from 'next/image'

export default async function BusinessPage({ params }: { params: { locale: string; slug: string } }) {
  const [business, session] = await Promise.all([prisma.business.findUnique({
    where: { slug: params.slug },
    include: businessInclude,
  }), getServerSession(authOptions)])
  if (!business) notFound()
  const canPreview = session?.user?.id && (
    ['EDITOR', 'BOARD', 'ADMIN'].includes(session.user.role) || business.owner.userId === session.user.id
  )
  if (business.status !== 'APPROVED' && !canPreview) notFound()

  const ownerName = params.locale === 'km' && business.owner.firstNameKhmer
    ? `${business.owner.firstNameKhmer} ${business.owner.lastNameKhmer || ''}`.trim()
    : `${business.owner.firstName} ${business.owner.lastName}`
  const fullAddress = [business.address, business.postalCode, business.city, business.country].filter(Boolean).join(', ')
  const visibleLocation = business.locationVisibility === 'ONLINE_ONLY'
    ? (params.locale === 'sv' ? 'Online' : params.locale === 'km' ? 'អនឡាញ' : 'Online')
    : business.locationVisibility === 'EXACT' ? fullAddress : `${business.city}, ${business.country}`

  return (
    <main className={`bg-sahakum-navy-50 py-12 ${params.locale === 'km' ? 'font-khmer' : 'font-sweden'}`}>
      <Container size="wide">
        {business.status !== 'APPROVED' && <div className="mb-5 border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-900">Preview: this listing is currently {business.status.replaceAll('_', ' ').toLowerCase()} and is not public.</div>}
        <Link href={`/${params.locale}/connections`} className="mb-6 inline-block text-sweden-blue-600 underline underline-offset-4">← Khmer Connections</Link>
        <article className="overflow-hidden border border-sweden-neutral-200 bg-white shadow-sweden-sm">
          <header className="grid gap-8 bg-sahakum-navy-900 p-8 text-white md:grid-cols-[180px_1fr] md:p-12">
            <div className="flex h-40 items-center justify-center bg-white/10 p-5">
              {business.logoUrl ? <Image src={business.logoUrl} alt="" width={160} height={160} unoptimized className="max-h-full max-w-full object-contain" /> : <Building2 className="h-20 w-20 text-sahakum-gold-300" />}
            </div>
            <div>
              <p className="mb-3 font-medium text-sahakum-gold-300">{categoryName(business.category, params.locale)}</p>
              <h1 className="mb-4 text-3xl font-semibold md:text-5xl">{business.name}</h1>
              <p className="max-w-3xl text-lg leading-relaxed text-white/85">{business.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {business.tags.map(({ tag }) => <span key={tag.id} className="bg-white/10 px-3 py-1 text-sm">{tag.name}</span>)}
              </div>
            </div>
          </header>
          <div className="grid gap-10 p-8 md:grid-cols-[1fr_300px] md:p-12">
            <SafeBusinessDescription html={business.description} />
            <aside className="space-y-5 border-l-4 border-sahakum-gold-500 bg-sahakum-navy-50 p-6">
              <div className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sweden-blue-600" /><span>{visibleLocation}</span></div>
              {business.displayOwnerName && <div className="flex gap-3"><UserRound className="mt-0.5 h-5 w-5 shrink-0 text-sweden-blue-600" /><span>{ownerName}</span></div>}
              {business.phone && <a className="flex gap-3 text-sweden-blue-700 hover:underline" href={`tel:${business.phone}`}><Phone className="mt-0.5 h-5 w-5 shrink-0" />{business.phone}</a>}
              {business.email && <a className="flex gap-3 break-all text-sweden-blue-700 hover:underline" href={`mailto:${business.email}`}><Mail className="mt-0.5 h-5 w-5 shrink-0" />{business.email}</a>}
              {business.website && <a className="flex gap-3 break-all text-sweden-blue-700 hover:underline" href={business.website} target="_blank" rel="noreferrer"><Globe2 className="mt-0.5 h-5 w-5 shrink-0" />{business.website.replace(/^https?:\/\//, '')}</a>}
              {business.facebookUrl && <a className="flex gap-3 text-sweden-blue-700 hover:underline" href={business.facebookUrl} target="_blank" rel="noreferrer"><ExternalLink className="mt-0.5 h-5 w-5 shrink-0" />Facebook</a>}
              {business.instagramUrl && <a className="flex gap-3 text-sweden-blue-700 hover:underline" href={business.instagramUrl} target="_blank" rel="noreferrer"><ExternalLink className="mt-0.5 h-5 w-5 shrink-0" />Instagram</a>}
            </aside>
          </div>
        </article>
      </Container>
    </main>
  )
}
