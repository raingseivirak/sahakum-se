import Link from 'next/link';
import Image from 'next/image';
import { Container, Grid } from '@/components/layout/grid';
import { SwedishCard, SwedishCardHeader, SwedishCardContent, SwedishCardTitle } from '@/components/ui/swedish-card';
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility';
import { SwedenH1, SwedenH2, SwedenLead, SwedenBody } from '@/components/ui/sweden-typography';
import { SwedenButton } from '@/components/ui/sweden-motion';
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo';
import { FeaturedContentGrid } from '@/components/homepage/featured-content-grid';
import { ServicesSection } from '@/components/homepage/services-section';
import { MembershipSection } from '@/components/homepage/membership-section';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { UserMenu } from '@/components/layout/user-menu';
import { type Language } from '@/lib/constants';

const translations = {
  sv: {
    "home.title": "Välkommen till vår gemenskap",
    "home.subtitle": "Gemenskap • Kultur • Integration",
    "home.hero_description": "Vi hjälper kambodjaner att integreras i det svenska samhället genom gemenskapsaktiviteter, kulturutbyte och stöd.",
    "common.join_us": "Bli medlem",
    "common.learn_more": "Läs mer",
    "common.contact_us": "Kontakta oss",
    "nav.cambodia": "Kambodja",
    "nav.living_in_sweden": "Leva i Sverige",
    "nav.community": "Gemenskap",
    "nav.blog": "Blogg",
    "nav.sign_in": "Logga in",
    "nav.sign_out": "Logga ut",
    "nav.admin": "Adminpanel",
    "nav.profile": "Profil",
    "nav.settings": "Inställningar",
    "services.title": "Våra tjänster",
    "services.description": "Vi erbjuder stöd och gemenskap för att hjälpa dig att trivas i Sverige",
    "cambodia.description": "Lär dig om kambodjansk historia, kultur, mat och traditioner.",
    "living_sweden.description": "Praktisk guide för nyanlända - boende, vård, transport och mer.",
    "community.description": "Gemenskap genom matlagning, evenemang och kulturella aktiviteter.",
    "blog.description": "Läs de senaste nyheterna, berättelser och insikter från vår gemenskap.",
    "footer.copyright": "© 2025 Sahakum Khmer. Alla rättigheter förbehållna."
  },
  en: {
    "home.title": "Welcome to our community",
    "home.subtitle": "Community • Culture • Integration",
    "home.hero_description": "We help Cambodians integrate into Swedish society through community activities, cultural exchange and support.",
    "common.join_us": "Join Sahakum Khmer",
    "common.learn_more": "Learn more",
    "common.contact_us": "Contact us",
    "nav.cambodia": "Cambodia",
    "nav.living_in_sweden": "Living in Sweden",
    "nav.community": "Community",
    "nav.blog": "Blog",
    "nav.sign_in": "Sign In",
    "nav.sign_out": "Sign Out",
    "nav.admin": "Admin Dashboard",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
    "services.title": "Our services",
    "services.description": "We offer support and community to help you thrive in Sweden",
    "cambodia.description": "Learn about Cambodian history, culture, food and traditions.",
    "living_sweden.description": "Practical guide for newcomers - housing, healthcare, transport and more.",
    "community.description": "Community through cooking, events and cultural activities.",
    "blog.description": "Read the latest news, stories and insights from our community.",
    "footer.copyright": "© 2025 Sahakum Khmer. All rights reserved."
  },
  km: {
    "home.title": "សូមស្វាគមន៍មកកាន់សហគមន៍របស់យើង",
    "home.subtitle": "សហគមន៍ • វប្បធម៌ • ការសន្សំចូល",
    "home.hero_description": "យើងជួយជនជាតិកម្ពុជាចូលរួមក្នុងសង្គមស៊ុយអែតតាមរយៈសកម្មភាពសហគមន៍ ការផ្លាស់ប្តូរវប្បធម៌ និងការគាំទ្រ។",
    "common.join_us": "ចូលរួមជាមួយសហគមន៍ខ្មែរ",
    "common.learn_more": "អានបន្ថែម",
    "common.contact_us": "ទាក់ទងយើង",
    "nav.cambodia": "កម្ពុជា",
    "nav.living_in_sweden": "រស់នៅក្នុងស៊ុយអែត",
    "nav.community": "សហគមន៍",
    "nav.blog": "ប្លុក",
    "nav.sign_in": "ចូលប្រើប្រាស់",
    "nav.sign_out": "ចេញ",
    "nav.admin": "ផ្ទាំងគ្រប់គ្រង",
    "nav.profile": "ប្រវត្តិរូប",
    "nav.settings": "ការកំណត់",
    "services.title": "សេវាកម្មរបស់យើង",
    "services.description": "យើងផ្តល់ការគាំទ្រ និងសហគមន៍ដើម្បីជួយអ្នកទទួលបានជោគជ័យនៅស៊ុយអែត",
    "cambodia.description": "ស្វែងយល់អំពីប្រវត្តិសាស្ត្រ វប្បធម៌ អាហារ និងប្រពៃណីកម្ពុជា។",
    "living_sweden.description": "ការណែនាំដ៏ជាក់ស្តែងសម្រាប់អ្នកទាំងនោះដែលទើបមកដល់ - លំនៅដ្ឋាន សុខភាព ការធ្វើដំណើរ និងច្រើនទៀត។",
    "community.description": "សហគមន៍តាមរយៈការចម្អិនបាយ ព្រឹត្តិការណ៍ និងសកម្មភាពវប្បធម៌។",
    "blog.description": "អានព័ត៌មានថ្មីៗ រឿងរ៉ាវ និងការយល់ដឹងពីសហគមន៍របស់យើង។",
    "footer.copyright": "© ២០២៥ សហគមន៍ខ្មែរ។ រក្សាសិទ្ធិគ្រប់យ៉ាង។"
  }
};

