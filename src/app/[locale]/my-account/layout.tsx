import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Footer } from "@/components/layout/footer"
import { SwedenSkipNav } from "@/components/ui/sweden-accessibility"
import { MyAccountNav } from "@/components/layout/my-account-nav"

interface MyAccountLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function MyAccountLayout({ children, params }: MyAccountLayoutProps) {
  const session = await getServerSession(authOptions)
  const locale = params.locale
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  // Redirect to signin if not authenticated
  if (!session) {
    redirect(`/${locale}/auth/signin?callbackUrl=/${locale}/my-account`)
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-white to-gray-50 ${fontClass}`}>
      <SwedenSkipNav locale={locale} />

      <main>
        {/* Page Header */}
        <div className="bg-[var(--sahakum-navy)] text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className={`text-3xl md:text-4xl font-semibold ${fontClass}`}>
              {locale === 'sv' ? 'Mitt Konto' : locale === 'km' ? 'គណនីរបស់ខ្ញុំ' : 'My Account'}
            </h1>
            <p className={`mt-2 text-white/80 ${fontClass}`}>
              {session.user.name || session.user.email}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <MyAccountNav locale={locale} fontClass={fontClass} />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  )
}
