import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { readdir, stat } from "fs/promises"
import { join } from "path"

// GET /api/media - List all media files
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["ADMIN", "EDITOR", "AUTHOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') // 'images', 'documents', 'videos', or 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (category && category !== 'all') {
      where.category = category
    }
    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get files from database
    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.mediaFile.count({ where })
    ])

    return NextResponse.json({
      files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Media listing error:", error)
    return NextResponse.json({ error: "Failed to load media files" }, { status: 500 })
  }
}

// SYNC /api/media?action=sync - Sync database with file system
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    if (searchParams.get('action') !== 'sync') {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const mediaDir = join(process.cwd(), 'public', 'media')
    const categories = ['images', 'documents', 'videos']
    const syncResults = {
      added: 0,
      removed: 0,
      errors: []
    }

    // Get existing files from database
    const existingFiles = await prisma.mediaFile.findMany()
    const existingUrls = new Set(existingFiles.map(f => f.url))

    // Scan file system and add missing files to database
    for (const category of categories) {
      try {
        const categoryPath = join(mediaDir, category)
        const files = await readdir(categoryPath)

        for (const filename of files) {
          const filePath = join(categoryPath, filename)
          const fileUrl = `/media/${category}/${filename}`

          if (!existingUrls.has(fileUrl)) {
            try {
              const stats = await stat(filePath)
              const mimeType = getMimeType(filename)

              await prisma.mediaFile.create({
                data: {
                  filename,
                  originalName: filename,
                  url: fileUrl,
                  mimeType,
                  fileSize: stats.size,
                  category,
                  uploadedBy: session.user.id
                }
              })

              syncResults.added++
            } catch (error) {
              syncResults.errors.push(`Failed to add ${filename}: ${error}`)
            }
          }
        }
      } catch (error) {
        syncResults.errors.push(`Failed to read ${category} directory: ${error}`)
      }
    }

    // TODO: Check for orphaned database records (files that no longer exist on disk)
    // This would require checking each database record against the file system

    return NextResponse.json(syncResults)

  } catch (error) {
    console.error("Media sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    mov: 'video/quicktime'
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}