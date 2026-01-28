"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Image as ImageIcon,
  Search,
  X,
  File,
  Video,
  FileText
} from "lucide-react"

interface MediaFile {
  id: string
  filename: string
  originalName: string
  url: string
  altText?: string
  caption?: string
  mimeType: string
  fileSize?: number
  category: string
  createdAt: string
  uploader?: {
    name: string
    email: string
  }
}

interface MediaSelectorProps {
  value?: string
  onSelect: (url: string) => void
  placeholder?: string
  className?: string
  buttonText?: string
  accept?: 'images' | 'all'
}

export function MediaSelector({
  value,
  onSelect,
  placeholder = "Select media file",
  className = "",
  buttonText = "Browse Media",
  accept = 'images'
}: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>(accept === 'images' ? 'images' : 'all')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        category,
        limit: '100',
        page: '1'
      })

      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/media?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
      }
    } catch (error) {
      console.error('Failed to fetch media files:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMedia()
    }
  }, [isOpen, category, search])

  const handleSelect = () => {
    if (selectedFile) {
      onSelect(selectedFile)
      setIsOpen(false)
      setSelectedFile(null)
    }
  }

  const handleClear = () => {
    onSelect("")
    setSelectedFile(null)
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />
    if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(1)} MB`
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Input
          value={value || ""}
          onChange={(e) => onSelect(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="px-2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button type="button">
              <ImageIcon className="h-4 w-4 mr-2" />
              {buttonText}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] bg-white font-sweden">
            <DialogHeader>
              <DialogTitle className="font-sweden">Select Media File</DialogTitle>
              <DialogDescription className="font-sweden">
                Choose from your media library
              </DialogDescription>
            </DialogHeader>

            {/* Filters */}
            <div className="flex gap-4 py-4 border-b">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 font-sweden"
                  />
                </div>
              </div>
              {accept === 'all' && (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-40 font-sweden">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white font-sweden">
                    <SelectItem value="all" className="font-sweden">All Files</SelectItem>
                    <SelectItem value="images" className="font-sweden">Images</SelectItem>
                    <SelectItem value="documents" className="font-sweden">Documents</SelectItem>
                    <SelectItem value="videos" className="font-sweden">Videos</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Media Grid with Custom Scrollbar */}
            <div
              className="h-96 max-h-[60vh] w-full overflow-y-auto border border-gray-200 rounded-md bg-white scrollbar-custom"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#D4932F #f1f5f9'
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground font-sweden">Loading media files...</div>
                </div>
              ) : files.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-muted-foreground font-sweden">No media files found</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 min-h-fit">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        selectedFile === file.url
                          ? 'ring-2 ring-sahakum-gold-500 bg-sahakum-gold-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedFile(file.url)}
                    >
                      {/* Preview */}
                      <div className="aspect-square bg-gray-50 flex items-center justify-center">
                        {file.mimeType.startsWith('image/') ? (
                          <img
                            src={file.url}
                            alt={file.altText || file.originalName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-muted-foreground">
                            {getFileIcon(file.mimeType)}
                            <span className="text-xs mt-1">{file.category.toUpperCase()}</span>
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="p-2 space-y-1">
                        <div className="text-xs font-medium truncate font-sweden" title={file.originalName}>
                          {file.originalName}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs px-1 py-0 font-sweden">
                            {file.category}
                          </Badge>
                          {file.fileSize && (
                            <span className="text-xs text-muted-foreground font-sweden">
                              {formatFileSize(file.fileSize)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      {selectedFile === file.url && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-sahakum-gold-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground font-sweden">
                {selectedFile && (
                  <span>Selected: {files.find(f => f.url === selectedFile)?.originalName}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="font-sweden"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSelect}
                  disabled={!selectedFile}
                  className="font-sweden"
                >
                  Select File
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview */}
      {value && value.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
        <div className="relative w-32 h-20 bg-gray-50 rounded border overflow-hidden">
          <img
            src={value}
            alt="Selected image"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  )
}