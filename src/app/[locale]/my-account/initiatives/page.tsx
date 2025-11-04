import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, CheckSquare, Calendar, ArrowRight, Crown } from "lucide-react"

export const metadata: Metadata = {
  title: "My Initiatives | Sahakum Khmer",
  description: "View initiatives you're involved in"
}

interface MyInitiativesPageProps {
  params: { locale: string }
}

async function getMyInitiatives(userId: string, locale: string) {
  try {
    // Get all initiatives where user is a team member
    const memberInitiatives = await prisma.initiativeMember.findMany({
      where: {
        userId: userId,
      },
      include: {
        initiative: {
          include: {
            translations: {
              where: {
                language: locale,
              },
            },
            projectLead: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
            _count: {
              select: {
                members: true,
                tasks: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    })

    // Filter out archived initiatives and format response
    const activeInitiatives = memberInitiatives
      .filter((member) => member.initiative.status !== "ARCHIVED")
      .map((member) => {
        const initiative = member.initiative
        const translation = initiative.translations[0] || {
          title: "Untitled",
          shortDescription: "",
        }

        return {
          id: initiative.id,
          slug: initiative.slug,
          status: initiative.status,
          category: initiative.category,
          startDate: initiative.startDate,
          endDate: initiative.endDate,
          featuredImage: initiative.featuredImage,
          myRole: member.role,
          joinedAt: member.joinedAt,
          translation,
          projectLead: initiative.projectLead,
          taskCount: initiative._count.tasks,
          memberCount: initiative._count.members,
        }
      })

    return activeInitiatives
  } catch (error) {
    console.error("Error fetching initiatives:", error)
    return []
  }
}

export default async function MyInitiativesPage({ params }: MyInitiativesPageProps) {
  const session = await getServerSession(authOptions)
  const locale = params.locale
  const fontClass = locale === 'km' ? 'font-khmer' : 'font-sweden'

  if (!session) {
    return null
  }

  const initiatives = await getMyInitiatives(session.user.id, locale)

  const texts = {
    title: {
      en: 'My Initiatives',
      sv: 'Mina Initiativ',
      km: 'គម្រោងរបស់ខ្ញុំ'
    },
    description: {
      en: 'Initiatives where you are a team member',
      sv: 'Initiativ där du är en teammedlem',
      km: 'គម្រោងដែលអ្នកជាសមាជិកក្រុម'
    },
    noInitiatives: {
      en: 'You are not part of any initiatives yet',
      sv: 'Du är inte med i några initiativ ännu',
      km: 'អ្នកមិនទាន់ចូលរួមក្នុងគម្រោងណាមួយទេ'
    },
    members: {
      en: 'members',
      sv: 'medlemmar',
      km: 'សមាជិក'
    },
    tasks: {
      en: 'tasks',
      sv: 'uppgifter',
      km: 'កិច្ចការ'
    },
    yourRole: {
      en: 'Your role',
      sv: 'Din roll',
      km: 'តួនាទីរបស់អ្នក'
    },
    joined: {
      en: 'Joined',
      sv: 'Gick med',
      km: 'បានចូលរួម'
    },
    viewTasks: {
      en: 'View Tasks',
      sv: 'Visa Uppgifter',
      km: 'មើលកិច្ចការ'
    },
    lead: {
      en: 'Lead',
      sv: 'Ledare',
      km: 'ប្រធាន'
    },
    coLead: {
      en: 'Co-Lead',
      sv: 'Medledare',
      km: 'អនុប្រធាន'
    },
    member: {
      en: 'Member',
      sv: 'Medlem',
      km: 'សមាជិក'
    }
  }

  const t = (key: keyof typeof texts) => texts[key][locale as keyof typeof texts.title] || texts[key].en

  const getRoleLabel = (role: string) => {
    if (role === 'LEAD') return t('lead')
    if (role === 'CO_LEAD') return t('coLead')
    return t('member')
  }

  const getRoleBadge = (role: string) => {
    if (role === 'LEAD') {
      return <Badge className="bg-purple-500"><Crown className="h-3 w-3 mr-1" />{getRoleLabel(role)}</Badge>
    }
    if (role === 'CO_LEAD') {
      return <Badge className="bg-blue-500">{getRoleLabel(role)}</Badge>
    }
    return <Badge variant="outline">{getRoleLabel(role)}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'sv' ? 'sv-SE' : 'en-US', {
      month: 'short',
      year: 'numeric'
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

      {/* Initiatives List */}
      {initiatives.length === 0 ? (
        <Card className="border border-gray-200 rounded-none">
          <CardContent className="py-12">
            <p className={`text-center text-muted-foreground ${fontClass}`}>
              {t('noInitiatives')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {initiatives.map((initiative: any) => (
            <Link key={initiative.id} href={`/${locale}/my-account/initiatives/${initiative.slug}`}>
              <Card className="border border-gray-200 rounded-none hover:shadow-lg transition-shadow cursor-pointer h-full">
                {initiative.featuredImage && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={initiative.featuredImage}
                      alt={initiative.translation.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className={`text-xl ${fontClass}`}>
                      {initiative.translation.title}
                    </CardTitle>
                    {getRoleBadge(initiative.myRole)}
                  </div>
                  {initiative.translation.shortDescription && (
                    <p className={`text-sm text-muted-foreground line-clamp-2 ${fontClass}`}>
                      {initiative.translation.shortDescription}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className={fontClass}>{initiative.memberCount} {t('members')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckSquare className="h-4 w-4" />
                      <span className={fontClass}>{initiative.taskCount} {t('tasks')}</span>
                    </div>
                  </div>

                  {/* Joined Date */}
                  <div className={`text-xs text-muted-foreground flex items-center gap-1 ${fontClass}`}>
                    <Calendar className="h-3 w-3" />
                    {t('joined')} {formatDate(initiative.joinedAt)}
                  </div>

                  {/* View Button */}
                  <div className={`flex items-center text-[var(--sahakum-navy)] font-medium group-hover:text-[var(--sahakum-gold)] ${fontClass}`}>
                    {t('viewTasks')}
                    <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
