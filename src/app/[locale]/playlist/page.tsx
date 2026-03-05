import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/grid'
import { SwedenH1, SwedenBody } from '@/components/ui/sweden-typography'
import { PlaylistLanding } from '@/components/playlist/playlist-landing'

interface PlaylistPageProps {
  params: { locale: string }
}

const navTranslations: Record<string, Record<string, string>> = {
  sv: { sign_in: 'Logga in', sign_out: 'Logga ut', admin: 'Admin', profile: 'Profil', settings: 'Inställningar' },
  en: { sign_in: 'Sign In', sign_out: 'Sign Out', admin: 'Admin', profile: 'Profile', settings: 'Settings' },
  km: { sign_in: 'ចូលប្រើ', sign_out: 'ចាកចេញ', admin: 'អ្នកគ្រប់គ្រង', profile: 'ប្រវត្តិរូប', settings: 'ការកំណត់' },
}

export async function generateMetadata({ params }: PlaylistPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'playlist' })

  return {
    title: `${t('title')} | Sahakum Khmer`,
    description: t('subtitle'),
  }
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'playlist' })
  const nav = navTranslations[params.locale] || navTranslations.en

  const translations = {
    createRoom: t('createRoom'),
    createRoomDesc: t('createRoomDesc'),
    createNewRoom: t('createNewRoom'),
    joinRoom: t('joinRoom'),
    joinRoomDesc: t('joinRoomDesc'),
    enterRoomCode: t('enterRoomCode'),
    serviceUnavailable: t('serviceUnavailable'),
    atCapacity: t('atCapacity'),
    loginRequired: t('loginRequired'),
  }

  return (
    <>
      <ScrollAwareHeader
        locale={params.locale}
        stickyContent={{
          title: t('title'),
          excerpt: t('subtitle'),
        }}
        translations={{
          sign_in: nav.sign_in,
          sign_out: nav.sign_out,
          admin: nav.admin,
          profile: nav.profile,
          settings: nav.settings,
        }}
        currentUrl={`/${params.locale}/playlist`}
      />
      <main className="min-h-screen bg-white">
        <section className="bg-[var(--sahakum-navy)] text-white py-16">
          <Container size="wide" className="text-center">
            <SwedenH1 locale={params.locale} className="text-white mb-4">
              {t('title')}
            </SwedenH1>
            <SwedenBody locale={params.locale} className="text-gray-300 max-w-2xl mx-auto">
              {t('subtitle')}
            </SwedenBody>
          </Container>
        </section>

        <section className="py-16">
          <Container size="wide">
            <PlaylistLanding locale={params.locale} t={translations} />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  )
}
