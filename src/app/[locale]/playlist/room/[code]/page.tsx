import { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/grid'
import { PlaylistRoom } from '@/components/playlist/playlist-room'

interface RoomPageProps {
  params: { locale: string; code: string }
}

const navTranslations: Record<string, Record<string, string>> = {
  sv: { sign_in: 'Logga in', sign_out: 'Logga ut', admin: 'Admin', profile: 'Profil', settings: 'Inställningar' },
  en: { sign_in: 'Sign In', sign_out: 'Sign Out', admin: 'Admin', profile: 'Profile', settings: 'Settings' },
  km: { sign_in: 'ចូល', sign_out: 'ចាកចេញ', admin: 'អ្នកគ្រប់គ្រង', profile: 'ប្រវត្តិរូប', settings: 'ការកំណត់' },
}

export async function generateMetadata({ params }: RoomPageProps): Promise<Metadata> {
  return {
    title: `Room ${params.code} | Shared Playlist`,
    robots: { index: false },
  }
}

export default async function RoomPage({ params }: RoomPageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'playlist' })
  const nav = navTranslations[params.locale] || navTranslations.en

  const translations = {
    nicknameTaken: t('nicknameTaken'),
    invalidYoutubeUrl: t('invalidYoutubeUrl'),
    roomNotFound: t('roomNotFound'),
    createRoom: t('createRoom'),
    roomExpired: t('roomExpired'),
    createNewRoom: t('createNewRoom'),
    joinRoom: t('joinRoom'),
    enterNickname: t('enterNickname'),
    join: t('join'),
    codeCopied: t('codeCopied'),
    copyCode: t('copyCode'),
    expiresIn: t('expiresIn', { minutes: '{minutes}' }),
    displayMode: t('displayMode'),
    nowPlaying: t('nowPlaying'),
    nothingPlaying: t('nothingPlaying'),
    play: t('play'),
    pause: t('pause'),
    skip: t('skip'),
    clearQueueConfirm: t('clearQueueConfirm'),
    clearQueueDescription: t('clearQueueDescription'),
    clearQueue: t('clearQueue'),
    cancel: t('cancel'),
    pasteYoutubeUrl: t('pasteYoutubeUrl'),
    add: t('add'),
    queue: t('queue'),
    noVideos: t('noVideos'),
    addFirstVideo: t('addFirstVideo'),
    addedBy: t('addedBy', { name: '{name}' }),
    removeSong: t('removeSong'),
    participants: t('participants'),
    openDisplayScreen: t('openDisplayScreen'),
    displayScreenHint: t('displayScreenHint'),
    shareLink: t('shareLink'),
    showQr: t('showQr'),
    scanToJoin: t('scanToJoin'),
    loopList: t('loopList'),
    loopListOn: t('loopListOn'),
    loopListOff: t('loopListOff'),
    playing: t('playing'),
    paused: t('paused'),
    pressPlayHint: t('pressPlayHint'),
    adminControls: t('adminControls'),
    serviceUnavailable: t('serviceUnavailable'),
    serviceUnavailableDesc: t('serviceUnavailableDesc'),
    addVideo: t('addVideo'),
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 overflow-x-hidden">
        <section className="bg-[var(--sahakum-navy)] text-white py-6">
          <Container size="wide">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href={`/${params.locale}/playlist`}
                  className={`text-gray-400 hover:text-[var(--sahakum-gold)] transition-colors text-sm ${params.locale === 'km' ? 'font-khmer' : 'font-sweden'}`}
                >
                  ← {t('title')}
                </Link>
                <h1 className={`text-2xl font-bold mt-1 ${params.locale === 'km' ? 'font-khmer' : 'font-sweden'}`}>
                  {t('title')} <span className="font-mono text-[var(--sahakum-gold)]">{params.code}</span>
                </h1>
              </div>
            </div>
          </Container>
        </section>
        <PlaylistRoom locale={params.locale} roomCode={params.code} t={translations} />
      </main>
      <Footer />
    </>
  )
}
