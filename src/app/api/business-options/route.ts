import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [categories, tags] = await Promise.all([
      prisma.businessCategory.findMany({ where: { active: true }, orderBy: { order: 'asc' } }),
      prisma.businessTag.findMany({ orderBy: { name: 'asc' } }),
    ])

    return NextResponse.json({ categories, tags })
  } catch (error) {
    console.error('Business options fetch error:', error)
    return NextResponse.json({ error: 'Failed to load business options' }, { status: 500 })
  }
}
