'use client'

import { useState, useEffect } from "react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  RefreshCw,
  Search,
  Upload,
  Image,
  FileText,
  Video,
  Loader2,
  CheckCircle,
  AlertCircle,
  Folder,
} from "lucide-react"

interface MediaFile {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  fileSize: number
  category: string
  altText?: string
  caption?: string
  createdAt: string
  uploader?: {
    name: string
    email: string
  }
}

interface SyncResult {
  added: number
  updated: number
  removed: number
  errors: string[]
  environment?: string
  hybridMode?: boolean
  syncedSources?: string[]
}

interface MediaPageProps {
  params: { locale: string }
}

export default function MediaPage({ params }: MediaPageProps) {
  const fontClass = 'font-sweden'
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (searchTerm) params.set('search', searchTerm)

      const response = await fetch(`/api/media?${params}`)
      if (!response.ok) throw new Error('Failed to fetch files')

      const data = await response.json()
      setFiles(data.files || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    setError(null)

    try {
      // In production, use hybrid mode to sync from both local filesystem and Google Cloud Storage
      const isProduction = process.env.NODE_ENV === 'production'
      const syncUrl = isProduction ? '/api/media/sync?hybrid=true' : '/api/media/sync'

      const response = await fetch(syncUrl, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Sync failed')
      }

      const result = await response.json()
      setSyncResult(result)

      // Refresh file list
      await fetchFiles()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'images': return <Image className="h-4 w-4" />
      case 'videos': return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = searchTerm === '' ||
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.altText?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  useEffect(() => {
    fetchFiles()
  }, [selectedCategory, searchTerm])

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
                <BreadcrumbPage className={fontClass}>Media Library</BreadcrumbPage>
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
              Media Library
            </h2>
            <p className={`text-muted-foreground ${fontClass}`}>
              Manage your media files and sync with filesystem
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              className={fontClass}
            >
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync with Files
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sync Results */}
        {syncResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className={fontClass}>
              <strong>Sync completed:</strong> {syncResult.added} files added, {syncResult.updated} updated, {syncResult.removed} removed
              {syncResult.hybridMode && (
                <div className="mt-1 text-sm text-muted-foreground">
                  <strong>Hybrid mode:</strong> Synced from {syncResult.syncedSources?.join(' and ') || 'multiple sources'}
                </div>
              )}
              {syncResult.errors.length > 0 && (
                <div className="mt-2">
                  <strong>Errors:</strong>
                  <ul className="list-disc ml-4">
                    {syncResult.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={fontClass}>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-8 ${fontClass}`}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {['all', 'images', 'documents', 'videos'].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={fontClass}
                  >
                    {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Files Table */}
        <Card>
          <CardHeader>
            <CardTitle className={fontClass}>Files ({filteredFiles.length})</CardTitle>
            <CardDescription className={fontClass}>
              Media files in your library
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading files...</span>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className={`mt-4 text-lg font-semibold ${fontClass}`}>No files found</h3>
                <p className={`mt-2 text-muted-foreground ${fontClass}`}>
                  {searchTerm || selectedCategory !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add files to /public/media/ and click "Sync with Files"'
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={fontClass}>Preview</TableHead>
                    <TableHead className={fontClass}>Name</TableHead>
                    <TableHead className={fontClass}>Type</TableHead>
                    <TableHead className={fontClass}>Size</TableHead>
                    <TableHead className={fontClass}>Uploaded By</TableHead>
                    <TableHead className={fontClass}>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                          {file.category === 'images' ? (
                            <img
                              src={file.url}
                              alt={file.altText || file.originalName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getCategoryIcon(file.category)
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`font-medium ${fontClass}`}>{file.originalName}</p>
                          <p className={`text-sm text-muted-foreground ${fontClass}`}>
                            {file.url}
                          </p>
                          {file.altText && (
                            <p className={`text-xs text-muted-foreground ${fontClass}`}>
                              Alt: {file.altText}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(file.category)}
                          {file.category}
                        </Badge>
                      </TableCell>
                      <TableCell className={fontClass}>
                        {formatFileSize(file.fileSize)}
                      </TableCell>
                      <TableCell className={fontClass}>
                        {file.uploader?.name || 'System'}
                      </TableCell>
                      <TableCell className={fontClass}>
                        {new Date(file.createdAt).toLocaleDateString()}
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