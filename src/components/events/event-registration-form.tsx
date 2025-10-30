'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface EventRegistrationFormProps {
  eventId: string
  eventSlug: string
  registrationType: 'PUBLIC' | 'MEMBERS_ONLY' | null
  locale: string
}

export function EventRegistrationForm({
  eventId,
  eventSlug,
  registrationType,
  locale,
}: EventRegistrationFormProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  const [formData, setFormData] = useState({
    guestFirstName: '',
    guestLastName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 1,
    notes: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const translations: { [key: string]: any } = {
    sv: {
      firstName: 'Förnamn',
      lastName: 'Efternamn',
      email: 'E-post',
      phone: 'Telefon',
      numberOfGuests: 'Antal gäster',
      notes: 'Anteckningar',
      notesPlaceholder: 'Eventuell information eller specialkrav',
      submit: 'Skicka anmälan',
      submitting: 'Skickar...',
      success: 'Din anmälan har tagits emot!',
      successMessage: 'Vi ser fram emot att träffa dig på evenemanget.',
      loginRequired: 'Du måste logga in för att anmäla dig',
      loginButton: 'Logga in',
      membersOnlyMessage: 'Detta evenemang är endast för medlemmar.',
      phonePlaceholder: 'Valfritt',
      includesYourself: 'Inkluderar dig själv',
      alreadyRegistered: 'Du har redan anmält dig till detta evenemang',
      fillThisField: 'Vänligen fyll i detta fält',
    },
    en: {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      numberOfGuests: 'Number of Guests',
      notes: 'Notes',
      notesPlaceholder: 'Any additional information or special requirements',
      submit: 'Submit Registration',
      submitting: 'Submitting...',
      success: 'Your registration has been received!',
      successMessage: 'We look forward to seeing you at the event.',
      loginRequired: 'You must log in to register',
      loginButton: 'Log In',
      membersOnlyMessage: 'This event is for members only.',
      phonePlaceholder: 'Optional',
      includesYourself: 'Includes yourself',
      alreadyRegistered: 'You have already registered for this event',
      fillThisField: 'Please fill in this field',
    },
    km: {
      firstName: 'នាមខ្លួន',
      lastName: 'នាមត្រកូល',
      email: 'អ៊ីមែល',
      phone: 'លេខទូរស័ព្ទ',
      numberOfGuests: 'ចំនួនភ្ញៀវ',
      notes: 'កំណត់ចំណាំ',
      notesPlaceholder: 'ព័ត៌មានបន្ថែម ឬតម្រូវការពិសេស',
      submit: 'ដាក់ពាក្យចុះឈ្មោះ',
      submitting: 'កំពុងដាក់ពាក្យ...',
      success: 'ការចុះឈ្មោះរបស់អ្នកត្រូវបានទទួល!',
      successMessage: 'យើងរង់ចាំជួបអ្នកនៅព្រឹត្តិការណ៍',
      loginRequired: 'អ្នកត្រូវតែចូលគណនីដើម្បីចុះឈ្មោះ',
      loginButton: 'ចូលគណនី',
      membersOnlyMessage: 'ព្រឹត្តិការណ៍នេះសម្រាប់តែសមាជិកប៉ុណ្ណោះ',
      phonePlaceholder: 'ស្រេចចិត្ត',
      includesYourself: 'រួមបញ្ចូលអ្នក',
      alreadyRegistered: 'អ្នកបានចុះឈ្មោះសម្រាប់ព្រឹត្តិការណ៍នេះរួចហើយ',
      fillThisField: 'សូមបំពេញវាលនេះ',
    },
  }

  const t = translations[locale] || translations.en

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const registrationData: any = {
        numberOfGuests: parseInt(formData.numberOfGuests.toString()),
        notes: formData.notes || undefined,
      }

      // If user is logged in, use user registration
      if (session?.user?.id) {
        registrationData.userId = session.user.id
      } else {
        // Guest registration
        registrationData.guestFirstName = formData.guestFirstName
        registrationData.guestLastName = formData.guestLastName
        registrationData.guestEmail = formData.guestEmail
        registrationData.guestPhone = formData.guestPhone || undefined
      }

      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register')
      }

      setSuccess(true)
      setFormData({
        guestFirstName: '',
        guestLastName: '',
        guestEmail: '',
        guestPhone: '',
        numberOfGuests: 1,
        notes: '',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      // Translate common error messages
      if (errorMessage.toLowerCase().includes('already registered')) {
        setError(t.alreadyRegistered)
      } else {
        setError(errorMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Members-only check
  if (registrationType === 'MEMBERS_ONLY' && status === 'unauthenticated') {
    return (
      <Alert className={fontClass}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className={fontClass}>
          <p className={`mb-2 ${fontClass}`}>{t.membersOnlyMessage}</p>
          <p className={`mb-4 ${fontClass}`}>{t.loginRequired}</p>
          <Button asChild size="sm" className={fontClass}>
            <Link href={`/${locale}/auth/signin?callbackUrl=/${locale}/events/${eventSlug}%23register`}>
              {t.loginButton}
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Success message
  if (success) {
    return (
      <div className={`border-2 border-[var(--sahakum-gold)] bg-white p-6 ${fontClass}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-[var(--sahakum-gold)] flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-[var(--sahakum-navy)]" />
            </div>
          </div>
          <div className="flex-1">
            <p className={`font-bold text-[var(--sahakum-navy)] text-lg mb-2 ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}>
              {t.success}
            </p>
            <p className={`text-[var(--sahakum-navy)]/80 ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}>
              {t.successMessage}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className={`flex items-center justify-center py-8 ${fontClass}`}>
        <Loader2 className="h-6 w-6 animate-spin text-sahakum-navy" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${fontClass}`}>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={fontClass}>{error}</AlertDescription>
        </Alert>
      )}

      {/* Guest registration fields (only show if not logged in) */}
      {!session?.user && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="guestFirstName"
                className={`block text-sm font-medium text-[var(--sahakum-navy)] ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
              >
                {t.firstName} *
              </label>
              <input
                id="guestFirstName"
                type="text"
                required
                value={formData.guestFirstName}
                onChange={(e) => {
                  setFormData({ ...formData, guestFirstName: e.target.value })
                  e.target.setCustomValidity('')
                }}
                onInvalid={(e) => {
                  e.currentTarget.setCustomValidity(t.fillThisField)
                }}
                className={`w-full px-3 py-2 border border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)] focus:outline-none transition-colors ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="guestLastName"
                className={`block text-sm font-medium text-[var(--sahakum-navy)] ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
              >
                {t.lastName} *
              </label>
              <input
                id="guestLastName"
                type="text"
                required
                value={formData.guestLastName}
                onChange={(e) => {
                  setFormData({ ...formData, guestLastName: e.target.value })
                  e.target.setCustomValidity('')
                }}
                onInvalid={(e) => {
                  e.currentTarget.setCustomValidity(t.fillThisField)
                }}
                className={`w-full px-3 py-2 border border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)] focus:outline-none transition-colors ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="guestEmail"
              className={`block text-sm font-medium text-[var(--sahakum-navy)] ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
            >
              {t.email} *
            </label>
            <input
              id="guestEmail"
              type="email"
              required
              value={formData.guestEmail}
              onChange={(e) => {
                setFormData({ ...formData, guestEmail: e.target.value })
                e.target.setCustomValidity('')
              }}
              onInvalid={(e) => {
                e.currentTarget.setCustomValidity(t.fillThisField)
              }}
              className={`w-full px-3 py-2 border border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)] focus:outline-none transition-colors ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="guestPhone"
              className={`block text-sm font-medium text-[var(--sahakum-navy)] ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
            >
              {t.phone}
            </label>
            <input
              id="guestPhone"
              type="tel"
              placeholder={t.phonePlaceholder}
              value={formData.guestPhone}
              onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
              className={`w-full px-3 py-2 border border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)] focus:outline-none transition-colors ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
            />
          </div>
        </>
      )}

      {/* Number of guests */}
      <div className="space-y-2">
        <label
          htmlFor="numberOfGuests"
          className={`block text-sm font-medium text-[var(--sahakum-navy)] ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
        >
          {t.numberOfGuests}
        </label>
        <input
          id="numberOfGuests"
          type="number"
          min="1"
          max="10"
          required
          value={formData.numberOfGuests}
          onChange={(e) => {
            setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) || 1 })
            e.target.setCustomValidity('')
          }}
          onInvalid={(e) => {
            e.currentTarget.setCustomValidity(t.fillThisField)
          }}
          className={`w-full px-3 py-2 border border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)] focus:outline-none transition-colors ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
        />
        <p className={`text-sm text-[var(--sahakum-navy)]/70 ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}>
          {t.includesYourself}
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label
          htmlFor="notes"
          className={`block text-sm font-medium text-[var(--sahakum-navy)] ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
        >
          {t.notes}
        </label>
        <textarea
          id="notes"
          placeholder={t.notesPlaceholder}
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className={`w-full px-3 py-2 border border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)] focus:outline-none transition-colors resize-none ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
        />
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={submitting}
        className={`w-full bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 text-[var(--sahakum-navy)] font-bold text-base py-6 ${fontClass}`}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {t.submitting}
          </>
        ) : (
          t.submit
        )}
      </Button>
    </form>
  )
}
