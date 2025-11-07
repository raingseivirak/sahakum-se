const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const request = await prisma.membershipRequest.findUnique({
    where: { id: 'cmhndvqvd0000l010kn4v39zk' },
    select: {
      id: true,
      requestNumber: true,
      firstName: true,
      lastName: true,
      status: true,
      approvalSystem: true,
      createdAt: true
    }
  })
  
  console.log('\n📋 Membership Request Details:')
  console.log('================================')
  console.log('ID:', request?.id)
  console.log('Request Number:', request?.requestNumber)
  console.log('Applicant:', `${request?.firstName} ${request?.lastName}`)
  console.log('Status:', request?.status)
  console.log('Approval System:', request?.approvalSystem || 'NOT SET (defaults to SINGLE)')
  console.log('Created:', request?.createdAt)
  console.log('\n✨ Will Board Voting Card Appear?', request?.approvalSystem === 'MULTI_BOARD' ? 'YES ✅' : 'NO ❌')
  console.log('\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
