import Link from 'next/link';
import { Container } from '@/components/layout/grid';
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility';
import { SwedenH1, SwedenH2, SwedenH3, SwedenBody } from '@/components/ui/sweden-typography';
import { SwedenBrandLogo } from '@/components/ui/sweden-brand-logo';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { UserMenu } from '@/components/layout/user-menu';
import { Footer } from '@/components/layout/footer';
import { type Language } from '@/lib/constants';

const translations = {
  sv: {
    "page.title": "Kontakta oss",
    "page.subtitle": "Vi hjälper gärna till med dina frågor",
    "page.description": "Har du frågor om våra tjänster, vill bli medlem eller behöver hjälp? Tveka inte att kontakta oss.",
    "office.title": "Vårt kontor",
    "office.address": "Adress",
    "office.phone": "Telefon",
    "office.email": "E-post",
    "office.hours": "Öppettider",
    "office.hours_detail": "Måndag - Fredag: 10:00 - 16:00",
    "contact.form.title": "Skicka meddelande",
    "contact.form.name": "Namn",
    "contact.form.email": "E-post",
    "contact.form.subject": "Ämne",
    "contact.form.message": "Meddelande",
    "contact.form.submit": "Skicka meddelande",
    "services.title": "Våra tjänster",
    "services.membership": "Medlemskap",
    "services.membership_desc": "Bli medlem i vår gemenskap",
    "services.integration": "Integrationsstöd",
    "services.integration_desc": "Hjälp med att komma in i det svenska samhället",
    "services.language": "Språkstöd",
    "services.language_desc": "Hjälp med svenska språket",
    "services.culture": "Kulturaktiviteter",
    "services.culture_desc": "Delta i kambodjanska kulturella evenemang",
    "emergency.title": "Akut hjälp",
    "emergency.description": "För akuta situationer, kontakta alltid nödnumret 112 först.",
    "nav.sign_in": "Logga in",
    "nav.sign_out": "Logga ut",
    "nav.admin": "Administratörspanel",
    "nav.profile": "Min profil",
    "nav.settings": "Inställningar"
  },
  en: {
    "page.title": "Contact Us",
    "page.subtitle": "We're here to help with your questions",
    "page.description": "Have questions about our services, want to become a member, or need assistance? Don't hesitate to contact us.",
    "office.title": "Our Office",
    "office.address": "Address",
    "office.phone": "Phone",
    "office.email": "Email",
    "office.hours": "Office Hours",
    "office.hours_detail": "Monday - Friday: 10:00 AM - 4:00 PM",
    "contact.form.title": "Send Message",
    "contact.form.name": "Name",
    "contact.form.email": "Email",
    "contact.form.subject": "Subject",
    "contact.form.message": "Message",
    "contact.form.submit": "Send Message",
    "services.title": "Our Services",
    "services.membership": "Membership",
    "services.membership_desc": "Join our community",
    "services.integration": "Integration Support",
    "services.integration_desc": "Help with integrating into Swedish society",
    "services.language": "Language Support",
    "services.language_desc": "Assistance with Swedish language",
    "services.culture": "Cultural Activities",
    "services.culture_desc": "Participate in Cambodian cultural events",
    "emergency.title": "Emergency Help",
    "emergency.description": "For emergency situations, always contact emergency number 112 first.",
    "nav.sign_in": "Sign In",
    "nav.sign_out": "Sign Out",
    "nav.admin": "Admin Dashboard",
    "nav.profile": "Profile",
    "nav.settings": "Settings"
  },
  km: {
    "page.title": "ទាក់ទងយើង",
    "page.subtitle": "យើងនៅទីនេះដើម្បីជួយឆ្លើយសំណួររបស់អ្នក",
    "page.description": "មានសំណួរអំពីសេវាកម្មរបស់យើង ចង់ក្លាយជាសមាជិក ឬត្រូវការជំនួយ? កុំស្ទាក់ស្ទើរក្នុងការទាក់ទងយើង។",
    "office.title": "ការិយាល័យរបស់យើង",
    "office.address": "អាសយដ្ឋាន",
    "office.phone": "ទូរសព្ទ",
    "office.email": "អ៊ីមែល",
    "office.hours": "ម៉ោងបើកការ",
    "office.hours_detail": "ថ្ងៃច័ន្ទ - ថ្ងៃសុក្រ: ម៉ោង ១០:០០ - ១៦:០០",
    "contact.form.title": "ផ្ញើសារ",
    "contact.form.name": "ឈ្មោះ",
    "contact.form.email": "អ៊ីមែល",
    "contact.form.subject": "ប្រធានបទ",
    "contact.form.message": "សារ",
    "contact.form.submit": "ផ្ញើសារ",
    "services.title": "សេវាកម្មរបស់យើង",
    "services.membership": "សមាជិកភាព",
    "services.membership_desc": "ចូលរួមជាមួយសហគមន៍របស់យើង",
    "services.integration": "ការគាំទ្រការសម្រុះសម្រួល",
    "services.integration_desc": "ជំនួយសម្រាប់ការបញ្ចូលទៅក្នុងសង្គមស៊ុយអែត",
    "services.language": "ការគាំទ្រភាសា",
    "services.language_desc": "ជំនួយជាមួយភាសាស៊ុយអែត",
    "services.culture": "សកម្មភាពវប្បធម៌",
    "services.culture_desc": "ចូលរួមក្នុងព្រឹត្តិការណ៍វប្បធម៌កម្ពុជា",
    "emergency.title": "ជំនួយបន្ទាន់",
    "emergency.description": "សម្រាប់ស្ថានការណ៍បន្ទាន់ សូមទាក់ទងលេខបន្ទាន់ ១១២ ជាមុនសិន។",
    "nav.sign_in": "ចូលប្រើប្រាស់",
    "nav.sign_out": "ចាកចេញ",
    "nav.admin": "ផ្ទាំងគ្រប់គ្រង",
    "nav.profile": "ប្រវត្តិរូបផ្ទាល់ខ្លួន",
    "nav.settings": "ការកំណត់"
  }
};

