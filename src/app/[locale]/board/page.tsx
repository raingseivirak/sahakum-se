import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { Container } from '@/components/layout/grid'
import { SwedenSkipNav } from '@/components/ui/sweden-accessibility'
import { ScrollAwareHeader } from '@/components/ui/scroll-aware-header'
import { Footer } from '@/components/layout/footer'

export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale })

  return {
    title: `${t('board.boardOfDirectors')} | Sahakum Khmer`,
    description: t('board.boardDescription'),
  }
}

export default async function BoardPage({
  params,
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale: params.locale })
  const fontClass = params.locale === 'km' ? 'font-khmer' : 'font-sweden'

  // Fetch all board members (flat organization - all equal)
  const boardMembers = await prisma.boardMember.findMany({
    where: {
      active: true,
    },
    include: {
      translations: {
        where: {
          language: params.locale,
        },
      },
    },
    orderBy: [{ order: 'asc' }],
  })

  return (
    <div className={`min-h-screen bg-swedenBrand-neutral-white ${fontClass}`}>
      {/* Official Sweden Brand Skip Navigation */}
      <SwedenSkipNav locale={params.locale} />

      {/* Scroll-Aware Header */}
      <ScrollAwareHeader
        locale={params.locale}
        showBlogLink={false}
        stickyContent={{
          title: t('board.boardOfDirectors'),
          excerpt: t('board.boardLeadingDescription')
        }}
        translations={{
          sign_in: params.locale === 'km' ? 'ចូលប្រើប្រាស់' : params.locale === 'sv' ? 'Logga in' : 'Sign In',
          sign_out: params.locale === 'km' ? 'ចាកចេញ' : params.locale === 'sv' ? 'Logga ut' : 'Sign Out',
          admin: params.locale === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : params.locale === 'sv' ? 'Administratörspanel' : 'Admin Dashboard',
          profile: params.locale === 'km' ? 'ប្រវត្តិរូបផ្ទាល់ខ្លួន' : params.locale === 'sv' ? 'Min profil' : 'Profile',
          settings: params.locale === 'km' ? 'ការកំណត់' : params.locale === 'sv' ? 'Inställningar' : 'Settings'
        }}
        currentUrl={`/${params.locale}/board`}
      />

      {/* Hero Section - Clean, Flat Design */}
      <main id="main-content">
        <section className="bg-[var(--sahakum-navy)] text-white border-b border-[var(--sahakum-gold)]/20">
          <Container size="wide" className="py-16 md:py-20">
            <div className="max-w-3xl">
              <h1 className={`text-white mb-4 text-4xl lg:text-5xl font-semibold leading-[1.29] tracking-[-0.36px] ${fontClass}`}>
                {t('board.boardOfDirectors')}
              </h1>
              <p className={`text-white/80 text-lg lg:text-xl leading-[1.42] ${fontClass}`}>
                {t('board.boardLeadingDescription')}
              </p>
            </div>
          </Container>
        </section>

        {/* Board Members Grid - Flat Organization */}
        <section className="py-12 md:py-16 bg-white">
          <Container size="wide">
            {/* Clean, Equal Grid of All Board Members */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {boardMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white border border-[var(--sahakum-navy)]/20 overflow-hidden transition-all duration-300 hover:border-[var(--sahakum-gold)]"
                >
                  {/* Image or Clean Placeholder */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {member.profileImage ? (
                      <img
                        src={member.profileImage}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--sahakum-navy)]/5 border-b-4 border-[var(--sahakum-gold)]"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Position Badge - Clean Square */}
                    <div className="inline-block px-3 py-1 bg-[var(--sahakum-gold)] text-white text-xs font-bold">
                      {member.translations[0]?.position || 'Board Member'}
                    </div>

                    {/* Name - Khmer on top */}
                    <div>
                      {member.firstNameKhmer && member.lastNameKhmer && (
                        <p className="text-xl font-bold text-[var(--sahakum-navy)] font-khmer mb-1">
                          {member.firstNameKhmer} {member.lastNameKhmer}
                        </p>
                      )}
                      <h3 className={`text-lg font-semibold text-sweden-neutral-600 ${fontClass}`}>
                        {member.firstName} {member.lastName}
                      </h3>
                    </div>

                    {/* Education */}
                    <div>
                      <h4 className={`text-xs font-bold uppercase tracking-wide text-[var(--sahakum-navy)] mb-2 ${fontClass}`}>
                        {t('board.education')}
                      </h4>
                      <p className={`text-sm text-sweden-neutral-700 leading-relaxed ${fontClass}`}>
                        {member.translations[0]?.education}
                      </p>
                    </div>

                    {/* Vision - Clean Square Highlight */}
                    <div className="border-l-4 border-[var(--sahakum-gold)] bg-[var(--sahakum-navy)]/5 p-4">
                      <h4 className={`text-xs font-bold uppercase tracking-wide text-[var(--sahakum-navy)] mb-2 ${fontClass}`}>
                        {t('board.vision')}
                      </h4>
                      <p className={`text-sm text-sweden-neutral-700 italic leading-relaxed ${fontClass}`}>
                        "{member.translations[0]?.vision}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA Section - Clean, Flat */}
        <section className="py-16 bg-[var(--sahakum-navy)] text-white border-t border-[var(--sahakum-gold)]/20">
          <Container className="max-w-3xl">
            <h2 className={`text-3xl md:text-4xl font-bold text-white mb-4 ${fontClass}`}>
              {t('board.joinOurCommunity')}
            </h2>
            <p className={`text-lg text-white/80 mb-8 ${fontClass}`}>
              {t('board.joinCommunityDescription')}
            </p>
            <a
              href={`/${params.locale}/join`}
              className={`inline-block bg-[var(--sahakum-gold)] text-white px-8 py-4 font-bold text-lg hover:bg-[var(--sahakum-gold-600)] transition-colors duration-300 ${fontClass}`}
            >
              {t('board.becomeMember')}
            </a>
          </Container>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
