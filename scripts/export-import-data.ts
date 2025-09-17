import { PrismaClient } from '@prisma/client'

// Local database connection
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:postgres@localhost:5433/sahakum_khmer_dev'
    }
  }
})

// Production database connection
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.vjfxpnztaxwgcieoudij:PVjFRPim2hcygzzG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
    }
  }
})

async function exportImportData() {
  try {
    console.log('🔄 Starting data export/import...')

    // Create schema in production first
    console.log('📋 Creating production schema...')
    await prodPrisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "password" TEXT,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `

    // Continue with other essential tables
    await prodPrisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "content_items" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "slug" TEXT NOT NULL UNIQUE,
        "type" TEXT NOT NULL DEFAULT 'PAGE',
        "status" TEXT NOT NULL DEFAULT 'DRAFT',
        "featuredImg" TEXT,
        "authorId" TEXT NOT NULL,
        "publishedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `

    await prodPrisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "content_translations" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "contentItemId" TEXT NOT NULL,
        "language" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "excerpt" TEXT NOT NULL,
        "seoTitle" TEXT,
        "metaDescription" TEXT,
        UNIQUE("contentItemId", "language")
      );
    `

    await prodPrisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "services" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "slug" TEXT NOT NULL UNIQUE,
        "icon" TEXT,
        "featuredImg" TEXT,
        "colorTheme" TEXT DEFAULT 'navy',
        "order" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `

    await prodPrisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "service_translations" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "serviceId" TEXT NOT NULL,
        "language" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "buttonText" TEXT NOT NULL DEFAULT 'Learn More',
        UNIQUE("serviceId", "language")
      );
    `

    // Export and import data
    console.log('📤 Exporting local data...')

    // Export users
    const users = await localPrisma.user.findMany()
    console.log(`Found ${users.length} users`)

    // Export content items and translations
    const contentItems = await localPrisma.contentItem.findMany({
      include: {
        translations: true
      }
    })
    console.log(`Found ${contentItems.length} content items`)

    // Export services and translations
    const services = await localPrisma.service.findMany({
      include: {
        translations: true
      }
    })
    console.log(`Found ${services.length} services`)

    console.log('📥 Importing to production...')

    // Import users
    for (const user of users) {
      await prodPrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      })
    }
    console.log(`✅ Imported ${users.length} users`)

    // Import content items and translations
    for (const item of contentItems) {
      const { translations, ...itemData } = item
      await prodPrisma.contentItem.upsert({
        where: { id: item.id },
        update: itemData,
        create: itemData
      })

      for (const translation of translations) {
        await prodPrisma.contentTranslation.upsert({
          where: {
            contentItemId_language: {
              contentItemId: translation.contentItemId,
              language: translation.language
            }
          },
          update: translation,
          create: translation
        })
      }
    }
    console.log(`✅ Imported ${contentItems.length} content items`)

    // Import services and translations
    for (const service of services) {
      const { translations, ...serviceData } = service
      await prodPrisma.service.upsert({
        where: { id: service.id },
        update: serviceData,
        create: serviceData
      })

      for (const translation of translations) {
        await prodPrisma.serviceTranslation.upsert({
          where: {
            serviceId_language: {
              serviceId: translation.serviceId,
              language: translation.language
            }
          },
          update: translation,
          create: translation
        })
      }
    }
    console.log(`✅ Imported ${services.length} services`)

    console.log('🎉 Data export/import completed successfully!')
  } catch (error) {
    console.error('❌ Error during export/import:', error)
  } finally {
    await localPrisma.$disconnect()
    await prodPrisma.$disconnect()
  }
}

exportImportData()