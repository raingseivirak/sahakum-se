import nodemailer from 'nodemailer'

// Email configuration
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
}

// Create reusable transporter
export const createEmailTransporter = () => {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('Email configuration missing. Email notifications disabled.')
    return null
  }

  return nodemailer.createTransport(emailConfig)
}

// Send email utility
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[]
  subject: string
  html: string
  text?: string
}) {
  const transporter = createEmailTransporter()

  if (!transporter) {
    console.warn('Email transporter not configured. Skipping email send.')
    return { success: false, error: 'Email not configured' }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Sahakum Khmer" <${process.env.EMAIL_FROM}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text: text || subject,
      html,
    })

    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Email verification (for testing)
export async function verifyEmailConfig() {
  const transporter = createEmailTransporter()

  if (!transporter) {
    return { success: false, error: 'Email not configured' }
  }

  try {
    await transporter.verify()
    return { success: true }
  } catch (error) {
    console.error('Email configuration verification failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
