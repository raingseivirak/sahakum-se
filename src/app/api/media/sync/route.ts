import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { storageService } from "@/lib/storage"

// POST /api/media/sync - Comprehensive sync between storage and database
// Works with both local filesystem and Google Cloud Storage
// Supports hybrid mode: ?hybrid=true to sync from both sources in production
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    // Check for hybrid mode parameter
    const { searchParams } = new URL(request.url)
    const hybridMode = searchParams.get('hybrid') === 'true'

    console.log('🔄 Starting media sync...')
    console.log(`📍 Environment: ${process.env.NODE_ENV}`)
    console.log(`🔀 Hybrid Mode: ${hybridMode}`)

    if (hybridMode && process.env.NODE_ENV === 'production') {
      console.log('💾 Storage: Both Local Filesystem + Google Cloud Storage')
    } else {
      console.log(`💾 Storage: ${process.env.NODE_ENV === 'production' ? 'Google Cloud Storage' : 'Local Filesystem'}`)
    }

    // Use the storage service's comprehensive sync method
    // Pass hybridMode to sync from both sources when requested
    const syncResults = await storageService.syncFiles(['images', 'documents', 'videos', 'avatars'], hybridMode)

    console.log('✅ Sync completed:', syncResults)

    return NextResponse.json({
      ...syncResults,
      environment: process.env.NODE_ENV,
      hybridMode,
      syncedSources: syncResults.sources
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