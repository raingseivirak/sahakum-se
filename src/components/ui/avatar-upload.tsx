"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, X, User, Loader2 } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatar?: string | null
  userName?: string
  onUploadSuccess?: (avatarUrl: string) => void
  onDeleteSuccess?: () => void
  className?: string
}

export function AvatarUpload({
  currentAvatar,
  userName = 'User',
  onUploadSuccess,
  onDeleteSuccess,
  className = ''
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fontClass = 'font-sweden'

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setError('')
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()

      // Update preview with actual uploaded URL
      setPreviewUrl(result.file.url)

      // Call success callback
      onUploadSuccess?.(result.file.url)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/upload/avatar', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Delete failed')
      }

      // Clear preview
      setPreviewUrl(null)

      // Call success callback
      onDeleteSuccess?.()

    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setIsDeleting(false)
    }
  }

  const displayAvatar = previewUrl || currentAvatar
  const userInitials = userName.charAt(0).toUpperCase()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className={fontClass}>Profile Picture</CardTitle>
        <CardDescription className={fontClass}>
          Upload a profile picture to personalize your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Avatar Display */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-gray-200">
              <AvatarImage src={displayAvatar || undefined} alt={userName} />
              <AvatarFallback className="text-2xl bg-sahakum-navy text-white">
                {userInitials}
              </AvatarFallback>
            </Avatar>

            {(isUploading || isDeleting) && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Upload Controls */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading || isDeleting}
          />

          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isDeleting}
              className={fontClass}
            >
              <Upload className="w-4 h-4 mr-2" />
              {currentAvatar ? 'Change' : 'Upload'}
            </Button>

            {(displayAvatar || currentAvatar) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading || isDeleting}
                className={fontClass}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Recommended: Square image, max 5MB (JPG, PNG, WebP)
          </p>
        </div>
      </CardContent>
    </Card>
  )
}