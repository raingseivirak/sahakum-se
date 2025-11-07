const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const updated = await prisma.membershipRequest.update({
    where: { id: 'cmhndvqvd0000l010kn4v39zk' },
    data: {
      approvalSystem: 'MULTI_BOARD'
    }
  })
  
  console.log('\n✅ Request updated to use MULTI_BOARD approval system!')
  console.log('Refresh the page to see the Board Voting card.\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
