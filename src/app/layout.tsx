import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Noto_Sans_Khmer } from 'next/font/google';
import { Providers } from '@/components/providers/session-provider';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { CookieConsentBanner } from '@/components/gdpr/cookie-consent-banner';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBaseUrl, getDynamicOgImageUrl } from '@/lib/metadata';
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

const baseUrl = getBaseUrl();
const defaultOgImage = getDynamicOgImageUrl({
  title: 'Sahakum Khmer',
  description: 'Community • Culture • Integration',
  locale: 'en',
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Sahakum Khmer | Cambodian Community in Sweden',
    template: '%s | Sahakum Khmer',
  },
  description: 'Community • Culture • Integration — Sahakum Khmer helps Cambodians integrate into Swedish society through community activities, cultural exchange and support.',
  applicationName: 'Sahakum Khmer',
  openGraph: {
    title: 'Sahakum Khmer | Cambodian Community in Sweden',
    description: 'Community • Culture • Integration — Sahakum Khmer helps Cambodians integrate into Swedish society through community activities, cultural exchange and support.',
    url: baseUrl,
    siteName: 'Sahakum Khmer',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'Sahakum Khmer — Cambodian Community in Sweden',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sahakum Khmer | Cambodian Community in Sweden',
    description: 'Community • Culture • Integration',
    site: '@sahakumkhmer',
    creator: '@sahakumkhmer',
    images: [defaultOgImage],
  },
  icons: {
    icon: '/media/images/logo.svg',
    apple: '/media/images/logo.svg',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions)

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
        <Providers session={session}>
          {children}
        </Providers>
        <CookieConsentBanner />
      </body>
    </html>
  );
}