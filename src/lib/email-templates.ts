// Email templates using Swedish Brand colors and design

const SAHAKUM_NAVY = '#0D1931'
const SAHAKUM_GOLD = '#D4932F'

// Base64 encoded logo for email embedding (works in all email clients)
const LOGO_BASE64 = 'data:image/png;base64,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'

// Email content translations
type Language = 'en' | 'sv' | 'km'

interface EmailTranslations {
  welcome: {
    subject: string
    greeting: string
    thankYou: string
    whatHappensNext: string
    reviewProcess: string
    timeframe: string
    nextSteps: {
      title: string
      items: string[]
    }
    links: {
      exploreWebsite: string
      readBlog: string
      checkEvents: string
    }
    closing: string
    footer: string
  }
  approval: {
    subject: string
    congratulations: string
    approved: string
    nextSteps: string
  }
  credentials: {
    subject: string
    greeting: string
    accountCreated: string
    accessPortal: string
    features: string[]
    credentials: string
    email: string
    tempPassword: string
    important: string
    changePassword: string
    loginButton: string
    needHelp: string
    footer: string
  }
}

const EMAIL_CONTENT: Record<Language, EmailTranslations> = {
  en: {
    welcome: {
      subject: 'Thank You for Your Membership Application',
      greeting: 'Dear',
      thankYou: 'Thank you for applying to become a member of Sahakum Khmer!',
      whatHappensNext: 'What Happens Next?',
      reviewProcess: 'We have received your application and our board will carefully review it.',
      timeframe: 'You can expect to hear from us within 7-14 days.',
      nextSteps: {
        title: 'While You Wait',
        items: [
          'Explore our website to learn more about our community',
          'Read our latest blog posts and news',
          'Check out upcoming events and activities',
          'Follow us on social media to stay connected'
        ]
      },
      links: {
        exploreWebsite: 'Visit Our Website',
        readBlog: 'Read Our Blog',
        checkEvents: 'View Events'
      },
      closing: 'We look forward to welcoming you to the Sahakum Khmer community!',
      footer: 'This is an automated confirmation from Sahakum Khmer.'
    },
    approval: {
      subject: 'Congratulations! Your Membership Has Been Approved',
      congratulations: 'Congratulations',
      approved: 'Your membership application has been approved!',
      nextSteps: 'Welcome to the Sahakum Khmer community. We will contact you soon with more details.'
    },
    credentials: {
      subject: 'Your Sahakum Khmer Member Account - Login Credentials',
      greeting: 'Dear',
      accountCreated: 'Your member account has been created!',
      accessPortal: 'You can now access the Sahakum Khmer member portal to:',
      features: [
        'View and update your member profile',
        'Access member-only content and resources',
        'Register for exclusive events',
        'Connect with other members',
        'Stay updated with community news'
      ],
      credentials: 'Your Login Credentials',
      email: 'Email',
      tempPassword: 'Temporary Password',
      important: 'Important Security Notice',
      changePassword: 'Please change your password after your first login for security.',
      loginButton: 'Login to Member Portal',
      needHelp: 'Need help? Contact us at',
      footer: 'This email contains sensitive information. Please keep it secure.'
    }
  },
  sv: {
    welcome: {
      subject: 'Tack för din medlemsansökan',
      greeting: 'Kära',
      thankYou: 'Tack för att du ansöker om att bli medlem i Sahakum Khmer!',
      whatHappensNext: 'Vad händer nu?',
      reviewProcess: 'Vi har mottagit din ansökan och vår styrelse kommer att granska den noggrant.',
      timeframe: 'Du kan förvänta dig att höra från oss inom 7-14 dagar.',
      nextSteps: {
        title: 'Medan du väntar',
        items: [
          'Utforska vår webbplats för att lära dig mer om vår gemenskap',
          'Läs våra senaste blogginlägg och nyheter',
          'Kolla in kommande evenemang och aktiviteter',
          'Följ oss på sociala medier för att hålla kontakten'
        ]
      },
      links: {
        exploreWebsite: 'Besök vår webbplats',
        readBlog: 'Läs vår blogg',
        checkEvents: 'Se evenemang'
      },
      closing: 'Vi ser fram emot att välkomna dig till Sahakum Khmer-gemenskapen!',
      footer: 'Detta är en automatisk bekräftelse från Sahakum Khmer.'
    },
    approval: {
      subject: 'Grattis! Ditt medlemskap har godkänts',
      congratulations: 'Grattis',
      approved: 'Din medlemsansökan har godkänts!',
      nextSteps: 'Välkommen till Sahakum Khmer-gemenskapen. Vi kommer att kontakta dig snart med mer information.'
    },
    credentials: {
      subject: 'Ditt Sahakum Khmer medlemskonto - Inloggningsuppgifter',
      greeting: 'Kära',
      accountCreated: 'Ditt medlemskonto har skapats!',
      accessPortal: 'Du kan nu komma åt Sahakum Khmers medlemsportal för att:',
      features: [
        'Visa och uppdatera din medlemsprofil',
        'Få tillgång till medlemsexklusivt innehåll och resurser',
        'Anmäla dig till exklusiva evenemang',
        'Ansluta till andra medlemmar',
        'Håll dig uppdaterad med gemenskapsnyheter'
      ],
      credentials: 'Dina inloggningsuppgifter',
      email: 'E-post',
      tempPassword: 'Tillfälligt lösenord',
      important: 'Viktig säkerhetsnotis',
      changePassword: 'Vänligen ändra ditt lösenord efter din första inloggning för säkerhet.',
      loginButton: 'Logga in på medlemsportalen',
      needHelp: 'Behöver du hjälp? Kontakta oss på',
      footer: 'Detta e-postmeddelande innehåller känslig information. Vänligen håll det säkert.'
    }
  },
  km: {
    welcome: {
      subject: 'សូមអរគុណសម្រាប់ពាក្យសុំសមាជិកភាពរបស់អ្នក',
      greeting: 'សូមគោរព',
      thankYou: 'សូមអរគុណដែលបានដាក់ពាក្យសុំក្លាយជាសមាជិករបស់ Sahakum Khmer!',
      whatHappensNext: 'អ្វីដែលកើតឡើងបន្ទាប់?',
      reviewProcess: 'យើងបានទទួលពាក្យសុំរបស់អ្នក ហើយក្រុមប្រឹក្សារបស់យើងនឹងពិនិត្យវាដោយប្រុងប្រយ័ត្ន។',
      timeframe: 'អ្នកអាចរំពឹងថានឹងទទួលបានការឆ្លើយតបពីយើងក្នុងរយៈពេល 7-14 ថ្ងៃ។',
      nextSteps: {
        title: 'ខណៈពេលដែលអ្នករង់ចាំ',
        items: [
          'ស្វែងយល់បន្ថែមអំពីសហគមន៍របស់យើងនៅលើគេហទំព័ររបស់យើង',
          'អានប្លុកនិងព័ត៌មានថ្មីៗរបស់យើង',
          'មើលព្រឹត្តិការណ៍និងសកម្មភាពនាពេលខាងមុខ',
          'តាមដានយើងនៅលើប្រព័ន្ធផ្សព្វផ្សាយសង្គមដើម្បីរក្សាទំនាក់ទំនង'
        ]
      },
      links: {
        exploreWebsite: 'ទស្សនាគេហទំព័ររបស់យើង',
        readBlog: 'អានប្លុករបស់យើង',
        checkEvents: 'មើលព្រឹត្តិការណ៍'
      },
      closing: 'យើងរំពឹងថានឹងស្វាគមន៍អ្នកមកកាន់សហគមន៍ Sahakum Khmer!',
      footer: 'នេះជាការបញ្ជាក់ដោយស្វ័យប្រវត្តិពី Sahakum Khmer។'
    },
    approval: {
      subject: 'អបអរសាទរ! សមាជិកភាពរបស់អ្នកត្រូវបានអនុម័ត',
      congratulations: 'អបអរសាទរ',
      approved: 'ពាក្យសុំសមាជិកភាពរបស់អ្នកត្រូវបានអនុម័ត!',
      nextSteps: 'សូមស្វាគមន៍មកកាន់សហគមន៍ Sahakum Khmer។ យើងនឹងទាក់ទងអ្នកឆាប់ៗនេះជាមួយព័ត៌មានលម្អិតបន្ថែម។'
    },
    credentials: {
      subject: 'គណនីសមាជិក Sahakum Khmer របស់អ្នក - ព័ត៌មានចូល',
      greeting: 'សូមគោរព',
      accountCreated: 'គណនីសមាជិករបស់អ្នកត្រូវបានបង្កើត!',
      accessPortal: 'ឥឡូវនេះអ្នកអាចចូលប្រើប្រព័ន្ធសមាជិក Sahakum Khmer ដើម្បី:',
      features: [
        'មើលនិងកែប្រែព័ត៌មានសមាជិករបស់អ្នក',
        'ចូលប្រើមាតិកានិងធនធានសម្រាប់តែសមាជិក',
        'ចុះឈ្មោះចូលរួមព្រឹត្តិការណ៍ពិសេស',
        'ភ្ជាប់ទំនាក់ទំនងជាមួយសមាជិកផ្សេងទៀត',
        'ទទួលបានព័ត៌មានថ្មីៗពីសហគមន៍'
      ],
      credentials: 'ព័ត៌មានចូលរបស់អ្នក',
      email: 'អ៊ីមែល',
      tempPassword: 'ពាក្យសម្ងាត់បណ្តោះអាសន្ន',
      important: 'សេចក្តីជូនដំណឹងសុវត្ថិភាពសំខាន់',
      changePassword: 'សូមប្តូរពាក្យសម្ងាត់របស់អ្នកបន្ទាប់ពីចូលលើកដំបូងដើម្បីសុវត្ថិភាព។',
      loginButton: 'ចូលទៅកាន់ប្រព័ន្ធសមាជិក',
      needHelp: 'ត្រូវការជំនួយ? ទាក់ទងយើងខ្ញុំតាម',
      footer: 'អ៊ីមែលនេះមានព័ត៌មានសម្ងាត់។ សូមរក្សាទុកឱ្យមានសុវត្ថិភាព។'
    }
  }
}

