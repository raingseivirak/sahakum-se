import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Initializing approval threshold setting...')

  // Create or update the APPROVAL_THRESHOLD setting
  const setting = await prisma.setting.upsert({
    where: { key: 'APPROVAL_THRESHOLD' },
    update: {},
    create: {
      key: 'APPROVAL_THRESHOLD',
      value: 'MAJORITY', // Default to MAJORITY
      type: 'TEXT',
      category: 'membership'
    }
  })

  console.log('✅ Approval threshold setting initialized:', setting)
  console.log('   Key:', setting.key)
  console.log('   Value:', setting.value)
  console.log('   Category:', setting.category)
}

main()
  .catch((e) => {
    console.error('Error initializing approval threshold:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
