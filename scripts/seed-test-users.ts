import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting test users seeding...')

  // Check if users already exist
  const existingUsers = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'admin@sahakumkhmer.se',
          'board@sahakumkhmer.se',
          'editor@sahakumkhmer.se',
          'moderator@sahakumkhmer.se',
          'author@sahakumkhmer.se',
          'user@sahakumkhmer.se'
        ]
      }
    }
  })

  console.log(`Found ${existingUsers.length} existing test users`)

  // Password for all test users
  const password = 'TestPass123'
  const hashedPassword = await bcrypt.hash(password, 10)

  const usersToCreate = [
    {
      email: 'admin@sahakumkhmer.se',
      name: 'Test Admin',
      firstName: 'Test',
      lastName: 'Admin',
      role: 'ADMIN',
      password: hashedPassword,
      isActive: true,
    },
    {
      email: 'board@sahakumkhmer.se',
      name: 'Test Board Member',
      firstName: 'Test',
      lastName: 'Board',
      role: 'BOARD',
      password: hashedPassword,
      isActive: true,
    },
    {
      email: 'editor@sahakumkhmer.se',
      name: 'Test Editor',
      firstName: 'Test',
      lastName: 'Editor',
      role: 'EDITOR',
      password: hashedPassword,
      isActive: true,
    },
    {
      email: 'moderator@sahakumkhmer.se',
      name: 'Test Moderator',
      firstName: 'Test',
      lastName: 'Moderator',
      role: 'MODERATOR',
      password: hashedPassword,
      isActive: true,
    },
    {
      email: 'author@sahakumkhmer.se',
      name: 'Test Author',
      firstName: 'Test',
      lastName: 'Author',
      role: 'AUTHOR',
      password: hashedPassword,
      isActive: true,
    },
    {
      email: 'user@sahakumkhmer.se',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      password: hashedPassword,
      isActive: true,
    }
  ]

  for (const userData of usersToCreate) {
    const existingUser = existingUsers.find(u => u.email === userData.email)

    if (existingUser) {
      console.log(`📝 Updating existing user: ${userData.email} (${userData.role})`)
      await prisma.user.update({
        where: { email: userData.email },
        data: {
          name: userData.name,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role as any,
          password: userData.password,
          isActive: userData.isActive,
        }
      })
    } else {
      console.log(`➕ Creating new user: ${userData.email} (${userData.role})`)
      await prisma.user.create({
        data: userData as any
      })
    }
  }

  console.log('\n✅ Test users seeding completed!')
  console.log('\n🔑 All test users use password: TestPass123')
  console.log('\n👥 Created/Updated users:')
  console.log('   • admin@sahakumkhmer.se (ADMIN) - Full access to everything')
  console.log('   • board@sahakumkhmer.se (BOARD) - Same as Editor + board privileges')
  console.log('   • editor@sahakumkhmer.se (EDITOR) - Content + Organization management')
  console.log('   • moderator@sahakumkhmer.se (MODERATOR) - Content creation + membership requests')
  console.log('   • author@sahakumkhmer.se (AUTHOR) - Basic content creation only')
  console.log('   • user@sahakumkhmer.se (USER) - No admin access (should redirect)')

  console.log('\n🧪 Permission Testing Guide:')
  console.log('Layer 1 (Navigation): Check which menu sections are visible')
  console.log('Layer 2 (Buttons): Check which action buttons are enabled/disabled')
  console.log('Layer 3 (API): Try accessing restricted endpoints')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test users:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })