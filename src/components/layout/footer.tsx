import { getPublicSettings } from '@/lib/public-settings'
import { FooterContent } from './footer-content'

interface FooterProps {
  /**
   * Active locale. When omitted (legacy callers) we fall back to Swedish — the site's default.
   * Existing pages should pass `params.locale` so the footer labels match the surrounding UI.
   */
  locale?: string
}

/**
 * Public-site footer.
 *
 * Server component: fetches organization / contact / social settings from the DB
 * (cached for 5 min via `getPublicSettings`) and passes them down to the client
 * `FooterContent` which handles rendering + the cookie-consent button.
 */
export async function Footer({ locale }: FooterProps = {}) {
  const settings = await getPublicSettings()
  const resolvedLocale = locale || settings.site.defaultLanguage || 'sv'

  return (
    <FooterContent
      locale={resolvedLocale}
      organization={settings.organization}
      contact={settings.contact}
      social={settings.social}
    />
  )
}
