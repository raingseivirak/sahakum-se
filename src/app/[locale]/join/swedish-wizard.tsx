"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CheckCircle, Home, Mail, Calendar, Users } from "lucide-react"
import Link from "next/link"

interface SwedishWizardProps {
  locale: string
  initialData?: {
    firstName?: string
    lastName?: string
    email?: string
  }
}

const translations = {
  en: {
    steps: {
      personal: "Personal Information",
      address: "Address & Residence",
      application: "Application & Membership"
    },
    fields: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      address: "Address",
      city: "City",
      postalCode: "Postal Code",
      residenceStatus: "Residence Status",
      motivation: "Why do you want to join Sahakum Khmer?"
    },
    placeholders: {
      selectStatus: "Select your status",
      motivation: "Tell us about your motivation for joining our community..."
    },
    options: {
      STUDENT: "Student",
      WORK_PERMIT: "Work Permit",
      PERMANENT_RESIDENT: "Permanent Resident",
      CITIZEN: "Swedish Citizen",
      EU_CITIZEN: "EU Citizen",
      OTHER: "Other"
    },
    validation: {
      minChars: "Minimum 10 characters",
      required: "This field is required",
      invalidEmail: "Please enter a valid email address",
      invalidPostal: "Please enter a valid Swedish postal code (5 digits)",
      tooShort: "Too short - minimum 2 characters",
      motivationShort: "Please provide at least 10 characters"
    },
    errors: {
      emailExists: "An application with this email address already exists. Please contact us if you need to update your application.",
      networkError: "Network error. Please check your connection and try again.",
      submitFailed: "Failed to submit application. Please try again.",
      serverError: "Server error. Please try again later."
    },
    success: {
      title: "Application Submitted Successfully!",
      subtitle: "Welcome to the Sahakum Khmer Community",
      message: "Thank you for your interest in joining Sahakum Khmer. We have received your membership application and will review it shortly.",
      nextSteps: {
        title: "What happens next?",
        steps: [
          "We'll review your application within 5-7 business days",
          "A board member will contact you via email to verify details",
          "Once approved, you'll receive your membership confirmation"
        ]
      },
      contact: {
        title: "Questions?",
        description: "If you have any questions, feel free to contact us at",
        email: "contact.sahakumkhmer.se@gmail.com"
      },
      actions: {
        home: "Return to Homepage",
        learn: "Learn More About Us"
      }
    },
    step: "Step",
    of: "of",
    next: "Next",
    previous: "Previous",
    submit: "Submit Application"
  },
  sv: {
    steps: {
      personal: "Personlig information",
      address: "Adress & uppehåll",
      application: "Ansökan & medlemskap"
    },
    fields: {
      firstName: "Förnamn",
      lastName: "Efternamn",
      email: "E-postadress",
      address: "Adress",
      city: "Stad",
      postalCode: "Postnummer",
      residenceStatus: "Uppehållsstatus",
      motivation: "Varför vill du gå med i Sahakum Khmer?"
    },
    placeholders: {
      selectStatus: "Välj din status",
      motivation: "Berätta om din motivation för att gå med i vår förening..."
    },
    options: {
      STUDENT: "Student",
      WORK_PERMIT: "Arbetstillstånd",
      PERMANENT_RESIDENT: "Permanent uppehållstillstånd",
      CITIZEN: "Svensk medborgare",
      EU_CITIZEN: "EU-medborgare",
      OTHER: "Annat"
    },
    validation: {
      minChars: "Minst 10 tecken",
      required: "Detta fält är obligatoriskt",
      invalidEmail: "Vänligen ange en giltig e-postadress",
      invalidPostal: "Vänligen ange ett giltigt svenskt postnummer (5 siffror)",
      tooShort: "För kort - minst 2 tecken",
      motivationShort: "Vänligen ange minst 10 tecken"
    },
    errors: {
      emailExists: "En ansökan med denna e-postadress finns redan. Kontakta oss om du behöver uppdatera din ansökan.",
      networkError: "Nätverksfel. Kontrollera din anslutning och försök igen.",
      submitFailed: "Det gick inte att skicka ansökan. Försök igen.",
      serverError: "Serverfel. Försök igen senare."
    },
    success: {
      title: "Ansökan skickad framgångsrikt!",
      subtitle: "Välkommen till Sahakum Khmer-gemenskapen",
      message: "Tack för ditt intresse för att gå med i Sahakum Khmer. Vi har tagit emot din medlemsansökan och kommer att granska den inom kort.",
      nextSteps: {
        title: "Vad händer härnäst?",
        steps: [
          "Vi kommer att granska din ansökan inom 5-7 arbetsdagar",
          "En styrelsemedlem kommer att kontakta dig via e-post för att verifiera detaljer",
          "När du godkänts får du din medlemsbekräftelse"
        ]
      },
      contact: {
        title: "Frågor?",
        description: "Om du har några frågor, tveka inte att kontakta oss på",
        email: "contact.sahakumkhmer.se@gmail.com"
      },
      actions: {
        home: "Återgå till startsidan",
        learn: "Läs mer om oss"
      }
    },
    step: "Steg",
    of: "av",
    next: "Nästa",
    previous: "Föregående",
    submit: "Skicka ansökan"
  },
  km: {
    steps: {
      personal: "ព័ត៌មានផ្ទាល់ខ្លួន",
      address: "អាសយដ្ឋាន និងលំនៅ",
      application: "ពាក្យសុំ និងសមាជិកភាព"
    },
    fields: {
      firstName: "ឈ្មោះដំបូង",
      lastName: "នាមត្រកូល",
      email: "អាសយដ្ឋានអ៊ីមែល",
      address: "អាសយដ្ឋាន",
      city: "ក្រុង",
      postalCode: "លេខប្រៃសណីយ៍",
      residenceStatus: "ស្ថានភាពលំនៅ",
      motivation: "ហេតុអ្វីបានជាអ្នកចង់ចូលរួមជាមួយសហគមន៍ខ្មែរ?"
    },
    placeholders: {
      selectStatus: "ជ្រើសរើសស្ថានភាពរបស់អ្នក",
      motivation: "ប្រាប់យើងអំពីចិត្តសម្ម៉ុករបស់អ្នកក្នុងការចូលរួមជាមួយសហគមន៍របស់យើង..."
    },
    options: {
      STUDENT: "និស្សិត",
      WORK_PERMIT: "ធ្វើការ",
      PERMANENT_RESIDENT: "អាស្រ័យលំនៅអចិន្ត្រៃយ៍",
      CITIZEN: "ពលរដ្ឋស៊ុយអែត",
      EU_CITIZEN: "ពលរដ្ឋអឺរ៉ុប",
      OTHER: "ផ្សេងទៀត"
    },
    validation: {
      minChars: "យ៉ាងតិច ១០ តួអក្សរ",
      required: "វាលនេះត្រូវតែបំពេញ",
      invalidEmail: "សូមបញ្ចូលអាសយដ្ឋានអ៊ីមែលដែលត្រឹមត្រូវ",
      invalidPostal: "សូមបញ្ចូលលេខប្រៃសណីយ៍ស៊ុយអែតដែលត្រឹមត្រូវ (៥ ខ្ទង់)",
      tooShort: "ខ្លីពេក - យ៉ាងតិច ២ តួអក្សរ",
      motivationShort: "សូមផ្តល់យ៉ាងតិច ១០ តួអក្សរ"
    },
    errors: {
      emailExists: "ពាក្យសុំជាមួយអាសយដ្ឋានអ៊ីមែលនេះមានរួចហើយ។ សូមទាក់ទងយើងប្រសិនបើអ្នកត្រូវការកែប្រែពាក្យសុំរបស់អ្នក។",
      networkError: "កំហុសបណ្តាញ។ សូមពិនិត្យការតភ្ជាប់របស់អ្នក ហើយព្យាយាមម្តងទៀត។",
      submitFailed: "បរាជ័យក្នុងការដាក់ពាក្យសុំ។ សូមព្យាយាមម្តងទៀត។",
      serverError: "កំហុសម៉ាស៊ីនបម្រើ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ។"
    },
    success: {
      title: "ពាក្យសុំត្រូវបានដាក់ដោយជោគជ័យ!",
      subtitle: "សូមស្វាគមន៍មកកាន់សហគមន៍ខ្មែរ",
      message: "សូមអរគុណចំពោះការចាប់អារម្មណ៍របស់អ្នកក្នុងការចូលរួមជាមួយសហគមន៍ខ្មែរ។ យើងបានទទួលពាក្យសុំសមាជិកភាពរបស់អ្នកហើយ នឹងពិនិត្យវាក្នុងពេលឆាប់ៗនេះ។",
      nextSteps: {
        title: "អ្វីដែលកើតឡើងបន្ទាប់?",
        steps: [
          "យើងនឹងពិនិត្យពាក្យសុំរបស់អ្នកក្នុងរយៈពេល ៥-៧ ថ្ងៃធ្វើការ",
          "សមាជិកក្រុមប្រឹក្សាភិបាលនឹងទាក់ទងអ្នកតាមអ៊ីមែលដើម្បីផ្ទៀងផ្ទាត់ព័ត៌មានលម្អិត",
          "នៅពេលដែលត្រូវបានអនុម័ត អ្នកនឹងទទួលបានការបញ្ជាក់សមាជិកភាពរបស់អ្នក"
        ]
      },
      contact: {
        title: "មានសំណួរ?",
        description: "ប្រសិនបើអ្នកមានសំណួរណាមួយ សូមកុំទាក់ទាក់ទងយើងតាម",
        email: "contact.sahakumkhmer.se@gmail.com"
      },
      actions: {
        home: "ត្រលប់ទៅទំព័រដើម",
        learn: "ស្វែងយល់បន្ថែមអំពីយើង"
      }
    },
    step: "ជំហាន",
    of: "នៃ",
    next: "បន្ទាប់",
    previous: "មុន",
    submit: "ដាក់ពាក្យសុំ"
  }
}

