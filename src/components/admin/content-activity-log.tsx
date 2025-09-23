'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, User, Clock, FileText, Eye, Save } from "lucide-react"
import { useState, useEffect } from "react"

interface ActivityItem {
  id: string
  action: string
  description: string
  createdAt: string
  ipAddress: string
  userAgent: string
  user: {
    name: string | null
    email: string
  }
  oldValues?: any
  newValues?: any
  metadata?: any
}

interface ContentActivityLogProps {
  resourceType: 'POST' | 'PAGE'
  resourceId: string
  title?: string
  className?: string
}

export function ContentActivityLog({
  resourceType,
  resourceId,
  title,
  className = "font-sweden"
}: ContentActivityLogProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!resourceId) return

    const fetchActivities = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/admin/activity?resourceType=${resourceType}&resourceId=${resourceId}&limit=20`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch activity logs')
        }

        const data = await response.json()
        setActivities(data.activities || [])
      } catch (err) {
        console.error('Error fetching activity logs:', err)
        setError('Failed to load activity logs')
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [resourceType, resourceId])

  // Helper function to get appropriate icon for action
  const getActionIcon = (action: string) => {
    if (action.includes('created')) return <FileText className="h-4 w-4 text-green-600" />
    if (action.includes('updated')) return <Save className="h-4 w-4 text-blue-600" />
    if (action.includes('deleted')) return <FileText className="h-4 w-4 text-red-600" />
    if (action.includes('viewed') || action.includes('preview')) return <Eye className="h-4 w-4 text-gray-600" />
    return <Activity className="h-4 w-4 text-gray-600" />
  }

  // Helper function to get action color
  const getActionColor = (action: string) => {
    if (action.includes('created')) return 'bg-green-100 text-green-800'
    if (action.includes('updated')) return 'bg-blue-100 text-blue-800'
    if (action.includes('deleted')) return 'bg-red-100 text-red-800'
    if (action.includes('viewed') || action.includes('preview')) return 'bg-gray-100 text-gray-800'
    return 'bg-gray-100 text-gray-800'
  }

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} min ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    } catch {
      return 'Unknown'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${className}`}>
            <Activity className="h-5 w-5" />
            Activity History
          </CardTitle>
          <CardDescription className={className}>
            Loading activity logs for this {resourceType.toLowerCase()}...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sahakum-navy"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${className}`}>
            <Activity className="h-5 w-5" />
            Activity History
          </CardTitle>
          <CardDescription className={className}>
            Recent changes and activity for this {resourceType.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className={className}>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${className}`}>
          <Activity className="h-5 w-5" />
          Activity History
        </CardTitle>
        <CardDescription className={className}>
          Recent changes and activity for this {resourceType.toLowerCase()}
          {title && ` "${title}"`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className={className}>No activity recorded yet</p>
            <p className={`text-sm ${className}`}>
              Actions will appear here as they happen
            </p>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {getActionIcon(activity.action)}

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getActionColor(activity.action)}`}
                      >
                        {activity.action}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(activity.createdAt)}
                      </div>
                    </div>

                    <p className={`text-sm text-gray-900 ${className}`}>
                      {activity.description}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className={className}>
                        {activity.user.name || activity.user.email}
                      </span>
                      {activity.metadata?.changedFields && (
                        <span className={`ml-2 ${className}`}>
                          • Fields: {activity.metadata.changedFields.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Show additional details for updates */}
                    {activity.action.includes('updated') && activity.metadata?.translationsUpdated && (
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className={className}>
                          • Translations updated: {activity.metadata.languages?.join(', ') || 'Multiple languages'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {activities.length > 0 && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground text-center">
            <span className={className}>
              Showing last {activities.length} activities
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}