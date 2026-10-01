import Link from 'next/link'
import { Building2, MapPin, UserRound } from 'lucide-react'
import { categoryName } from '@/lib/business-directory'
import type { BusinessWithDetails } from '@/lib/business-directory'
import Image from 'next/image'

interface BusinessCardProps {
  business: BusinessWithDetails
  locale: string
}

export function BusinessCard({ business, locale }: BusinessCardProps) {
  const ownerName = locale === 'km' && business.owner.firstNameKhmer
    ? `${business.owner.firstNameKhmer} ${business.owner.lastNameKhmer || ''}`.trim()
    : `${business.owner.firstName} ${business.owner.lastName}`

  return (
    <Link
      href={`/${locale}/connections/${business.slug}`}
      className="group flex h-full flex-col overflow-hidden border border-sweden-neutral-200 bg-white shadow-sweden-sm transition-all duration-sweden-base hover:-translate-y-0.5 hover:border-sweden-blue-500/30 hover:shadow-sweden-md focus-sweden"
    >
      <div className="flex min-h-36 items-center justify-center bg-gradient-to-br from-sahakum-navy-600 to-sahakum-navy-800 p-6">
        {business.logoUrl ? (
          <Image src={business.logoUrl} alt="" width={160} height={96} unoptimized className="max-h-24 max-w-full object-contain" />
        ) : (
          <Building2 className="h-16 w-16 text-sahakum-gold-300" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-2 text-sm font-medium text-sweden-blue-600">
          {categoryName(business.category, locale)}
        </p>
        <h3 className={`mb-2 text-xl font-semibold text-sahakum-navy-900 group-hover:text-sweden-blue-600 ${locale === 'km' ? 'font-khmer' : 'font-sweden'}`}>
          {business.name}
        </h3>
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-sahakum-navy-600">{business.summary}</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {business.tags.slice(0, 3).map(({ tag }) => (
            <span key={tag.id} className="bg-sahakum-gold-50 px-2 py-1 text-xs text-sahakum-navy-800">{tag.name}</span>
          ))}
        </div>
        <div className="mt-auto space-y-2 border-t border-sweden-neutral-200 pt-4 text-sm text-sahakum-navy-600">
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{business.city}, {business.country}</span>
          {business.displayOwnerName && <span className="flex items-center gap-2"><UserRound className="h-4 w-4" />{ownerName}</span>}
        </div>
      </div>
    </Link>
  )
}
