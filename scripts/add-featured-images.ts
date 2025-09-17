import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Setting up CSS placeholders for pages...')

  // Remove featured images to use CSS placeholders instead
  const pagesWithoutImages = ['about-us', 'cambodia', 'living-in-sweden', 'support-resources']

  // Remove featured images from pages to use CSS placeholders
  for (const slug of pagesWithoutImages) {
    try {
      const updatedPage = await prisma.contentItem.update({
        where: { slug },
        data: {
          featuredImg: null
        }
      })
      console.log(`✅ Removed featured image from ${slug} (will use CSS placeholder)`)
    } catch (error) {
      console.error(`❌ Failed to update ${slug}:`, error)
    }
  }

  console.log('✅ Finished setting up CSS placeholders!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })