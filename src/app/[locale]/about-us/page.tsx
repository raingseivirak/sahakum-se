import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/layout/grid';
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility';
import { SwedenH1, SwedenH2, SwedenBody } from '@/components/ui/sweden-typography';
import { SwedenButton } from '@/components/ui/sweden-motion';
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header';
import { Footer } from '@/components/layout/footer';

const translations = {
  sv: {
    "page.title": "Om Sahakum Khmer",
    "page.subtitle": "Vår gemenskap, vår historia, våra värderingar",
    "purpose.title": "Syfte",
    "purpose.content": "Sahakum Khmer är en ideell förening som grundats för att stödja kambodjaner som bor i Sverige i deras integration i samhället. Föreningen strävar efter att bygga ett välkomnande och inkluderande samhälle genom att hjälpa individer att anpassa sig till det svenska samhället, söka meningsfulla karriärer och bibehålla en stark koppling till sitt kambodjanska arv. Genom kulturutbyte, utbildningsinitiativ och gemensamma aktiviteter — såsom traditionell matlagning, kulturutställningar, språköva och workshops — främjar Sahakum Khmer både personlig utveckling och kollektiv egenmakt.",
    "mission.title": "Uppdrag",
    "mission.content": "Att stärka den kambodjanska gemenskapen i Sverige — särskilt kvinnor i interkulturella äktenskap och studenter — genom att främja kulturell integration, personlig utveckling och karriärutveckling.",
    "vision.title": "Vision",
    "vision.content": "Att bygga en stark och inkluderande kambodjansk gemenskap i Sverige som firar kulturarv, stödjer integration och ger individer möjlighet att blomstra socialt och professionellt uppfyllt.",
    "activities.title": "Våra aktiviteter",
    "activities.list": [
      "Khmer nyårsfirande",
      "Traditionella matlagningsworkshops",
      "Kulturutställningar och föreställningar",
      "Stöd för svenska språket och handledning",
      "Gemenskapssamlingar, workshops och nätverksevenemang",
      "Stödja nyanlända, inklusive delning av erfarenheter relaterade till utbildning, karriärmöjligheter och anpassning till livet i Sverige"
    ],
    "organization.title": "Vår organisation",
    "organization.content": "Vi styrs av en engagerad styrelse och följer våra officiella stadgar.",
    "cta.join": "Bli medlem",
    "cta.board": "Möt vår styrelse",
    "cta.statutes": "Läs våra stadgar",
    "cta.contact": "Kontakta oss",
    "nav.sign_in": "Logga in",
    "nav.sign_out": "Logga ut",
    "nav.admin": "Administratörspanel",
    "nav.profile": "Min profil",
    "nav.settings": "Inställningar"
  },
  en: {
    "page.title": "About Sahakum Khmer",
    "page.subtitle": "Our community, our story, our values",
    "purpose.title": "Purpose",
    "purpose.content": "Sahakum Khmer is a non-profit association established to support Cambodians living in Sweden in their integration into society. The association strives to build a welcoming and inclusive community by helping individuals adapt to Swedish society, pursue meaningful careers, and maintain a strong connection to their Cambodian heritage. Through cultural exchange, educational initiatives, and shared activities—such as traditional cooking, cultural exhibitions, language practice, and workshops—Sahakum Khmer promotes both personal development and collective empowerment.",
    "mission.title": "Mission",
    "mission.content": "To empower the Cambodian community in Sweden—especially women in intercultural marriages and students—by promoting cultural integration, personal growth, and career development.",
    "vision.title": "Vision",
    "vision.content": "To build a strong and inclusive Cambodian community in Sweden that celebrates cultural heritage, supports integration, and empowers individuals to thrive socially and professionally fulfilled.",
    "activities.title": "Our Activities",
    "activities.list": [
      "Khmer New Year celebrations",
      "Traditional cooking workshops",
      "Cultural exhibitions and performances",
      "Swedish language support and tutoring",
      "Community gatherings, workshops and networking events",
      "Support the newcomers, including sharing experiences related to education, career opportunities, and adapting to life in Sweden"
    ],
    "organization.title": "Our Organization",
    "organization.content": "We are governed by a dedicated board of directors and follow our official statutes.",
    "cta.join": "Join Sahakum Khmer",
    "cta.board": "Meet our board",
    "cta.statutes": "Read our statutes",
    "cta.contact": "Contact us",
    "nav.sign_in": "Sign In",
    "nav.sign_out": "Sign Out",
    "nav.admin": "Admin Dashboard",
    "nav.profile": "Profile",
    "nav.settings": "Settings"
  },
  km: {
    "page.title": "អំពីសហគមខ្មែរ",
    "page.subtitle": "សហគមន៍របស់យើង ប្រវត្តិរបស់យើង តម្លៃរបស់យើង",
    "purpose.title": "គោលបំណង",
    "purpose.content": "សហគមខ្មែរ គឺជាសមាគមមិនរកប្រាក់ចំណេញដែលបានបង្កើតឡើងដើម្បីគាំទ្រប្រជាជនកម្ពុជាដែលរស់នៅក្នុងប្រទេសស៊ុយអែតក្នុងការធ្វើសមាហរណកម្មទៅក្នុងសង្គម។ សមាគមនេះព្យាយាមបង្កើតសហគមន៍ដែលស្វាគមន៍និងរួមបញ្ចូលដោយជួយបុគ្គលម្នាក់ៗឱ្យសម្រប់ខ្លួនទៅនឹងសង្គមស៊ុយអែត ស្វែងរកការងារដែលមានអត្ថន័យ និងរក្សាទំនាក់ទំនងដ៏រឹងមាំទៅនឹងបេតិកភណ្ឌកម្ពុជារបស់ពួកគេ។",
    "mission.title": "បេសកកម្ម",
    "mission.content": "ដើម្បីផ្តល់សិទ្ធិអំណាចដល់សហគមន៍កម្ពុជាក្នុងប្រទេសស៊ុយអែត—ជាពិសេសសស្ត្រីក្នុងអាពាហ៍ពិពាហ៍អន្តរវប្បធម៌ និងសិស្សានុសិស្ស—តាមរយៈការលើកកម្ពស់ការរួមបញ្ចូលវប្បធម៌ ការអភិវឌ្ឍន៍ផ្ទាល់ខ្លួន និងការអភិវឌ្ឍន៍អាជីព។",
    "vision.title": "ចក្ខុវិស័យ",
    "vision.content": "ដើម្បីកសាងសហគមន៍កម្ពុជាដ៏រឹងមាំ និងរួមបញ្ចូលក្នុងប្រទេសស៊ុយអែតដែលអបអរបេតិកភណ្ឌវប្បធម៌ គាំទ្រការរួមបញ្ចូល និងផ្តល់សិទ្ធិអំណាចដល់បុគ្គលឱ្យរីកចម្រើនក្នុងសង្គម និងវិជ្ជាជីវៈ។",
    "activities.title": "សកម្មភាពរបស់យើង",
    "activities.list": [
      "ពិធីបុណ្យចូលឆ្នាំថ្មីខ្មែរ",
      "សិក្ខាសាលាធ្វើម្ហូបប្រពៃណី",
      "ការតាំងពិព័រណ៍ និងការសំដែងវប្បធម៌",
      "ការគាំទ្រភាសាស៊ុយអែត និងការបង្រៀន",
      "ការជួបជុំសហគមន៍ សិក្ខាសាលា និងព្រឹត្តិការណ៍បណ្តាញ",
      "គាំទ្រអ្នកមកថ្មី រួមទាំងការចែករំលែកបទពិសោធន៍ទាក់ទងនឹងការអប់រំ ឱកាសការងារ និងការសម្រប់ខ្លួនទៅនឹងជីវិតក្នុងប្រទេសស៊ុយអែត"
    ],
    "organization.title": "អង្គការរបស់យើង",
    "organization.content": "យើងត្រូវបានគ្រប់គ្រងដោយក្រុមប្រឹក្សាភិបាលដែលមានការប្តេជ្ញាចិត្ត ហើយធ្វើតាមជំពូកផ្លូវការរបស់យើង។",
    "cta.join": "ចូលរួមជាមួយសហគមខ្មែរ",
    "cta.board": "ជួបក្រុមប្រឹក្សារបស់យើង",
    "cta.statutes": "អានជំពូករបស់យើង",
    "cta.contact": "ទាក់ទងយើង",
    "nav.sign_in": "ចូលប្រើប្រាស់",
    "nav.sign_out": "ចាកចេញ",
    "nav.admin": "ផ្ទាំងគ្រប់គ្រង",
    "nav.profile": "ប្រវត្តិរូបផ្ទាល់ខ្លួន",
    "nav.settings": "ការកំណត់"
  }
};

