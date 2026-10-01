import Link from 'next/link'
import { BusinessForm } from '@/components/business/business-form'

export default function EditBusinessPage({ params }: { params: { locale: string; id: string } }) {
  return <div><Link href={`/${params.locale}/my-account/connections`} className="mb-5 inline-block text-sweden-blue-600 underline underline-offset-4">← Khmer Connections</Link><h2 className="mb-2 text-3xl font-semibold text-sahakum-navy-900">Edit business</h2><p className="mb-8 text-gray-600">Update your listing and submit it for review.</p><BusinessForm locale={params.locale} businessId={params.id} /></div>
}

