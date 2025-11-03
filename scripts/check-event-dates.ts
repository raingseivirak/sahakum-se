import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const events = await prisma.event.findMany({
    where: {
      slug: {
        contains: 'investment-workshop'
      }
    },
    select: {
      slug: true,
      startDate: true,
      endDate: true,
      status: true,
      publishedAt: true
    },
    orderBy: {
      startDate: 'asc'
    }
  })

  console.log('Investment Workshop Events:')
  console.log('='.repeat(80))

  const now = new Date()
  console.log('Current time:', now.toISOString())
  console.log()

  events.forEach(event => {
    console.log('Slug:', event.slug)
    console.log('Start Date:', event.startDate.toISOString())
    console.log('End Date:', event.endDate.toISOString())
    console.log('Status:', event.status)
    console.log('Published At:', event.publishedAt?.toISOString() || 'Not published')
    console.log('Is Upcoming?', event.endDate >= now ? 'YES ✅' : 'NO ❌ (Past event)')
    console.log('-'.repeat(80))
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
