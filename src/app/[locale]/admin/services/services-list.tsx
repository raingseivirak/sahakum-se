"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import {
  Grid3X3,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Clock,
  Loader2,
  ExternalLink,
  ToggleLeft,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Service {
  id: string
  slug: string
  icon: string | null
  featuredImg: string | null
  colorTheme: string | null
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
  translations: Array<{
    id: string
    serviceId: string
    language: string
    title: string
    description: string
    buttonText: string
  }>
}

interface ServicesListProps {
  locale: string
}

export function ServicesList({ locale }: ServicesListProps) {
  const fontClass = 'font-sweden'
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      if (!response.ok) {
        throw new Error("Failed to fetch services")
      }
      const data = await response.json()
      setServices(data.services || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge variant="default" className="bg-green-500">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    )
  }

  const getColorThemeBadge = (colorTheme: string | null) => {
    const themes = {
      'navy': { label: 'Navy', className: 'bg-sahakum-navy-500' },
      'gold': { label: 'Gold', className: 'bg-sahakum-gold-500' },
      'blue': { label: 'Blue', className: 'bg-sweden-blue-500' },
      'custom': { label: 'Custom', className: 'bg-gradient-to-r from-sahakum-navy-500 to-sahakum-gold-500' }
    }

    const theme = colorTheme || 'navy'
    const themeConfig = themes[theme as keyof typeof themes] || { label: theme, className: 'bg-gray-500' }

    return (
      <Badge variant="default" className={themeConfig.className}>
        {themeConfig.label}
      </Badge>
    )
  }

  const getLanguageBadges = (translations: Service['translations']) => {
    const languageMap: { [key: string]: string } = {
      sv: "SV",
      en: "EN",
      km: "KM",
    }

    return translations.map((translation) => (
      <Badge key={translation.language} variant="outline" className="text-xs">
        {languageMap[translation.language] || translation.language.toUpperCase()}
      </Badge>
    ))
  }

  const getPrimaryTitle = (translations: Service['translations']) => {
    // Prefer English, then Swedish, then any other language
    const english = translations.find(t => t.language === 'en')
    const swedish = translations.find(t => t.language === 'sv')
    const primary = english || swedish || translations[0]
    return primary?.title || "Untitled"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleDelete = async (serviceId: string) => {
    setDeletingId(serviceId)
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete service")
      }

      // Remove the deleted service from the list
      setServices(services.filter(service => service.id !== serviceId))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete service")
    } finally {
      setDeletingId(null)
    }
  }

  const toggleActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update service")
      }

      // Update the service in the list
      setServices(services.map(service =>
        service.id === serviceId
          ? { ...service, active: !currentStatus }
          : service
      ))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update service")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className={`ml-2 ${fontClass}`}>Loading services...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className={`text-red-500 ${fontClass}`}>Error: {error}</p>
        <Button onClick={fetchServices} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center p-8">
        <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className={`text-lg font-medium text-muted-foreground ${fontClass}`}>
          No services found
        </h3>
        <p className={`text-sm text-muted-foreground ${fontClass}`}>
          Create your first service to get started
        </p>
        <Button asChild className="mt-4">
          <Link href={`/${locale}/admin/services/create`}>
            Create Service
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className={fontClass}>Service</TableHead>
          <TableHead className={fontClass}>Theme</TableHead>
          <TableHead className={fontClass}>Status</TableHead>
          <TableHead className={fontClass}>Languages</TableHead>
          <TableHead className={fontClass}>Order</TableHead>
          <TableHead className={fontClass}>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services
          .sort((a, b) => a.order - b.order)
          .map((service) => (
          <TableRow key={service.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-3">
                {service.featuredImg ? (
                  <div className="w-10 h-10 relative rounded-md overflow-hidden">
                    <Image
                      src={service.featuredImg}
                      alt={getPrimaryTitle(service.translations)}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-sahakum-navy-600 to-sahakum-gold-600 rounded-md flex items-center justify-center">
                    <Grid3X3 className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <div className={`font-medium ${fontClass}`}>{getPrimaryTitle(service.translations)}</div>
                  <div className={`text-sm text-muted-foreground ${fontClass}`}>
                    /{service.slug}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{getColorThemeBadge(service.colorTheme)}</TableCell>
            <TableCell>{getStatusBadge(service.active)}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                {getLanguageBadges(service.translations)}
              </div>
            </TableCell>
            <TableCell className={fontClass}>
              <Badge variant="outline">{service.order}</Badge>
            </TableCell>
            <TableCell className={fontClass}>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{formatDate(service.updatedAt)}</span>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`bg-white border border-gray-200 shadow-lg rounded-md p-1 z-50 ${fontClass}`}>
                  <DropdownMenuItem
                    className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                    onClick={() => window.open(`/${locale}/${service.slug === 'blog' ? 'blog' : service.slug === 'membership' ? 'join' : service.slug}`, '_blank')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Service
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                    onClick={() => window.location.href = `/${locale}/admin/services/${service.id}/edit`}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                    onClick={() => toggleActive(service.id, service.active)}
                  >
                    <ToggleLeft className="mr-2 h-4 w-4" />
                    {service.active ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className={`flex items-center px-2 py-2 text-sm hover:bg-red-50 rounded cursor-pointer text-red-600 ${fontClass}`}
                        disabled={deletingId === service.id}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {deletingId === service.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        {deletingId === service.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent className={fontClass}>
                      <AlertDialogHeader>
                        <AlertDialogTitle className={fontClass}>
                          Delete Service
                        </AlertDialogTitle>
                        <AlertDialogDescription className={fontClass}>
                          Are you sure you want to delete "{getPrimaryTitle(service.translations)}"?
                          This action cannot be undone and will permanently remove the service and all its translations.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className={fontClass}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className={`bg-red-600 hover:bg-red-700 ${fontClass}`}
                          onClick={() => handleDelete(service.id)}
                        >
                          Delete Service
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}