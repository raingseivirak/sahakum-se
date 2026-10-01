import { AdminBusinessList } from '@/components/business/admin-business-list'
import { BusinessTaxonomyManager } from '@/components/business/business-taxonomy-manager'

export default function AdminBusinessesPage({ params }: { params: { locale: string } }) {
  return <div className="py-6"><AdminBusinessList locale={params.locale} /><BusinessTaxonomyManager /></div>
}
