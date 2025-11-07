import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Calendar, Shield, Lock } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "My Profile | Sahakum Khmer",
  description: "View and manage your profile"
}

interface ProfilePageProps {
  params: { locale: string }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions)
  const locale = params.locale
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  if (!session) {
    return null
  }

  // Get full user details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          initiativeMemberships: true,
          assignedTasks: true,
          eventRegistrations: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  const texts = {
    title: {
      en: 'My Profile',
      sv: 'Min Profil',
      km: 'ប្រវត្តិរូបរបស់ខ្ញុំ'
    },
    description: {
      en: 'View and manage your account information',
      sv: 'Visa och hantera din kontoinformation',
      km: 'មើល និងគ្រប់គ្រងព័ត៌មានគណនីរបស់អ្នក'
    },
    accountInfo: {
      en: 'Account Information',
      sv: 'Kontoinformation',
      km: 'ព័ត៌មានគណនី'
    },
    name: {
      en: 'Name',
      sv: 'Namn',
      km: 'ឈ្មោះ'
    },
    email: {
      en: 'Email',
      sv: 'E-post',
      km: 'អ៊ីមែល'
    },
    role: {
      en: 'Role',
      sv: 'Roll',
      km: 'តួនាទី'
    },
    memberSince: {
      en: 'Member Since',
      sv: 'Medlem Sedan',
      km: 'សមាជិកតាំងពី'
    },
    accountStatus: {
      en: 'Account Status',
      sv: 'Kontostatus',
      km: 'ស្ថានភាពគណនី'
    },
    active: {
      en: 'Active',
      sv: 'Aktiv',
      km: 'សកម្ម'
    },
    inactive: {
      en: 'Inactive',
      sv: 'Inaktiv',
      km: 'អសកម្ម'
    },
    activitySummary: {
      en: 'Activity Summary',
      sv: 'Aktivitetssammanfattning',
      km: 'សង្ខេបសកម្មភាព'
    },
    initiatives: {
      en: 'Initiatives',
      sv: 'Initiativ',
      km: 'គម្រោង'
    },
    tasks: {
      en: 'Tasks',
      sv: 'Uppgifter',
      km: 'កិច្ចការ'
    },
    events: {
      en: 'Events',
      sv: 'Evenemang',
      km: 'ព្រឹត្តិការណ៍'
    },
    changePassword: {
      en: 'Change Password',
      sv: 'Ändra Lösenord',
      km: 'ប្តូរពាក្យសម្ងាត់'
    },
    security: {
      en: 'Security',
      sv: 'Säkerhet',
      km: 'សុវត្ថិភាព'
    },
    involvement: {
      en: 'Your involvement in the community',
      sv: 'Ditt engagemang i gemenskapen',
      km: 'ការចូលរួមរបស់អ្នកក្នុងសហគមន៍'
    }
  }

  const t = (key: keyof typeof texts) => texts[key][locale as keyof typeof texts.title] || texts[key].en

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: Date) => {
    const localeCode = locale === 'sv' ? 'sv-SE' : locale === 'km' ? 'km-KH' : 'en-US'
    return new Date(date).toLocaleDateString(localeCode, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-semibold text-[var(--sahakum-navy)] ${fontClass}`}>
          {t('title')}
        </h1>
        <p className={`mt-2 text-muted-foreground ${fontClass}`}>
          {t('description')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="border border-gray-200 rounded-none md:col-span-2">
          <CardHeader>
            <CardTitle className={fontClass}>{t('accountInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-[var(--sahakum-gold)]">
                <AvatarImage src={user.profileImage || undefined} alt={user.name || 'User'} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-[var(--sahakum-gold)] to-[var(--sahakum-gold)]/80 text-[var(--sahakum-navy)] font-bold font-sweden">
                  {getInitials(user.name || user.email || 'U')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className={`text-2xl font-bold text-[var(--sahakum-navy)] ${fontClass}`}>
                  {user.name || 'User'}
                </h2>
                <p className={`text-muted-foreground ${fontClass}`}>
                  {user.email}
                </p>
              </div>
            </div>

            {/* User Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className={fontClass}>{t('name')}</span>
                </div>
                <p className={`font-medium text-[var(--sahakum-navy)] ${fontClass}`}>
                  {user.name || 'Not set'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className={fontClass}>{t('email')}</span>
                </div>
                <p className={`font-medium text-[var(--sahakum-navy)] ${fontClass}`}>
                  {user.email}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span className={fontClass}>{t('role')}</span>
                </div>
                <Badge className="bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)]">
                  {user.role.toLowerCase()}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className={fontClass}>{t('memberSince')}</span>
                </div>
                <p className={`font-medium text-[var(--sahakum-navy)] ${fontClass}`}>
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {/* Account Status */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className={`text-sm text-muted-foreground ${fontClass}`}>
                  {t('accountStatus')}
                </span>
                <Badge className={user.isActive ? "bg-[var(--sahakum-gold)] text-[var(--sahakum-navy)]" : "bg-gray-400 text-white"}>
                  {user.isActive ? t('active') : t('inactive')}
                </Badge>
              </div>
            </div>

            {/* Security Section */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span className={`text-sm text-muted-foreground ${fontClass}`}>
                    {t('security')}
                  </span>
                </div>
                <Link href={`/${locale}/my-account/change-password`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`border-[var(--sahakum-navy)] text-[var(--sahakum-navy)] hover:bg-[var(--sahakum-navy)] hover:text-white ${fontClass}`}
                  >
                    {t('changePassword')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary Card */}
        <Card className="border border-gray-200 rounded-none">
          <CardHeader>
            <CardTitle className={fontClass}>{t('activitySummary')}</CardTitle>
            <CardDescription className={fontClass}>
              {t('involvement')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${fontClass}`}>{t('initiatives')}</span>
                <span className="text-2xl font-bold text-[var(--sahakum-navy)]">
                  {user._count.initiativeMemberships}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div
                  className="bg-[var(--sahakum-gold)] h-2"
                  style={{ width: `${Math.min((user._count.initiativeMemberships / 10) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${fontClass}`}>{t('tasks')}</span>
                <span className="text-2xl font-bold text-[var(--sahakum-navy)]">
                  {user._count.assignedTasks}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div
                  className="bg-[var(--sahakum-navy)] h-2"
                  style={{ width: `${Math.min((user._count.assignedTasks / 20) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${fontClass}`}>{t('events')}</span>
                <span className="text-2xl font-bold text-[var(--sahakum-navy)]">
                  {user._count.eventRegistrations}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2">
                <div
                  className="h-2 opacity-60"
                  style={{
                    width: `${Math.min((user._count.eventRegistrations / 10) * 100, 100)}%`,
                    backgroundColor: 'var(--sahakum-navy)'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
