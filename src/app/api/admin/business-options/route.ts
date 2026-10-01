import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { makeSlug } from '@/lib/business-directory'

const inputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('category'), nameEn: z.string().trim().min(2).max(80), nameSv: z.string().trim().min(2).max(80), nameKm: z.string().trim().min(1).max(100) }),
  z.object({ type: z.literal('tag'), name: z.string().trim().min(2).max(50) }),
])

async function authorized() {
  const session = await getServerSession(authOptions)
  return session?.user?.id && ['EDITOR', 'BOARD', 'ADMIN'].includes(session.user.role)
}

export async function GET() {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [categories, tags] = await Promise.all([
    prisma.businessCategory.findMany({ orderBy: { order: 'asc' } }),
    prisma.businessTag.findMany({ orderBy: { name: 'asc' } }),
  ])
  return NextResponse.json({ categories, tags })
}

export async function POST(request: NextRequest) {
  try {
    if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const input = inputSchema.parse(await request.json())
    if (input.type === 'category') {
      const slug = makeSlug(input.nameEn)
      const category = await prisma.businessCategory.create({ data: { nameEn: input.nameEn, nameSv: input.nameSv, nameKm: input.nameKm, slug } })
      return NextResponse.json({ category }, { status: 201 })
    }
    const tag = await prisma.businessTag.create({ data: { name: input.name, slug: makeSlug(input.name) } })
    return NextResponse.json({ tag }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0]?.message || 'Invalid option' }, { status: 400 })
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'That name already exists' }, { status: 409 })
    console.error('Business option create error:', error)
    return NextResponse.json({ error: 'Could not create option' }, { status: 500 })
  }
}
