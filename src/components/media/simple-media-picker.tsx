'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"

interface SimpleMediaFile {
  name: string
  url: string
  type: 'image' | 'document' | 'video'
  size?: number
}

interface SimpleMediaPickerProps {
  onSelect: (file: SimpleMediaFile) => void
  selectedUrl?: string
  trigger?: React.ReactNode
}

export default function SimpleMediaPicker({
  onSelect,
  selectedUrl,
  trigger
}: SimpleMediaPickerProps) {
  const fontClass = 'font-sweden'
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [files, setFiles] = useState<SimpleMediaFile[]>([])
  const [loading, setLoading] = useState(false)

  // Scan filesystem for media files
  const scanMediaFiles = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/media/scan')
      if (!response.ok) throw new Error('Failed to scan files')
      const data = await response.json()
      setFiles(data.files || [])
    } catch (error) {
      console.error('Failed to scan files:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFileSelect = (file: SimpleMediaFile) => {
    onSelect(file)
    setOpen(false)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  useEffect(() => {
    if (open) {
      scanMediaFiles()
    }
  }, [open])

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
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className={fontClass}>Select Media File</DialogTitle>
          <DialogDescription className={fontClass}>
            Choose from available media files
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-8 ${fontClass}`}
            />
          </div>

          {/* File Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-8">
                Loading files...
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No files found
              </div>
            ) : (
              filteredFiles.map((file) => (
                <Card
                  key={file.url}
                  className={`cursor-pointer transition-all hover:shadow-md relative ${
                    selectedUrl === file.url ? 'ring-2 ring-sahakum-gold' : ''
                  }`}
                  onClick={() => handleFileSelect(file)}
                >
                  <CardContent className="p-2">
                    <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          {getFileIcon(file.type)}
                          <span className="text-xs mt-1 text-center truncate w-full px-1">
                            {file.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className={`text-xs truncate ${fontClass}`} title={file.name}>
                      {file.name}
                    </p>

                    {selectedUrl === file.url && (
                      <div className="absolute top-1 right-1 bg-sahakum-gold text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}