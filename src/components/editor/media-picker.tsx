"use client"

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Image as ImageIcon,
  Upload,
  Search,
  Check,
  Loader2,
  FileText,
  Video,
  AlertCircle
} from 'lucide-react'

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
}

interface MediaPickerProps {
  onSelect: (mediaFile: MediaFile) => void
  trigger?: React.ReactNode
  allowedTypes?: string[]
  language?: 'sv' | 'en' | 'km'
}

function MediaPreview({ file }: { file: MediaFile }) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-400">
        <ImageIcon className="h-8 w-8" />
      </div>
    )
  }

  return (
    <img
      src={file.url}
      alt={file.altText || file.originalName}
      className="w-full h-full object-cover transition-transform hover:scale-105"
      loading="lazy"
      onError={() => setImageError(true)}
    />
  )
}

export function MediaPicker({
  onSelect,
  trigger,
  allowedTypes = ['images'],
  language = 'en'
}: MediaPickerProps) {
  const fontClass = language === 'km' ? 'font-khmer' : 'font-sweden'
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(allowedTypes[0] || 'images')
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageWidth, setImageWidth] = useState<string>('')
  const [imageHeight, setImageHeight] = useState<string>('')
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)

  const fetchFiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (searchTerm) params.set('search', searchTerm)

      const response = await fetch(`/api/media?${params}`)
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You need to be logged in to access media files')
        }
        throw new Error('Failed to fetch files')
      }

      const data = await response.json()
      setFiles(data.files || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const uploadedFile = await response.json()
      setFiles(prev => [uploadedFile, ...prev])
      setSelectedFile(uploadedFile)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSelect = () => {
    if (selectedFile) {
      // Pass the file with optional dimensions
      const fileWithDimensions = {
        ...selectedFile,
        width: imageWidth || undefined,
        height: imageHeight || undefined
      }
      onSelect(fileWithDimensions)
      setOpen(false)
      setSelectedFile(null)
      setImageWidth('')
      setImageHeight('')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'images': return <ImageIcon className="h-4 w-4" />
      case 'videos': return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = searchTerm === '' ||
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.altText?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = allowedTypes.includes(file.category)

    return matchesSearch && matchesType
  })

  useEffect(() => {
    if (open) {
      fetchFiles()
    }
  }, [open, selectedCategory, searchTerm])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="sm" className={fontClass}>
            <ImageIcon className="h-4 w-4 mr-2" />
            Select Media
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className={fontClass}>Select Media</DialogTitle>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {allowedTypes.map(type => (
              <TabsTrigger key={type} value={type} className={fontClass}>
                {getCategoryIcon(type)}
                <span className="ml-2">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="space-y-4 mt-4">
            {/* Search and Upload */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search media files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-8 ${fontClass}`}
                />
              </div>

              <div className="relative">
                <Input
                  type="file"
                  accept={selectedCategory === 'images' ? 'image/*' : selectedCategory === 'videos' ? 'video/*' : '*'}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className={fontClass}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className={fontClass}>{error}</AlertDescription>
              </Alert>
            )}

            {/* File Grid */}
            <TabsContent value={selectedCategory} className="space-y-4">
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span className={fontClass}>Loading files...</span>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className={`mt-4 text-lg font-semibold ${fontClass}`}>No files found</h3>
                    <p className={`mt-2 text-muted-foreground ${fontClass}`}>
                      {searchTerm ? 'Try adjusting your search' : 'Upload a file to get started'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`relative border-2 rounded-lg p-2 cursor-pointer transition-all hover:border-sweden-blue hover:shadow-md ${
                          selectedFile?.id === file.id
                            ? 'border-sweden-blue bg-sweden-blue/10 shadow-lg ring-2 ring-sweden-blue/20'
                            : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedFile(file)}
                      >
                        {/* Preview */}
                        <div className="aspect-square bg-gray-50 rounded flex items-center justify-center overflow-hidden mb-2 border border-gray-100">
                          {file.category === 'images' ? (
                            <MediaPreview file={file} />
                          ) : (
                            <div className="text-gray-400 text-2xl">
                              {getCategoryIcon(file.category)}
                            </div>
                          )}
                        </div>

                        {/* File Info */}
                        <div className="space-y-1">
                          <p className={`text-sm font-medium truncate ${fontClass}`}>
                            {file.originalName}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {file.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.fileSize)}
                            </span>
                          </div>
                          {file.altText && (
                            <p className="text-xs text-muted-foreground truncate">
                              Alt: {file.altText}
                            </p>
                          )}
                        </div>

                        {/* Selected indicator */}
                        {selectedFile?.id === file.id && (
                          <div className="absolute -top-1 -right-1 bg-sweden-blue text-white rounded-full p-1.5 shadow-lg border-2 border-white">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </div>

          {/* Image Size Controls */}
          {selectedFile && selectedFile.category === 'images' && (
            <div className="space-y-3 p-4 bg-gray-50 border-t">
              <h4 className={`text-sm font-medium ${fontClass}`}>Image Size (Optional)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs text-gray-600 ${fontClass}`}>Width (px)</label>
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={imageWidth}
                    onChange={(e) => setImageWidth(e.target.value)}
                    className={`text-sm ${fontClass}`}
                  />
                </div>
                <div>
                  <label className={`text-xs text-gray-600 ${fontClass}`}>Height (px)</label>
                  <Input
                    type="number"
                    placeholder="Auto"
                    value={imageHeight}
                    onChange={(e) => setImageHeight(e.target.value)}
                    className={`text-sm ${fontClass}`}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="maintainAspectRatio"
                  checked={maintainAspectRatio}
                  onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="maintainAspectRatio" className={`text-xs text-gray-600 ${fontClass}`}>
                  Maintain aspect ratio
                </label>
              </div>
              <p className={`text-xs text-gray-500 ${fontClass}`}>
                Leave empty for responsive sizing. Values are in pixels.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className={fontClass}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSelect}
              disabled={!selectedFile}
              className={fontClass}
            >
              Select File
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}