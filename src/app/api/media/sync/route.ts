import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { readdir, stat } from "fs/promises"
import { join } from "path"

// POST /api/media/sync - Comprehensive sync between filesystem and database
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    const mediaDir = join(process.cwd(), 'public', 'media')
    const categories = ['images', 'documents', 'videos']

    const syncResults = {
      added: 0,
      updated: 0,
      removed: 0,
      errors: [] as string[]
    }

    console.log('🔄 Starting media sync...')

    // Step 1: Get all existing database records
    const existingFiles = await prisma.mediaFile.findMany()
    const existingByUrl = new Map(existingFiles.map(f => [f.url, f]))
    const foundUrls = new Set<string>()

    // Step 2: Scan filesystem and sync files
    for (const category of categories) {
      try {
        const categoryPath = join(mediaDir, category)
        console.log(`📁 Scanning ${categoryPath}...`)

        const files = await readdir(categoryPath)
        console.log(`Found ${files.length} files in ${category}`)

        for (const filename of files) {
          // Skip hidden files
          if (filename.startsWith('.')) continue

          const filePath = join(categoryPath, filename)
          const fileUrl = `/media/${category}/${filename}`
          foundUrls.add(fileUrl)

          try {
            const stats = await stat(filePath)
            const mimeType = getMimeType(filename)
            const existingFile = existingByUrl.get(fileUrl)

            if (!existingFile) {
              // New file - add to database
              await prisma.mediaFile.create({
                data: {
                  filename,
                  originalName: filename,
                  url: fileUrl,
                  mimeType,
                  fileSize: stats.size,
                  category,
                  uploaderId: session.user.id
                }
              })

              syncResults.added++
              console.log(`➕ Added: ${filename}`)
            } else {
              // Existing file - check if we need to update
              const needsUpdate =
                existingFile.fileSize !== stats.size ||
                existingFile.mimeType !== mimeType ||
                existingFile.category !== category

              if (needsUpdate) {
                await prisma.mediaFile.update({
                  where: { id: existingFile.id },
                  data: {
                    mimeType,
                    fileSize: stats.size,
                    category,
                    updatedAt: new Date()
                  }
                })

                syncResults.updated++
                console.log(`🔄 Updated: ${filename}`)
              }
            }
          } catch (fileError) {
            const errorMsg = `Failed to process ${filename}: ${fileError}`
            syncResults.errors.push(errorMsg)
            console.error('❌', errorMsg)
          }
        }
      } catch (dirError) {
        const errorMsg = `Failed to read ${category} directory: ${dirError}`
        syncResults.errors.push(errorMsg)
        console.error('❌', errorMsg)
      }
    }

    // Step 3: Remove orphaned database records (files that no longer exist)
    const orphanedFiles = existingFiles.filter(file => !foundUrls.has(file.url))

    if (orphanedFiles.length > 0) {
      console.log(`🗑️ Removing ${orphanedFiles.length} orphaned records...`)

      for (const orphan of orphanedFiles) {
        try {
          await prisma.mediaFile.delete({
            where: { id: orphan.id }
          })
          syncResults.removed++
          console.log(`🗑️ Removed: ${orphan.originalName}`)
        } catch (deleteError) {
          const errorMsg = `Failed to remove orphaned record ${orphan.originalName}: ${deleteError}`
          syncResults.errors.push(errorMsg)
          console.error('❌', errorMsg)
        }
      }
    }

    console.log('✅ Sync completed:', syncResults)

    return NextResponse.json(syncResults)

  } catch (error) {
    console.error("❌ Media sync error:", error)
    return NextResponse.json({
      error: "Sync failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: { [key: string]: string } = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',

    // Videos
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm'
  }

  return mimeTypes[ext || ''] || 'application/octet-stream'
}