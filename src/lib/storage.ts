import fs from 'fs/promises'
import path from 'path'
import { Storage } from '@google-cloud/storage'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'

export interface UploadedFile {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  fileSize: number
  category: string
}

export interface StorageOptions {
  category?: string
  allowedTypes?: string[]
  maxSize?: number
  generateSizes?: { width: number; height: number; suffix: string }[]
}

export interface ImageSize {
  width: number
  height: number
  suffix: string
  url: string
  filename: string
}

export class StorageService {
  private static instance: StorageService
  private gcStorage?: Storage
  private bucket?: any
  private isProduction: boolean

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'

    if (this.isProduction && process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_BUCKET_NAME) {
      let storageOptions: any = {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      }

      // Handle both JSON content and file path for GOOGLE_CLOUD_KEY_FILE
      if (process.env.GOOGLE_CLOUD_KEY_FILE) {
        try {
          // Try to parse as JSON first (for Vercel environment variables)
          const credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEY_FILE)
          storageOptions.credentials = credentials
        } catch {
          // If parsing fails, treat as file path (for local development)
          storageOptions.keyFilename = process.env.GOOGLE_CLOUD_KEY_FILE
        }
      }

      this.gcStorage = new Storage(storageOptions)
      this.bucket = this.gcStorage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME)
    }
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  /**
   * Upload file with optional image processing
   */
  async uploadFile(
    file: File,
    uploaderId: string,
    options: StorageOptions = {}
  ): Promise<UploadedFile & { sizes?: ImageSize[] }> {
    const {
      category = 'images',
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxSize = 10 * 1024 * 1024, // 10MB
      generateSizes = []
    } = options

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }

    // Validate file size
    if (file.size > maxSize) {
      throw new Error(`File size ${file.size} exceeds maximum ${maxSize} bytes`)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${sanitizedName}`
    const buffer = Buffer.from(await file.arrayBuffer())

    let url: string
    let sizes: ImageSize[] = []

    if (this.isProduction && this.bucket) {
      // Upload to Google Cloud Storage
      url = await this.uploadToGoogleCloud(buffer, filename, category, file.type)

      // Generate image sizes for cloud storage
      if (generateSizes.length > 0 && file.type.startsWith('image/')) {
        sizes = await this.generateImageSizesCloud(buffer, filename, category, generateSizes, file.type)
      }
    } else {
      // Upload to local file system
      url = await this.uploadToLocal(buffer, filename, category)

      // Generate image sizes for local storage
      if (generateSizes.length > 0 && file.type.startsWith('image/')) {
        const localPath = path.join(process.cwd(), 'public', 'media', category, filename)
        sizes = await this.generateImageSizesLocal(localPath, filename, category, generateSizes)
      }
    }

    // Save to database
    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename,
        originalName: file.name,
        url,
        mimeType: file.type,
        fileSize: file.size,
        category,
        uploaderId,
      },
    })

    return {
      id: mediaFile.id,
      filename: mediaFile.filename,
      originalName: mediaFile.originalName,
      url: mediaFile.url,
      mimeType: mediaFile.mimeType,
      fileSize: mediaFile.fileSize,
      category: mediaFile.category,
      ...(sizes.length > 0 && { sizes })
    }
  }

  /**
   * Upload to local file system
   */
  private async uploadToLocal(buffer: Buffer, filename: string, category: string): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'public', 'media', category)
    await fs.mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, filename)
    await fs.writeFile(filePath, buffer)

    return `/media/${category}/${filename}`
  }

  /**
   * Upload to Google Cloud Storage
   */
  private async uploadToGoogleCloud(buffer: Buffer, filename: string, category: string, mimeType: string): Promise<string> {
    if (!this.bucket) {
      throw new Error('Google Cloud Storage not configured')
    }

    const cloudPath = `${category}/${filename}`
    const file = this.bucket.file(cloudPath)

    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
      },
      public: true,
    })

    // Return public URL
    return `https://storage.googleapis.com/${this.bucket.name}/${cloudPath}`
  }

  /**
   * Generate multiple image sizes for local storage
   */
  private async generateImageSizesLocal(
    originalPath: string,
    originalFilename: string,
    category: string,
    sizes: { width: number; height: number; suffix: string }[]
  ): Promise<ImageSize[]> {
    const generatedSizes: ImageSize[] = []

    for (const size of sizes) {
      const sizeFilename = originalFilename.replace(/(\.[^.]+)$/, `_${size.suffix}$1`)
      const sizeUrl = `/media/${category}/${sizeFilename}`
      const sizeDir = path.dirname(originalPath)
      const sizePath = path.join(sizeDir, sizeFilename)

      try {
        // Use sharp to resize image
        await sharp(originalPath)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center'
          })
          .toFile(sizePath)

        generatedSizes.push({
          width: size.width,
          height: size.height,
          suffix: size.suffix,
          url: sizeUrl,
          filename: sizeFilename
        })
      } catch (error) {
        console.warn(`Failed to generate size ${size.suffix} for ${originalFilename}:`, error)
        // Fallback: copy original file
        await fs.copyFile(originalPath, sizePath)
        generatedSizes.push({
          width: size.width,
          height: size.height,
          suffix: size.suffix,
          url: sizeUrl,
          filename: sizeFilename
        })
      }
    }

    return generatedSizes
  }

  /**
   * Generate multiple image sizes for Google Cloud Storage
   */
  private async generateImageSizesCloud(
    originalBuffer: Buffer,
    originalFilename: string,
    category: string,
    sizes: { width: number; height: number; suffix: string }[],
    mimeType: string
  ): Promise<ImageSize[]> {
    if (!this.bucket) {
      throw new Error('Google Cloud Storage not configured')
    }

    const generatedSizes: ImageSize[] = []

    for (const size of sizes) {
      const sizeFilename = originalFilename.replace(/(\.[^.]+)$/, `_${size.suffix}$1`)
      const cloudPath = `${category}/${sizeFilename}`

      try {
        // Use sharp to resize image
        const resizedBuffer = await sharp(originalBuffer)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center'
          })
          .toBuffer()

        // Upload resized image to Google Cloud
        const file = this.bucket.file(cloudPath)
        await file.save(resizedBuffer, {
          metadata: {
            contentType: mimeType,
          },
          public: true,
        })

        const sizeUrl = `https://storage.googleapis.com/${this.bucket.name}/${cloudPath}`

        generatedSizes.push({
          width: size.width,
          height: size.height,
          suffix: size.suffix,
          url: sizeUrl,
          filename: sizeFilename
        })
      } catch (error) {
        console.warn(`Failed to generate size ${size.suffix} for ${originalFilename}:`, error)
      }
    }

    return generatedSizes
  }

  /**
   * Upload avatar with predefined sizes
   */
  async uploadAvatar(file: File, uploaderId: string): Promise<UploadedFile & { sizes: ImageSize[] }> {
    return this.uploadFile(file, uploaderId, {
      category: 'avatars',
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024, // 5MB
      generateSizes: [
        { width: 64, height: 64, suffix: '64' },
        { width: 128, height: 128, suffix: '128' },
        { width: 256, height: 256, suffix: '256' }
      ]
    })
  }

  /**
   * Upload article image
   */
  async uploadArticleImage(file: File, uploaderId: string): Promise<UploadedFile> {
    return this.uploadFile(file, uploaderId, {
      category: 'articles',
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 10 * 1024 * 1024, // 10MB
    })
  }

  /**
   * Delete file and its variants
   */
  async deleteFile(fileId: string): Promise<void> {
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id: fileId }
    })

    if (!mediaFile) {
      throw new Error('File not found')
    }

    try {
      if (this.isProduction && this.bucket) {
        // Delete from Google Cloud Storage
        await this.deleteFromGoogleCloud(mediaFile.filename, mediaFile.category)
      } else {
        // Delete from local file system
        await this.deleteFromLocal(mediaFile.url, mediaFile.filename)
      }
    } catch (error) {
      console.warn('Could not delete physical file:', error)
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: { id: fileId }
    })
  }

  /**
   * Delete files from local storage
   */
  private async deleteFromLocal(url: string, filename: string): Promise<void> {
    const filePath = path.join(process.cwd(), 'public', url)
    await fs.unlink(filePath)

    // Delete size variants if they exist
    const dir = path.dirname(filePath)
    const baseName = path.basename(filename, path.extname(filename))
    const ext = path.extname(filename)

    try {
      const files = await fs.readdir(dir)
      const variants = files.filter(file => file.startsWith(`${baseName}_`) && file.endsWith(ext))

      for (const variant of variants) {
        await fs.unlink(path.join(dir, variant))
      }
    } catch (error) {
      console.warn('Could not delete variant files:', error)
    }
  }

  /**
   * Delete files from Google Cloud Storage
   */
  private async deleteFromGoogleCloud(filename: string, category: string): Promise<void> {
    if (!this.bucket) {
      throw new Error('Google Cloud Storage not configured')
    }

    // Delete main file
    const mainPath = `${category}/${filename}`
    await this.bucket.file(mainPath).delete()

    // Delete size variants
    const baseName = path.basename(filename, path.extname(filename))
    const ext = path.extname(filename)

    try {
      const [files] = await this.bucket.getFiles({ prefix: `${category}/${baseName}_` })

      for (const file of files) {
        if (file.name.endsWith(ext)) {
          await file.delete()
        }
      }
    } catch (error) {
      console.warn('Could not delete variant files from cloud storage:', error)
    }
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: string): Promise<UploadedFile | null> {
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id: fileId }
    })

    if (!mediaFile) {
      return null
    }

    return {
      id: mediaFile.id,
      filename: mediaFile.filename,
      originalName: mediaFile.originalName,
      url: mediaFile.url,
      mimeType: mediaFile.mimeType,
      fileSize: mediaFile.fileSize,
      category: mediaFile.category,
    }
  }

  /**
   * List files by category
   */
  async listFiles(category?: string, limit = 50, offset = 0): Promise<UploadedFile[]> {
    const mediaFiles = await prisma.mediaFile.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    return mediaFiles.map(file => ({
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      url: file.url,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      category: file.category,
    }))
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance()