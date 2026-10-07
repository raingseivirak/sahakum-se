import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { storageService } from '@/lib/storage'

export const dynamic = 'force-dynamic'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const mediaFile = await prisma.mediaFile.findUnique({
    where: { id: params.id },
    select: { filename: true, category: true, url: true },
  })

  if (!mediaFile) {
    return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
  }

  // Local development media is already served by Next.js.
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.redirect(new URL(mediaFile.url, process.env.NEXTAUTH_URL || 'http://localhost:3000'))
  }

  try {
    const signedUrl = await storageService.getSignedReadUrl(mediaFile.filename, mediaFile.category)
    return NextResponse.redirect(signedUrl, 302)
  } catch (error) {
    console.error('Signed media URL error:', error)
    return NextResponse.json({ error: 'Unable to access media file' }, { status: 500 })
  }
}
