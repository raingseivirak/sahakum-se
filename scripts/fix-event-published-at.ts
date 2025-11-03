import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Fixing publishedAt timestamps for investment workshop events...')

  const result = await prisma.event.updateMany({
    where: {
      slug: {
        in: ['investment-workshop-nov-1-2025', 'investment-workshop-nov-2-2025']
      }
    },
    data: {
      publishedAt: new Date() // Set to current time
    }
  })

  console.log(`✅ Updated ${result.count} events`)
  console.log('Events should now appear immediately on the public events page!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
