import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding services...')

  // Community Service
  const communityService = await prisma.service.upsert({
    where: { slug: 'community' },
    update: {},
    create: {
      slug: 'community',
      icon: '👥',
      active: true,
      order: 1,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Community',
            description: 'Community through cooking, events and cultural activities.',
            buttonText: 'Join Community'
          },
          {
            language: 'sv',
            title: 'Gemenskap',
            description: 'Gemenskap genom matlagning, evenemang och kulturella aktiviteter.',
            buttonText: 'Gå med i gemenskapen'
          },
          {
            language: 'km',
            title: 'សហគមន៍',
            description: 'សហគមន៍តាមរយៈការធ្វើម្ហូប ព្រឹត្តិការណ៍ និងសកម្មភាពវប្បធម៌។',
            buttonText: 'ចូលរួមសហគមន៍'
          }
        ]
      }
    },
    include: {
      translations: true
    }
  })

  // Blog Service
  const blogService = await prisma.service.upsert({
    where: { slug: 'blog' },
    update: {},
    create: {
      slug: 'blog',
      icon: '📝',
      active: true,
      order: 2,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Blog',
            description: 'Read the latest news, stories and insights from our community.',
            buttonText: 'Read Stories'
          },
          {
            language: 'sv',
            title: 'Blogg',
            description: 'Läs de senaste nyheterna, berättelserna och insikterna från vår gemenskap.',
            buttonText: 'Läs berättelser'
          },
          {
            language: 'km',
            title: 'កំណត់ហេតុ',
            description: 'អានព័ត៌មានថ្មីៗ កថានិទាន និងការយល់ដឹងពីសហគមន៍របស់យើង។',
            buttonText: 'អានរឿងរ៉ាវ'
          }
        ]
      }
    },
    include: {
      translations: true
    }
  })

  // Support Service
  const supportService = await prisma.service.upsert({
    where: { slug: 'support' },
    update: {},
    create: {
      slug: 'support',
      icon: '🤝',
      active: true,
      order: 3,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Support',
            description: 'Resources and guidance for living in Sweden and navigating Swedish society.',
            buttonText: 'Get Support'
          },
          {
            language: 'sv',
            title: 'Support',
            description: 'Resurser och vägledning för att bo i Sverige och navigera i det svenska samhället.',
            buttonText: 'Få support'
          },
          {
            language: 'km',
            title: 'ការគាំទ្រ',
            description: 'ធនធាន និងការណែនាំសម្រាប់ការរស់នៅក្នុងប្រទេសស៊ុយអែត និងការធ្វើដំណើរក្នុងសង្គមស៊ុយអែត។',
            buttonText: 'ទទួលបានការគាំទ្រ'
          }
        ]
      }
    },
    include: {
      translations: true
    }
  })

  // Membership Service
  const membershipService = await prisma.service.upsert({
    where: { slug: 'membership' },
    update: {},
    create: {
      slug: 'membership',
      icon: '👨‍👩‍👧‍👦',
      active: true,
      order: 4,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Membership',
            description: 'Join our community and connect with fellow Cambodians in Sweden.',
            buttonText: 'Become Member'
          },
          {
            language: 'sv',
            title: 'Medlemskap',
            description: 'Gå med i vårt community och knyt kontakter med andra kambodjaner i Sverige.',
            buttonText: 'Bli medlem'
          },
          {
            language: 'km',
            title: 'សមាជិកភាព',
            description: 'ចូលរួមក្នុងសហគមន៍របស់យើង និងភ្ជាប់ទំនាក់ទំនងជាមួយជនជាតិកម្ពុជាដទៃទៀតនៅប្រទេសស៊ុយអែត។',
            buttonText: 'ក្លាយជាសមាជិក'
          }
        ]
      }
    },
    include: {
      translations: true
    }
  })

  console.log('✅ Created Community service:', communityService.slug)
  console.log('✅ Created Blog service:', blogService.slug)
  console.log('✅ Created Support service:', supportService.slug)
  console.log('✅ Created Membership service:', membershipService.slug)
  console.log('🎉 Services seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding services:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })