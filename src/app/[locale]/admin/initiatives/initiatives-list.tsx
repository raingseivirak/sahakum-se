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
  Lightbulb,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Calendar,
  Users,
  Loader2,
  CheckSquare,
} from "lucide-react"
import Link from "next/link"

interface Initiative {
  id: string
  slug: string
  status: string
  visibility: string
  category: string
  startDate: string
  endDate?: string
  projectLead: {
    id: string
    name: string
    email: string
  }
  translations: Array<{
    id: string
    language: string
    title: string
    shortDescription: string
  }>
  _count: {
    members: number
    tasks: number
    updates: number
  }
}

interface InitiativesListProps {
  locale: string
}

export function InitiativesList({ locale }: InitiativesListProps) {
  const fontClass = 'font-sweden'
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchInitiatives()
  }, [])

  const fetchInitiatives = async () => {
    try {
      const response = await fetch("/api/initiatives")
      if (!response.ok) {
        throw new Error("Failed to fetch initiatives")
      }
      const data = await response.json()
      setInitiatives(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "PUBLISHED":
        return <Badge variant="default" className="bg-green-500">Published</Badge>
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>
      case "ARCHIVED":
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility.toUpperCase()) {
      case "PUBLIC":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Public</Badge>
      case "MEMBERS_ONLY":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Members Only</Badge>
      default:
        return <Badge variant="outline">{visibility}</Badge>
    }
  }

  const getCategoryBadge = (category: string) => {
    const categoryLabels: { [key: string]: string } = {
      CULTURAL_EVENT: "Cultural Event",
      BUSINESS: "Business",
      EDUCATION: "Education",
      TRANSLATION: "Translation",
      SOCIAL: "Social",
      OTHER: "Other",
    }
    return <Badge variant="outline">{categoryLabels[category] || category}</Badge>
  }

  const getLanguageBadges = (translations: Initiative['translations']) => {
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

  const getPrimaryTitle = (translations: Initiative['translations']) => {
    // Prefer English, then Swedish, then any other language
    const english = translations.find(t => t.language === 'en')
    const swedish = translations.find(t => t.language === 'sv')
    const primary = english || swedish || translations[0]
    return primary?.title || "Untitled"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleDelete = async (initiativeId: string) => {
    setDeletingId(initiativeId)
    try {
      const response = await fetch(`/api/initiatives/${initiativeId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete initiative")
      }

      // Remove the deleted initiative from the list
      setInitiatives(initiatives.filter(init => init.id !== initiativeId))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete initiative")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className={`ml-2 ${fontClass}`}>Loading initiatives...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className={`text-red-500 ${fontClass}`}>Error: {error}</p>
        <Button onClick={fetchInitiatives} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (initiatives.length === 0) {
    return (
      <div className="text-center p-8">
        <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className={`text-lg font-medium text-muted-foreground ${fontClass}`}>
          No initiatives found
        </h3>
        <p className={`text-sm text-muted-foreground ${fontClass}`}>
          Create your first initiative to get started
        </p>
        <Button asChild className="mt-4">
          <Link href={`/${locale}/admin/initiatives/create`}>
            Create Initiative
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className={fontClass}>Title</TableHead>
          <TableHead className={fontClass}>Category</TableHead>
          <TableHead className={fontClass}>Status</TableHead>
          <TableHead className={fontClass}>Visibility</TableHead>
          <TableHead className={fontClass}>Languages</TableHead>
          <TableHead className={fontClass}>Project Lead</TableHead>
          <TableHead className={fontClass}>Team</TableHead>
          <TableHead className={fontClass}>Tasks</TableHead>
          <TableHead className={fontClass}>Start Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {initiatives.map((initiative) => (
          <TableRow key={initiative.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-3">
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className={`font-medium ${fontClass}`}>{getPrimaryTitle(initiative.translations)}</div>
                  <div className={`text-sm text-muted-foreground ${fontClass}`}>/{initiative.slug}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{getCategoryBadge(initiative.category)}</TableCell>
            <TableCell>{getStatusBadge(initiative.status)}</TableCell>
            <TableCell>{getVisibilityBadge(initiative.visibility)}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                {getLanguageBadges(initiative.translations)}
              </div>
            </TableCell>
            <TableCell className={fontClass}>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{initiative.projectLead.name || initiative.projectLead.email}</span>
              </div>
            </TableCell>
            <TableCell className={fontClass}>
              <div className="flex items-center space-x-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span>{initiative._count.members}</span>
              </div>
            </TableCell>
            <TableCell className={fontClass}>
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-3 w-3 text-muted-foreground" />
                <span>{initiative._count.tasks}</span>
              </div>
            </TableCell>
            <TableCell className={fontClass}>
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{formatDate(initiative.startDate)}</span>
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
                    onClick={() => window.open(`/${locale}/initiatives/${initiative.slug}`, '_blank')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Initiative
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                    onClick={() => window.location.href = `/${locale}/admin/initiatives/${initiative.id}/edit`}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className={`flex items-center px-2 py-2 text-sm hover:bg-red-50 rounded cursor-pointer text-red-600 ${fontClass}`}
                        disabled={deletingId === initiative.id}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {deletingId === initiative.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        {deletingId === initiative.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent className={`bg-white ${fontClass}`}>
                      <AlertDialogHeader>
                        <AlertDialogTitle className={fontClass}>
                          Delete Initiative
                        </AlertDialogTitle>
                        <AlertDialogDescription className={fontClass}>
                          Are you sure you want to delete "{getPrimaryTitle(initiative.translations)}"?
                          This action cannot be undone and will permanently remove the initiative, all team members, tasks, and updates.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className={fontClass}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className={`bg-red-600 hover:bg-red-700 ${fontClass}`}
                          onClick={() => handleDelete(initiative.id)}
                        >
                          Delete Initiative
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
