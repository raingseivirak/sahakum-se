import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { storageService } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const member = await prisma.member.findFirst({ where: { userId: session.user.id, active: true }, select: { id: true } })
    if (!member) return NextResponse.json({ error: 'An active membership is required' }, { status: 403 })

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image' }, { status: 400 })
    const uploaded = await storageService.uploadFile(file, session.user.id, {
      category: 'businesses',
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxSize: 5 * 1024 * 1024,
      generateSizes: [{ suffix: 'card', width: 640, height: 400 }],
    })
    return NextResponse.json({ url: uploaded.url })
  } catch (error: unknown) {
    console.error('Business logo upload error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 400 })
  }
}
