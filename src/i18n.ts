import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['sv', 'en', 'km'];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  // Debug logging
  console.log('i18n: requestLocale =', locale);
  console.log('i18n: locales =', locales);
  console.log('i18n: includes?', locales.includes(locale));

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale)) {
    console.log('i18n: calling notFound() for locale:', locale);
    notFound();
  }

  return {
    messages: (await import(`./i18n/messages/${locale}.json`)).default
  };
});