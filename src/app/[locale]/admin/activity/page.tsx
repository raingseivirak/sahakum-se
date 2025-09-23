'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Loader2, Search, Filter, Calendar, User, FileText, Settings, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface ActivityLogPageProps {
  params: { locale: string }
}

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

interface ActivityResponse {
  activities: ActivityLog[]
  total: number
}

const RESOURCE_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'PAGE', label: 'Pages' },
  { value: 'POST', label: 'Posts' },
  { value: 'USER', label: 'Users' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'CATEGORY', label: 'Categories' },
  { value: 'TAG', label: 'Tags' },
  { value: 'SERVICE', label: 'Services' },
  { value: 'MEMBERSHIP_REQUEST', label: 'Membership Requests' },
  { value: 'SETTINGS', label: 'Settings' },
  { value: 'AUTH', label: 'Authentication' },
]

const ACTION_TYPES = [
  { value: 'all', label: 'All Actions' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'deleted', label: 'Deleted' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

function getResourceTypeIcon(resourceType: string) {
  switch (resourceType) {
    case 'PAGE':
    case 'POST':
      return <FileText className="h-4 w-4" />
    case 'USER':
      return <User className="h-4 w-4" />
    case 'SETTINGS':
      return <Settings className="h-4 w-4" />
    case 'AUTH':
      return <User className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

function getActionColor(action: string) {
  if (action.includes('created')) return 'bg-green-100 text-green-800'
  if (action.includes('updated')) return 'bg-blue-100 text-blue-800'
  if (action.includes('deleted')) return 'bg-red-100 text-red-800'
  if (action.includes('login')) return 'bg-purple-100 text-purple-800'
  if (action.includes('approved')) return 'bg-green-100 text-green-800'
  if (action.includes('rejected')) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

export default function ActivityLogPage({ params }: ActivityLogPageProps) {
  const { data: session } = useSession()
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const fontClass = 'font-sweden'

  // Filters
  const [resourceType, setResourceType] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const limit = 50

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const urlParams = new URLSearchParams()

      if (resourceType && resourceType !== 'all') urlParams.set('resourceType', resourceType)
      if (actionFilter && actionFilter !== 'all') urlParams.set('action', actionFilter)
      if (startDate) urlParams.set('startDate', startDate)
      if (endDate) urlParams.set('endDate', endDate)

      urlParams.set('limit', limit.toString())
      urlParams.set('offset', ((page - 1) * limit).toString())

      const response = await fetch(`/api/admin/activity?${urlParams}`)
      if (!response.ok) throw new Error('Failed to fetch activities')

      const data: ActivityResponse = await response.json()
      setActivities(data.activities)
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [page, resourceType, actionFilter, startDate, endDate])

  const filteredActivities = activities.filter(activity =>
    searchTerm === '' ||
    activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(total / limit)
  const canViewAll = ['ADMIN', 'BOARD'].includes(session?.user?.role || '')

  return (
    <div className={`space-y-4 ${fontClass}`}>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${params.locale}/admin`} className={fontClass}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>Activity Log</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className={`text-3xl font-bold tracking-tight text-sahakum-navy ${fontClass}`}>
              Activity Log
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              {canViewAll ? 'Monitor all user activities' : 'Your recent activities'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${fontClass}`}>
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${fontClass}`}>Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search descriptions, users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 ${fontClass}`}
                  />
                </div>
              </div>

              {/* Resource Type */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${fontClass}`}>Resource Type</label>
                <Select value={resourceType} onValueChange={setResourceType}>
                  <SelectTrigger className={`bg-white ${fontClass}`}>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className={`bg-white ${fontClass}`}>
                    {RESOURCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value} className={`bg-white hover:bg-muted ${fontClass}`}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Type */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${fontClass}`}>Action</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className={`bg-white ${fontClass}`}>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent className={`bg-white ${fontClass}`}>
                    {ACTION_TYPES.map((action) => (
                      <SelectItem key={action.value} value={action.value} className={`bg-white hover:bg-muted ${fontClass}`}>
                        {action.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${fontClass}`}>Date Range</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start date"
                    className={`bg-white ${fontClass}`}
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End date"
                    className={`bg-white ${fontClass}`}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity List */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center justify-between ${fontClass}`}>
              <span>Recent Activities ({total} total)</span>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className={`text-center py-8 text-muted-foreground ${fontClass}`}>
                No activities found matching your criteria.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="p-2 bg-sweden-blue-soft rounded-full">
                        {getResourceTypeIcon(activity.resourceType)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className={`text-sm font-medium text-sahakum-navy ${fontClass}`}>
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${getActionColor(activity.action)} ${fontClass}`}>
                              {activity.action}
                            </Badge>
                            <Badge variant="outline" className={fontClass}>
                              {activity.resourceType}
                            </Badge>
                            {canViewAll && (
                              <span className={`text-xs text-muted-foreground ${fontClass}`}>
                                by {activity.user.name || activity.user.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0 ${fontClass}`}>
                          <Clock className="h-3 w-3" />
                          {format(new Date(activity.createdAt), 'MMM d, HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className={`text-sm text-muted-foreground ${fontClass}`}>
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} activities
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={fontClass}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className={fontClass}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}