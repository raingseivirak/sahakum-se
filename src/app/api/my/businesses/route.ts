import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { businessInclude, businessInputSchema, uniqueBusinessSlug } from '@/lib/business-directory'
import { sanitizeEditorHTML } from '@/lib/sanitize-server'
import { z } from 'zod'

async function activeMember(userId: string) {
  return prisma.member.findFirst({ where: { userId, active: true } })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const member = await activeMember(session.user.id)
  if (!member) return NextResponse.json({ error: 'An active membership is required' }, { status: 403 })

  const businesses = await prisma.business.findMany({
    where: { ownerId: member.id },
    include: businessInclude,
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json({ businesses })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const member = await activeMember(session.user.id)
    if (!member) return NextResponse.json({ error: 'An active membership is required' }, { status: 403 })

    const input = businessInputSchema.parse(await request.json())
    const category = await prisma.businessCategory.findFirst({ where: { id: input.categoryId, active: true } })
    if (!category) return NextResponse.json({ error: 'Choose a valid category' }, { status: 400 })
    const tagCount = await prisma.businessTag.count({ where: { id: { in: input.tagIds } } })
    if (tagCount !== input.tagIds.length) return NextResponse.json({ error: 'Choose valid tags' }, { status: 400 })

    const slug = await uniqueBusinessSlug(input.name, async value => Boolean(
      await prisma.business.findUnique({ where: { slug: value }, select: { id: true } })
    ))

    const business = await prisma.business.create({
      data: {
        ownerId: member.id,
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
        status: input.action === 'submit' ? 'PENDING' : 'DRAFT',
        tags: { create: input.tagIds.map(tagId => ({ tagId })) },
      },
      include: businessInclude,
    })

    return NextResponse.json({ business }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || 'Invalid business details' }, { status: 400 })
    }
    console.error('Business create error:', error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
}