export function SwedishWizard({ locale, initialData }: SwedishWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    address: "",
    city: "",
    postalCode: "",
    residenceStatus: "",
    motivation: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitError, setSubmitError] = useState<string>('')

  const totalSteps = 3
  const t = translations[locale as keyof typeof translations] || translations.en

  // Validation functions
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return t.validation.required
        if (value.trim().length < 2) return t.validation.tooShort
        return ''
      case 'email':
        if (!value.trim()) return t.validation.required
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return t.validation.invalidEmail
        return ''
      case 'address':
        // Address is optional, but if provided must be at least 2 chars
        if (value.trim() && value.trim().length < 2) return t.validation.tooShort
        return ''
      case 'city':
        if (!value.trim()) return t.validation.required
        if (value.trim().length < 2) return t.validation.tooShort
        return ''
      case 'postalCode':
        // Postal code is optional, but if provided must be valid Swedish format
        if (value.trim()) {
          const postalRegex = /^\d{5}$/
          if (!postalRegex.test(value)) return t.validation.invalidPostal
        }
        return ''
      case 'residenceStatus':
        if (!value) return t.validation.required
        return ''
      case 'motivation':
        if (!value.trim()) return t.validation.required
        if (value.trim().length < 10) return t.validation.motivationShort
        return ''
      default:
        return ''
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Real-time validation
    if (touched[field]) {
      const error = validateField(field, value)
      setErrors(prev => ({ ...prev, [field]: error }))
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field as keyof typeof formData])
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    const getCurrentStepFields = () => {
      switch (currentStep) {
        case 1:
          return ['firstName', 'lastName', 'email']
        case 2:
          // Only city and residenceStatus are required; address and postalCode are optional
          return ['city', 'residenceStatus']
        case 3:
          return ['motivation']
        default:
          return []
      }
    }

    const fields = getCurrentStepFields()

    // Check if all fields have values and no errors
    const hasValues = fields.every(field => formData[field as keyof typeof formData]?.trim())
    const hasErrors = fields.some(field => errors[field])

    return hasValues && !hasErrors
  }

  const getTranslatedError = (error: string): string => {
    // Check for specific error patterns and return translated message
    if (error.toLowerCase().includes('email') && error.toLowerCase().includes('already exists')) {
      return t.errors.emailExists
    }
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('connection')) {
      return t.errors.networkError
    }
    if (error.toLowerCase().includes('server') || error.toLowerCase().includes('internal')) {
      return t.errors.serverError
    }
    // Default fallback
    return t.errors.submitFailed
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      // Include preferred language based on current locale
      const submissionData = {
        ...formData,
        preferredLanguage: locale as 'en' | 'sv' | 'km'
      }

      const response = await fetch("/api/membership-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const errorData = await response.json()
        const serverError = errorData.error || "Failed to submit application"
        const translatedError = getTranslatedError(serverError)
        setSubmitError(translatedError)
      }
    } catch (error) {
      console.error("Error submitting application:", error)
      setSubmitError(t.errors.networkError)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success Page
  if (isSubmitted) {
    return (
      <div className="space-y-8">
        {/* Success Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-[var(--sahakum-gold)] flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-[var(--sahakum-navy)]" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[var(--sahakum-navy)] mb-4">
            {t.success.title}
          </h2>
          <p className="text-xl text-[var(--sahakum-gold)] font-medium mb-6">
            {t.success.subtitle}
          </p>
          <p className="text-[var(--sahakum-navy)]/80 max-w-2xl mx-auto leading-relaxed">
            {t.success.message}
          </p>
        </div>

        {/* Next Steps Section */}
        <div className="bg-white p-8 border border-[var(--sahakum-gold)]/30 shadow-lg">
          <h3 className="text-xl font-semibold text-[var(--sahakum-navy)] mb-6 flex items-center">
            <Calendar className="h-5 w-5 text-[var(--sahakum-gold)] mr-3" />
            {t.success.nextSteps.title}
          </h3>
          <ol className="space-y-4">
            {t.success.nextSteps.steps.map((step, index) => (
              <li key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)] flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                </div>
                <p className="text-[var(--sahakum-navy)]/80 font-medium pt-1">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Contact Information */}
        <div className="bg-[var(--sahakum-navy)] text-white p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-[var(--sahakum-gold)] flex items-center justify-center">
                <Mail className="h-6 w-6 text-[var(--sahakum-navy)]" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-1">{t.success.contact.title}</h4>
              <p className="text-white/90 text-sm mb-2">{t.success.contact.description}</p>
              <a
                href={`mailto:${t.success.contact.email}`}
                className="text-[var(--sahakum-gold)] font-medium hover:text-[var(--sahakum-gold)]/80 transition-colors"
              >
                {t.success.contact.email}
              </a>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href={`/${locale}`}
            className="flex items-center justify-center gap-2 bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 text-[var(--sahakum-navy)] px-6 py-3 font-medium transition-colors"
          >
            <Home className="h-5 w-5" />
            {t.success.actions.home}
          </Link>
          <Link
            href={`/${locale}/about-us`}
            className="flex items-center justify-center gap-2 border border-[var(--sahakum-navy)]/30 text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)]/5 px-6 py-3 font-medium transition-colors"
          >
            <Users className="h-5 w-5" />
            {t.success.actions.learn}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Swedish Progress Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--sahakum-navy)]/70">
            {t.step} {currentStep} {t.of} {totalSteps}
          </span>
          <span className="text-sm font-medium text-[var(--sahakum-navy)]">
            {currentStep === 1 && t.steps.personal}
            {currentStep === 2 && t.steps.address}
            {currentStep === 3 && t.steps.application}
          </span>
        </div>
        <div className="w-full bg-[var(--sahakum-navy)]/10 h-2">
          <div
            className="bg-[var(--sahakum-gold)] h-2 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {currentStep === 1 && (
          <div className="border border-[var(--sahakum-navy)]/20 bg-white">
            <div className="bg-[var(--sahakum-navy)] text-white p-6">
              <h3 className="text-lg font-semibold">{t.steps.personal}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--sahakum-navy)] mb-2">
                    {t.fields.firstName} *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    onBlur={() => handleBlur("firstName")}
                    className={`w-full px-3 py-2 border focus:outline-none transition-colors ${
                      errors.firstName
                        ? 'border-[var(--sahakum-navy)] focus:border-[var(--sahakum-navy)] bg-[var(--sahakum-navy)]/5'
                        : 'border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)]'
                    } ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
                  />
                  {errors.firstName && (
                    <p className="text-[var(--sahakum-navy)] text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sahakum-navy)] mb-2">
                    {t.fields.lastName} *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    onBlur={() => handleBlur("lastName")}
                    className={`w-full px-3 py-2 border focus:outline-none transition-colors ${
                      errors.lastName
                        ? 'border-[var(--sahakum-navy)] focus:border-[var(--sahakum-navy)] bg-[var(--sahakum-navy)]/5'
                        : 'border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)]'
                    } ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
                  />
                  {errors.lastName && (
                    <p className="text-[var(--sahakum-navy)] text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sahakum-navy)] mb-2">
                  {t.fields.email} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`w-full px-3 py-2 border focus:outline-none transition-colors ${
                    errors.email
                      ? 'border-[var(--sahakum-navy)] focus:border-[var(--sahakum-navy)] bg-[var(--sahakum-navy)]/5'
                      : 'border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)]'
                  } ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
                />
                {errors.email && (
                  <p className="text-[var(--sahakum-navy)] text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="border border-[var(--sahakum-navy)]/20 bg-white">
            <div className="bg-[var(--sahakum-navy)] text-white p-6">
              <h3 className="text-lg font-semibold">{t.steps.address}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--sahakum-navy)] mb-2">
                  {t.fields.address} <span className="text-[var(--sahakum-navy)]/60 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  onBlur={() => handleBlur("address")}
                  className={`w-full px-3 py-2 border focus:outline-none transition-colors ${
                    errors.address
                      ? 'border-[var(--sahakum-navy)] focus:border-[var(--sahakum-navy)] bg-[var(--sahakum-navy)]/5'
                      : 'border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)]'
                  } ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
                />
                {errors.address && (
                  <p className="text-[var(--sahakum-navy)] text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.address}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--sahakum-navy)] mb-2">
                    {t.fields.city} *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    onBlur={() => handleBlur("city")}
                    className={`w-full px-3 py-2 border focus:outline-none transition-colors ${
                      errors.city
                        ? 'border-[var(--sahakum-navy)] focus:border-[var(--sahakum-navy)] bg-[var(--sahakum-navy)]/5'
                        : 'border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)]'
                    } ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
                  />
                  {errors.city && (
                    <p className="text-[var(--sahakum-navy)] text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.city}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--sahakum-navy)] mb-2">
                    {t.fields.postalCode} <span className="text-[var(--sahakum-navy)]/60 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange("postalCode", e.target.value)}
                    onBlur={() => handleBlur("postalCode")}
                    className={`w-full px-3 py-2 border focus:outline-none transition-colors ${
                      errors.postalCode
                        ? 'border-[var(--sahakum-navy)] focus:border-[var(--sahakum-navy)] bg-[var(--sahakum-navy)]/5'
                        : 'border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)]'
                    } ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
                    placeholder="12345"
                    maxLength={5}
                  />
                  {errors.postalCode && (
                    <p className="text-[var(--sahakum-navy)] text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--sahakum-navy)] mb-2">
                  {t.fields.residenceStatus} *
                </label>
                <select
                  value={formData.residenceStatus}
                  onChange={(e) => handleInputChange("residenceStatus", e.target.value)}
                  onBlur={() => handleBlur("residenceStatus")}
                  style={{ fontSize: '16px', fontFamily: locale === 'km' ? 'var(--font-khmer)' : 'var(--font-sweden)' }}
                  className={`w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none ${
                    errors.residenceStatus
                      ? 'border-[var(--sahakum-navy)] focus:border-[var(--sahakum-navy)] focus:ring-[var(--sahakum-navy)] bg-[var(--sahakum-navy)]/5'
                      : 'hover:border-gray-400'
                  }`}
                >
                  <option value="">{t.placeholders.selectStatus}</option>
                  <option value="STUDENT">{t.options.STUDENT}</option>
                  <option value="WORK_PERMIT">{t.options.WORK_PERMIT}</option>
                  <option value="PERMANENT_RESIDENT">{t.options.PERMANENT_RESIDENT}</option>
                  <option value="CITIZEN">{t.options.CITIZEN}</option>
                  <option value="EU_CITIZEN">{t.options.EU_CITIZEN}</option>
                  <option value="OTHER">{t.options.OTHER}</option>
                </select>
                {errors.residenceStatus && (
                  <p className="text-[var(--sahakum-navy)] text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.residenceStatus}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="border border-[var(--sahakum-navy)]/20 bg-white">
            <div className="bg-[var(--sahakum-navy)] text-white p-6">
              <h3 className="text-lg font-semibold">{t.steps.application}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--sahakum-navy)] mb-2">
                  {t.fields.motivation} *
                </label>
                <textarea
                  value={formData.motivation}
                  onChange={(e) => handleInputChange("motivation", e.target.value)}
                  onBlur={() => handleBlur("motivation")}
                  rows={4}
                  className={`w-full px-3 py-2 border focus:outline-none transition-colors resize-none ${
                    errors.motivation
                      ? 'border-[var(--sahakum-navy)] focus:border-[var(--sahakum-navy)] bg-[var(--sahakum-navy)]/5'
                      : 'border-[var(--sahakum-navy)]/30 focus:border-[var(--sahakum-gold)]'
                  } ${locale === 'km' ? 'font-khmer text-khmer-body' : 'font-sweden text-sweden-body'}`}
                  placeholder={t.placeholders.motivation}
                />
                {errors.motivation && (
                  <p className="text-[var(--sahakum-navy)] text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.motivation}
                  </p>
                )}
                <p className={`text-sm mt-1 ${
                  formData.motivation.length < 10 ? 'text-[var(--sahakum-navy)]/70' : 'text-[var(--sahakum-gold)]'
                }`}>
                  {t.validation.minChars} ({formData.motivation.length}/10)
                  {formData.motivation.length >= 10 && (
                    <svg className="w-4 h-4 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sweden Brand Error Display */}
      {submitError && (
        <div className="mt-6 p-6 bg-[var(--sahakum-navy)]/5 border border-[var(--sahakum-navy)]/30">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-[var(--sahakum-navy)] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-[var(--sahakum-navy)] font-semibold mb-2">
                {locale === 'sv' ? 'Ansökningsfel' :
                 locale === 'km' ? 'កំហុសក្នុងការដាក់ពាក្យ' :
                 'Application Error'}
              </h3>
              <p className="text-[var(--sahakum-navy)]/80 leading-relaxed">
                {submitError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Swedish Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-[var(--sahakum-gold)]">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 border border-[var(--sahakum-navy)] text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t.previous}
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-6 py-2 font-medium transition-colors ${
              canProceed()
                ? 'bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 text-[var(--sahakum-navy)]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t.next}
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className={`px-6 py-2 font-medium transition-colors flex items-center gap-2 ${
              canProceed() && !isSubmitting
                ? 'bg-[var(--sahakum-gold)] hover:bg-[var(--sahakum-gold)]/90 text-[var(--sahakum-navy)]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-[var(--sahakum-navy)]/30 border-t-[var(--sahakum-navy)] rounded-full animate-spin" />
            )}
            {isSubmitting ? (
              locale === 'sv' ? 'Skickar...' :
              locale === 'km' ? 'កំពុងដាក់ស្នើ...' :
              'Submitting...'
            ) : t.submit}
          </button>
        )}
      </div>
    </div>
  )
}