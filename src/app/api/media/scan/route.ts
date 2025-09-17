import { NextRequest, NextResponse } from "next/server"
import { readdir } from "fs/promises"
import { join } from "path"

// GET /api/media/scan - Simply scan filesystem without database
export async function GET(request: NextRequest) {
  try {
    const mediaDir = join(process.cwd(), 'public', 'media')
    const categories = ['images', 'documents', 'videos']
    const allFiles: any[] = []

    for (const category of categories) {
      try {
        const categoryPath = join(mediaDir, category)
        const files = await readdir(categoryPath)

        for (const filename of files) {
          // Skip hidden files
          if (filename.startsWith('.')) continue

          const fileType = getFileType(filename)
          allFiles.push({
            name: filename,
            url: `/media/${category}/${filename}`,
            type: fileType,
            category
          })
        }
      } catch (error) {
        // Directory might not exist, continue
        console.log(`Directory ${category} not found or empty`)
      }
    }

    // Sort by name
    allFiles.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ files: allFiles })

  } catch (error) {
    console.error("Media scan error:", error)
    return NextResponse.json({ error: "Failed to scan media files" }, { status: 500 })
  }
}

function getFileType(filename: string): 'image' | 'document' | 'video' {
  const ext = filename.split('.').pop()?.toLowerCase()

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const videoExts = ['mp4', 'mpeg', 'mov', 'avi', 'webm']

  if (imageExts.includes(ext || '')) return 'image'
  if (videoExts.includes(ext || '')) return 'video'
  return 'document'
}