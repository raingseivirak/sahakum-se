import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PlaylistDisplay } from '@/components/playlist/playlist-display'

interface DisplayPageProps {
  params: { locale: string; code: string }
}

export async function generateMetadata({ params }: DisplayPageProps): Promise<Metadata> {
  return {
    title: `Display — ${params.code}`,
    robots: { index: false },
  }
}

export default async function DisplayPage({ params }: DisplayPageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'playlist' })

  const translations = {
    title: t('title'),
    roomExpired: t('roomExpired'),
    expiresIn: t('expiresIn', { minutes: '{minutes}' }),
    nothingPlaying: t('nothingPlaying'),
    upNext: t('upNext'),
    nowPlaying: t('nowPlaying'),
    waitingForAdmin: t('waitingForAdmin'),
    fullscreen: t('fullscreen'),
    exitFullscreen: t('exitFullscreen'),
    comingUpNext: t('comingUpNext'),
    addedBy: t('addedBy', { name: '{name}' }),
    loopList: t('loopList'),
    paused: t('paused'),
    nextUpIn: t('nextUpIn', { seconds: '{seconds}' }),
  }

  return (
    <PlaylistDisplay
      locale={params.locale}
      roomCode={params.code}
      t={translations}
    />
  )
}
