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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  ArrowLeft,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Mail,
  Phone,
  Trash2,
  Download,
} from "lucide-react"
import Link from "next/link"
import { useAdminPermissions } from "@/contexts/admin-permissions-context"
import { useState, useEffect } from "react"

interface RegistrationsPageProps {
  params: { locale: string; id: string }
}

interface Registration {
  id: string
  eventId: string
  registrantType: 'MEMBER' | 'GUEST'
  registrantName: string
  registrantEmail: string
  registrantPhone?: string | null
  numberOfGuests: number
  notes?: string | null
  status: 'CONFIRMED' | 'CANCELLED' | 'WAITLIST'
  registeredAt: string
  userId?: string | null
  createdAt: string
  updatedAt: string
}

interface RegistrationSummary {
  total: number
  confirmed: number
  waitlist: number
  cancelled: number
  totalGuests: number
}

export default function EventRegistrationsPage({ params }: RegistrationsPageProps) {
  const fontClass = 'font-sweden'
  const { permissions } = useAdminPermissions()

  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [summary, setSummary] = useState<RegistrationSummary>({
    total: 0,
    confirmed: 0,
    waitlist: 0,
    cancelled: 0,
    totalGuests: 0
  })
  const [eventTitle, setEventTitle] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    const fetchRegistrations = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch registrations
        const response = await fetch(`/api/events/${params.id}/registrations`)
        if (!response.ok) {
          throw new Error('Failed to fetch registrations')
        }
        const data = await response.json()
        setRegistrations(data.registrations)
        setSummary(data.summary)

        // Fetch event title
        const eventResponse = await fetch(`/api/events/${params.id}`)
        if (eventResponse.ok) {
          const eventData = await eventResponse.json()
          setEventTitle(eventData.translations?.[0]?.title || 'Event')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [params.id])

  const handleUpdateStatus = async (registrationId: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'WAITLIST') => {
    setUpdatingId(registrationId)
    try {
      const response = await fetch(`/api/events/${params.id}/registrations/${registrationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update registration status')
      }

      const updatedRegistration = await response.json()

      // Update local state
      setRegistrations(prev =>
        prev.map(reg =>
          reg.id === registrationId
            ? {
                ...reg,
                status: updatedRegistration.status,
                updatedAt: updatedRegistration.updatedAt
              }
            : reg
        )
      )

      // Recalculate summary
      const newRegs = registrations.map(reg =>
        reg.id === registrationId ? { ...reg, status: newStatus } : reg
      )
      setSummary({
        total: newRegs.length,
        confirmed: newRegs.filter(r => r.status === 'CONFIRMED').length,
        waitlist: newRegs.filter(r => r.status === 'WAITLIST').length,
        cancelled: newRegs.filter(r => r.status === 'CANCELLED').length,
        totalGuests: newRegs
          .filter(r => r.status === 'CONFIRMED')
          .reduce((sum, r) => sum + r.numberOfGuests, 0)
      })
    } catch (err) {
      console.error('Failed to update registration:', err)
      alert('Failed to update registration status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!confirm('Are you sure you want to delete this registration?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${params.id}/registrations/${registrationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete registration')
      }

      // Remove from local state
      setRegistrations(prev => prev.filter(reg => reg.id !== registrationId))

      // Recalculate summary
      const newRegs = registrations.filter(reg => reg.id !== registrationId)
      setSummary({
        total: newRegs.length,
        confirmed: newRegs.filter(r => r.status === 'CONFIRMED').length,
        waitlist: newRegs.filter(r => r.status === 'WAITLIST').length,
        cancelled: newRegs.filter(r => r.status === 'CANCELLED').length,
        totalGuests: newRegs
          .filter(r => r.status === 'CONFIRMED')
          .reduce((sum, r) => sum + r.numberOfGuests, 0)
      })
    } catch (err) {
      console.error('Failed to delete registration:', err)
      alert('Failed to delete registration')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Confirmed
          </Badge>
        )
      case "WAITLIST":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="mr-1 h-3 w-3" />
            Waitlist
          </Badge>
        )
      case "CANCELLED":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "MEMBER":
        return <Badge variant="default" className="bg-sahakum-navy">Member</Badge>
      case "GUEST":
        return <Badge variant="outline">Guest</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const canUpdateStatus = permissions.canEditOthersContent
  const canDelete = permissions.canDeleteOthersContent

  const filteredRegistrations = filterStatus === 'all'
    ? registrations
    : registrations.filter(reg => reg.status === filterStatus.toUpperCase())

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Type', 'Status', 'Guests', 'Registered At', 'Notes']
    const rows = registrations.map(reg => [
      reg.registrantName,
      reg.registrantEmail,
      reg.registrantPhone || '',
      reg.registrantType,
      reg.status,
      reg.numberOfGuests.toString(),
      new Date(reg.registeredAt).toLocaleString(),
      reg.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `registrations-${params.id}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${params.locale}/admin/events`} className={fontClass}>
                  Events
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className={fontClass}>Registrations</BreadcrumbPage>
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
              Event Registrations
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              {eventTitle}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportToCSV} className={fontClass}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" asChild className={fontClass}>
              <Link href={`/${params.locale}/admin/events`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Link>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${fontClass}`}>
                Total Registrations
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${fontClass}`}>{summary.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${fontClass}`}>
                Confirmed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-green-600 ${fontClass}`}>{summary.confirmed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${fontClass}`}>
                Waitlist
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-yellow-600 ${fontClass}`}>{summary.waitlist}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${fontClass}`}>
                Cancelled
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold text-red-600 ${fontClass}`}>{summary.cancelled}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${fontClass}`}>
                Total Attendees
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${fontClass}`}>{summary.totalGuests}</div>
              <p className="text-xs text-muted-foreground">
                Including +{summary.totalGuests - summary.confirmed} guests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={fontClass}>All Registrations</CardTitle>
                <CardDescription className={fontClass}>
                  Manage event registrations and attendee information
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className={`w-[180px] ${fontClass}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="waitlist">Waitlist</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={fontClass}>Attendee</TableHead>
                  <TableHead className={fontClass}>Contact</TableHead>
                  <TableHead className={fontClass}>Type</TableHead>
                  <TableHead className={fontClass}>Status</TableHead>
                  <TableHead className={fontClass}>Guests</TableHead>
                  <TableHead className={fontClass}>Registered</TableHead>
                  <TableHead className={fontClass}>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading registrations...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-red-600">
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : filteredRegistrations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {filterStatus === 'all'
                        ? 'No registrations yet'
                        : `No ${filterStatus} registrations`}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        <div className={fontClass}>{registration.registrantName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center">
                            <Mail className="mr-1 h-3 w-3 text-muted-foreground" />
                            <span className={fontClass}>{registration.registrantEmail}</span>
                          </div>
                          {registration.registrantPhone && (
                            <div className="flex items-center">
                              <Phone className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span className={fontClass}>{registration.registrantPhone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(registration.registrantType)}</TableCell>
                      <TableCell>{getStatusBadge(registration.status)}</TableCell>
                      <TableCell>
                        <div className={`text-center ${fontClass}`}>
                          {registration.numberOfGuests}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${fontClass}`}>
                          {new Date(registration.registeredAt).toLocaleDateString()}
                          <div className="text-xs text-muted-foreground">
                            {new Date(registration.registeredAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {registration.notes && (
                          <div className={`text-sm text-muted-foreground max-w-xs truncate ${fontClass}`}>
                            {registration.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className={`bg-white border border-gray-200 shadow-lg rounded-md p-1 z-50 ${fontClass}`}
                          >
                            {canUpdateStatus && registration.status !== 'CONFIRMED' && (
                              <DropdownMenuItem
                                className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                                onClick={() => handleUpdateStatus(registration.id, 'CONFIRMED')}
                                disabled={updatingId === registration.id}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Confirm
                              </DropdownMenuItem>
                            )}
                            {canUpdateStatus && registration.status !== 'WAITLIST' && (
                              <DropdownMenuItem
                                className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                                onClick={() => handleUpdateStatus(registration.id, 'WAITLIST')}
                                disabled={updatingId === registration.id}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Move to Waitlist
                              </DropdownMenuItem>
                            )}
                            {canUpdateStatus && registration.status !== 'CANCELLED' && (
                              <DropdownMenuItem
                                className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                                onClick={() => handleUpdateStatus(registration.id, 'CANCELLED')}
                                disabled={updatingId === registration.id}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                className={`flex items-center px-2 py-2 text-sm hover:bg-red-50 rounded cursor-pointer text-red-600 ${fontClass}`}
                                onClick={() => handleDeleteRegistration(registration.id)}
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
