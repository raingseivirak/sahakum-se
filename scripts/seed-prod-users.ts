import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Generate random password
function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

async function seedProductionUsers() {
  console.log('🌱 Seeding production users...')

  const users = [
    { email: 'lk.makey@gmail.com', name: 'Likhith Pal', role: 'EDITOR' },
    { email: 'peavlieng4@gmail.com', name: 'Peav Lieng', role: 'EDITOR' },
    { email: 'Theary.so23@gmail.com', name: 'Theary So', role: 'EDITOR' },
    { email: 'ylinna168@gmail.com', name: 'Linna Lux', role: 'EDITOR' },
    { email: 'puthnith.var@gmail.com', name: 'Puthnith Var', role: 'EDITOR' },
  ]

  const userCredentials: Array<{email: string, name: string, password: string, role: string}> = []

  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`)
        continue
      }

      // Generate password and hash it
      const password = generatePassword()
      const hashedPassword = await bcrypt.hash(password, 10)

      // Split name into firstName and lastName
      const nameParts = userData.name.split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ')

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          firstName,
          lastName,
          password: hashedPassword,
          role: userData.role as any,
          isActive: true,
        }
      })

      userCredentials.push({
        email: userData.email,
        name: userData.name,
        password,
        role: userData.role
      })

      console.log(`✅ Created user: ${userData.name} (${userData.email})`)
    } catch (error) {
      console.error(`❌ Failed to create user ${userData.email}:`, error)
    }
  }

  // Output credentials
  console.log('\n🔐 USER CREDENTIALS:')
  console.log('====================')
  userCredentials.forEach(cred => {
    console.log(`Email: ${cred.email}`)
    console.log(`Name: ${cred.name}`)
    console.log(`Password: ${cred.password}`)
    console.log(`Role: ${cred.role}`)
    console.log('---')
  })

  // Write credentials to file
  const credentialsText = userCredentials.map(cred =>
    `Email: ${cred.email}\nName: ${cred.name}\nPassword: ${cred.password}\nRole: ${cred.role}\n---`
  ).join('\n')

  const fs = require('fs')
  fs.writeFileSync('prod-user-credentials.txt', credentialsText)
  console.log('\n📝 Credentials saved to: prod-user-credentials.txt')

  console.log('\n🎉 Production user seeding completed!')
}

seedProductionUsers()
  .catch((e) => {
    console.error('❌ Error seeding production users:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })