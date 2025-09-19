import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { storageService } from "@/lib/storage"

// POST /api/media/sync - Comprehensive sync between storage and database
// Works with both local filesystem and Google Cloud Storage
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    console.log('🔄 Starting media sync...')
    console.log(`📍 Environment: ${process.env.NODE_ENV}`)
    console.log(`💾 Storage: ${process.env.NODE_ENV === 'production' ? 'Google Cloud Storage' : 'Local Filesystem'}`)

    // Use the storage service's comprehensive sync method
    // This automatically handles both local and Google Cloud Storage
    const syncResults = await storageService.syncFiles(['images', 'documents', 'videos', 'avatars'])

    console.log('✅ Sync completed:', syncResults)

    return NextResponse.json({
      ...syncResults,
      environment: process.env.NODE_ENV,
      storageType: process.env.NODE_ENV === 'production' ? 'Google Cloud Storage' : 'Local Filesystem'
    })

  } catch (error) {
    console.error("❌ Media sync error:", error)
    return NextResponse.json({
      error: "Sync failed",
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
}