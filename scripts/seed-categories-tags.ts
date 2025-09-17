import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCategoriesAndTags() {
  console.log('🌱 Starting to seed categories and tags...')

  try {
    // Clear existing data
    console.log('🧹 Cleaning existing categories and tags...')
    await prisma.contentCategory.deleteMany()
    await prisma.contentTag.deleteMany()
    await prisma.categoryTranslation.deleteMany()
    await prisma.tagTranslation.deleteMany()
    await prisma.category.deleteMany()
    await prisma.tag.deleteMany()

    // Seed Categories
    console.log('📁 Creating categories...')

    // Main content categories
    const newsCategory = await prisma.category.create({
      data: {
        slug: 'news',
        type: 'general',
        translations: {
          create: [
            { language: 'sv', name: 'Nyheter', description: 'Aktuella nyheter från föreningen och samhället' },
            { language: 'en', name: 'News', description: 'Latest news from the association and community' },
            { language: 'km', name: 'ព័ត៌មាន', description: 'ព័ត៌មានថ្មីពីសមាគមនិងសហគមន៍' },
          ]
        }
      }
    })

    const eventsCategory = await prisma.category.create({
      data: {
        slug: 'events',
        type: 'general',
        translations: {
          create: [
            { language: 'sv', name: 'Evenemang', description: 'Kommande och tidigare evenemang' },
            { language: 'en', name: 'Events', description: 'Upcoming and past events' },
            { language: 'km', name: 'ព្រឹត្តិការណ៍', description: 'ព្រឹត្តិការណ៍នាពេលអនាគតនិងកន្លងមក' },
          ]
        }
      }
    })

    const culturalCategory = await prisma.category.create({
      data: {
        slug: 'culture',
        type: 'general',
        translations: {
          create: [
            { language: 'sv', name: 'Kultur', description: 'Kambodjansk kultur och traditioner' },
            { language: 'en', name: 'Culture', description: 'Cambodian culture and traditions' },
            { language: 'km', name: 'វប្បធម៌', description: 'វប្បធម៌និងប្រពៃណីខ្មែរ' },
          ]
        }
      }
    })

    const integrationCategory = await prisma.category.create({
      data: {
        slug: 'integration',
        type: 'general',
        translations: {
          create: [
            { language: 'sv', name: 'Integration', description: 'Integrationsstöd och information' },
            { language: 'en', name: 'Integration', description: 'Integration support and information' },
            { language: 'km', name: 'ការរួមបញ្ចូល', description: 'ការគាំទ្រនិងព័ត៌មានអំពីការរួមបញ្ចូល' },
          ]
        }
      }
    })

    const communityCategory = await prisma.category.create({
      data: {
        slug: 'community',
        type: 'general',
        translations: {
          create: [
            { language: 'sv', name: 'Gemenskap', description: 'Föreningsliv och gemenskap' },
            { language: 'en', name: 'Community', description: 'Association life and community' },
            { language: 'km', name: 'សហគមន៍', description: 'ជីវិតសមាគមនិងសហគមន៍' },
          ]
        }
      }
    })

    // Event type subcategories
    const culturalEventsCategory = await prisma.category.create({
      data: {
        slug: 'cultural-events',
        type: 'event-type',
        parentId: eventsCategory.id,
        translations: {
          create: [
            { language: 'sv', name: 'Kulturella evenemang', description: 'Kulturella festivaler och firanden' },
            { language: 'en', name: 'Cultural Events', description: 'Cultural festivals and celebrations' },
            { language: 'km', name: 'ព្រឹត្តិការណ៍វប្បធម៌', description: 'ពិធីបុណ្យវប្បធម៌និងការប្រារព្ធ' },
          ]
        }
      }
    })

    const educationalEventsCategory = await prisma.category.create({
      data: {
        slug: 'educational-events',
        type: 'event-type',
        parentId: eventsCategory.id,
        translations: {
          create: [
            { language: 'sv', name: 'Utbildningsevenemang', description: 'Workshops och utbildningstillfällen' },
            { language: 'en', name: 'Educational Events', description: 'Workshops and educational opportunities' },
            { language: 'km', name: 'ព្រឹត្តិការណ៍អប់រំ', description: 'សិក្ខាសាលានិងឱកាសអប់រំ' },
          ]
        }
      }
    })

    const socialEventsCategory = await prisma.category.create({
      data: {
        slug: 'social-events',
        type: 'event-type',
        parentId: eventsCategory.id,
        translations: {
          create: [
            { language: 'sv', name: 'Sociala evenemang', description: 'Sociala sammankomster och aktiviteter' },
            { language: 'en', name: 'Social Events', description: 'Social gatherings and activities' },
            { language: 'km', name: 'ព្រឹត្តិការណ៍សង្គម', description: 'ការជួបជុំនិងសកម្មភាពសង្គម' },
          ]
        }
      }
    })

    // Recipe type categories
    const traditionalFoodCategory = await prisma.category.create({
      data: {
        slug: 'traditional-food',
        type: 'recipe-type',
        translations: {
          create: [
            { language: 'sv', name: 'Traditionell mat', description: 'Traditionella kambodjanska recept' },
            { language: 'en', name: 'Traditional Food', description: 'Traditional Cambodian recipes' },
            { language: 'km', name: 'ម្ហូបប្រពៃណី', description: 'រូបមន្តម្ហូបខ្មែរប្រពៃណី' },
          ]
        }
      }
    })

    const festivalFoodCategory = await prisma.category.create({
      data: {
        slug: 'festival-food',
        type: 'recipe-type',
        translations: {
          create: [
            { language: 'sv', name: 'Festmat', description: 'Mat för speciella tillfällen och festivaler' },
            { language: 'en', name: 'Festival Food', description: 'Food for special occasions and festivals' },
            { language: 'km', name: 'ម្ហូបពិធីបុណ្យ', description: 'ម្ហូបសម្រាប់ឱកាសពិសេសនិងពិធីបុណ្យ' },
          ]
        }
      }
    })

    // Seed Tags
    console.log('🏷️ Creating tags...')

    const tagsData = [
      {
        slug: 'khmer-language',
        translations: [
          { language: 'sv', name: 'Khmer språk' },
          { language: 'en', name: 'Khmer Language' },
          { language: 'km', name: 'ភាសាខ្មែរ' },
        ]
      },
      {
        slug: 'swedish-language',
        translations: [
          { language: 'sv', name: 'Svenska språket' },
          { language: 'en', name: 'Swedish Language' },
          { language: 'km', name: 'ភាសាស៊ុយអែត' },
        ]
      },
      {
        slug: 'water-festival',
        translations: [
          { language: 'sv', name: 'Vattenfestival' },
          { language: 'en', name: 'Water Festival' },
          { language: 'km', name: 'បុណ្យអុំទូក' },
        ]
      },
      {
        slug: 'new-year',
        translations: [
          { language: 'sv', name: 'Nyår' },
          { language: 'en', name: 'New Year' },
          { language: 'km', name: 'ចូលឆ្នាំថ្មី' },
        ]
      },
      {
        slug: 'traditional-dance',
        translations: [
          { language: 'sv', name: 'Traditionell dans' },
          { language: 'en', name: 'Traditional Dance' },
          { language: 'km', name: 'របាំប្រពៃណី' },
        ]
      },
      {
        slug: 'youth',
        translations: [
          { language: 'sv', name: 'Ungdom' },
          { language: 'en', name: 'Youth' },
          { language: 'km', name: 'យុវជន' },
        ]
      },
      {
        slug: 'elderly',
        translations: [
          { language: 'sv', name: 'Äldre' },
          { language: 'en', name: 'Elderly' },
          { language: 'km', name: 'មនុស្សចាស់' },
        ]
      },
      {
        slug: 'education',
        translations: [
          { language: 'sv', name: 'Utbildning' },
          { language: 'en', name: 'Education' },
          { language: 'km', name: 'អប់រំ' },
        ]
      },
      {
        slug: 'language-learning',
        translations: [
          { language: 'sv', name: 'Språkinlärning' },
          { language: 'en', name: 'Language Learning' },
          { language: 'km', name: 'ការរៀនភាសា' },
        ]
      },
      {
        slug: 'integration-support',
        translations: [
          { language: 'sv', name: 'Integrationsstöd' },
          { language: 'en', name: 'Integration Support' },
          { language: 'km', name: 'ការគាំទ្រការរួមបញ្ចូល' },
        ]
      },
      {
        slug: 'job-search',
        translations: [
          { language: 'sv', name: 'Jobbsökning' },
          { language: 'en', name: 'Job Search' },
          { language: 'km', name: 'ការស្វែងរកការងារ' },
        ]
      },
      {
        slug: 'housing',
        translations: [
          { language: 'sv', name: 'Boende' },
          { language: 'en', name: 'Housing' },
          { language: 'km', name: 'លំនៅដ្ឋាន' },
        ]
      },
      {
        slug: 'healthcare',
        translations: [
          { language: 'sv', name: 'Sjukvård' },
          { language: 'en', name: 'Healthcare' },
          { language: 'km', name: 'សុខាភិបាល' },
        ]
      },
      {
        slug: 'volunteer',
        translations: [
          { language: 'sv', name: 'Volontär' },
          { language: 'en', name: 'Volunteer' },
          { language: 'km', name: 'អ្នកស្ម័គ្រចិត្ត' },
        ]
      },
      {
        slug: 'fundraising',
        translations: [
          { language: 'sv', name: 'Insamling' },
          { language: 'en', name: 'Fundraising' },
          { language: 'km', name: 'ការបរិច្ចាគ' },
        ]
      },
      {
        slug: 'cooking',
        translations: [
          { language: 'sv', name: 'Matlagning' },
          { language: 'en', name: 'Cooking' },
          { language: 'km', name: 'ការធ្វើម្ហូប' },
        ]
      },
      {
        slug: 'music',
        translations: [
          { language: 'sv', name: 'Musik' },
          { language: 'en', name: 'Music' },
          { language: 'km', name: 'តន្ត្រី' },
        ]
      },
      {
        slug: 'buddhism',
        translations: [
          { language: 'sv', name: 'Buddhism' },
          { language: 'en', name: 'Buddhism' },
          { language: 'km', name: 'ព្រះពុទ្ធសាសនា' },
        ]
      },
      {
        slug: 'temple',
        translations: [
          { language: 'sv', name: 'Tempel' },
          { language: 'en', name: 'Temple' },
          { language: 'km', name: 'វត្ត' },
        ]
      },
      {
        slug: 'family',
        translations: [
          { language: 'sv', name: 'Familj' },
          { language: 'en', name: 'Family' },
          { language: 'km', name: 'គ្រួសារ' },
        ]
      },
      {
        slug: 'children',
        translations: [
          { language: 'sv', name: 'Barn' },
          { language: 'en', name: 'Children' },
          { language: 'km', name: 'កុមារ' },
        ]
      },
      {
        slug: 'scholarship',
        translations: [
          { language: 'sv', name: 'Stipendium' },
          { language: 'en', name: 'Scholarship' },
          { language: 'km', name: 'អាហារូបករណ៍' },
        ]
      },
      {
        slug: 'art',
        translations: [
          { language: 'sv', name: 'Konst' },
          { language: 'en', name: 'Art' },
          { language: 'km', name: 'សិល្បៈ' },
        ]
      },
      {
        slug: 'handicrafts',
        translations: [
          { language: 'sv', name: 'Hantverk' },
          { language: 'en', name: 'Handicrafts' },
          { language: 'km', name: 'សិប្បកម្មដៃ' },
        ]
      }
    ]

    for (const tagData of tagsData) {
      await prisma.tag.create({
        data: {
          slug: tagData.slug,
          translations: {
            create: tagData.translations
          }
        }
      })
    }

    console.log('✅ Successfully seeded categories and tags!')
    console.log(`📁 Created ${await prisma.category.count()} categories`)
    console.log(`🏷️ Created ${await prisma.tag.count()} tags`)

  } catch (error) {
    console.error('❌ Error seeding categories and tags:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedCategoriesAndTags()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })