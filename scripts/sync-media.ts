#!/usr/bin/env npx tsx

/**
 * Media Sync CLI Tool
 *
 * Syncs the media database with files in /public/media/
 *
 * Usage:
 *   npm run sync-media
 *   or
 *   npx tsx scripts/sync-media.ts
 */

import { PrismaClient } from '@prisma/client'
import { readdir, stat } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

interface SyncResults {
  added: number
  updated: number
  removed: number
  errors: string[]
}

async function syncMedia(): Promise<SyncResults> {
  const results: SyncResults = {
    added: 0,
    updated: 0,
    removed: 0,
    errors: []
  }

  console.log('🚀 Starting media sync...')

  try {
    const mediaDir = join(process.cwd(), 'public', 'media')
    const categories = ['images', 'documents', 'videos']

    // Get existing files from database
    const existingFiles = await prisma.mediaFile.findMany()
    const existingByUrl = new Map(existingFiles.map(f => [f.url, f]))
    const foundUrls = new Set<string>()

    // Default admin user ID for system files
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      throw new Error('No admin user found. Please create an admin user first.')
    }

    // Scan each category
    for (const category of categories) {
      console.log(`📁 Scanning ${category}...`)

      try {
        const categoryPath = join(mediaDir, category)
        const files = await readdir(categoryPath)

        for (const filename of files) {
          if (filename.startsWith('.')) continue // Skip hidden files

          const filePath = join(categoryPath, filename)
          const fileUrl = `/media/${category}/${filename}`
          foundUrls.add(fileUrl)

          try {
            const stats = await stat(filePath)
            const existingFile = existingByUrl.get(fileUrl)

            if (!existingFile) {
              // New file
              await prisma.mediaFile.create({
                data: {
                  filename,
                  originalName: filename,
                  url: fileUrl,
                  mimeType: getMimeType(filename),
                  fileSize: stats.size,
                  category,
                  uploadedBy: adminUser.id
                }
              })

              results.added++
              console.log(`✅ Added: ${filename}`)
            } else {
              // Check if update needed
              if (existingFile.fileSize !== stats.size) {
                await prisma.mediaFile.update({
                  where: { id: existingFile.id },
                  data: {
                    fileSize: stats.size,
                    updatedAt: new Date()
                  }
                })

                results.updated++
                console.log(`🔄 Updated: ${filename}`)
              }
            }
          } catch (error) {
            const errorMsg = `Failed to process ${filename}: ${error}`
            results.errors.push(errorMsg)
            console.error(`❌ ${errorMsg}`)
          }
        }
      } catch (error) {
        const errorMsg = `Failed to read ${category} directory: ${error}`
        results.errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    // Remove orphaned records
    const orphanedFiles = existingFiles.filter(file => !foundUrls.has(file.url))

    for (const orphan of orphanedFiles) {
      try {
        await prisma.mediaFile.delete({
          where: { id: orphan.id }
        })
        results.removed++
        console.log(`🗑️ Removed orphaned: ${orphan.originalName}`)
      } catch (error) {
        const errorMsg = `Failed to remove orphaned ${orphan.originalName}: ${error}`
        results.errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    return results

  } catch (error) {
    console.error('💥 Sync failed:', error)
    throw error
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
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    mov: 'video/quicktime'
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

// Run the sync
async function main() {
  try {
    const results = await syncMedia()

    console.log('\n📊 Sync Results:')
    console.log(`✅ Added: ${results.added} files`)
    console.log(`🔄 Updated: ${results.updated} files`)
    console.log(`🗑️ Removed: ${results.removed} files`)

    if (results.errors.length > 0) {
      console.log(`❌ Errors: ${results.errors.length}`)
      results.errors.forEach(error => console.log(`   ${error}`))
    }

    console.log('\n🎉 Media sync completed!')
  } catch (error) {
    console.error('💥 Media sync failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main()
}

export { syncMedia, type SyncResults }