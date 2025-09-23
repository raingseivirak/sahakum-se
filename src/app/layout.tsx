import { Inter } from 'next/font/google';
import { Noto_Sans_Khmer } from 'next/font/google';
import { Providers } from '@/components/providers/session-provider';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { CookieConsentBanner } from '@/components/gdpr/cookie-consent-banner';
import './[locale]/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ['khmer'],
  variable: '--font-noto-khmer',
  weight: ['100', '300', '400', '500', '600', '700', '800', '900']
});

export const metadata = {
  title: 'Sahakum Khmer',
  description: 'Community • Culture • Integration'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        {/* Preload Sweden Sans fonts for faster rendering */}
        <link
          rel="preload"
          href="/fonts/sweden-sans/SwedenSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/sweden-sans/SwedenSans-Semibold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
        <link
          rel="preload"
          href="/fonts/sweden-sans/SwedenSans-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />
      </head>
      <body className={`${inter.variable} ${notoSansKhmer.variable}`}>
        <GoogleAnalytics />
        <Providers>
          {children}
        </Providers>
        <CookieConsentBanner />
      </body>
    </html>
  );
}