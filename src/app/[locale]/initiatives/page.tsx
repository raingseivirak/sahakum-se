import { Container } from "@/components/layout/grid"
import { InitiativesGrid } from "./initiatives-grid"
import { Metadata } from 'next'
import { Lightbulb } from 'lucide-react'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { Footer } from '@/components/layout/footer'

interface InitiativesPageProps {
  params: { locale: string }
}

export async function generateMetadata({ params }: InitiativesPageProps): Promise<Metadata> {
  const locale = params.locale

  const titles = {
    sv: "Initiativ & Projekt | Sahakum Khmer",
    en: "Initiatives & Projects | Sahakum Khmer",
    km: "គម្រោង និង សកម្មភាព | Sahakum Khmer"
  }

  const descriptions = {
    sv: "Upptäck våra pågående och kommande initiativ för den kambodjanska gemenskapen i Sverige",
    en: "Discover our ongoing and upcoming initiatives for the Cambodian community in Sweden",
    km: "ស្វែងយល់អំពីគម្រោង និង សកម្មភាពសម្រាប់សហគមន៍ខ្មែរនៅស៊ុយអែត"
  }

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
  }
}

export default async function InitiativesPage({ params }: InitiativesPageProps) {
  const locale = params.locale
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  const heroContent = {
    sv: {
      title: "Våra Initiativ",
      subtitle: "Bygga en starkare gemenskap tillsammans",
      description: "Upptäck de projekt och initiativ som formar vår kambodjanska-svenska gemenskap. Från kulturella evenemang till affärsnätverk och utbildningsprogram."
    },
    en: {
      title: "Our Initiatives",
      subtitle: "Building a stronger community together",
      description: "Discover the projects and initiatives shaping our Cambodian-Swedish community. From cultural events to business networks and educational programs."
    },
    km: {
      title: "គម្រោងរបស់យើង",
      subtitle: "កសាងសហគមន៍កាន់តែរឹងមាំ",
      description: "ស្វែងយល់អំពីគម្រោង និង សកម្មភាពដែលកំពុងកសាងសហគមន៍កម្ពុជា-ស៊ុយអែត។ ចាប់ពីពិធីវប្បធម៌ រហូតដល់បណ្តាញអាជីវកម្ម និង កម្មវិធីអប់រំ។"
    }
  }

  const content = heroContent[locale as keyof typeof heroContent] || heroContent.en

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 ${fontClass}`}>
      <SwedenSkipNav locale={locale} />
      <ScrollAwareHeader
        locale={locale}
        currentUrl={`/${locale}/initiatives`}
        translations={{
          sign_in: locale === 'km' ? 'ចូលប្រើប្រាស់' : locale === 'sv' ? 'Logga in' : 'Sign In',
          sign_out: locale === 'km' ? 'ចាកចេញ' : locale === 'sv' ? 'Logga ut' : 'Sign Out',
          admin: locale === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : locale === 'sv' ? 'Administratörspanel' : 'Admin Dashboard',
          profile: locale === 'km' ? 'ប្រវត្តិរូបផ្ទាល់ខ្លួន' : locale === 'sv' ? 'Min profil' : 'Profile',
          settings: locale === 'km' ? 'ការកំណត់' : locale === 'sv' ? 'Inställningar' : 'Settings'
        }}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--color-sweden-neutral-700)] text-white overflow-hidden py-16 lg:py-20">
        <Container size="wide" className="relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6 animate-fade-in-up">
              <Lightbulb className="h-12 w-12 lg:h-16 lg:w-16 mr-4 text-[var(--sahakum-gold)]" />
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.29] tracking-[-0.36px] ${fontClass}`}>
                {content.title}
              </h1>
            </div>
            <p className={`text-lg lg:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in-up ${fontClass}`} style={{ animationDelay: '0.2s' }}>
              {content.subtitle}
            </p>
          </div>
        </Container>
      </section>

      {/* Initiatives Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <InitiativesGrid locale={locale} />
      </div>

      <Footer locale={locale} />
    </div>
  )
}