interface Props {
  params: { locale: keyof typeof translations };
}

export default function HomePage({ params }: Props) {
  const t = (key: string) => translations[params.locale]?.[key] || translations.sv[key] || key;

  // Determine font class based on locale
  const getFontClass = () => {
    switch (params.locale) {
      case 'km':
        return 'font-khmer';
      case 'sv':
      case 'en':
        return 'font-sweden';
      default:
        return 'font-multilingual';
    }
  };

  return (
    <div className={`min-h-screen bg-swedenBrand-neutral-white ${getFontClass()}`}>
      {/* Official Sweden Brand Skip Navigation */}
      <SwedenSkipNav locale={params.locale} />

      {/* Swedish Design Header - Simple, Consistent, Contextual */}
      <header className="bg-[var(--sahakum-navy)] text-white shadow-sm border-b border-[var(--sahakum-gold)]/15">
        <Container size="wide">
          <nav className="flex items-center justify-between py-6 lg:py-8">
            {/* Swedish Brand Logo - Consistent */}
            <SwedenBrandLogo
              locale={params.locale}
              size="lg"
              variant="horizontal"
              className="hover:opacity-90 transition-all duration-[var(--duration-sweden-base)] ease-[var(--easing-sweden-standard)]"
            />

            {/* Right side - Simple Layout with Enhanced Spacing */}
            <div className="flex items-center gap-6">
              <LanguageSwitcher
                currentLocale={params.locale as Language}
                variant="compact"
                className="transition-all duration-[var(--duration-sweden-base)]"
              />
              <UserMenu
                locale={params.locale as Language}
                translations={{
                  sign_in: t('nav.sign_in') || 'Sign In',
                  sign_out: t('nav.sign_out') || 'Sign Out',
                  admin: t('nav.admin') || 'Admin Dashboard',
                  profile: t('nav.profile') || 'Profile',
                  settings: t('nav.settings') || 'Settings'
                }}
              />
            </div>
          </nav>
        </Container>
      </header>

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section - Clean Sophisticated Sahakum style */}
        <section className="relative bg-gradient-to-br from-[var(--sahakum-navy)] via-[var(--sahakum-navy-800)] to-[var(--color-sweden-neutral-700)] text-white overflow-hidden">
          <Container size="wide" className="py-12 lg:py-16 relative">
            <div className="max-w-sweden-content">
              {/* Enhanced animated welcome message */}
              <div className="animate-fade-in-up">
                <SwedenH1 className="text-white mb-4 text-4xl lg:text-5xl" locale={params.locale}>
                  <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {t('home.title')}
                  </span>
                </SwedenH1>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <SwedenLead className="text-[var(--sahakum-gold)] mb-4 text-lg lg:text-xl font-medium" locale={params.locale}>
                  {t('home.subtitle')}
                </SwedenLead>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <SwedenBody className="text-white/90 mb-6 max-w-3xl text-base lg:text-lg leading-relaxed" locale={params.locale}>
                  {t('home.hero_description')}
                </SwedenBody>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
                <Link href={`/${params.locale}/join`}>
                  <SwedenButton
                    variant="primary"
                    size="lg"
                    locale={params.locale}
                    className="bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 focus:ring-[var(--sahakum-gold)]/50 text-[var(--sahakum-navy)] font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
                  >
                    {t('common.join_us')}
                  </SwedenButton>
                </Link>
                <Link href={`/${params.locale}/contact`}>
                  <SwedenButton
                    variant="secondary"
                    size="lg"
                    locale={params.locale}
                    className="border-[var(--sahakum-gold)] text-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)] hover:text-[var(--sahakum-navy)] transition-colors duration-200 w-full sm:w-auto"
                  >
                    {t('common.contact_us')}
                  </SwedenButton>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Featured Content Section - Dynamic pages grid */}
        <FeaturedContentGrid locale={params.locale} />

        {/* Dynamic Services Section */}
        <ServicesSection locale={params.locale} />

        {/* Membership Section - Call to Action */}
        <MembershipSection locale={params.locale} />
      </main>

      {/* Footer */}
      <footer className="bg-[var(--sahakum-navy)] text-white py-12 border-t border-[var(--sahakum-gold)]/20">
        <Container size="wide">
          <div className="text-center">
            <SwedenBody className="text-[var(--sahakum-gold)] mb-0" locale={params.locale}>
              {t('footer.copyright')}
            </SwedenBody>
          </div>
        </Container>
      </footer>
    </div>
  );
}