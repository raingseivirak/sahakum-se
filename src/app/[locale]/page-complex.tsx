import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#006AA7] via-[#0093BD] to-[#006AA7] text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold mb-6 tracking-tight">{t('home.title')}</h1>
            <p className="text-2xl mb-4 text-[#FECC02] font-semibold">{t('home.subtitle')}</p>
            <p className="text-lg mb-10 max-w-3xl mx-auto opacity-95 leading-relaxed">
              {t('home.hero_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#FECC02] text-[#006AA7] hover:bg-[#d69e2e] font-semibold px-8 py-4 text-lg">
                {t('common.learn_more')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-[#006AA7] px-8 py-4 text-lg"
              >
                {t('nav.membership')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#006AA7] mb-4">Våra tjänster</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Vi erbjuder stöd och gemenskap för att hjälpa dig att trivas i Sverige
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-[#006AA7] rounded-lg flex items-center justify-center mb-4">
                  <span className="text-[#FECC02] text-3xl">🏛️</span>
                </div>
                <CardTitle className="text-[#006AA7] text-xl">{t('nav.cambodia')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Lär dig om kambodjansk historia, kultur, mat och traditioner. Bevara ditt kulturella arv medan du bygger en ny framtid.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-[#006AA7] rounded-lg flex items-center justify-center mb-4">
                  <span className="text-[#FECC02] text-3xl">🇸🇪</span>
                </div>
                <CardTitle className="text-[#006AA7] text-xl">{t('nav.living_in_sweden')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Praktisk guide för nyanlända - boende, vård, transport, språkkurser och allt du behöver veta för att komma igång.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-[#006AA7] rounded-lg flex items-center justify-center mb-4">
                  <span className="text-[#FECC02] text-3xl">👥</span>
                </div>
                <CardTitle className="text-[#006AA7] text-xl">{t('nav.community')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Gemenskap genom matlagning, evenemang och kulturella aktiviteter. Bygg nätverk och nya vänskaper.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#006AA7] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Bli medlem idag</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Gå med i vår gemenskap och få tillgång till alla våra tjänster och evenemang
          </p>
          <Button size="lg" className="bg-[#FECC02] text-[#006AA7] hover:bg-[#d69e2e] font-semibold px-8 py-4 text-lg">
            Ansök om medlemskap
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}