import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { sendEmail } from '@/lib/email'
import { generateRegistrationWelcomeEmail } from '@/lib/email-templates'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeGmail(email: string): string {
  const [local, domain] = email.toLowerCase().split('@')
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return `${local.replace(/\./g, '')}@${domain}`
  }
  return email.toLowerCase()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, language } = body

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'ALL_FIELDS_REQUIRED' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'INVALID_EMAIL' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'PASSWORD_TOO_SHORT' },
        { status: 400 }
      )
    }

    // Check if email already exists (with Gmail dot-variant normalization)
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'EMAIL_TAKEN' },
        { status: 409 }
      )
    }

    // Gmail normalization check
    const normalized = normalizeGmail(trimmedEmail)
    if (normalized !== trimmedEmail) {
      const gmailUsers = await prisma.user.findMany({
        where: {
          OR: [
            { email: { endsWith: '@gmail.com' } },
            { email: { endsWith: '@googlemail.com' } },
          ],
        },
        select: { email: true },
      })
      const match = gmailUsers.find((u) => normalizeGmail(u.email) === normalized)
      if (match) {
        return NextResponse.json(
          { error: 'EMAIL_TAKEN' },
          { status: 409 }
        )
      }
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        role: 'USER',
      },
      select: { id: true, email: true },
    })

    // Link to existing Member record if one matches by email
    const member = await prisma.member.findFirst({
      where: { email: trimmedEmail, userId: null },
    })
    if (member) {
      await prisma.member.update({
        where: { id: member.id },
        data: { userId: user.id },
      })
    }

    // Send welcome email (non-blocking — don't fail registration if email fails)
    const validLang = ['en', 'sv', 'km'].includes(language) ? language : 'en'
    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.sahakumkhmer.se'

    try {
      const welcomeEmail = generateRegistrationWelcomeEmail({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: trimmedEmail,
        language: validLang as 'en' | 'sv' | 'km',
        baseUrl,
      })

      await sendEmail({
        to: trimmedEmail,
        subject: welcomeEmail.subject,
        html: welcomeEmail.html,
        text: welcomeEmail.text,
      })

      console.log(`Registration welcome email sent to: ${trimmedEmail} (${validLang})`)
    } catch (emailError) {
      console.error('Failed to send registration welcome email:', emailError)
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'REGISTRATION_FAILED' },
      { status: 500 }
    )
  }
}
