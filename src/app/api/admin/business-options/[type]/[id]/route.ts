import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function authorized() {
  const session = await getServerSession(authOptions)
  return session?.user?.id && ['EDITOR', 'BOARD', 'ADMIN'].includes(session.user.role)
}

export async function PATCH(request: NextRequest, { params }: { params: { type: string; id: string } }) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (params.type !== 'category') return NextResponse.json({ error: 'Only categories can be activated or hidden' }, { status: 400 })
  const body = await request.json() as { active?: unknown }
  if (typeof body.active !== 'boolean') return NextResponse.json({ error: 'Active must be true or false' }, { status: 400 })
  const category = await prisma.businessCategory.update({ where: { id: params.id }, data: { active: body.active } })
  return NextResponse.json({ category })
}

export async function DELETE(_: NextRequest, { params }: { params: { type: string; id: string } }) {
  if (!(await authorized())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (params.type !== 'tag') return NextResponse.json({ error: 'Hide categories instead of deleting them' }, { status: 400 })
  const used = await prisma.businessTagAssignment.count({ where: { tagId: params.id } })
  if (used) return NextResponse.json({ error: 'This tag is used by a business and cannot be deleted' }, { status: 409 })
  await prisma.businessTag.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}

