import { LayoutHeader } from '@/components/layout/layout-header'

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params }: Props) {
  return (
    <>
      <LayoutHeader locale={params.locale} />
      {children}
    </>
  )
}
