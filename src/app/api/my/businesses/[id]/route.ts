import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { businessInclude, businessInputSchema, uniqueBusinessSlug } from '@/lib/business-directory'
import { sanitizeEditorHTML } from '@/lib/sanitize-server'
import { z } from 'zod'

async function ownedBusiness(userId: string, id: string) {
  return prisma.business.findFirst({ where: { id, owner: { userId, active: true } }, include: businessInclude })
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const business = await ownedBusiness(session.user.id, params.id)
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  return NextResponse.json({ business })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const existing = await ownedBusiness(session.user.id, params.id)
    if (!existing) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    if (existing.status === 'PENDING' || existing.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'This listing cannot be edited in its current status' }, { status: 409 })
    }

    const input = businessInputSchema.parse(await request.json())
    const category = await prisma.businessCategory.findFirst({ where: { id: input.categoryId, active: true } })
    if (!category) return NextResponse.json({ error: 'Choose a valid category' }, { status: 400 })
    const tagCount = await prisma.businessTag.count({ where: { id: { in: input.tagIds } } })
    if (tagCount !== input.tagIds.length) return NextResponse.json({ error: 'Choose valid tags' }, { status: 400 })
    const slug = await uniqueBusinessSlug(input.name, async value => Boolean(
      await prisma.business.findFirst({ where: { slug: value, id: { not: existing.id } }, select: { id: true } })
    ), existing.slug)

    const status = input.action === 'submit' ? 'PENDING' : existing.status === 'APPROVED' ? 'PENDING' : 'DRAFT'
    const business = await prisma.business.update({
      where: { id: existing.id },
      data: {
        categoryId: input.categoryId,
        slug,
        name: input.name,
        summary: input.summary,
        description: sanitizeEditorHTML(input.description),
        logoUrl: input.logoUrl || null,
        phone: input.phone || null,
        email: input.email || null,
        website: input.website || null,
        facebookUrl: input.facebookUrl || null,
        instagramUrl: input.instagramUrl || null,
        address: input.address || null,
        city: input.city,
        region: input.region || null,
        postalCode: input.postalCode || null,
        country: input.country,
        serviceArea: input.serviceArea,
        locationVisibility: input.locationVisibility,
        displayOwnerName: input.displayOwnerName,
        status,
        reviewNote: null,
        reviewedAt: null,
        reviewedById: null,
        publishedAt: status === 'PENDING' ? existing.publishedAt : null,
        tags: {
          deleteMany: {},
          create: input.tagIds.map(tagId => ({ tagId })),
        },
      },
      include: businessInclude,
    })
    return NextResponse.json({ business })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid business details' }, { status: 400 })
    }
    console.error('Business update error:', error)
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const existing = await ownedBusiness(session.user.id, params.id)
  if (!existing) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  if (existing.status === 'PENDING') return NextResponse.json({ error: 'A pending listing cannot be removed' }, { status: 409 })
  await prisma.business.delete({ where: { id: existing.id } })
  return NextResponse.json({ success: true })
}
