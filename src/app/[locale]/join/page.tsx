import { SwedishWizard } from "./swedish-wizard"
import { Container } from '@/components/layout/grid';
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility';
import { SwedenH1, SwedenH3, SwedenLead, SwedenBody } from '@/components/ui/sweden-typography';
import { Footer } from '@/components/layout/footer';
import { type Language } from '@/lib/constants';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PublicHeader } from '@/components/layout/public-header';

const translations = {
  sv: {
    "page.title": "Bli medlem i Sahakum Khmer",
    "page.subtitle": "Gemenskap • Kultur • Integration",
    "page.description": "Bli en del av vår livliga kambodjansk-svenska gemenskap. Anslut dig till andra kambodjaner som bor i Sverige, delta i kulturella evenemang och hjälp till att bevara vårt arv för framtida generationer.",
    "benefits.title": "Varför gå med i Sahakum Khmer?",
    "benefits.cultural_connection": "Kulturell anknytning",
    "benefits.cultural_description": "Håll kontakten med kambodjansk kultur genom evenemang, festivaler och gemenskapsammankomster",
    "benefits.support_network": "Stödnätverk",
    "benefits.support_description": "Få hjälp med integration, språkstöd och praktiska råd för att leva i Sverige",
    "benefits.community_events": "Gemenskapsevenemang",
    "benefits.community_description": "Delta i sociala evenemang, utbildningsworkshops och kulturella firanden",
    "benefits.professional_network": "Professionellt nätverk",
    "benefits.professional_description": "Anslut dig till andra kambodjanska yrkesverksamma och utöka dina karriärmöjligheter",
    "benefits.language_preservation": "Språkbevarande",
    "benefits.language_description": "Hjälp till att bevara khmer-språket och kulturen för framtida generationer",
    "benefits.volunteer_opportunities": "Volontärmöjligheter",
    "benefits.volunteer_description": "Ge tillbaka till samhället genom olika volontärprogram och initiativ",
    "form.title": "Medlemsansökan",
    "form.wizard_title": "Medlemsansökan",
    "form.wizard_description": "Fyll i guiden nedan för att ansöka om medlemskap.",
    "learn_more.title": "Vill du veta mer om Sahakum Khmer?",
    "learn_more.about_us": "Om oss",
    "learn_more.statutes": "Stadgar",
    "nav.sign_in": "Logga in",
    "nav.sign_out": "Logga ut",
    "nav.admin": "Administratörspanel",
    "nav.profile": "Min profil",
    "nav.settings": "Inställningar"
  },
  en: {
    "page.title": "Join Sahakum Khmer",
    "page.subtitle": "Community • Culture • Integration",
    "page.description": "Become part of our vibrant Cambodian-Swedish community. Connect with fellow Cambodians living in Sweden, participate in cultural events, and help preserve our heritage for future generations.",
    "benefits.title": "Why Join Sahakum Khmer?",
    "benefits.cultural_connection": "Cultural Connection",
    "benefits.cultural_description": "Stay connected to Cambodian culture through events, festivals, and community gatherings",
    "benefits.support_network": "Support Network",
    "benefits.support_description": "Get help with integration, language support, and practical advice for living in Sweden",
    "benefits.community_events": "Community Events",
    "benefits.community_description": "Participate in social events, educational workshops, and cultural celebrations",
    "benefits.professional_network": "Professional Network",
    "benefits.professional_description": "Connect with other Cambodian professionals and expand your career opportunities",
    "benefits.language_preservation": "Language Preservation",
    "benefits.language_description": "Help preserve Khmer language and culture for future generations",
    "benefits.volunteer_opportunities": "Volunteer Opportunities",
    "benefits.volunteer_description": "Give back to the community through various volunteer programs and initiatives",
    "form.title": "Membership Application",
    "form.wizard_title": "Membership Application Form",
    "form.wizard_description": "Complete the wizard below to apply for membership.",
    "learn_more.title": "Want to learn more about Sahakum Khmer?",
    "learn_more.about_us": "About Us",
    "learn_more.statutes": "Statutes",
    "nav.sign_in": "Sign In",
    "nav.sign_out": "Sign Out",
    "nav.admin": "Admin Dashboard",
    "nav.profile": "Profile",
    "nav.settings": "Settings"
  },
  km: {
    "page.title": "ចូលរួមជាមួយសហគមន៍ខ្មែរ",
    "page.subtitle": "សហគមន៍ • វប្បធម៌ • សមាហរណកម្ម",
    "page.description": "ក្លាយជាផ្នែកមួយនៃសហគមន៍កម្ពុជា-ស៊ុយអែតដ៏រស់រវើករបស់យើង។ ទាក់ទងជាមួយជនជាតិកម្ពុជាដែលរស់នៅក្នុងប្រទេសស៊ុយអែត ចូលរួមក្នុងព្រឹត្តិការណ៍វប្បធម៌ និងជួយរក្សាបេតិកភណ្ឌរបស់យើងសម្រាប់កូនចៅអនាគត។",
    "benefits.title": "ហេតុអ្វីបានជាចូលរួមជាមួយសហគមន៍ខ្មែរ?",
    "benefits.cultural_connection": "ការតភ្ជាប់វប្បធម៌",
    "benefits.cultural_description": "រក្សាការតភ្ជាប់ជាមួយវប្បធម៌កម្ពុជាតាមរយៈព្រឹត្តិការណ៍ ពិធីបុណ្យ និងការជួបជុំសហគមន៍",
    "benefits.support_network": "បណ្តាញគាំទ្រ",
    "benefits.support_description": "ទទួលបានជំនួយការសម្រុះសម្រួល ការគាំទ្រភាសា និងដំបូន្មានជាក់ស្តែងសម្រាប់ការរស់នៅក្នុងស៊ុយអែត",
    "benefits.community_events": "ព្រឹត្តិការណ៍សហគមន៍",
    "benefits.community_description": "ចូលរួមក្នុងព្រឹត្តិការណ៍សង្គម សិក្ខាសាលាអប់រំ និងការប្រារព្ធពិធីវប្បធម៌",
    "benefits.professional_network": "បណ្តាញវិជ្ជាជីវៈ",
    "benefits.professional_description": "ទាក់ទងជាមួយអ្នកជំនាញកម្ពុជាដទៃទៀត និងពង្រីកឱកាសការងាររបស់អ្នក",
    "benefits.language_preservation": "ការរក្សាភាសា",
    "benefits.language_description": "ជួយរក្សាភាសានិងវប្បធម៌ខ្មែរសម្រាប់កូនចៅអនាគត",
    "benefits.volunteer_opportunities": "ឱកាសស្ម័គ្រចិត្ត",
    "benefits.volunteer_description": "ផ្តល់ការគាំទ្រដល់សហគមន៍តាមរយៈកម្មវិធីស្ម័គ្រចិត្តនិងគំនិតផ្តួចផ្តើមផ្សេងៗ",
    "form.title": "ពាក្យសុំសមាជិកភាព",
    "form.wizard_title": "ទម្រង់ពាក្យសុំសមាជិកភាព",
    "form.wizard_description": "បំពេញសំណូមពរខាងក្រោមដើម្បីដាក់ពាក្យសុំសមាជិកភាព។",
    "learn_more.title": "ចង់ដឹងបន្ថែមអំពីសហគមខ្មែរ?",
    "learn_more.about_us": "អំពីយើង",
    "learn_more.statutes": "ជំពូក",
    "nav.sign_in": "ចូលប្រើប្រាស់",
    "nav.sign_out": "ចាកចេញ",
    "nav.admin": "ផ្ទាំងគ្រប់គ្រង",
    "nav.profile": "ប្រវត្តិរូបផ្ទាល់ខ្លួន",
    "nav.settings": "ការកំណត់"
  }
}

