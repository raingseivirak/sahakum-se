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
  FileText,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Clock,
  User,
  Loader2,
} from "lucide-react"
import Link from "next/link"

interface Page {
  id: string
  slug: string
  status: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  author: {
    name: string
    email: string
  }
  translations: Array<{
    id: string
    language: string
    title: string
    content: string
    excerpt?: string
  }>
}

interface PagesListProps {
  locale: string
}

export function PagesList({ locale }: PagesListProps) {
  const fontClass = 'font-sweden'
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/pages")
      if (!response.ok) {
        throw new Error("Failed to fetch pages")
      }
      const data = await response.json()
      setPages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "published":
        return <Badge variant="default" className="bg-green-500">Published</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "archived":
        return <Badge variant="outline">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getLanguageBadges = (translations: Page['translations']) => {
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

  const getPrimaryTitle = (translations: Page['translations']) => {
    // Prefer English, then Swedish, then any other language
    const english = translations.find(t => t.language === 'en')
    const swedish = translations.find(t => t.language === 'sv')
    const primary = english || swedish || translations[0]
    return primary?.title || "Untitled"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleDelete = async (pageId: string) => {
    setDeletingId(pageId)
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete page")
      }

      // Remove the deleted page from the list
      setPages(pages.filter(page => page.id !== pageId))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete page")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className={`ml-2 ${fontClass}`}>Loading pages...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className={`text-red-500 ${fontClass}`}>Error: {error}</p>
        <Button onClick={fetchPages} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <div className="text-center p-8">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className={`text-lg font-medium text-muted-foreground ${fontClass}`}>
          No pages found
        </h3>
        <p className={`text-sm text-muted-foreground ${fontClass}`}>
          Create your first page to get started
        </p>
        <Button asChild className="mt-4">
          <Link href={`/${locale}/admin/pages/create`}>
            Create Page
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
            <TableHead className={fontClass}>Status</TableHead>
            <TableHead className={fontClass}>Languages</TableHead>
            <TableHead className={fontClass}>Author</TableHead>
            <TableHead className={fontClass}>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {pages.map((page) => (
          <TableRow key={page.id}>
            <TableCell className="font-medium">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className={`font-medium ${fontClass}`}>{getPrimaryTitle(page.translations)}</div>
                  <div className={`text-sm text-muted-foreground ${fontClass}`}>/{page.slug}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(page.status)}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                {getLanguageBadges(page.translations)}
              </div>
            </TableCell>
            <TableCell className={fontClass}>
              <div className="flex items-center space-x-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span>{page.author.name || page.author.email}</span>
              </div>
            </TableCell>
            <TableCell className={fontClass}>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>{formatDate(page.updatedAt)}</span>
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
                    onClick={() => window.open(`/${locale}/${page.slug}`, '_blank')}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Page
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={`flex items-center px-2 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer ${fontClass}`}
                    onClick={() => window.location.href = `/${locale}/admin/pages/${page.id}/edit`}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className={`flex items-center px-2 py-2 text-sm hover:bg-red-50 rounded cursor-pointer text-red-600 ${fontClass}`}
                        disabled={deletingId === page.id}
                        onSelect={(e) => e.preventDefault()}
                      >
                        {deletingId === page.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        {deletingId === page.id ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent className={fontClass}>
                      <AlertDialogHeader>
                        <AlertDialogTitle className={fontClass}>
                          Delete Page
                        </AlertDialogTitle>
                        <AlertDialogDescription className={fontClass}>
                          Are you sure you want to delete "{getPrimaryTitle(page.translations)}"?
                          This action cannot be undone and will permanently remove the page and all its translations.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className={fontClass}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className={`bg-red-600 hover:bg-red-700 ${fontClass}`}
                          onClick={() => handleDelete(page.id)}
                        >
                          Delete Page
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