interface ContactPageProps {
  params: { locale: keyof typeof translations }
}

export default function ContactPage({ params }: ContactPageProps) {
  const t = (key: string) => translations[params.locale]?.[key] || translations.en[key] || key;

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
      <SwedenSkipNav locale={params.locale} />

      {/* Header - Consistent with homepage */}
      <header className="bg-[var(--sahakum-navy)] text-white shadow-lg border-b border-[var(--sahakum-gold)]/20">
        <Container size="wide">
          <nav className="flex items-center justify-between py-4 lg:py-6">
            <Link href={`/${params.locale}`} className="block">
              <SwedenBrandLogo
                locale={params.locale}
                size="md"
                variant="horizontal"
                className="hover:opacity-90 transition-opacity duration-200"
              />
            </Link>

            <div className="flex items-center space-x-4">
              <Link
                href={`/${params.locale}`}
                className="text-white hover:text-[var(--sahakum-gold)] transition-colors duration-200 text-sm font-medium"
              >
                {params.locale === 'sv' ? 'Hem' :
                 params.locale === 'km' ? 'ទំព័រដើម' : 'Home'}
              </Link>
              <LanguageSwitcher
                currentLocale={params.locale as Language}
                variant="compact"
              />
              <UserMenu
                locale={params.locale as Language}
                translations={{
                  sign_in: t('nav.sign_in'),
                  sign_out: t('nav.sign_out'),
                  admin: t('nav.admin'),
                  profile: t('nav.profile'),
                  settings: t('nav.settings')
                }}
              />
            </div>
          </nav>
        </Container>
      </header>

      {/* Main Content */}
      <main id="main-content" className="py-16 lg:py-24">
        <Container size="wide">
          {/* Page Header */}
          <div className="text-center mb-16">
            <SwedenH1 className="text-[var(--sahakum-navy)] mb-6" locale={params.locale}>
              {t('page.title')}
            </SwedenH1>
            <SwedenBody className="text-[var(--sahakum-navy)]/70 max-w-2xl mx-auto text-lg" locale={params.locale}>
              {t('page.description')}
            </SwedenBody>
          </div>

          {/* Contact Information Grid */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Office Information */}
            <div className="bg-white p-8 border border-[var(--sahakum-navy)]/10 shadow-sm">
              <SwedenH2 className="text-[var(--sahakum-navy)] mb-6" locale={params.locale}>
                {t('office.title')}
              </SwedenH2>

              <div className="space-y-4">
                <div>
                  <h4 className={`font-semibold text-[var(--sahakum-navy)] mb-2 ${getFontClass()}`}>
                    {t('office.address')}
                  </h4>
                  <SwedenBody className="text-[var(--sahakum-navy)]/80" locale={params.locale}>
                    Sahakum Khmer<br />
                    [Street Address]<br />
                    [Postal Code] [City]<br />
                    Sverige
                  </SwedenBody>
                </div>

                <div>
                  <h4 className={`font-semibold text-[var(--sahakum-navy)] mb-2 ${getFontClass()}`}>
                    {t('office.phone')}
                  </h4>
                  <SwedenBody className="text-[var(--sahakum-navy)]/80" locale={params.locale}>
                    <a href="tel:+46XXXXXXXXX" className="hover:text-[var(--sahakum-gold)] transition-colors">
                      +46 XX XXX XX XX
                    </a>
                  </SwedenBody>
                </div>

                <div>
                  <h4 className={`font-semibold text-[var(--sahakum-navy)] mb-2 ${getFontClass()}`}>
                    {t('office.email')}
                  </h4>
                  <SwedenBody className="text-[var(--sahakum-navy)]/80" locale={params.locale}>
                    <a href="mailto:info@sahakumkhmer.se" className="hover:text-[var(--sahakum-gold)] transition-colors">
                      info@sahakumkhmer.se
                    </a>
                  </SwedenBody>
                </div>

                <div>
                  <h4 className={`font-semibold text-[var(--sahakum-navy)] mb-2 ${getFontClass()}`}>
                    {t('office.hours')}
                  </h4>
                  <SwedenBody className="text-[var(--sahakum-navy)]/80" locale={params.locale}>
                    {t('office.hours_detail')}
                  </SwedenBody>
                </div>
              </div>
            </div>

            {/* Services Overview */}
            <div className="bg-[var(--sahakum-gold)]/5 p-8 border border-[var(--sahakum-gold)]/20">
              <SwedenH2 className="text-[var(--sahakum-navy)] mb-6" locale={params.locale}>
                {t('services.title')}
              </SwedenH2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[var(--sahakum-gold)] mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className={`font-semibold text-[var(--sahakum-navy)] mb-1 ${getFontClass()}`}>
                      {t('services.membership')}
                    </h4>
                    <SwedenBody className="text-[var(--sahakum-navy)]/70 text-sm" locale={params.locale}>
                      {t('services.membership_desc')}
                    </SwedenBody>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[var(--sahakum-gold)] mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className={`font-semibold text-[var(--sahakum-navy)] mb-1 ${getFontClass()}`}>
                      {t('services.integration')}
                    </h4>
                    <SwedenBody className="text-[var(--sahakum-navy)]/70 text-sm" locale={params.locale}>
                      {t('services.integration_desc')}
                    </SwedenBody>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[var(--sahakum-gold)] mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className={`font-semibold text-[var(--sahakum-navy)] mb-1 ${getFontClass()}`}>
                      {t('services.language')}
                    </h4>
                    <SwedenBody className="text-[var(--sahakum-navy)]/70 text-sm" locale={params.locale}>
                      {t('services.language_desc')}
                    </SwedenBody>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[var(--sahakum-gold)] mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className={`font-semibold text-[var(--sahakum-navy)] mb-1 ${getFontClass()}`}>
                      {t('services.culture')}
                    </h4>
                    <SwedenBody className="text-[var(--sahakum-navy)]/70 text-sm" locale={params.locale}>
                      {t('services.culture_desc')}
                    </SwedenBody>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Information */}
          <div className="bg-[var(--sahakum-navy)] text-white p-8 text-center">
            <SwedenH3 className="text-white mb-4" locale={params.locale}>
              {t('emergency.title')}
            </SwedenH3>
            <SwedenBody className="text-white/90" locale={params.locale}>
              {t('emergency.description')}
            </SwedenBody>
            <div className="mt-4">
              <a href="tel:112" className="text-[var(--sahakum-gold)] text-2xl font-bold hover:underline">
                112
              </a>
            </div>
          </div>

        </Container>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}