interface AboutPageProps {
  params: { locale: keyof typeof translations }
}

export async function generateMetadata({ params }: AboutPageProps) {
  const locale = params.locale
  const t = (key: string) => translations[locale]?.[key] || translations.en[key] || key

  const baseUrl = process.env.NEXTAUTH_URL || 'https://www.sahakumkhmer.se'
  const canonicalUrl = `${baseUrl}/${locale}/about-us`

  return {
    title: t('page.title'),
    description: t('page.subtitle'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'sv': `${baseUrl}/sv/about-us`,
        'en': `${baseUrl}/en/about-us`,
        'km': `${baseUrl}/km/about-us`,
      }
    },
    openGraph: {
      title: t('page.title'),
      description: t('page.subtitle'),
      url: canonicalUrl,
      siteName: 'Sahakum Khmer',
      locale: locale,
      type: 'website',
    },
  }
}

export default function AboutPage({ params }: AboutPageProps) {
  const t = (key: string) => translations[params.locale]?.[key] || translations.en[key] || key
  const fontClass = params.locale === 'km' ? 'font-khmer' : 'font-sweden'

  return (
    <div className={`min-h-screen bg-swedenBrand-neutral-white ${fontClass}`}>
      <SwedenSkipNav locale={params.locale} />

      {/* Scroll-Aware Header */}
      <ScrollAwareHeader
        locale={params.locale}
        showBlogLink={false}
        stickyContent={{
          title: t('page.title'),
          excerpt: t('page.subtitle')
        }}
        translations={{
          sign_in: t('nav.sign_in'),
          sign_out: t('nav.sign_out'),
          admin: t('nav.admin'),
          profile: t('nav.profile'),
          settings: t('nav.settings')
        }}
        currentUrl={`/${params.locale}/about-us`}
      />

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--color-sweden-neutral-700)] text-white py-12 lg:py-16">
          <Container size="wide">
            <div className="max-w-4xl">
              <SwedenH1 className="text-white mb-4" locale={params.locale}>
                {t('page.title')}
              </SwedenH1>
              <SwedenBody className="text-white/90 text-lg" locale={params.locale}>
                {t('page.subtitle')}
              </SwedenBody>
            </div>
          </Container>
        </section>

        {/* Purpose Section */}
        <section className="py-16 lg:py-20 bg-white">
          <Container size="wide">
            <div className="max-w-4xl mx-auto">
              <SwedenH2 className="text-[var(--sahakum-navy)] mb-6" locale={params.locale}>
                {t('purpose.title')}
              </SwedenH2>
              <SwedenBody className="text-[var(--sahakum-navy)]/80 text-lg leading-relaxed" locale={params.locale}>
                {t('purpose.content')}
              </SwedenBody>
            </div>
          </Container>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 lg:py-20 bg-[var(--sahakum-gold)]/5">
          <Container size="wide">
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Mission */}
              <div className="bg-white p-8 border-l-4 border-[var(--sahakum-gold)]">
                <SwedenH2 className="text-[var(--sahakum-navy)] mb-4" locale={params.locale}>
                  {t('mission.title')}
                </SwedenH2>
                <SwedenBody className="text-[var(--sahakum-navy)]/80 leading-relaxed" locale={params.locale}>
                  {t('mission.content')}
                </SwedenBody>
              </div>

              {/* Vision */}
              <div className="bg-white p-8 border-l-4 border-[var(--sahakum-navy)]">
                <SwedenH2 className="text-[var(--sahakum-navy)] mb-4" locale={params.locale}>
                  {t('vision.title')}
                </SwedenH2>
                <SwedenBody className="text-[var(--sahakum-navy)]/80 leading-relaxed" locale={params.locale}>
                  {t('vision.content')}
                </SwedenBody>
              </div>
            </div>
          </Container>
        </section>

        {/* Activities Section */}
        <section className="py-16 lg:py-20 bg-white">
          <Container size="wide">
            <SwedenH2 className="text-[var(--sahakum-navy)] mb-12 text-center" locale={params.locale}>
              {t('activities.title')}
            </SwedenH2>

            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Image */}
              <div className="relative h-[400px] lg:h-[500px] rounded-sm overflow-hidden bg-gray-50">
                <Image
                  src="/media/images/khmer_new_year.png"
                  alt={params.locale === 'sv' ? 'Khmer nyårsfirande' :
                       params.locale === 'km' ? 'ពិធីបុណ្យចូលឆ្នាំថ្មីខ្មែរ' :
                       'Khmer New Year celebrations'}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Activities List */}
              <div className="space-y-4">
                {(t('activities.list') as string[]).map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-6 h-6 flex items-center justify-center bg-[var(--sahakum-gold)] text-white font-bold text-sm flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <SwedenBody className="text-[var(--sahakum-navy)] flex-1" locale={params.locale}>
                      {activity}
                    </SwedenBody>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Organization Section */}
        <section className="py-16 lg:py-20 bg-[var(--sahakum-navy)] text-white">
          <Container size="wide">
            <div className="max-w-4xl mx-auto text-center">
              <SwedenH2 className="text-white mb-6" locale={params.locale}>
                {t('organization.title')}
              </SwedenH2>
              <SwedenBody className="text-white/90 text-lg mb-8" locale={params.locale}>
                {t('organization.content')}
              </SwedenBody>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/${params.locale}/board`}>
                  <SwedenButton
                    variant="secondary"
                    size="lg"
                    locale={params.locale}
                    className="border-[var(--sahakum-gold)] text-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)] hover:text-[var(--sahakum-navy)] w-full sm:w-auto"
                  >
                    {t('cta.board')}
                  </SwedenButton>
                </Link>
                <Link href={`/${params.locale}/statutes`}>
                  <SwedenButton
                    variant="secondary"
                    size="lg"
                    locale={params.locale}
                    className="border-white/50 text-white hover:bg-white hover:text-[var(--sahakum-navy)] w-full sm:w-auto"
                  >
                    {t('cta.statutes')}
                  </SwedenButton>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 lg:py-20 bg-gradient-to-r from-[var(--sahakum-gold)]/10 to-[var(--sahakum-gold)]/5">
          <Container size="wide">
            <div className="max-w-4xl mx-auto text-center">
              <SwedenH2 className="text-[var(--sahakum-navy)] mb-6" locale={params.locale}>
                {params.locale === 'sv' ? 'Bli en del av vår gemenskap' :
                 params.locale === 'km' ? 'ក្លាយជាផ្នែកមួយនៃសហគមន៍របស់យើង' :
                 'Become part of our community'}
              </SwedenH2>
              <SwedenBody className="text-[var(--sahakum-navy)]/80 text-lg mb-8" locale={params.locale}>
                {params.locale === 'sv' ? 'Gå med i Sahakum Khmer idag och anslut dig till vår växande gemenskap.' :
                 params.locale === 'km' ? 'ចូលរួមជាមួយសហគមខ្មែរថ្ងៃនេះ និងភ្ជាប់ទៅសហគមន៍ដែលកំពុងរីកចម្រើនរបស់យើង។' :
                 'Join Sahakum Khmer today and connect with our growing community.'}
              </SwedenBody>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/${params.locale}/join`}>
                  <SwedenButton
                    variant="primary"
                    size="lg"
                    locale={params.locale}
                    className="bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 text-[var(--sahakum-navy)] w-full sm:w-auto"
                  >
                    {t('cta.join')}
                  </SwedenButton>
                </Link>
                <Link href={`/${params.locale}/contact`}>
                  <SwedenButton
                    variant="secondary"
                    size="lg"
                    locale={params.locale}
                    className="border-[var(--sahakum-navy)] text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)] hover:text-white w-full sm:w-auto"
                  >
                    {t('cta.contact')}
                  </SwedenButton>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
