import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { businessInclude } from '@/lib/business-directory'
import type { Prisma } from '@prisma/client'

const moderationSchema = z.object({
  action: z.enum(['approve', 'request_changes', 'suspend', 'feature', 'unfeature']),
  note: z.string().trim().max(2000).optional(),
})

const REVIEW_ROLES = ['EDITOR', 'BOARD', 'ADMIN']

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !REVIEW_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const input = moderationSchema.parse(await request.json())
    const existing = await prisma.business.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: 'Business not found' }, { status: 404 })

    if (input.action === 'request_changes' && !input.note) {
      return NextResponse.json({ error: 'Explain what the member should change' }, { status: 400 })
    }

    const data: Prisma.BusinessUncheckedUpdateInput = {}
    if (input.action === 'approve') Object.assign(data, {
      status: 'APPROVED', reviewNote: input.note || null, reviewedAt: new Date(),
      reviewedById: session.user.id, publishedAt: existing.publishedAt || new Date(),
    })
    if (input.action === 'request_changes') Object.assign(data, {
      status: 'CHANGES_REQUESTED', reviewNote: input.note, reviewedAt: new Date(),
      reviewedById: session.user.id, featured: false,
    })
    if (input.action === 'suspend') Object.assign(data, {
      status: 'SUSPENDED', reviewNote: input.note || null, reviewedAt: new Date(),
      reviewedById: session.user.id, featured: false,
    })
    if (input.action === 'feature' || input.action === 'unfeature') {
      if (existing.status !== 'APPROVED') {
        return NextResponse.json({ error: 'Only approved businesses can be featured' }, { status: 409 })
      }
      data.featured = input.action === 'feature'
    }

    const business = await prisma.business.update({
      where: { id: existing.id }, data, include: businessInclude,
    })
    return NextResponse.json({ business })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid review action' }, { status: 400 })
    }
    console.error('Business moderation error:', error)
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}
