"use client"

import Link from 'next/link'
import { SwedenH2, SwedenBody } from '@/components/ui/sweden-typography'
import { SwedenButton } from '@/components/ui/sweden-motion'
import { Container } from '@/components/layout/grid'
import { UserPlus, CheckCircle, Users, Heart, Globe, ArrowRight } from 'lucide-react'

interface MembershipSectionProps {
  locale: string
  className?: string
}

// Translations following Sweden Brand multilingual guidelines
const translations = {
  sv: {
    title: "Bli medlem i Sahakum Khmer",
    subtitle: "Gå med i vår växande gemenskap av kambodjaner som bor i Sverige",
    description: "Som medlem får du tillgång till kulturella evenemang, stöd för integration och en stark gemenskap som hjälper dig att känna dig hemma i Sverige.",
    benefits: {
      community: "Gemenskap & stöd",
      culture: "Kulturella aktiviteter",
      integration: "Hjälp med integration",
      network: "Professionellt nätverk"
    },
    cta: {
      primary: "Ansök om medlemskap",
      secondary: "Läs mer om fördelarna"
    },
    process: {
      title: "Så här går det till:",
      steps: [
        "Fyll i ansökan online",
        "Vi granskar din ansökan",
        "Välkommen som medlem!"
      ]
    },
    accessibility: "Ansök om medlemskap i Sahakum Khmer - öppnar ny sida"
  },
  en: {
    title: "Join Sahakum Khmer",
    subtitle: "Become part of our growing community of Cambodians living in Sweden",
    description: "As a member, you'll gain access to cultural events, integration support, and a strong community that helps you feel at home in Sweden.",
    benefits: {
      community: "Community & support",
      culture: "Cultural activities",
      integration: "Integration assistance",
      network: "Professional network"
    },
    cta: {
      primary: "Apply for membership",
      secondary: "Learn more about benefits"
    },
    process: {
      title: "How it works:",
      steps: [
        "Fill out online application",
        "We review your application",
        "Welcome as a member!"
      ]
    },
    accessibility: "Apply for membership in Sahakum Khmer - opens new page"
  },
  km: {
    title: "ចូលរួមជាមួយសហគមន៍ខ្មែរ",
    subtitle: "ក្លាយជាផ្នែកមួយនៃសហគមន៍ខ្មែររបស់យើងដែលរស់នៅក្នុងប្រទេសស៊ុយអែត",
    description: "ក្នុងនាមជាសមាជិក អ្នកនឹងទទួលបានការចូលរួមសកម្មភាពវប្បធម៌ ការគាំទ្រការសម្រុះសម្រួល និងសហគមន៍រឹងមាំដែលជួយអ្នកមានអារម្មណ៍ថាអ្នកនៅផ្ទះនៅស៊ុយអែត។",
    benefits: {
      community: "សហគមន៍ និងការគាំទ្រ",
      culture: "សកម្មភាពវប្បធម៌",
      integration: "ជំនួយការសម្រុះសម្រួល",
      network: "បណ្តាញវិជ្ជាជីវៈ"
    },
    cta: {
      primary: "ដាក់ពាក្យសុំសមាជិកភាព",
      secondary: "ស្វែងយល់បន្ថែមអំពីអត្ថប្រយោជន៍"
    },
    process: {
      title: "របៀបដែលវាដំណើរការ៖",
      steps: [
        "បំពេញពាក្យសុំតាមអនឡាញ",
        "យើងពិនិត្យពាក្យសុំរបស់អ្នក",
        "សូមស្វាគមន៍ក្នុងនាមជាសមាជិក!"
      ]
    },
    accessibility: "ដាក់ពាក្យសុំសមាជិកភាពក្នុងសហគមន៍ខ្មែរ - បើកទំព័រថ្មី"
  }
}

