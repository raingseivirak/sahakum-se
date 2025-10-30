'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, Users, Search, X, Loader2, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

interface EventRegistrationsPageProps {
  params: { locale: string }
}

export default function EventRegistrationsPage({ params }: EventRegistrationsPageProps) {
  const fontClass = params.locale === 'km' ? 'font-khmer' : 'font-sweden'
  const { data: session } = useSession()

  const [registrations, setRegistrations] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterEventId, setFilterEventId] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [cancelling, setCancelling] = useState<string | null>(null)

  const translations: { [key: string]: any } = {
    sv: {
      title: 'Evenemangsan​mälningar',
      description: 'Hantera alla evenemangsan​mälningar',
      breadcrumb: {
        dashboard: 'Instrumentpanel',
        registrations: 'Anmälningar'
      },
      filters: {
        search: 'Sök efter namn eller e-post...',
        event: 'Filtrera efter evenemang',
        status: 'Filtrera efter status',
        allEvents: 'Alla evenemang',
        allStatuses: 'Alla statusar'
      },
      table: {
        event: 'Evenemang',
        attendee: 'Deltagare',
        guests: 'Gäster',
        date: 'Anmälningsdatum',
        eventDate: 'Evenemangsdatum',
        status: 'Status',
        actions: 'Åtgärder',
        cancel: 'Avbryt',
        view: 'Visa'
      },
      status: {
        CONFIRMED: 'Bekräftad',
        CANCELLED: 'Avbruten',
        WAITLIST: 'Väntelista'
      },
      confirmCancel: {
        title: 'Avbryt anmälan?',
        description: 'Är du säker på att du vill avbryta denna anmälan? Denna åtgärd kan inte ångras.',
        cancel: 'Nej, behåll',
        confirm: 'Ja, avbryt'
      },
      empty: {
        title: 'Inga anmälningar',
        description: 'Inga evenemangsan​mälningar hittades'
      },
      loading: 'Laddar...'
    },
    en: {
      title: 'Event Registrations',
      description: 'Manage all event registrations',
      breadcrumb: {
        dashboard: 'Dashboard',
        registrations: 'Registrations'
      },
      filters: {
        search: 'Search by name or email...',
        event: 'Filter by event',
        status: 'Filter by status',
        allEvents: 'All events',
        allStatuses: 'All statuses'
      },
      table: {
        event: 'Event',
        attendee: 'Attendee',
        guests: 'Guests',
        date: 'Registration Date',
        eventDate: 'Event Date',
        status: 'Status',
        actions: 'Actions',
        cancel: 'Cancel',
        view: 'View'
      },
      status: {
        CONFIRMED: 'Confirmed',
        CANCELLED: 'Cancelled',
        WAITLIST: 'Waitlist'
      },
      confirmCancel: {
        title: 'Cancel Registration?',
        description: 'Are you sure you want to cancel this registration? This action cannot be undone.',
        cancel: 'No, keep it',
        confirm: 'Yes, cancel'
      },
      empty: {
        title: 'No Registrations',
        description: 'No event registrations found'
      },
      loading: 'Loading...'
    },
    km: {
      title: 'ការចុះឈ្មោះព្រឹត្តិការណ៍',
      description: 'គ្រប់គ្រងការចុះឈ្មោះព្រឹត្តិការណ៍ទាំងអស់',
      breadcrumb: {
        dashboard: 'ផ្ទាំងគ្រប់គ្រង',
        registrations: 'ការចុះឈ្មោះ'
      },
      filters: {
        search: 'ស្វែងរកតាមឈ្មោះ ឬអ៊ីមែល...',
        event: 'ច្រោះតាមព្រឹត្តិការណ៍',
        status: 'ច្រោះតាមស្ថានភាព',
        allEvents: 'ព្រឹត្តិការណ៍ទាំងអស់',
        allStatuses: 'ស្ថានភាពទាំងអស់'
      },
      table: {
        event: 'ព្រឹត្តិការណ៍',
        attendee: 'អ្នកចូលរួម',
        guests: 'ភ្ញៀវ',
        date: 'កាលបរិច្ឆេទចុះឈ្មោះ',
        eventDate: 'កាលបរិច្ឆេទព្រឹត្តិការណ៍',
        status: 'ស្ថានភាព',
        actions: 'សកម្មភាព',
        cancel: 'បោះបង់',
        view: 'មើល'
      },
      status: {
        CONFIRMED: 'បញ្ជាក់',
        CANCELLED: 'បោះបង់',
        WAITLIST: 'បញ្ជីរង់ចាំ'
      },
      confirmCancel: {
        title: 'បោះបង់ការចុះឈ្មោះ?',
        description: 'តើអ្នកប្រាកដថាចង់បោះបង់ការចុះឈ្មោះនេះ? សកម្មភាពនេះមិនអាចត្រឡប់វិញបានទេ។',
        cancel: 'ទេ រក្សាទុក',
        confirm: 'បាទ/ចាស បោះបង់'
      },
      empty: {
        title: 'គ្មានការចុះឈ្មោះ',
        description: 'រកមិនឃើញការចុះឈ្មោះព្រឹត្តិការណ៍ទេ'
      },
      loading: 'កំពុងផ្ទុក...'
    }
  }

  const t = translations[params.locale] || translations.en

  useEffect(() => {
    fetchRegistrations()
    fetchEvents()
  }, [filterEventId, filterStatus, searchQuery])

  const fetchRegistrations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterEventId) params.append('eventId', filterEventId)
      if (filterStatus) params.append('status', filterStatus)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/event-registrations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleCancelRegistration = async (registrationId: string) => {
    setCancelling(registrationId)
    try {
      const response = await fetch(`/api/event-registrations?id=${registrationId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchRegistrations()
      }
    } catch (error) {
      console.error('Error cancelling registration:', error)
    } finally {
      setCancelling(null)
    }
  }

  const getEventTitle = (event: any) => {
    const translation = event.translations.find((t: any) => t.language === params.locale)
    return translation?.title || event.translations[0]?.title || event.slug
  }

  const getAttendeeName = (registration: any) => {
    if (registration.user) {
      return registration.user.name || registration.user.email
    }
    return `${registration.guestFirstName} ${registration.guestLastName}`
  }

  const getAttendeeEmail = (registration: any) => {
    return registration.user?.email || registration.guestEmail
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t.status.CONFIRMED}
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            {t.status.CANCELLED}
          </Badge>
        )
      case 'WAITLIST':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {t.status.WAITLIST}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
                  {t.breadcrumb.dashboard}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>{t.breadcrumb.registrations}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-3xl font-bold tracking-tight text-sahakum-navy ${fontClass}`}>
              {t.title}
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              {t.description}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>
              <Search className="inline h-5 w-5 mr-2" />
              {t.filters.search}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                placeholder={t.filters.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={fontClass}
              />
              <Select value={filterEventId} onValueChange={setFilterEventId}>
                <SelectTrigger className={fontClass}>
                  <SelectValue placeholder={t.filters.event} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value=" " className={fontClass}>{t.filters.allEvents}</SelectItem>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id} className={fontClass}>
                      {getEventTitle(event)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className={fontClass}>
                  <SelectValue placeholder={t.filters.status} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value=" " className={fontClass}>{t.filters.allStatuses}</SelectItem>
                  <SelectItem value="CONFIRMED" className={fontClass}>{t.status.CONFIRMED}</SelectItem>
                  <SelectItem value="CANCELLED" className={fontClass}>{t.status.CANCELLED}</SelectItem>
                  <SelectItem value="WAITLIST" className={fontClass}>{t.status.WAITLIST}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>
              <Users className="inline h-5 w-5 mr-2" />
              {t.title}
            </CardTitle>
            <CardDescription className={fontClass}>
              {registrations.length} {params.locale === 'sv' ? 'anmälningar' : params.locale === 'km' ? 'ការចុះឈ្មោះ' : 'registrations'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-sahakum-navy" />
                <span className={`ml-2 ${fontClass}`}>{t.loading}</span>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className={`text-lg font-semibold ${fontClass}`}>{t.empty.title}</h3>
                <p className={`text-muted-foreground ${fontClass}`}>{t.empty.description}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={fontClass}>{t.table.event}</TableHead>
                    <TableHead className={fontClass}>{t.table.attendee}</TableHead>
                    <TableHead className={fontClass}>{t.table.guests}</TableHead>
                    <TableHead className={fontClass}>{t.table.date}</TableHead>
                    <TableHead className={fontClass}>{t.table.eventDate}</TableHead>
                    <TableHead className={fontClass}>{t.table.status}</TableHead>
                    <TableHead className={fontClass}>{t.table.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className={fontClass}>
                        <Link
                          href={`/${params.locale}/admin/events/${registration.event.id}/registrations`}
                          className="text-sahakum-gold hover:underline"
                        >
                          {getEventTitle(registration.event)}
                        </Link>
                      </TableCell>
                      <TableCell className={fontClass}>
                        <div>
                          <div className="font-medium">{getAttendeeName(registration)}</div>
                          <div className="text-sm text-muted-foreground">{getAttendeeEmail(registration)}</div>
                        </div>
                      </TableCell>
                      <TableCell className={fontClass}>{registration.numberOfGuests}</TableCell>
                      <TableCell className={fontClass}>
                        {new Date(registration.createdAt).toLocaleDateString(params.locale)}
                      </TableCell>
                      <TableCell className={fontClass}>
                        {new Date(registration.event.startDate).toLocaleDateString(params.locale)}
                      </TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/${params.locale}/admin/events/${registration.event.id}/registrations`}>
                            <Button variant="outline" size="sm" className={fontClass}>
                              {t.table.view}
                            </Button>
                          </Link>
                          {registration.status === 'CONFIRMED' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={cancelling === registration.id}
                                  className={fontClass}
                                >
                                  {cancelling === registration.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    t.table.cancel
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className={fontClass}>{t.confirmCancel.title}</AlertDialogTitle>
                                  <AlertDialogDescription className={fontClass}>
                                    {t.confirmCancel.description}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className={fontClass}>{t.confirmCancel.cancel}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleCancelRegistration(registration.id)}
                                    className={fontClass}
                                  >
                                    {t.confirmCancel.confirm}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
