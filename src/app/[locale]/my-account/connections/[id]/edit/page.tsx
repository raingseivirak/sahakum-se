import Link from 'next/link'
import { BusinessForm } from '@/components/business/business-form'
import { getBusinessTranslations } from '@/lib/business-translations'

export default function EditBusinessPage({ params }: { params: { locale: string; id: string } }) {
  const text = getBusinessTranslations(params.locale)
  return <div><Link href={`/${params.locale}/my-account/connections`} className="mb-5 inline-block text-sweden-blue-700 underline underline-offset-4">← {text.backToDirectory}</Link><h2 className="mb-2 text-3xl font-semibold text-sahakum-navy-900">{text.editTitle}</h2><p className="mb-8 text-gray-600">{text.editLead}</p><BusinessForm locale={params.locale} businessId={params.id} /></div>
}
