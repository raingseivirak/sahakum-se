import { Metadata } from 'next'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { StickyTitleBar } from '@/components/ui/sticky-title-bar'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/grid'
import { SwedenH1, SwedenBody } from '@/components/ui/sweden-typography'
import { PlaylistLanding } from '@/components/playlist/playlist-landing'
import { prisma } from '@/lib/prisma'

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

  const langMap: Record<string, string> = { sv: 'sv', en: 'en', km: 'km' }
  const language = langMap[params.locale] || 'en'

  let serviceData: { description: string; featuredImg: string | null } | null = null
  try {
    const service = await prisma.service.findFirst({
      where: { slug: 'playlist', active: true },
      include: {
        translations: { where: { language } },
      },
    })
    if (service) {
      const translation = service.translations[0]
      serviceData = {
        description: translation?.description || '',
        featuredImg: service.featuredImg,
      }
    }
  } catch {
    // Service data is optional — fall back to translation strings
  }

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
    customCodePlaceholder: t('customCodePlaceholder'),
    codeTaken: t('codeTaken'),
    codeInvalid: t('codeInvalid'),
  }

  return (
    <>
      <StickyTitleBar
        locale={params.locale}
        title={t('title')}
        excerpt={t('subtitle')}
      />
      <main className="min-h-screen bg-white">
        <section className="relative bg-[var(--sahakum-navy)] text-white py-16 overflow-hidden">
          {serviceData?.featuredImg && (
            <Image
              src={serviceData.featuredImg}
              alt=""
              fill
              className="object-cover opacity-20"
              sizes="100vw"
              priority
            />
          )}
          <Container size="wide" className="relative z-10 text-center">
            <SwedenH1 locale={params.locale} className="text-white mb-4">
              {t('title')}
            </SwedenH1>
            <SwedenBody locale={params.locale} className="text-gray-300 max-w-2xl mx-auto">
              {serviceData?.description || t('subtitle')}
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