export interface MembershipRequestEmailData {
  firstName: string
  lastName: string
  khmerFirstName?: string
  khmerLastName?: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  residenceStatus: string
  motivation: string
  requestId: string
  adminUrl: string
}

export function generateNewMembershipRequestEmail(data: MembershipRequestEmailData): { subject: string; html: string; text: string } {
  const fullName = `${data.firstName} ${data.lastName}`
  const khmerName = data.khmerFirstName && data.khmerLastName ? `${data.khmerFirstName} ${data.khmerLastName}` : null
  const baseUrl = data.adminUrl ? data.adminUrl.split('/en/admin')[0] : 'https://www.sahakumkhmer.se'

  const subject = `New Membership Request: ${fullName}`

  const text = `
New Membership Request Received

Name: ${fullName}${khmerName ? `\nKhmer Name: ${khmerName}` : ''}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Residence Status: ${data.residenceStatus}

Address:
${data.address || 'Not provided'}
${data.postalCode || ''} ${data.city || ''}

Motivation:
${data.motivation}

Review this request in the admin panel:
${data.adminUrl}
  `.trim()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Membership Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: white; border-collapse: collapse;">

          <!-- Header with Sahakum Logo -->
          <tr>
            <td style="background-color: ${SAHAKUM_NAVY}; padding: 40px; border-bottom: 4px solid ${SAHAKUM_GOLD};">
              <!-- Horizontal layout: Logo left, Brand text right -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 120px; vertical-align: middle; padding-right: 0;">
                    <!-- Sahakum Logo Image -->
                    <img src="${LOGO_BASE64}" alt="Sahakum Khmer Logo" width="96" height="96" style="display: block;" />
                  </td>
                  <td style="vertical-align: middle; padding-left: 0;">
                    <!-- Brand Text - Swedish Brand style (stacked vertically) -->
                    <div>
                      <p style="margin: 0; color: white; font-size: 13px; font-weight: 500; letter-spacing: 1px; line-height: 1.2;">
                        SWEDEN
                      </p>
                      <p style="margin: 2px 0 0 0; color: ${SAHAKUM_GOLD}; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; line-height: 1.2;">
                        SAHAKUM KHMER
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">

              <!-- Alert Badge -->
              <div style="background-color: ${SAHAKUM_GOLD}; color: ${SAHAKUM_NAVY}; padding: 12px 16px; margin-bottom: 24px; font-weight: 600; font-size: 14px; text-align: center;">
                NEW MEMBERSHIP REQUEST
              </div>

              <p style="margin: 0 0 24px 0; color: #333; font-size: 16px; line-height: 1.5;">
                A new membership application has been submitted and requires your review.
              </p>

              <!-- Applicant Details -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <td colspan="2" style="background-color: ${SAHAKUM_NAVY}; color: white; padding: 12px 16px; font-weight: 600; border-left: 4px solid ${SAHAKUM_GOLD};">
                    Applicant Information
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9f9f9; font-weight: 600; color: ${SAHAKUM_NAVY}; width: 40%; border-bottom: 1px solid #e5e5e5;">
                    Name
                  </td>
                  <td style="padding: 12px 16px; background-color: white; color: #333; border-bottom: 1px solid #e5e5e5;">
                    ${fullName}${khmerName ? `<br><span style="color: #666; font-size: 14px;">${khmerName}</span>` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9f9f9; font-weight: 600; color: ${SAHAKUM_NAVY}; border-bottom: 1px solid #e5e5e5;">
                    Email
                  </td>
                  <td style="padding: 12px 16px; background-color: white; color: #333; border-bottom: 1px solid #e5e5e5;">
                    <a href="mailto:${data.email}" style="color: ${SAHAKUM_GOLD}; text-decoration: none;">${data.email}</a>
                  </td>
                </tr>
                ${data.phone ? `
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9f9f9; font-weight: 600; color: ${SAHAKUM_NAVY}; border-bottom: 1px solid #e5e5e5;">
                    Phone
                  </td>
                  <td style="padding: 12px 16px; background-color: white; color: #333; border-bottom: 1px solid #e5e5e5;">
                    ${data.phone}
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9f9f9; font-weight: 600; color: ${SAHAKUM_NAVY}; border-bottom: 1px solid #e5e5e5;">
                    Residence Status
                  </td>
                  <td style="padding: 12px 16px; background-color: white; color: #333; border-bottom: 1px solid #e5e5e5;">
                    ${data.residenceStatus}
                  </td>
                </tr>
                ${data.address || data.city ? `
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9f9f9; font-weight: 600; color: ${SAHAKUM_NAVY};">
                    Address
                  </td>
                  <td style="padding: 12px 16px; background-color: white; color: #333;">
                    ${data.address || ''}<br>
                    ${data.postalCode || ''} ${data.city || ''}
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- Motivation -->
              <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid ${SAHAKUM_GOLD}; margin-bottom: 32px;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: ${SAHAKUM_NAVY};">
                  Motivation:
                </p>
                <p style="margin: 0; color: #333; line-height: 1.6; font-size: 15px;">
                  ${data.motivation}
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${data.adminUrl}"
                       style="display: inline-block; background-color: ${SAHAKUM_GOLD}; color: ${SAHAKUM_NAVY}; padding: 16px 32px; text-decoration: none; font-weight: 600; font-size: 16px; border: none;">
                      Review Application →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5; text-align: center;">
                Click the button above to review and approve/reject this membership request.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 24px 40px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.5; text-align: center;">
                This is an automated notification from Sahakum Khmer.<br>
                <a href="https://www.sahakumkhmer.se" style="color: ${SAHAKUM_GOLD}; text-decoration: none;">www.sahakumkhmer.se</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  return { subject, html, text }
}

// Interface for applicant welcome email data
export interface ApplicantWelcomeEmailData {
  firstName: string
  lastName: string
  khmerFirstName?: string
  khmerLastName?: string
  email: string
  requestNumber: string
  language?: Language
  baseUrl?: string
}

// Generate welcome email for membership applicant
export function generateApplicantWelcomeEmail(data: ApplicantWelcomeEmailData): { subject: string; html: string; text: string } {
  const lang = data.language || 'en'
  const content = EMAIL_CONTENT[lang].welcome
  const fullName = `${data.firstName} ${data.lastName}`
  const khmerName = data.khmerFirstName && data.khmerLastName ? `${data.khmerFirstName} ${data.khmerLastName}` : null
  const baseUrl = data.baseUrl || 'https://www.sahakumkhmer.se'

  // Determine which name to display based on language
  const displayName = lang === 'km' && khmerName ? khmerName : fullName

  // Get font family based on language
  const fontFamily = lang === 'km'
    ? "'Noto Sans Khmer', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

  const subject = content.subject

  const text = `
${content.greeting} ${displayName},

${content.thankYou}

${content.whatHappensNext}

${content.reviewProcess}
${content.timeframe}

${content.nextSteps.title}:
${content.nextSteps.items.map((item, i) => `${i + 1}. ${item}`).join('\n')}

${content.links.exploreWebsite}: ${baseUrl}/${lang}
${content.links.readBlog}: ${baseUrl}/${lang}/blog
${content.links.checkEvents}: ${baseUrl}/${lang}/pages

${content.closing}

${content.footer}
www.sahakumkhmer.se
  `.trim()

  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: ${fontFamily}; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: white; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header with Sahakum Logo -->
          <tr>
            <td style="background-color: ${SAHAKUM_NAVY}; padding: 40px; border-bottom: 4px solid ${SAHAKUM_GOLD};">
              <!-- Horizontal layout: Logo left, Brand text right -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 120px; vertical-align: middle; padding-right: 0;">
                    <!-- Sahakum Logo Image -->
                    <img src="${LOGO_BASE64}" alt="Sahakum Khmer Logo" width="96" height="96" style="display: block;" />
                  </td>
                  <td style="vertical-align: middle; padding-left: 0;">
                    <!-- Brand Text - Swedish Brand style (stacked vertically) -->
                    <div>
                      <p style="margin: 0; color: white; font-size: 13px; font-weight: 500; letter-spacing: 1px; line-height: 1.2;">
                        ${lang === 'sv' ? 'SVERIGE' : lang === 'km' ? 'ស៊ុយអែត' : 'SWEDEN'}
                      </p>
                      <p style="margin: 2px 0 0 0; color: ${SAHAKUM_GOLD}; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; line-height: 1.2;">
                        ${lang === 'sv' ? 'SAHAKUM KHMER' : lang === 'km' ? 'សហគមន៍ខ្មែរ' : 'SAHAKUM KHMER'}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Badge -->
          <tr>
            <td style="padding: 32px 40px 0 40px;">
              <div style="background: linear-gradient(135deg, ${SAHAKUM_NAVY} 0%, #1a2847 100%); color: white; padding: 20px 24px; text-align: center; border-left: 4px solid ${SAHAKUM_GOLD};">
                <p style="margin: 0; font-size: 18px; font-weight: 600;">
                  ${lang === 'sv' ? 'Ansökan mottagen' : lang === 'km' ? 'បានទទួលពាក្យសុំ' : 'Application Received'}
                </p>
                <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
                  ${lang === 'sv' ? 'Referensnummer' : lang === 'km' ? 'លេខយោង' : 'Reference'}: <strong>${data.requestNumber}</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px;">

              <!-- Greeting -->
              <p style="margin: 0 0 24px 0; color: #333; font-size: 17px; line-height: 1.6;">
                ${content.greeting} <strong>${displayName}</strong>,
              </p>

              <!-- Thank You Message -->
              <p style="margin: 0 0 24px 0; color: #333; font-size: 16px; line-height: 1.6;">
                ${content.thankYou}
              </p>

              <!-- What Happens Next Section -->
              <div style="background-color: #f9f9f9; padding: 24px; border-left: 4px solid ${SAHAKUM_GOLD}; margin-bottom: 32px;">
                <h2 style="margin: 0 0 16px 0; color: ${SAHAKUM_NAVY}; font-size: 20px; font-weight: 600;">
                  ${content.whatHappensNext}
                </h2>
                <p style="margin: 0 0 12px 0; color: #333; font-size: 15px; line-height: 1.6;">
                  ${content.reviewProcess}
                </p>
                <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.6;">
                  <strong>${content.timeframe}</strong>
                </p>
              </div>

              <!-- Next Steps -->
              <div style="margin-bottom: 32px;">
                <h3 style="margin: 0 0 16px 0; color: ${SAHAKUM_NAVY}; font-size: 18px; font-weight: 600;">
                  ${content.nextSteps.title}
                </h3>
                <ul style="margin: 0; padding-left: 24px; color: #333; font-size: 15px; line-height: 1.8;">
                  ${content.nextSteps.items.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
                </ul>
              </div>

              <!-- CTA Buttons -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 8px;">
                    <a href="${baseUrl}/${lang}"
                       style="display: block; background-color: ${SAHAKUM_GOLD}; color: ${SAHAKUM_NAVY}; padding: 14px 24px; text-decoration: none; font-weight: 600; font-size: 15px; text-align: center;">
                      ${content.links.exploreWebsite} →
                    </a>
                  </td>
                  <td style="padding: 8px;">
                    <a href="${baseUrl}/${lang}/blog"
                       style="display: block; background-color: white; color: ${SAHAKUM_NAVY}; padding: 14px 24px; text-decoration: none; font-weight: 600; font-size: 15px; text-align: center; border: 2px solid ${SAHAKUM_NAVY};">
                      ${content.links.readBlog} →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Closing Message -->
              <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6; text-align: center; padding: 24px 0; border-top: 1px solid #e5e5e5;">
                <strong>${content.closing}</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 32px 40px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 12px 0; color: #666; font-size: 13px; line-height: 1.5; text-align: center;">
                ${content.footer}
              </p>
              <p style="margin: 0; text-align: center;">
                <a href="${baseUrl}" style="color: ${SAHAKUM_GOLD}; text-decoration: none; font-weight: 600; font-size: 14px;">
                  www.sahakumkhmer.se
                </a>
              </p>
              <p style="margin: 12px 0 0 0; color: #999; font-size: 12px; line-height: 1.5; text-align: center;">
                Sahakum Khmer - ${lang === 'sv' ? 'Svensk-kambodjanska föreningen i Sverige' : lang === 'km' ? 'សមាគមស៊ុយអែត-កម្ពុជានៅស៊ុយអែត' : 'Swedish-Cambodian Association in Sweden'}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  return { subject, html, text }
}

// Interface for approval email data
export interface ApprovalEmailData {
  firstName: string
  lastName: string
  khmerFirstName?: string
  khmerLastName?: string
  email: string
  requestNumber: string
  memberNumber?: string
  language?: 'en' | 'sv' | 'km'
  baseUrl?: string
}

// Generate approval notification email
export function generateApprovalEmail(data: ApprovalEmailData): { subject: string; html: string; text: string } {
  const lang = data.language || 'en'
  const content = EMAIL_CONTENT[lang].approval
  const fullName = `${data.firstName} ${data.lastName}`
  const khmerName = data.khmerFirstName && data.khmerLastName ? `${data.khmerFirstName} ${data.khmerLastName}` : null
  const baseUrl = data.baseUrl || 'https://www.sahakumkhmer.se'

  // Determine which name to display based on language
  const displayName = lang === 'km' && khmerName ? khmerName : fullName

  const fontFamily = lang === 'km'
    ? "'Noto Sans Khmer', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

  const subject = content.subject

  const text = `
${content.congratulations} ${displayName}!

${content.approved}

${lang === 'sv' ? 'Medlemsnummer' : lang === 'km' ? 'លេខសមាជិក' : 'Member Number'}: ${data.memberNumber || 'Will be assigned'}
${lang === 'sv' ? 'Referensnummer' : lang === 'km' ? 'លេខយោង' : 'Reference Number'}: ${data.requestNumber}

${content.nextSteps}

Sahakum Khmer
www.sahakumkhmer.se
  `.trim()

  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: ${fontFamily}; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: white; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: ${SAHAKUM_NAVY}; padding: 40px; border-bottom: 4px solid ${SAHAKUM_GOLD};">
              <!-- Horizontal layout: Logo left, Brand text right -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 120px; vertical-align: middle; padding-right: 0;">
                    <!-- Sahakum Logo Image -->
                    <img src="${LOGO_BASE64}" alt="Sahakum Khmer Logo" width="96" height="96" style="display: block;" />
                  </td>
                  <td style="vertical-align: middle; padding-left: 0;">
                    <!-- Brand Text - Swedish Brand style (stacked vertically) -->
                    <div>
                      <p style="margin: 0; color: white; font-size: 13px; font-weight: 500; letter-spacing: 1px; line-height: 1.2;">
                        ${lang === 'sv' ? 'SVERIGE' : lang === 'km' ? 'ស៊ុយអែត' : 'SWEDEN'}
                      </p>
                      <p style="margin: 2px 0 0 0; color: ${SAHAKUM_GOLD}; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; line-height: 1.2;">
                        ${lang === 'sv' ? 'SAHAKUM KHMER' : lang === 'km' ? 'សហគមន៍ខ្មែរ' : 'SAHAKUM KHMER'}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px 0 40px;">
              <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 20px 24px; text-align: center;">
                <p style="margin: 0; font-size: 22px; font-weight: 700;">${content.congratulations}!</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 24px 0; color: #333; font-size: 17px;">${content.congratulations} <strong>${displayName}</strong>,</p>
              <p style="margin: 0 0 32px 0; color: #333; font-size: 16px;">${content.approved}</p>
              <div style="background-color: #f9f9f9; padding: 24px; border-left: 4px solid ${SAHAKUM_GOLD}; margin-bottom: 32px;">
                ${data.memberNumber ? `<p style="margin: 0 0 8px 0;"><strong>${lang === 'sv' ? 'Medlemsnummer' : lang === 'km' ? 'លេខសមាជិក' : 'Member Number'}:</strong> ${data.memberNumber}</p>` : ''}
                <p style="margin: 0;"><strong>${lang === 'sv' ? 'Referensnummer' : lang === 'km' ? 'លេខយោង' : 'Reference'}:</strong> ${data.requestNumber}</p>
              </div>
              <p style="margin: 0 0 16px 0; color: ${SAHAKUM_NAVY}; font-size: 18px; font-weight: 600;">${content.nextSteps}</p>
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${baseUrl}/${lang}" style="display: inline-block; background-color: ${SAHAKUM_GOLD}; color: ${SAHAKUM_NAVY}; padding: 16px 32px; text-decoration: none; font-weight: 600; font-size: 16px;">${lang === 'sv' ? 'Besök vår webbplats' : lang === 'km' ? 'ទស្សនាគេហទំព័ររបស់យើង' : 'Visit Our Website'} →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f5f5f5; padding: 32px 40px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; text-align: center;"><a href="${baseUrl}" style="color: ${SAHAKUM_GOLD}; text-decoration: none; font-weight: 600;">www.sahakumkhmer.se</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  return { subject, html, text }
}

// Interface for member credentials email data
export interface MemberCredentialsEmailData {
  firstName: string
  lastName: string
  khmerFirstName?: string
  khmerLastName?: string
  email: string
  memberNumber: string
  temporaryPassword: string
  language?: 'en' | 'sv' | 'km'
  baseUrl?: string
}

// Generate member credentials email with login information
export function generateMemberCredentialsEmail(data: MemberCredentialsEmailData): { subject: string; html: string; text: string } {
  const lang = data.language || 'en'
  const content = EMAIL_CONTENT[lang].credentials
  const fullName = `${data.firstName} ${data.lastName}`
  const khmerName = data.khmerFirstName && data.khmerLastName ? `${data.khmerFirstName} ${data.khmerLastName}` : null
  const baseUrl = data.baseUrl || 'https://www.sahakumkhmer.se'
  const loginUrl = `${baseUrl}/${lang}/auth/signin`

  // Determine which name to display based on language
  const displayName = lang === 'km' && khmerName ? khmerName : fullName

  const fontFamily = lang === 'km'
    ? "'Noto Sans Khmer', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

  const subject = content.subject

  const text = `
${content.greeting} ${displayName},

${content.accountCreated}

${content.accessPortal}
${content.features.map((feature, i) => `${i + 1}. ${feature}`).join('\n')}

${content.credentials}:
${content.email}: ${data.email}
${content.tempPassword}: ${data.temporaryPassword}

${content.important}
${content.changePassword}

${content.loginButton}: ${loginUrl}

${content.needHelp} info@sahakumkhmer.se

${content.footer}
Sahakum Khmer
www.sahakumkhmer.se
  `.trim()

  const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: ${fontFamily}; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: white; border-collapse: collapse; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header with Sahakum Logo -->
          <tr>
            <td style="background-color: ${SAHAKUM_NAVY}; padding: 40px; border-bottom: 4px solid ${SAHAKUM_GOLD};">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 120px; vertical-align: middle; padding-right: 0;">
                    <img src="${LOGO_BASE64}" alt="Sahakum Khmer Logo" width="96" height="96" style="display: block;" />
                  </td>
                  <td style="vertical-align: middle; padding-left: 0;">
                    <div>
                      <p style="margin: 0; color: white; font-size: 13px; font-weight: 500; letter-spacing: 1px; line-height: 1.2;">
                        ${lang === 'sv' ? 'SVERIGE' : lang === 'km' ? 'ស៊ុយអែត' : 'SWEDEN'}
                      </p>
                      <p style="margin: 2px 0 0 0; color: ${SAHAKUM_GOLD}; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; line-height: 1.2;">
                        ${lang === 'sv' ? 'SAHAKUM KHMER' : lang === 'km' ? 'សហគមន៍ខ្មែរ' : 'SAHAKUM KHMER'}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome Badge -->
          <tr>
            <td style="padding: 32px 40px 0 40px;">
              <div style="background: linear-gradient(135deg, ${SAHAKUM_NAVY} 0%, #1a2847 100%); color: white; padding: 20px 24px; text-align: center; border-left: 4px solid ${SAHAKUM_GOLD};">
                <p style="margin: 0; font-size: 18px; font-weight: 600;">
                  ${lang === 'sv' ? 'Välkommen till Sahakum Khmer!' : lang === 'km' ? 'សូមស្វាគមន៍មកកាន់ Sahakum Khmer!' : 'Welcome to Sahakum Khmer!'}
                </p>
                <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
                  ${lang === 'sv' ? 'Medlemsnummer' : lang === 'km' ? 'លេខសមាជិក' : 'Member Number'}: <strong>${data.memberNumber}</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px;">

              <!-- Greeting -->
              <p style="margin: 0 0 24px 0; color: #333; font-size: 17px; line-height: 1.6;">
                ${content.greeting} <strong>${displayName}</strong>,
              </p>

              <!-- Account Created Message -->
              <p style="margin: 0 0 24px 0; color: #333; font-size: 16px; line-height: 1.6;">
                ${content.accountCreated}
              </p>

              <!-- Features Section -->
              <div style="background-color: #f9f9f9; padding: 24px; border-left: 4px solid ${SAHAKUM_GOLD}; margin-bottom: 32px;">
                <p style="margin: 0 0 16px 0; color: ${SAHAKUM_NAVY}; font-size: 16px; font-weight: 600;">
                  ${content.accessPortal}
                </p>
                <ul style="margin: 0; padding-left: 24px; color: #333; font-size: 15px; line-height: 1.8;">
                  ${content.features.map(feature => `<li style="margin-bottom: 8px;">${feature}</li>`).join('')}
                </ul>
              </div>

              <!-- Credentials Section -->
              <div style="background-color: #fffbea; padding: 24px; border: 2px solid ${SAHAKUM_GOLD}; margin-bottom: 24px;">
                <p style="margin: 0 0 16px 0; color: ${SAHAKUM_NAVY}; font-size: 18px; font-weight: 600; text-align: center;">
                  ${content.credentials}
                </p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px; background-color: white; border: 1px solid #e5e5e5; width: 40%; font-weight: 600; color: ${SAHAKUM_NAVY};">
                      ${content.email}
                    </td>
                    <td style="padding: 12px; background-color: white; border: 1px solid #e5e5e5; color: #333; font-family: 'Courier New', monospace;">
                      ${data.email}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px; background-color: white; border: 1px solid #e5e5e5; font-weight: 600; color: ${SAHAKUM_NAVY};">
                      ${content.tempPassword}
                    </td>
                    <td style="padding: 12px; background-color: white; border: 1px solid #e5e5e5; color: ${SAHAKUM_NAVY}; font-family: 'Courier New', monospace; font-size: 16px; font-weight: 700;">
                      ${data.temporaryPassword}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Security Warning -->
              <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #ef4444; margin-bottom: 32px;">
                <p style="margin: 0 0 12px 0; color: #991b1b; font-size: 16px; font-weight: 600;">
                  ${content.important}
                </p>
                <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                  ${content.changePassword}
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}"
                       style="display: inline-block; background-color: ${SAHAKUM_GOLD}; color: ${SAHAKUM_NAVY}; padding: 16px 32px; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 4px;">
                      ${content.loginButton} →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Help Section -->
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6; text-align: center; padding: 24px 0; border-top: 1px solid #e5e5e5;">
                ${content.needHelp} <a href="mailto:info@sahakumkhmer.se" style="color: ${SAHAKUM_GOLD}; text-decoration: none; font-weight: 600;">info@sahakumkhmer.se</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 32px 40px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 12px 0; color: #666; font-size: 13px; line-height: 1.5; text-align: center;">
                ${content.footer}
              </p>
              <p style="margin: 0; text-align: center;">
                <a href="${baseUrl}" style="color: ${SAHAKUM_GOLD}; text-decoration: none; font-weight: 600; font-size: 14px;">
                  www.sahakumkhmer.se
                </a>
              </p>
              <p style="margin: 12px 0 0 0; color: #999; font-size: 12px; line-height: 1.5; text-align: center;">
                Sahakum Khmer - ${lang === 'sv' ? 'Svensk-kambodjanska föreningen i Sverige' : lang === 'km' ? 'សមាគមស៊ុយអែត-កម្ពុជានៅស៊ុយអែត' : 'Swedish-Cambodian Association in Sweden'}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  return { subject, html, text }
}

// Interface for board voting notification email
export interface BoardVotingNotificationEmailData {
  boardMemberName: string
  applicantFirstName: string
  applicantLastName: string
  applicantKhmerFirstName?: string
  applicantKhmerLastName?: string
  applicantEmail: string
  requestNumber: string
  approvalThreshold: string
  totalBoardMembers: number
  requiredApprovals: number
  adminUrl: string
  baseUrl?: string
}

// Generate email notification for board members about voting requirement
export function generateBoardVotingNotificationEmail(data: BoardVotingNotificationEmailData): { subject: string; html: string; text: string } {
  const fullName = `${data.applicantFirstName} ${data.applicantLastName}`
  const khmerName = data.applicantKhmerFirstName && data.applicantKhmerLastName
    ? `${data.applicantKhmerFirstName} ${data.applicantKhmerLastName}`
    : null
  const baseUrl = data.baseUrl || 'https://www.sahakumkhmer.se'

  // Format threshold description
  const thresholdDescription = (() => {
    switch (data.approvalThreshold) {
      case 'UNANIMOUS':
        return `All ${data.totalBoardMembers} board members must approve`
      case 'MAJORITY':
        return `More than 50% (${data.requiredApprovals} of ${data.totalBoardMembers} board members)`
      case 'SIMPLE_MAJORITY':
        return `At least 50% (${data.requiredApprovals} of ${data.totalBoardMembers} board members)`
      case 'ANY_TWO':
        return `At least 2 board members`
      case 'SINGLE':
        return `At least 1 board member`
      default:
        return `${data.requiredApprovals} of ${data.totalBoardMembers} board members`
    }
  })()

  const subject = `Board Vote Required: ${fullName} - ${data.requestNumber}`

  const text = `
Board Vote Required: New Membership Application

Dear ${data.boardMemberName},

A new membership application has been submitted and requires your vote.

Applicant: ${fullName}${khmerName ? ` (${khmerName})` : ''}
Email: ${data.applicantEmail}
Request Number: ${data.requestNumber}

VOTING REQUIREMENT:
Approval Threshold: ${data.approvalThreshold}
Required Approvals: ${data.requiredApprovals} of ${data.totalBoardMembers} board members
${thresholdDescription}

Please review the application and cast your vote (Approve, Reject, or Abstain) in the admin panel:
${data.adminUrl}

Your vote is important for making membership decisions collectively as a board.

Sahakum Khmer
www.sahakumkhmer.se
  `.trim()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Board Vote Required</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: white; border-collapse: collapse;">

          <!-- Header with Sahakum Logo -->
          <tr>
            <td style="background-color: ${SAHAKUM_NAVY}; padding: 40px; border-bottom: 4px solid ${SAHAKUM_GOLD};">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 120px; vertical-align: middle; padding-right: 0;">
                    <img src="${LOGO_BASE64}" alt="Sahakum Khmer Logo" width="96" height="96" style="display: block;" />
                  </td>
                  <td style="vertical-align: middle; padding-left: 0;">
                    <div>
                      <p style="margin: 0; color: white; font-size: 13px; font-weight: 500; letter-spacing: 1px; line-height: 1.2;">
                        SWEDEN
                      </p>
                      <p style="margin: 2px 0 0 0; color: ${SAHAKUM_GOLD}; font-size: 16px; font-weight: 600; letter-spacing: 0.5px; line-height: 1.2;">
                        SAHAKUM KHMER
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert Badge -->
          <tr>
            <td style="padding: 40px 40px 0 40px;">
              <div style="background-color: #ef4444; color: white; padding: 12px 16px; font-weight: 600; font-size: 14px; text-align: center;">
                ⚠️ BOARD VOTE REQUIRED
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">

              <p style="margin: 0 0 24px 0; color: #333; font-size: 16px; line-height: 1.5;">
                Dear <strong>${data.boardMemberName}</strong>,
              </p>

              <p style="margin: 0 0 24px 0; color: #333; font-size: 16px; line-height: 1.5;">
                A new membership application has been submitted and requires your vote as a board member.
              </p>

              <!-- Applicant Details -->
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <td colspan="2" style="background-color: ${SAHAKUM_NAVY}; color: white; padding: 12px 16px; font-weight: 600; border-left: 4px solid ${SAHAKUM_GOLD};">
                    Applicant Information
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9f9f9; font-weight: 600; color: ${SAHAKUM_NAVY}; width: 40%; border-bottom: 1px solid #e5e5e5;">
                    Name
                  </td>
                  <td style="padding: 12px 16px; background-color: white; color: #333; border-bottom: 1px solid #e5e5e5;">
                    ${fullName}${khmerName ? `<br><span style="color: #666; font-size: 14px;">${khmerName}</span>` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9f9f9; font-weight: 600; color: ${SAHAKUM_NAVY}; border-bottom: 1px solid #e5e5e5;">
                    Email
                  </td>
                  <td style="padding: 12px 16px; background-color: white; color: #333; border-bottom: 1px solid #e5e5e5;">
                    <a href="mailto:${data.applicantEmail}" style="color: ${SAHAKUM_GOLD}; text-decoration: none;">${data.applicantEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #f9f9f9; font-weight: 600; color: ${SAHAKUM_NAVY};">
                    Request Number
                  </td>
                  <td style="padding: 12px 16px; background-color: white; color: #333;">
                    ${data.requestNumber}
                  </td>
                </tr>
              </table>

              <!-- Voting Requirements -->
              <div style="background-color: #eff6ff; padding: 24px; border-left: 4px solid #3b82f6; margin-bottom: 32px;">
                <p style="margin: 0 0 16px 0; font-weight: 600; color: #1e40af; font-size: 17px;">
                  Voting Requirements
                </p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #1e3a8a; font-weight: 600; width: 50%;">
                      Approval Threshold:
                    </td>
                    <td style="padding: 8px 0; color: #1e3a8a;">
                      ${data.approvalThreshold}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #1e3a8a; font-weight: 600;">
                      Required Approvals:
                    </td>
                    <td style="padding: 8px 0; color: #1e3a8a;">
                      ${data.requiredApprovals} of ${data.totalBoardMembers} board members
                    </td>
                  </tr>
                </table>
                <p style="margin: 16px 0 0 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                  <em>${thresholdDescription}</em>
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${data.adminUrl}"
                       style="display: inline-block; background-color: ${SAHAKUM_GOLD}; color: ${SAHAKUM_NAVY}; padding: 16px 32px; text-decoration: none; font-weight: 600; font-size: 16px; border: none;">
                      Review & Vote →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5; text-align: center;">
                Your vote is important for making membership decisions collectively as a board.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 24px 40px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.5; text-align: center;">
                This is an automated notification from Sahakum Khmer.<br>
                <a href="https://www.sahakumkhmer.se" style="color: ${SAHAKUM_GOLD}; text-decoration: none;">www.sahakumkhmer.se</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  return { subject, html, text }
}
