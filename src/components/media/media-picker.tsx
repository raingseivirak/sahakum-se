'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Upload,
  Search,
  Image,
  FileText,
  Video,
  Check,
  Loader2,
  RefreshCw,
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
    id: string
    name: string
    email: string
  }
}

interface MediaPickerProps {
  onSelect: (file: MediaFile) => void
  selectedId?: string
  trigger?: React.ReactNode
  multiple?: boolean
  allowedTypes?: string[]
}

export default function MediaPicker({
  onSelect,
  selectedId,
  trigger,
  multiple = false,
  allowedTypes = ['images', 'documents', 'videos']
}: MediaPickerProps) {
  const fontClass = 'font-sweden'
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (searchTerm) params.set('search', searchTerm)

      const response = await fetch(`/api/media?${params}`)
      if (!response.ok) throw new Error('Failed to fetch files')

      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Failed to fetch files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      if (altText) formData.append('altText', altText)
      if (caption) formData.append('caption', caption)

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const newFile = await response.json()
      setFiles(prev => [newFile, ...prev])

      // Reset form
      setUploadFile(null)
      setAltText('')
      setCaption('')
      setActiveTab('browse')

      // Auto-select uploaded file
      if (!multiple) {
        onSelect(newFile)
        setOpen(false)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/media?action=sync', {
        method: 'PUT'
      })

      if (!response.ok) throw new Error('Sync failed')

      const results = await response.json()
      console.log('Sync results:', results)

      // Refresh file list
      await fetchFiles()
    } catch (error) {
      console.error('Sync failed:', error)
      alert('Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSyncing(false)
    }
  }

  const handleFileSelect = (file: MediaFile) => {
    if (multiple) {
      setSelectedFiles(prev => {
        const exists = prev.find(f => f.id === file.id)
        if (exists) {
          return prev.filter(f => f.id !== file.id)
        } else {
          return [...prev, file]
        }
      })
    } else {
      onSelect(file)
      setOpen(false)
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

  useEffect(() => {
    if (open) {
      fetchFiles()
    }
  }, [open, selectedCategory, searchTerm])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className={fontClass}>
            <Upload className="mr-2 h-4 w-4" />
            Select Media
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className={fontClass}>Media Library</DialogTitle>
          <DialogDescription className={fontClass}>
            Browse existing media or upload new files
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse" className={fontClass}>Browse</TabsTrigger>
            <TabsTrigger value="upload" className={fontClass}>Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Filters */}
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
                {['all', 'images', 'documents', 'videos'].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={fontClass}
                  >
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
                className={fontClass}
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sync
              </Button>
            </div>

            {/* File Grid */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : files.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No files found
                </div>
              ) : (
                files.map((file) => (
                  <Card
                    key={file.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedId === file.id || selectedFiles.find(f => f.id === file.id)
                        ? 'ring-2 ring-sahakum-gold'
                        : ''
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    <CardContent className="p-2">
                      <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                        {file.category === 'images' ? (
                          <img
                            src={file.url}
                            alt={file.altText || file.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            {getCategoryIcon(file.category)}
                            <span className="text-xs mt-1 text-center truncate w-full px-1">
                              {file.originalName}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className={`text-xs truncate ${fontClass}`} title={file.originalName}>
                          {file.originalName}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-xs">
                            {file.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.fileSize)}
                          </span>
                        </div>
                      </div>

                      {(selectedId === file.id || selectedFiles.find(f => f.id === file.id)) && (
                        <div className="absolute top-1 right-1 bg-sahakum-gold text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload" className={fontClass}>Select File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept={allowedTypes.includes('images') ? 'image/*,' : ''}
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className={fontClass}
                />
              </div>

              {uploadFile && uploadFile.type.startsWith('image/') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="alt-text" className={fontClass}>Alt Text</Label>
                    <Input
                      id="alt-text"
                      placeholder="Describe the image for accessibility"
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                      className={fontClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caption" className={fontClass}>Caption</Label>
                    <Textarea
                      id="caption"
                      placeholder="Optional caption for the image"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className={fontClass}
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {activeTab === 'upload' ? (
            <Button
              onClick={handleUpload}
              disabled={!uploadFile || uploading}
              className={fontClass}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
          ) : multiple ? (
            <Button
              onClick={() => {
                selectedFiles.forEach(onSelect)
                setOpen(false)
              }}
              disabled={selectedFiles.length === 0}
              className={fontClass}
            >
              Select {selectedFiles.length} Files
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}