export function MembershipSection({ locale, className = '' }: MembershipSectionProps) {
  const t = translations[locale as keyof typeof translations] || translations.en

  // Font class based on locale following Sweden Brand guidelines
  const getFontClass = () => {
    return locale === 'km' ? 'font-khmer' : 'font-sweden'
  }

  const fontClass = getFontClass()

  return (
    <section
      className={`py-16 lg:py-24 bg-gradient-to-br from-white via-[var(--sahakum-gold)]/5 to-[var(--sahakum-navy)]/10 ${className}`}
      aria-labelledby="membership-title"
    >
      <Container size="wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Content Side - Left */}
          <div className="space-y-8">
            <div className="space-y-6">
              <SwedenH2
                id="membership-title"
                className="text-[var(--sahakum-navy)]"
                locale={locale}
              >
                {t.title}
              </SwedenH2>

              <SwedenBody className="text-[var(--sahakum-navy)]/80 text-lg leading-relaxed" locale={locale}>
                {t.subtitle}
              </SwedenBody>

              <SwedenBody className="text-[var(--sahakum-navy)]/70" locale={locale}>
                {t.description}
              </SwedenBody>
            </div>

            {/* Benefits Grid - Accessible with proper structure */}
            <div className="grid grid-cols-2 gap-4" role="list" aria-label="Membership benefits">
              {Object.entries(t.benefits).map(([key, benefit], index) => {
                const icons = {
                  community: Users,
                  culture: Globe,
                  integration: Heart,
                  network: CheckCircle
                }
                const Icon = icons[key as keyof typeof icons] || CheckCircle

                return (
                  <div
                    key={key}
                    className="flex items-center space-x-3 p-3 bg-white/70 border border-[var(--sahakum-gold)]/30 hover:bg-white transition-colors duration-200"
                    role="listitem"
                  >
                    <div className="flex-shrink-0">
                      <Icon
                        className="h-5 w-5 text-[var(--sahakum-gold)]"
                        aria-hidden="true"
                      />
                    </div>
                    <span className={`text-base font-medium text-[var(--sahakum-navy)] ${fontClass}`}>
                      {benefit}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Call to Action Buttons - High contrast following Sweden Brand accessibility */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <SwedenButton
                asChild
                variant="primary"
                size="lg"
                className="bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 focus:ring-[var(--sahakum-gold)]/40 focus:ring-4 shadow-lg text-[var(--sahakum-navy)] font-medium"
              >
                <Link
                  href={`/${locale}/join`}
                  aria-label={t.accessibility}
                  className={fontClass}
                >
                  <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                  {t.cta.primary}
                </Link>
              </SwedenButton>

              <SwedenButton
                asChild
                variant="secondary"
                size="lg"
                className="border-[var(--sahakum-navy)]/30 text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/5 focus:ring-[var(--sahakum-navy)]/40 focus:ring-2"
              >
                <Link
                  href={`/${locale}/about-us`}
                  className={fontClass}
                >
                  {t.cta.secondary}
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
              </SwedenButton>
            </div>
          </div>

          {/* Visual Side - Right */}
          <div className="space-y-8">
            {/* Process Steps - Swedish Design with Square Corners */}
            <div className="bg-white p-8 shadow-lg border border-[var(--sahakum-gold)]/30">
              <h3 className={`text-xl font-semibold text-[var(--sahakum-navy)] mb-6 ${fontClass}`}>
                {t.process.title}
              </h3>

              <ol className="space-y-6" role="list">
                {t.process.steps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-4" role="listitem">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)] flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`text-[var(--sahakum-navy)]/80 text-base font-medium ${fontClass}`}>
                        {step}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Trust Indicators - Swedish Design with Square Corners */}
            <div className="bg-[var(--sahakum-navy)] p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[var(--sahakum-gold)] flex items-center justify-center">
                    <Users className="h-6 w-6 text-[var(--sahakum-navy)]" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <p className={`text-lg font-semibold ${fontClass}`}>
                    {locale === 'sv' ? '200+ aktiva medlemmar' :
                     locale === 'km' ? 'សមាជិកសកម្ម ២០០+ នាក់' :
                     '200+ active members'}
                  </p>
                  <p className={`text-[var(--sahakum-gold)] text-base ${fontClass}`}>
                    {locale === 'sv' ? 'I hela Sverige' :
                     locale === 'km' ? 'នៅទូទាំងប្រទេសស៊ុយអែត' :
                     'Across Sweden'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}