import { NextRequest, NextResponse } from 'next/server'
import {
  generateApplicantWelcomeEmail,
  generateApprovalEmail,
  generateNewMembershipRequestEmail,
  getEmailBaseUrl,
  type ApplicantWelcomeEmailData,
  type ApprovalEmailData,
  type MembershipRequestEmailData
} from '@/lib/email-templates'

// Sample data for preview
const SAMPLE_APPLICANT_DATA: ApplicantWelcomeEmailData = {
  firstName: 'Sopheak',
  lastName: 'Chan',
  khmerFirstName: 'សូភាគ',
  khmerLastName: 'ចាន់',
  email: 'sopheak.chan@example.com',
  requestNumber: 'REQ-2025-001',
  language: 'en'
}

const SAMPLE_APPROVAL_DATA: ApprovalEmailData = {
  firstName: 'Sopheak',
  lastName: 'Chan',
  khmerFirstName: 'សូភាគ',
  khmerLastName: 'ចាន់',
  email: 'sopheak.chan@example.com',
  requestNumber: 'REQ-2025-001',
  memberNumber: 'MEM-2025-042',
  language: 'en'
}

const SAMPLE_BOARD_DATA: Omit<MembershipRequestEmailData, 'adminUrl'> = {
  firstName: 'Sopheak',
  lastName: 'Chan',
  khmerFirstName: 'សូភាគ',
  khmerLastName: 'ចាន់',
  email: 'sopheak.chan@example.com',
  phone: '+46 70 123 4567',
  address: 'Vasagatan 12',
  city: 'Stockholm',
  postalCode: '111 20',
  residenceStatus: 'PERMANENT_RESIDENT',
  motivation: 'I would like to join Sahakum Khmer to connect with the Swedish-Cambodian community, participate in cultural events, and contribute to preserving Cambodian heritage in Sweden. I have been living in Stockholm for 5 years and am passionate about building bridges between our communities.',
  requestId: 'cmfky6vpn0000l08j4i3a0751'
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const template = searchParams.get('template') || 'welcome'
    const language = searchParams.get('language') || 'en'

    // Resolve through the canonical helper. This intentionally ignores the request host
    // so previewing from a Vercel preview deployment doesn't bake `*.vercel.app` URLs
    // into rendered emails — admins should always see exactly what real recipients get.
    const baseUrl = getEmailBaseUrl()

    let emailHtml: string

    switch (template) {
      case 'welcome': {
        const data: ApplicantWelcomeEmailData = {
          ...SAMPLE_APPLICANT_DATA,
          language: language as 'en' | 'sv' | 'km',
          baseUrl
        }
        const email = generateApplicantWelcomeEmail(data)
        emailHtml = email.html
        break
      }

      case 'approval': {
        const data: ApprovalEmailData = {
          ...SAMPLE_APPROVAL_DATA,
          language: language as 'en' | 'sv' | 'km',
          baseUrl
        }
        const email = generateApprovalEmail(data)
        emailHtml = email.html
        break
      }

      case 'board': {
        // Board notification is always in English
        const data: MembershipRequestEmailData = {
          ...SAMPLE_BOARD_DATA,
          adminUrl: `${baseUrl}/en/admin/membership-requests/${SAMPLE_BOARD_DATA.requestId}`
        }
        const email = generateNewMembershipRequestEmail(data)
        emailHtml = email.html
        break
      }

      default: {
        return NextResponse.json(
          { error: 'Invalid template type. Use: welcome, approval, or board' },
          { status: 400 }
        )
      }
    }

    // Return HTML response with headers that allow iframe embedding
    return new NextResponse(emailHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Frame-Options': 'SAMEORIGIN', // Allow iframe from same origin
        'Content-Security-Policy': "frame-ancestors 'self'" // Modern alternative to X-Frame-Options
      }
    })
  } catch (error) {
    console.error('Email preview error:', error)
    return NextResponse.json(
      { error: 'Failed to generate email preview' },
      { status: 500 }
    )
  }
}