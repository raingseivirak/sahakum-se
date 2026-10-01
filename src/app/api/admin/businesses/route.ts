import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { businessInclude } from '@/lib/business-directory'
import { BusinessStatus } from '@prisma/client'

const REVIEW_ROLES = ['EDITOR', 'BOARD', 'ADMIN']

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !REVIEW_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = request.nextUrl.searchParams.get('status')
  const validStatus = status && Object.values(BusinessStatus).includes(status as BusinessStatus) ? status as BusinessStatus : null
  const businesses = await prisma.business.findMany({
    where: validStatus ? { status: validStatus } : {},
    include: businessInclude,
    orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
  })
  return NextResponse.json({ businesses })
}
