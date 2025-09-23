'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Clock, Eye, FileText, User, Settings } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface ActivityLog {
  id: string
  action: string
  resourceType: string
  resourceId?: string
  description: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  metadata?: any
}

interface RecentActivityProps {
  locale: string
}

function getResourceTypeIcon(resourceType: string) {
  switch (resourceType) {
    case 'PAGE':
    case 'POST':
      return <FileText className="h-3 w-3" />
    case 'USER':
      return <User className="h-3 w-3" />
    case 'SETTINGS':
      return <Settings className="h-3 w-3" />
    case 'AUTH':
      return <User className="h-3 w-3" />
    default:
      return <FileText className="h-3 w-3" />
  }
}

function getActionColor(action: string) {
  if (action.includes('created')) return 'bg-green-100 text-green-700'
  if (action.includes('updated')) return 'bg-blue-100 text-blue-700'
  if (action.includes('deleted')) return 'bg-red-100 text-red-700'
  if (action.includes('login')) return 'bg-purple-100 text-purple-700'
  if (action.includes('approved')) return 'bg-green-100 text-green-700'
  if (action.includes('rejected')) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

export function RecentActivity({ locale }: RecentActivityProps) {
  const { data: session } = useSession()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  // English-only admin translations
  const t = {
    recentActivity: 'Recent Activity',
    description: 'Recent activity on your site',
    viewAll: 'View All Activity',
    noActivity: 'No recent activity found.',
  }

  const fontClass = 'font-sweden'

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/activity?limit=5')
        if (!response.ok) throw new Error('Failed to fetch activities')

        const data = await response.json()
        setActivities(data.activities || [])
      } catch (error) {
        console.error('Error fetching recent activities:', error)
        setActivities([])
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchRecentActivity()
    }
  }, [session])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={fontClass}>{t.recentActivity}</CardTitle>
            <CardDescription className={fontClass}>
              {t.description}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild className={fontClass}>
            <Link href={`/${locale}/admin/activity`}>
              <Eye className="h-4 w-4 mr-2" />
              {t.viewAll}
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className={`text-sm ${fontClass}`}>{t.noActivity}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-sweden-blue-primary rounded-full" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium text-gray-900 ${fontClass}`}>
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      {format(new Date(activity.createdAt), 'MMM d, HH:mm')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {getResourceTypeIcon(activity.resourceType)}
                      <Badge variant="outline" className="text-xs">
                        {activity.resourceType}
                      </Badge>
                    </div>
                    <Badge className={`text-xs ${getActionColor(activity.action)}`}>
                      {activity.action}
                    </Badge>
                    {session?.user?.role && ['ADMIN', 'BOARD'].includes(session.user.role) && (
                      <span className="text-xs text-muted-foreground">
                        by {activity.user.name || activity.user.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}