interface JoinPageProps {
  params: { locale: keyof typeof translations }
}

export default async function JoinPage({ params }: JoinPageProps) {
  const session = await getServerSession(authOptions)
  const t = (key: string) => translations[params.locale]?.[key] || translations.en[key] || key;

  // Check membership status for logged-in users
  let memberStatus: null | 'member' | 'pending' | 'under_review' = null
  let requestNumber: string | null = null

  if (session?.user?.email) {
    const [member, pendingRequest] = await Promise.all([
      prisma.member.findUnique({ where: { email: session.user.email }, select: { id: true, memberNumber: true } }),
      prisma.membershipRequest.findFirst({
        where: { email: session.user.email, status: { in: ['PENDING', 'UNDER_REVIEW'] } },
        select: { requestNumber: true, status: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    if (member) memberStatus = 'member'
    else if (pendingRequest) {
      memberStatus = pendingRequest.status === 'UNDER_REVIEW' ? 'under_review' : 'pending'
      requestNumber = pendingRequest.requestNumber
    }
  }

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

      <PublicHeader locale={params.locale} currentUrl={`/${params.locale}/join`} />

      {/* Main Content - Swedish Design Layout */}
      <main id="main-content" className="bg-white">
        <Container size="wide" className="py-8 lg:py-12">
          {/* Swedish Grid Layout: Left Image, Right Form */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 min-h-screen">

            {/* Left Side - Featured Image */}
            <div className="relative">
              <div className="sticky top-8">
                {/* Join Us Image with Creative Slide Animation */}
                <div className="relative aspect-[4/3] w-full overflow-hidden group">
                  <Image
                    src="/media/images/join_us.png"
                    alt={t('page.title')}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />

                  {/* Side sliding welcome panel */}
                  <div className="absolute top-4 left-0 w-full z-10">
                    <div className="bg-[var(--sahakum-navy)]/90 backdrop-blur-sm p-3 mx-4 border-l-4 border-[var(--sahakum-gold)]
                                    transform -translate-x-full group-hover:translate-x-0
                                    transition-transform duration-700 delay-100 ease-out max-w-xs">
                      <div className="text-white text-sm font-medium">
                        {params.locale === 'sv' ? 'Välkommen!' :
                         params.locale === 'km' ? 'សូមស្វាគមន៍!' : 'Welcome!'}
                      </div>
                      <div className="text-[var(--sahakum-gold)] text-xs mt-1">
                        {params.locale === 'sv' ? 'Bli medlem idag' :
                         params.locale === 'km' ? 'ក្លាយជាសមាជិកថ្ងៃនេះ' : 'Join us today'}
                      </div>
                    </div>
                  </div>

                  {/* Bottom sliding main content panel */}
                  <div className="absolute inset-0 flex items-end z-20">
                    <div className="w-full bg-gradient-to-t from-[var(--sahakum-navy)]/95 via-[var(--sahakum-navy)]/70 to-transparent
                                    transform translate-y-full group-hover:translate-y-0
                                    transition-transform duration-500 ease-out
                                    p-6 pt-12">
                      <div className="text-center text-white space-y-3">
                        <div className="transform translate-y-4 group-hover:translate-y-0
                                        transition-all duration-700 delay-200 opacity-0 group-hover:opacity-100">
                          <div className="w-12 h-12 bg-[var(--sahakum-gold)] mx-auto mb-3 flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-[var(--sahakum-navy)]">SK</span>
                          </div>
                        </div>
                        <div className="transform translate-y-4 group-hover:translate-y-0
                                        transition-all duration-700 delay-300 opacity-0 group-hover:opacity-100">
                          <SwedenH1 className="text-white mb-2 text-lg leading-tight" locale={params.locale}>
                            {t('page.title')}
                          </SwedenH1>
                          <SwedenLead className="text-[var(--sahakum-gold)] font-medium text-sm" locale={params.locale}>
                            {t('page.subtitle')}
                          </SwedenLead>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Benefits Summary Below Image */}
                <div className="mt-8 space-y-4">
                  <h3 className={`text-lg font-semibold text-[var(--sahakum-navy)] mb-4 ${getFontClass()}`}>
                    {t('benefits.title')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[var(--sahakum-gold)] mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className={`font-medium text-[var(--sahakum-navy)] text-sm ${getFontClass()}`}>
                          {t('benefits.cultural_connection')}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[var(--sahakum-gold)] mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className={`font-medium text-[var(--sahakum-navy)] text-sm ${getFontClass()}`}>
                          {t('benefits.support_network')}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[var(--sahakum-gold)] mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className={`font-medium text-[var(--sahakum-navy)] text-sm ${getFontClass()}`}>
                          {t('benefits.community_events')}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-[var(--sahakum-gold)] mt-2 flex-shrink-0"></div>
                      <div>
                        <h4 className={`font-medium text-[var(--sahakum-navy)] text-sm ${getFontClass()}`}>
                          {t('benefits.professional_network')}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Membership Form */}
            <div className="lg:py-8">
              <div className="max-w-lg">
                <div className="mb-8">
                  <SwedenH1 className="text-[var(--sahakum-navy)] mb-4" locale={params.locale}>
                    {t('form.title')}
                  </SwedenH1>
                  <SwedenBody className="text-[var(--sahakum-navy)]/70" locale={params.locale}>
                    {t('page.description')}
                  </SwedenBody>
                </div>

                {/* Learn More Section */}
                <div className="mb-8 p-4 bg-[var(--sahakum-gold)]/5 border-l-4 border-[var(--sahakum-gold)]">
                  <p className={`text-sm text-[var(--sahakum-navy)]/80 mb-3 ${getFontClass()}`}>
                    {t('learn_more.title')}
                  </p>
                  <div className="flex gap-4">
                    <Link
                      href={`/${params.locale}/about-us`}
                      className="text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] transition-colors duration-200 text-sm font-medium underline"
                    >
                      {t('learn_more.about_us')}
                    </Link>
                    <Link
                      href={`/${params.locale}/statutes`}
                      className="text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] transition-colors duration-200 text-sm font-medium underline"
                    >
                      {t('learn_more.statutes')}
                    </Link>
                  </div>
                </div>

                {memberStatus === 'member' ? (
                  <div className="p-8 border-2 border-[var(--sahakum-gold)] bg-amber-50/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[var(--sahakum-gold)] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <SwedenH3 className="text-[var(--sahakum-navy)] mb-0" locale={params.locale}>
                        {params.locale === 'sv' ? 'Du är redan medlem!' :
                         params.locale === 'km' ? 'អ្នកជាសមាជិករួចហើយ!' :
                         'You\'re already a member!'}
                      </SwedenH3>
                    </div>
                    <SwedenBody className="text-[var(--sahakum-navy)]/70 mb-6" locale={params.locale}>
                      {params.locale === 'sv' ? 'Välkommen tillbaka. Du har ett aktivt medlemskap i Sahakum Khmer.' :
                       params.locale === 'km' ? 'សូមស្វាគមន៍មកវិញ។ អ្នកមានសមាជិកភាពដំណើរការក្នុង Sahakum Khmer។' :
                       'Welcome back. You have an active membership with Sahakum Khmer.'}
                    </SwedenBody>
                    <Link
                      href={`/${params.locale}`}
                      className={`inline-block px-6 py-2.5 bg-[var(--sahakum-navy)] text-white text-sm font-medium hover:bg-[var(--sahakum-navy)]/90 transition-colors ${getFontClass()}`}
                    >
                      {params.locale === 'sv' ? 'Gå till startsidan' :
                       params.locale === 'km' ? 'ទៅទំព័រដើម' :
                       'Go to homepage'}
                    </Link>
                  </div>
                ) : memberStatus === 'pending' || memberStatus === 'under_review' ? (
                  <div className="p-8 border-2 border-[var(--sahakum-navy)]/30 bg-blue-50/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[var(--sahakum-navy)] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <SwedenH3 className="text-[var(--sahakum-navy)] mb-0" locale={params.locale}>
                        {params.locale === 'sv' ? 'Din ansökan behandlas' :
                         params.locale === 'km' ? 'ពាក្យសុំរបស់អ្នកកំពុងត្រូវបានពិចារណា' :
                         'Your application is being reviewed'}
                      </SwedenH3>
                    </div>
                    {requestNumber && (
                      <p className={`text-xs text-[var(--sahakum-navy)]/50 mb-3 font-mono ${getFontClass()}`}>
                        {requestNumber}
                      </p>
                    )}
                    <SwedenBody className="text-[var(--sahakum-navy)]/70 mb-2" locale={params.locale}>
                      {memberStatus === 'under_review'
                        ? (params.locale === 'sv' ? 'Din ansökan granskas just nu av styrelsen.' :
                           params.locale === 'km' ? 'ពាក្យសុំរបស់អ្នកកំពុងត្រូវបានពិនិត្យដោយក្រុមប្រឹក្សា។' :
                           'Your application is currently being reviewed by the board.')
                        : (params.locale === 'sv' ? 'Din ansökan väntar på granskning av styrelsen. Vi återkommer inom 5–7 arbetsdagar.' :
                           params.locale === 'km' ? 'ពាក្យសុំរបស់អ្នកកំពុងរង់ចាំការពិនិត្យដោយក្រុមប្រឹក្សា។ យើងនឹងទំនាក់ទំនងក្នុងរយៈពេល ៥–៧ ថ្ងៃធ្វើការ។' :
                           'Your application is awaiting review by the board. We\'ll be in touch within 5–7 business days.')}
                    </SwedenBody>
                    <Link
                      href={`/${params.locale}`}
                      className={`inline-block px-6 py-2.5 bg-[var(--sahakum-navy)] text-white text-sm font-medium hover:bg-[var(--sahakum-navy)]/90 transition-colors ${getFontClass()}`}
                    >
                      {params.locale === 'sv' ? 'Gå till startsidan' :
                       params.locale === 'km' ? 'ទៅទំព័រដើម' :
                       'Go to homepage'}
                    </Link>
                  </div>
                ) : (
                  <div className="p-8 border border-[var(--sahakum-navy)]/20 bg-white">
                    <SwedenH3 className="text-[var(--sahakum-navy)] mb-4" locale={params.locale}>
                      {t('form.wizard_title')}
                    </SwedenH3>
                    <p className={`text-[var(--sahakum-navy)]/70 mb-6 ${getFontClass()}`}>
                      {t('form.wizard_description')}
                    </p>
                    {session?.user ? (
                      <div className={`mb-4 p-3 bg-green-50 border border-green-200 text-sm text-green-800 ${getFontClass()}`}>
                        {params.locale === 'sv'
                          ? `Du ansöker som ${session.user.name || session.user.email}`
                          : params.locale === 'km'
                          ? `អ្នកកំពុងដាក់ពាក្យជា ${session.user.name || session.user.email}`
                          : `Applying as ${session.user.name || session.user.email}`}
                      </div>
                    ) : (
                      <div className={`mb-4 p-3 bg-blue-50 border border-blue-200 text-sm text-blue-800 ${getFontClass()}`}>
                        {params.locale === 'sv' ? (
                          <>Har du redan ett konto? <Link href={`/${params.locale}/auth/signin?callbackUrl=/${params.locale}/join`} className="underline font-medium">Logga in först</Link> för att koppla ditt medlemskap.</>
                        ) : params.locale === 'km' ? (
                          <>មានគណនីរួចហើយ? <Link href={`/${params.locale}/auth/signin?callbackUrl=/${params.locale}/join`} className="underline font-medium">ចូលជាមុន</Link> ដើម្បីភ្ជាប់សមាជិកភាពរបស់អ្នក។</>
                        ) : (
                          <>Already have an account? <Link href={`/${params.locale}/auth/signin?callbackUrl=/${params.locale}/join`} className="underline font-medium">Sign in first</Link> to link your membership.</>
                        )}
                      </div>
                    )}
                    <SwedishWizard
                      locale={params.locale}
                      initialData={session?.user ? {
                        firstName: (session.user as { firstName?: string }).firstName || session.user.name?.split(' ')[0] || '',
                        lastName: (session.user as { lastName?: string }).lastName || session.user.name?.split(' ').slice(1).join(' ') || '',
                        email: session.user.email || '',
                      } : undefined}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}