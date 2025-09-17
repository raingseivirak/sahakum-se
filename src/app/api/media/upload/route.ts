import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

const ALLOWED_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  videos: ['video/mp4', 'video/mpeg', 'video/quicktime']
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["ADMIN", "EDITOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 })
    }

    // Determine category based on MIME type
    let category = 'documents'
    if (ALLOWED_TYPES.images.includes(file.type)) {
      category = 'images'
    } else if (ALLOWED_TYPES.videos.includes(file.type)) {
      category = 'videos'
    } else if (!ALLOWED_TYPES.documents.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${randomUUID()}.${fileExtension}`

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file to public directory
    const uploadPath = join(process.cwd(), 'public', 'media', category, uniqueFilename)
    await writeFile(uploadPath, buffer)

    // Create database record
    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename: uniqueFilename,
        originalName: file.name,
        url: `/media/${category}/${uniqueFilename}`,
        mimeType: file.type,
        fileSize: file.size,
        category: category,
        uploadedBy: session.user.id,
        altText: formData.get("altText") as string || null,
        caption: formData.get("caption") as string || null,
      }
    })

    return NextResponse.json({
      id: mediaFile.id,
      url: mediaFile.url,
      filename: mediaFile.filename,
      originalName: mediaFile.originalName,
      mimeType: mediaFile.mimeType,
      fileSize: mediaFile.fileSize,
      category: mediaFile.category,
      altText: mediaFile.altText,
      caption: mediaFile.caption,
      createdAt: mediaFile.createdAt
    })

  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}