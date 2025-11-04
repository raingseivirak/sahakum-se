import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, CheckSquare, Calendar, Users } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Account | Sahakum Khmer",
  description: "View your initiatives, tasks, and events"
}

interface DashboardPageProps {
  params: { locale: string }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const session = await getServerSession(authOptions)
  const locale = params.locale
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  if (!session) {
    return null
  }

  // Get user's statistics
  const [initiatives, tasks, eventRegistrations] = await Promise.all([
    // Initiatives where user is a team member
    prisma.initiativeMember.count({
      where: {
        userId: session.user.id,
        initiative: {
          status: { not: 'ARCHIVED' }
        }
      }
    }),
    // Tasks assigned to user
    prisma.task.findMany({
      where: {
        assignedToId: session.user.id,
        status: { not: 'COMPLETED' }
      },
      include: {
        initiative: {
          select: {
            id: true,
            slug: true,
            translations: {
              where: { language: locale },
              select: { title: true }
            }
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      },
      take: 5
    }),
    // Event registrations
    prisma.eventRegistration.count({
      where: {
        userId: session.user.id,
        status: 'CONFIRMED',
        event: {
          endDate: { gte: new Date() }
        }
      }
    })
  ])

  const texts = {
    welcome: {
      en: 'Welcome back',
      sv: 'Välkommen tillbaka',
      km: 'សូមស្វាគមន៍'
    },
    myInitiatives: {
      en: 'My Initiatives',
      sv: 'Mina Initiativ',
      km: 'គម្រោងរបស់ខ្ញុំ'
    },
    myTasks: {
      en: 'My Tasks',
      sv: 'Mina Uppgifter',
      km: 'កិច្ចការរបស់ខ្ញុំ'
    },
    upcomingEvents: {
      en: 'Upcoming Events',
      sv: 'Kommande Evenemang',
      km: 'ព្រឹត្តិការណ៍នាពេលខាងមុខ'
    },
    active: {
      en: 'active',
      sv: 'aktiva',
      km: 'សកម្ម'
    },
    pending: {
      en: 'pending',
      sv: 'väntande',
      km: 'រង់ចាំ'
    },
    registered: {
      en: 'registered',
      sv: 'registrerade',
      km: 'បានចុះឈ្មោះ'
    },
    recentTasks: {
      en: 'Recent Tasks',
      sv: 'Senaste Uppgifter',
      km: 'កិច្ចការថ្មីៗ'
    },
    noTasks: {
      en: 'No pending tasks',
      sv: 'Inga väntande uppgifter',
      km: 'គ្មានកិច្ចការរង់ចាំ'
    },
    viewAll: {
      en: 'View all',
      sv: 'Visa alla',
      km: 'មើលទាំងអស់'
    },
    due: {
      en: 'Due',
      sv: 'Förfaller',
      km: 'ថ្ងៃផុតកំណត់'
    }
  }

  const t = (key: keyof typeof texts) => texts[key][locale as keyof typeof texts.welcome] || texts[key].en

  const getTaskTitle = (task: any) => {
    if (locale === 'sv' && task.titleSv) return task.titleSv
    if (locale === 'km' && task.titleKm) return task.titleKm
    return task.titleEn || task.titleSv || task.titleKm || 'Untitled'
  }

  const getInitiativeTitle = (initiative: any) => {
    return initiative.translations[0]?.title || 'Untitled Initiative'
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className={`text-2xl font-semibold text-[var(--sahakum-navy)] ${fontClass}`}>
          {t('welcome')}, {session.user.name?.split(' ')[0] || session.user.email}!
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link href={`/${locale}/my-account/initiatives`}>
          <Card className="border border-gray-200 rounded-none hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${fontClass}`}>{t('myInitiatives')}</CardTitle>
                <FolderKanban className="h-8 w-8 text-[var(--sahakum-gold)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--sahakum-navy)]">{initiatives}</div>
              <p className={`text-sm text-muted-foreground ${fontClass}`}>{t('active')}</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="border border-gray-200 rounded-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-lg ${fontClass}`}>{t('myTasks')}</CardTitle>
              <CheckSquare className="h-8 w-8 text-[var(--sahakum-gold)]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--sahakum-navy)]">{tasks.length}</div>
            <p className={`text-sm text-muted-foreground ${fontClass}`}>{t('pending')}</p>
          </CardContent>
        </Card>

        <Link href={`/${locale}/my-account/events`}>
          <Card className="border border-gray-200 rounded-none hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${fontClass}`}>{t('upcomingEvents')}</CardTitle>
                <Calendar className="h-8 w-8 text-[var(--sahakum-gold)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--sahakum-navy)]">{eventRegistrations}</div>
              <p className={`text-sm text-muted-foreground ${fontClass}`}>{t('registered')}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Tasks */}
      <Card className="border border-gray-200 rounded-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className={fontClass}>{t('recentTasks')}</CardTitle>
            {tasks.length > 0 && (
              <Link
                href={`/${locale}/my-account/initiatives`}
                className={`text-sm text-[var(--sahakum-navy)] hover:text-[var(--sahakum-gold)] ${fontClass}`}
              >
                {t('viewAll')} →
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className={`text-center py-8 text-muted-foreground ${fontClass}`}>
              {t('noTasks')}
            </p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/${locale}/my-account/initiatives/${task.initiative.slug}`}
                  className="block"
                >
                  <div className="border border-gray-200 rounded-none p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium text-[var(--sahakum-navy)] ${fontClass}`}>
                          {getTaskTitle(task)}
                        </h4>
                        <p className={`text-sm text-muted-foreground ${fontClass}`}>
                          {getInitiativeTitle(task.initiative)}
                        </p>
                      </div>
                      {task.dueDate && (
                        <div className={`text-sm text-muted-foreground ${fontClass}`}>
                          {t('due')}: {formatDate(task.dueDate)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
