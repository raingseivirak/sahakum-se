import { PrismaClient } from '@prisma/client'

async function transferData() {
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

  try {
    console.log('🔄 Starting data transfer...')

    // Export and import users
    console.log('👤 Transferring users...')
    const users = await localPrisma.user.findMany()
    for (const user of users) {
      await prodPrisma.user.create({ data: user })
    }
    console.log(`✅ Transferred ${users.length} users`)

    // Export and import content items with translations
    console.log('📄 Transferring content items...')
    const contentItems = await localPrisma.contentItem.findMany({
      include: { translations: true }
    })

    for (const item of contentItems) {
      const { translations, ...itemData } = item
      await prodPrisma.contentItem.create({ data: itemData })

      for (const translation of translations) {
        await prodPrisma.contentTranslation.create({ data: translation })
      }
    }
    console.log(`✅ Transferred ${contentItems.length} content items`)

    // Export and import services with translations
    console.log('🛠️ Transferring services...')
    const services = await localPrisma.service.findMany({
      include: { translations: true }
    })

    for (const service of services) {
      const { translations, ...serviceData } = service
      await prodPrisma.service.create({ data: serviceData })

      for (const translation of translations) {
        await prodPrisma.serviceTranslation.create({ data: translation })
      }
    }
    console.log(`✅ Transferred ${services.length} services`)

    // Transfer categories if they exist
    try {
      console.log('🏷️ Transferring categories...')
      const categories = await localPrisma.category.findMany({
        include: { translations: true }
      })

      for (const category of categories) {
        const { translations, ...categoryData } = category
        await prodPrisma.category.create({ data: categoryData })

        for (const translation of translations) {
          await prodPrisma.categoryTranslation.create({ data: translation })
        }
      }
      console.log(`✅ Transferred ${categories.length} categories`)
    } catch (error) {
      console.log('ℹ️ No categories found or error transferring categories')
    }

    // Transfer media files if they exist
    try {
      console.log('📁 Transferring media files...')
      const mediaFiles = await localPrisma.mediaFile.findMany()

      for (const file of mediaFiles) {
        await prodPrisma.mediaFile.create({ data: file })
      }
      console.log(`✅ Transferred ${mediaFiles.length} media files`)
    } catch (error) {
      console.log('ℹ️ No media files found or error transferring media files')
    }

    console.log('🎉 Data transfer completed successfully!')

  } catch (error) {
    console.error('❌ Error during data transfer:', error)
  } finally {
    await localPrisma.$disconnect()
    await prodPrisma.$disconnect()
  }
}

transferData()