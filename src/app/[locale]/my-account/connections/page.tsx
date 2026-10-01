import { MyBusinessesList } from '@/components/business/my-businesses-list'

export default function MyConnectionsPage({ params }: { params: { locale: string } }) {
  return <MyBusinessesList locale={params.locale} />
}

