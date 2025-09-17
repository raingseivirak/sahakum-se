import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding sample members...')

  // Sample members data
  const members = [
    {
      memberNumber: 'SK001',
      firstName: 'Sophea',
      lastName: 'Chan',
      email: 'sophea.chan@email.com',
      phone: '+46 70 123 45 67',
      address: 'Kungsgatan 10',
      city: 'Stockholm',
      postalCode: '111 43',
      country: 'Sweden',
      memberType: 'BOARD' as const,
      joinedDate: new Date('2020-01-15'),
      isActive: true,
      notes: 'Board member, very active in community events',
      emergencyContact: 'Bopha Chan (wife) - +46 70 987 65 43'
    },
    {
      memberNumber: 'SK002',
      firstName: 'Roth',
      lastName: 'Sovannak',
      email: 'roth.sovannak@email.com',
      phone: '+46 73 456 78 90',
      address: 'Sveavägen 25',
      city: 'Stockholm',
      postalCode: '113 60',
      country: 'Sweden',
      memberType: 'VOLUNTEER' as const,
      joinedDate: new Date('2021-03-20'),
      isActive: true,
      notes: 'Volunteer coordinator for cooking events',
      emergencyContact: 'Dara Sovannak (brother) - +46 73 111 22 33'
    },
    {
      memberNumber: 'SK003',
      firstName: 'Chenda',
      lastName: 'Prak',
      email: 'chenda.prak@email.com',
      phone: '+46 76 789 01 23',
      address: 'Östermalmsvägen 45',
      city: 'Stockholm',
      postalCode: '114 26',
      country: 'Sweden',
      memberType: 'REGULAR' as const,
      joinedDate: new Date('2022-06-10'),
      isActive: true,
      notes: 'New member, interested in cultural activities',
      emergencyContact: 'Srey Prak (mother) - +46 76 444 55 66'
    },
    {
      memberNumber: 'SK004',
      firstName: 'Virak',
      lastName: 'Tep',
      email: 'virak.tep@email.com',
      phone: '+46 72 345 67 89',
      address: 'Södermalmsvägen 12',
      city: 'Stockholm',
      postalCode: '118 46',
      country: 'Sweden',
      memberType: 'HONORARY' as const,
      joinedDate: new Date('2018-09-05'),
      isActive: true,
      notes: 'Founding member, significant contributions to the association',
      emergencyContact: 'Kannitha Tep (spouse) - +46 72 777 88 99'
    },
    {
      firstName: 'Sreyneat',
      lastName: 'Mao',
      email: 'sreyneat.mao@email.com',
      phone: '+46 70 567 89 01',
      address: 'Norrmalmsvägen 33',
      city: 'Stockholm',
      postalCode: '113 45',
      country: 'Sweden',
      memberType: 'REGULAR' as const,
      joinedDate: new Date('2023-02-14'),
      isActive: true,
      notes: 'Active participant in cultural workshops',
      emergencyContact: 'Pich Mao (father) - +46 70 123 99 88'
    }
  ]

  // Create members
  for (const member of members) {
    const createdMember = await prisma.member.upsert({
      where: {
        memberNumber: member.memberNumber || `TEMP_${member.firstName}_${member.lastName}`
      },
      update: {},
      create: member
    })

    console.log(`✅ Created member: ${createdMember.firstName} ${createdMember.lastName} (${createdMember.memberType})`)
  }

  console.log('🎉 Member seeding completed!')

  // Print summary
  const totalMembers = await prisma.member.count()
  const membersByType = await prisma.member.groupBy({
    by: ['memberType'],
    _count: {
      id: true
    }
  })

  console.log(`\n📊 Summary:`)
  console.log(`Total members: ${totalMembers}`)
  membersByType.forEach(group => {
    console.log(`${group.memberType}: ${group._count.id}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding members:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })