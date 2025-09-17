import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-[var(--sweden-blue)] mb-4">Sahakum Khmer</h3>
            <p className="text-gray-600 text-sm">
              Gemenskap • Kultur • Integration
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">{t('contact')}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Email: info@sahakumkhmer.se</p>
              <p>Telefon: +46 xxx xxx xxx</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Följ oss</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-[var(--sweden-blue)] hover:text-[var(--sweden-blue-light)]">
                Facebook
              </a>
              <a href="#" className="text-[var(--sweden-blue)] hover:text-[var(--sweden-blue-light)]">
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 mt-8 text-center text-sm text-gray-500">
          <p>&copy; 2025 Sahakum Khmer. Alla rättigheter förbehållna.</p>
        </div>
      </div>
    </footer>
  );
}