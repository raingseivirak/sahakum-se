'use client'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Calendar,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Users,
  MapPin,
  Globe,
  Monitor,
  SearchX,
} from "lucide-react"
import Link from "next/link"
import { useEvents } from "@/hooks/use-events"
import { useAdminPermissions } from "@/contexts/admin-permissions-context"
import { useState } from "react"

interface EventsPageProps {
  params: { locale: string }
}

export default function EventsPage({ params }: EventsPageProps) {
  const fontClass = 'font-sweden'
  const { events, loading, error, deleteEvent } = useEvents()
  const { permissions } = useAdminPermissions()
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event? This will also delete all registrations.')) {
      setDeletingEventId(eventId)
      try {
        await deleteEvent(eventId)
      } catch (err) {
        console.error('Failed to delete event:', err)
        alert('Failed to delete event')
      } finally {
        setDeletingEventId(null)
      }
    }
  }

  const canEditEvent = (event: any) => {
    return permissions.canEditOwnContent || permissions.canEditOthersContent
  }

  const canDeleteEvent = (event: any) => {
    return permissions.canDeleteOthersContent
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PUBLISHED":
        return <Badge variant="default" className="bg-green-500">Published</Badge>
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "ARCHIVED":
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLocationIcon = (locationType: string) => {
    switch (locationType) {
      case 'PHYSICAL':
        return <MapPin className="h-4 w-4" />
      case 'VIRTUAL':
        return <Monitor className="h-4 w-4" />
      case 'HYBRID':
        return <Globe className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  const getLocationBadge = (locationType: string) => {
    const icons = {
      PHYSICAL: <MapPin className="h-3 w-3 mr-1" />,
      VIRTUAL: <Monitor className="h-3 w-3 mr-1" />,
      HYBRID: <Globe className="h-3 w-3 mr-1" />,
    }
    return (
      <Badge variant="outline" className="text-xs">
        {icons[locationType as keyof typeof icons]}
        {locationType}
      </Badge>
    )
  }

  const getLanguageBadges = (translations: any[]) => {
    const languageMap: { [key: string]: string } = {
      sv: "SV",
      en: "EN",
      km: "KM",
    }

    return translations.map((translation) => (
      <Badge key={translation.language} variant="outline" className="text-xs">
        {languageMap[translation.language]}
      </Badge>
    ))
  }

  const getEventStatus = (event: any) => {
    const now = new Date()
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)

    if (now < start) return 'upcoming'
    if (now > end) return 'past'
    return 'ongoing'
  }

  const getEventStatusBadge = (event: any) => {
    const status = getEventStatus(event)
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500">Upcoming</Badge>
      case 'ongoing':
        return <Badge className="bg-green-500">Ongoing</Badge>
      case 'past':
        return <Badge variant="outline">Past</Badge>
      default:
        return null
    }
  }

  const getRegistrationBadge = (event: any) => {
    if (!event.registrationEnabled) {
      return <Badge variant="outline" className="text-xs">No Registration</Badge>
    }

    const confirmedCount = event._count?.registrations || 0
    const maxCapacity = event.maxCapacity

    if (maxCapacity) {
      const spotsRemaining = maxCapacity - confirmedCount
      if (spotsRemaining <= 0) {
        return <Badge variant="destructive" className="text-xs">Full ({confirmedCount}/{maxCapacity})</Badge>
      }
      return (
        <Badge variant="default" className="bg-green-600 text-xs">
          {confirmedCount}/{maxCapacity} registered
        </Badge>
      )
    }

    return (
      <Badge variant="default" className="bg-green-600 text-xs">
        {confirmedCount} registered
      </Badge>
    )
  }

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
                <BreadcrumbPage className={fontClass}>Events</BreadcrumbPage>
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
              Events
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Manage community events, workshops, and gatherings
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {permissions.canCreateContent ? (
              <Button asChild className={fontClass}>
                <Link href={`/${params.locale}/admin/events/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
            ) : (
              <Button disabled className={`${fontClass} opacity-50 cursor-not-allowed`} title="You don't have permission to create events">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            )}
          </div>
        </div>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>All Events</CardTitle>
            <CardDescription className={fontClass}>
              A list of all events in your CMS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={fontClass}>Event</TableHead>
                  <TableHead className={fontClass}>Date & Time</TableHead>
                  <TableHead className={fontClass}>Location</TableHead>
                  <TableHead className={fontClass}>Status</TableHead>
                  <TableHead className={fontClass}>Registration</TableHead>
                  <TableHead className={fontClass}>Languages</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading events...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-red-600">
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No events found. <Link href={`/${params.locale}/admin/events/create`} className="text-sahakum-gold hover:underline">Create your first event</Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className={`font-medium ${fontClass}`}>
                              {event.translations?.[0]?.title || 'Untitled'}
                            </div>
                            <div className={`text-sm text-muted-foreground ${fontClass}`}>/{event.slug}</div>
                            <div className="flex gap-1 mt-1">
                              {getEventStatusBadge(event)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${fontClass}`}>
                          <div className="font-medium">
                            {new Date(event.startDate).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {event.allDay
                              ? 'All day'
                              : new Date(event.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLocationBadge(event.locationType)}
                        {event.locationType === 'PHYSICAL' && event.city && (
                          <div className={`text-xs text-muted-foreground mt-1 ${fontClass}`}>
                            {event.city}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        {getRegistrationBadge(event)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {getLanguageBadges(event.translations)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className={`bg-white border border-gray-200 shadow-lg rounded-md p-1 z-50 ${fontClass}`}>
                            {event.status === 'PUBLISHED' && (
                              <DropdownMenuItem
                                className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                                onClick={() => window.open(`/${params.locale}/events/${event.slug}`, '_blank')}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Event
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                              onClick={() => window.open(`/${params.locale}/events/${event.slug}?preview=${event.id}`, '_blank')}
                            >
                              <SearchX className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            {event.registrationEnabled && (
                              <DropdownMenuItem
                                className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                                onClick={() => window.location.href = `/${params.locale}/admin/events/${event.id}/registrations`}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                View Registrations ({event._count?.registrations || 0})
                              </DropdownMenuItem>
                            )}
                            {canEditEvent(event) ? (
                              <DropdownMenuItem
                                className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                                onClick={() => window.location.href = `/${params.locale}/admin/events/${event.id}/edit`}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className={`flex items-center px-2 py-2 text-sm opacity-50 cursor-not-allowed rounded ${fontClass}`}
                                title="You don't have permission to edit this event"
                                disabled
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            {canDeleteEvent(event) ? (
                              <DropdownMenuItem
                                className={`flex items-center px-2 py-2 text-sm hover:bg-red-50 rounded cursor-pointer text-red-600 ${fontClass}`}
                                onClick={() => handleDeleteEvent(event.id)}
                                disabled={deletingEventId === event.id}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {deletingEventId === event.id ? 'Deleting...' : 'Delete'}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className={`flex items-center px-2 py-2 text-sm opacity-50 cursor-not-allowed rounded text-gray-400 ${fontClass}`}
                                title="You don't have permission to delete this event"
                                disabled
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
