import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding initiatives...')

  // Get the admin user as project lead
  const adminUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@sahakumkhmer.se' },
        { role: 'ADMIN' }
      ]
    }
  })

  if (!adminUser) {
    console.error('❌ No admin user found. Please run seed-admin.ts first.')
    return
  }

  // Get some board/admin users for team members
  const teamUsers = await prisma.user.findMany({
    where: {
      role: {
        in: ['BOARD', 'ADMIN', 'EDITOR']
      }
    },
    take: 5
  })

  console.log(`✅ Found ${teamUsers.length} users for team members`)

  // Initiative 1: Khmer New Year 2025
  const knyInitiative = await prisma.initiative.upsert({
    where: { slug: 'khmer-new-year-2025' },
    update: {},
    create: {
      slug: 'khmer-new-year-2025',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      category: 'CULTURAL_EVENT',
      startDate: new Date('2025-04-14'),
      endDate: new Date('2025-04-16'),
      featuredImage: '/media/images/khmer_new_year.jpg',
      projectLeadId: adminUser.id,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Khmer New Year 2025 Celebration',
            shortDescription: 'Join us for a grand celebration of Khmer New Year with traditional games, food, and cultural performances in Stockholm.',
            description: `<h2>Celebrate Khmer New Year with Us!</h2>
<p>We are excited to announce our annual Khmer New Year (Chaul Chnam Thmey) celebration in Stockholm. This three-day festival will bring together the Cambodian-Swedish community for traditional ceremonies, cultural performances, and delicious food.</p>

<h3>Event Highlights:</h3>
<ul>
  <li><strong>Traditional Ceremonies:</strong> Morning merit-making and monk blessings</li>
  <li><strong>Cultural Performances:</strong> Classical Apsara dance and traditional music</li>
  <li><strong>Traditional Games:</strong> Angkunh (seed tossing), Chaol Chhoung (cloth throwing), and more</li>
  <li><strong>Cambodian Cuisine:</strong> Authentic dishes prepared by community members</li>
  <li><strong>Children's Activities:</strong> Face painting, crafts, and storytelling</li>
</ul>

<h3>Schedule:</h3>
<p><strong>Day 1 (April 14):</strong> Moha Songkran - End of the old year<br>
<strong>Day 2 (April 15):</strong> Virak Wanabat - Transitional day<br>
<strong>Day 3 (April 16):</strong> Thngai Loeung Sak - Beginning of the new year</p>

<p>This is a free community event open to everyone. Bring your family and friends!</p>`,
            seoTitle: 'Khmer New Year 2025 Stockholm | Sahakum Khmer',
            metaDescription: 'Celebrate Cambodian New Year 2025 in Stockholm with traditional ceremonies, cultural performances, and authentic food. Free community event for all ages.'
          },
          {
            language: 'sv',
            title: 'Kambodjas Nyår 2025',
            shortDescription: 'Fira det kambodsjanska nyåret med traditionella spel, mat och kulturella föreställningar i Stockholm.',
            description: `<h2>Fira Kambodjas Nyår med Oss!</h2>
<p>Vi är glada att kunna presentera vår årliga firande av det kambodsjanska nyåret (Chaul Chnam Thmey) i Stockholm. Denna tredagars festival samlar den kambodjansk-svenska gemenskapen för traditionella ceremonier, kulturella föreställningar och läcker mat.</p>

<h3>Höjdpunkter:</h3>
<ul>
  <li><strong>Traditionella Ceremonier:</strong> Morgon merit-making och munkbönningar</li>
  <li><strong>Kulturella Föreställningar:</strong> Klassisk Apsara-dans och traditionell musik</li>
  <li><strong>Traditionella Spel:</strong> Angkunh, Chaol Chhoung och mer</li>
  <li><strong>Kambodjansk Mat:</strong> Autentiska rätter tillagade av gemenskapsmedlemmar</li>
  <li><strong>Barnaktiviteter:</strong> Ansiktsmålning, pyssel och berättelser</li>
</ul>

<p>Detta är ett gratis evenemang öppet för alla. Ta med familj och vänner!</p>`
          },
          {
            language: 'km',
            title: 'បុណ្យចូលឆ្នាំថ្មីខ្មែរ ២០២៥',
            shortDescription: 'ចូលរួមជាមួយយើងក្នុងការប្រារព្ធបុណ្យចូលឆ្នាំថ្មីខ្មែរជាមួយហ្គេមប្រពៃណី អាហារ និងការសំដែងវប្បធម៌នៅស្តុកហូម។',
            description: `<h2>ប្រារព្ធបុណ្យចូលឆ្នាំថ្មីខ្មែរជាមួយគ្នា!</h2>
<p>យើងរំភើបក្នុងការប្រកាសអំពីការប្រារព្ធបុណ្យចូលឆ្នាំថ្មីខ្មែរប្រចាំឆ្នាំរបស់យើងនៅស្តុកហូម។ ពិធីបុណ្យរយៈពេលបីថ្ងៃនេះនឹងប្រមូលផ្តុំសហគមន៍កម្ពុជា-ស៊ុយអែតសម្រាប់ពិធីប្រពៃណី ការសំដែងវប្បធម៌ និងអាហារឆ្ងាញ់ៗ។</p>

<h3>ចំណុចសំខាន់ៗ:</h3>
<ul>
  <li><strong>ពិធីប្រពៃណី:</strong> ធ្វើបុណ្យព្រឹក និងពរពេជ្រ</li>
  <li><strong>ការសំដែងវប្បធម៌:</strong> របាំអប្សរា និងតន្ត្រីប្រពៃណី</li>
  <li><strong>ហ្គេមប្រពៃណី:</strong> អង្គុញ ចោលឈូង និងច្រើនទៀត</li>
  <li><strong>អាហារខ្មែរ:</strong> ម្ហូបប្រពៃណីដែលរៀបចំដោយសមាជិកសហគមន៍</li>
  <li><strong>សកម្មភាពកុមារ:</strong> គូរមុខ សិប្បកម្ម និងនិទានកថា</li>
</ul>

<p>នេះជាព្រឹត្តិការណ៍សហគមន៍ឥតគិតថ្លៃបើកចំហសម្រាប់អ្នករាល់គ្នា។ នាំគ្រួសារ និងមិត្តភក្តិមកជាមួយ!</p>`
          }
        ]
      }
    }
  })

  // Add team members to KNY initiative
  if (teamUsers.length > 0) {
    await prisma.initiativeMember.createMany({
      data: teamUsers.slice(0, 3).map((user, index) => ({
        initiativeId: knyInitiative.id,
        userId: user.id,
        role: index === 0 ? 'CO_LEAD' : 'MEMBER',
        contributionNote: index === 0 ? 'Event coordinator' : 'Volunteer helper'
      })),
      skipDuplicates: true
    })
  }

  // Add tasks for KNY initiative
  await prisma.task.createMany({
    data: [
      {
        initiativeId: knyInitiative.id,
        titleEn: 'Book venue for event',
        titleSv: 'Boka lokal för evenemang',
        titleKm: 'កក់កន្លែងសម្រាប់ព្រឹត្តិការណ៍',
        status: 'COMPLETED',
        priority: 'HIGH',
        order: 1
      },
      {
        initiativeId: knyInitiative.id,
        titleEn: 'Organize cultural performances',
        titleSv: 'Organisera kulturella föreställningar',
        titleKm: 'រៀបចំការសំដែងវប្បធម៌',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        order: 2
      },
      {
        initiativeId: knyInitiative.id,
        titleEn: 'Coordinate food vendors',
        titleSv: 'Samordna matförsäljare',
        titleKm: 'ត្រួតពិនិត្យអ្នកលក់អាហារ',
        status: 'TODO',
        priority: 'MEDIUM',
        order: 3
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Created: Khmer New Year 2025 initiative')

  // Initiative 2: Swedish-Khmer Business Directory
  const businessDir = await prisma.initiative.upsert({
    where: { slug: 'swedish-khmer-business-directory' },
    update: {},
    create: {
      slug: 'swedish-khmer-business-directory',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      category: 'BUSINESS',
      startDate: new Date('2025-01-15'),
      featuredImage: '/media/images/business.jpg',
      projectLeadId: adminUser.id,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Swedish-Khmer Business Directory',
            shortDescription: 'Building a comprehensive directory of Cambodian-owned businesses and professionals in Sweden to strengthen our economic network.',
            description: `<h2>Connecting Cambodian Businesses in Sweden</h2>
<p>We are creating a comprehensive online directory of Cambodian-owned businesses and professionals operating in Sweden. This initiative aims to strengthen our economic network and help community members support each other.</p>

<h3>Project Goals:</h3>
<ul>
  <li>Map all Cambodian-owned businesses across Sweden</li>
  <li>Create searchable online directory</li>
  <li>Facilitate business-to-business networking</li>
  <li>Promote Cambodian entrepreneurship</li>
  <li>Connect professionals for collaboration</li>
</ul>

<h3>Categories Include:</h3>
<p>Restaurants, shops, professional services (law, accounting, healthcare), trades, technology, and more.</p>

<p><strong>Are you a business owner?</strong> Register your business with us to be included in the directory!</p>`
          },
          {
            language: 'sv',
            title: 'Svensk-Kambodjansk Företagskatalog',
            shortDescription: 'Bygger en omfattande katalog över kambodjansk-ägda företag och yrkesverksamma i Sverige för att stärka vårt ekonomiska nätverk.',
            description: `<h2>Koppla Samman Kambodjanska Företag i Sverige</h2>
<p>Vi skapar en omfattande online-katalog över kambodjansk-ägda företag och yrkesverksamma som verkar i Sverige. Detta initiativ syftar till att stärka vårt ekonomiska nätverk och hjälpa gemenskapsmedlemmar att stödja varandra.</p>

<h3>Projektmål:</h3>
<ul>
  <li>Kartlägga alla kambodjansk-ägda företag i Sverige</li>
  <li>Skapa sökbar online-katalog</li>
  <li>Underlätta företag-till-företag-nätverk</li>
  <li>Främja kambodjanskt entreprenörskap</li>
</ul>`
          },
          {
            language: 'km',
            title: 'បញ្ជីអាជីវកម្មខ្មែរ-ស៊ុយអែត',
            shortDescription: 'កសាងបញ្ជីអាជីវកម្មដែលគ្រប់គ្រងដោយជនជាតិខ្មែរនៅស៊ុយអែត ដើម្បីពង្រឹងបណ្តាញសេដ្ឋកិច្ចរបស់យើង។',
            description: `<h2>ភ្ជាប់អាជីវកម្មខ្មែរនៅស៊ុយអែត</h2>
<p>យើងកំពុងបង្កើតបញ្ជីអនឡាញដ៏ទូលំទូលាយនៃអាជីវកម្មដែលគ្រប់គ្រងដោយជនជាតិខ្មែរ និងអ្នកជំនាញដែលកំពុងដំណើរការនៅស៊ុយអែត។</p>`
          }
        ]
      }
    }
  })

  console.log('✅ Created: Business Directory initiative')

  // Initiative 3: Khmer Language Classes (Members Only)
  const languageClasses = await prisma.initiative.upsert({
    where: { slug: 'khmer-language-classes-2025' },
    update: {},
    create: {
      slug: 'khmer-language-classes-2025',
      status: 'PUBLISHED',
      visibility: 'MEMBERS_ONLY',
      category: 'EDUCATION',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-06-30'),
      featuredImage: '/media/images/education.jpg',
      projectLeadId: adminUser.id,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Khmer Language Classes for Children',
            shortDescription: 'Weekly Khmer language classes for children to maintain connection with their cultural heritage and develop bilingual skills.',
            description: `<h2>Keep the Language Alive</h2>
<p>Our Khmer language program offers structured classes for children aged 5-16 to learn and maintain their mother tongue. Classes are held every Saturday from February through June 2025.</p>

<h3>Class Levels:</h3>
<ul>
  <li><strong>Beginners (5-8 years):</strong> Basic alphabet, vocabulary, and simple conversations</li>
  <li><strong>Intermediate (9-12 years):</strong> Reading, writing, and grammar</li>
  <li><strong>Advanced (13-16 years):</strong> Literature, composition, and cultural studies</li>
</ul>

<h3>What Students Will Learn:</h3>
<ul>
  <li>Khmer alphabet and writing system</li>
  <li>Conversational Khmer for daily life</li>
  <li>Reading comprehension</li>
  <li>Cultural traditions and values</li>
</ul>

<p><em>This program is available exclusively to Sahakum Khmer members and their families.</em></p>`
          },
          {
            language: 'sv',
            title: 'Khmer-språkkurser för Barn',
            shortDescription: 'Veckovisa khmer-språkkurser för barn att bibehålla kontakten med sitt kulturarv och utveckla tvåspråkiga färdigheter.',
            description: `<h2>Håll Språket vid Liv</h2>
<p>Vårt khmer-språkprogram erbjuder strukturerade klasser för barn i åldern 5-16 år att lära sig och bibehålla sitt modersmål. Klasser hålls varje lördag från februari till juni 2025.</p>`
          },
          {
            language: 'km',
            title: 'ថ្នាក់រៀនភាសាខ្មែរសម្រាប់កុមារ',
            shortDescription: 'ថ្នាក់រៀនភាសាខ្មែរប្រចាំសប្តាហ៍សម្រាប់កុមារដើម្បីរក្សាទំនាក់ទំនងជាមួយបេតិកភណ្ឌវប្បធម៌ និងអភិវឌ្ឍជំនាញភាសាពីរ។',
            description: `<h2>រក្សាភាសាឱ្យនៅរស់</h2>
<p>កម្មវិធីភាសាខ្មែររបស់យើងផ្តល់ថ្នាក់រៀនដែលមានរចនាសម្ព័ន្ធសម្រាប់កុមារអាយុ 5-16 ឆ្នាំដើម្បីរៀន និងរក្សាភាសាម្តាយរបស់ពួកគេ។</p>`
          }
        ]
      }
    }
  })

  console.log('✅ Created: Language Classes initiative (Members Only)')

  // Initiative 4: Swedish Driving Theory Translation
  const drivingTranslation = await prisma.initiative.upsert({
    where: { slug: 'swedish-driving-theory-khmer-translation' },
    update: {},
    create: {
      slug: 'swedish-driving-theory-khmer-translation',
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      category: 'TRANSLATION',
      startDate: new Date('2025-01-01'),
      featuredImage: '/media/images/translation.jpg',
      projectLeadId: adminUser.id,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Swedish Driving Theory Book Translation',
            shortDescription: 'Translating Swedish driving theory materials into Khmer to help community members obtain their driver\'s license.',
            description: `<h2>Making Driving Theory Accessible</h2>
<p>We are translating the Swedish driving theory book (Körkortsboken) into Khmer to help Cambodian immigrants study for their driver's license test. This is a volunteer-driven translation project.</p>

<h3>Project Scope:</h3>
<ul>
  <li>Translate complete driving theory book</li>
  <li>Create bilingual study materials</li>
  <li>Develop practice tests in Khmer</li>
  <li>Organize study groups</li>
</ul>

<h3>How You Can Help:</h3>
<p>We need volunteers with strong Swedish and Khmer language skills to help with translation, proofreading, and formatting. No professional translation experience required!</p>`
          },
          {
            language: 'sv',
            title: 'Översättning av Körkortsboken till Khmer',
            shortDescription: 'Översätter svensk teorimaterial för körkortet till khmer för att hjälpa medlemmar i gemenskapen att få sitt körkort.',
            description: `<h2>Göra Körteori Tillgänglig</h2>
<p>Vi översätter den svenska körkortsboken till khmer för att hjälpa kambodjanska invandrare att studera för sitt körkortstest.</p>`
          },
          {
            language: 'km',
            title: 'ការបកប្រែសៀវភៅទ្រឹស្តីបើកបរស៊ុយអែត',
            shortDescription: 'ការបកប្រែសម្ភារៈទ្រឹស្តីបើកបរស៊ុយអែតទៅភាសាខ្មែរដើម្បីជួយសមាជិកសហគមន៍ទទួលបានប័ណ្ណបើកបររបស់ពួកគេ។',
            description: `<h2>ធ្វើឱ្យទ្រឹស្តីបើកបរអាចចូលដំណើរការបាន</h2>
<p>យើងកំពុងបកប្រែសៀវភៅទ្រឹស្តីបើកបរស៊ុយអែត (Körkortsboken) ទៅភាសាខ្មែរដើម្បីជួយជនអន្តោប្រវេសន៍កម្ពុជារៀនសម្រាប់ការប្រឡងប័ណ្ណបើកបររបស់ពួកគេ។</p>`
          }
        ]
      }
    }
  })

  console.log('✅ Created: Driving Theory Translation initiative')

  // Initiative 5: Community Cooking Workshops (Draft)
  const cookingWorkshops = await prisma.initiative.upsert({
    where: { slug: 'cambodian-cooking-workshops' },
    update: {},
    create: {
      slug: 'cambodian-cooking-workshops',
      status: 'DRAFT',
      visibility: 'PUBLIC',
      category: 'SOCIAL',
      startDate: new Date('2025-03-15'),
      featuredImage: '/media/images/cooking.jpg',
      projectLeadId: adminUser.id,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Monthly Cambodian Cooking Workshops',
            shortDescription: 'Learn to cook authentic Cambodian dishes in our monthly hands-on cooking workshops led by experienced community chefs.',
            description: `<h2>Preserve Culinary Heritage</h2>
<p>Join us for monthly cooking workshops where you'll learn to prepare traditional Cambodian dishes from experienced home cooks in our community. Each session focuses on different regional specialties.</p>

<h3>Upcoming Workshops:</h3>
<ul>
  <li><strong>March:</strong> Amok - Cambodia's signature curry</li>
  <li><strong>April:</strong> Nom banh chok - Khmer noodles</li>
  <li><strong>May:</strong> Prahok ktis - Traditional fermented fish dip</li>
</ul>

<p>Workshops include ingredients, recipes, and a communal meal together. Perfect for both beginners and experienced cooks!</p>`
          },
          {
            language: 'sv',
            title: 'Månadsvis Kambodjansk Matlagningskurs',
            shortDescription: 'Lär dig laga autentiska kambodjanska rätter i våra månatliga praktiska matlagningskurser ledda av erfarna kockar.',
            description: `<h2>Bevara Kulinariskt Arv</h2>
<p>Delta i våra månatliga matlagningskurser där du lär dig att tillaga traditionella kambodjanska rätter.</p>`
          },
          {
            language: 'km',
            title: 'វគ្គបណ្តុះបណ្តាលធ្វើម្ហូបខ្មែរប្រចាំខែ',
            shortDescription: 'រៀនធ្វើម្ហូបកម្ពុជាពិតប្រាកដក្នុងវគ្គបណ្តុះបណ្តាលធ្វើម្ហូបរបស់យើងដែលដឹកនាំដោយមេចុងពូកែក្នុងសហគមន៍។',
            description: `<h2>រក្សាបេតិកភណ្ឌធ្វើម្ហូប</h2>
<p>ចូលរួមជាមួយយើងក្នុងវគ្គបណ្តុះបណ្តាលធ្វើម្ហូបប្រចាំខែដែលអ្នកនឹងរៀនរៀបចំម្ហូបខ្មែរប្រពៃណីពីមេចុងក្នុងសហគមន៍របស់យើង។</p>`
          }
        ]
      }
    }
  })

  console.log('✅ Created: Cooking Workshops initiative (Draft)')

  console.log('\n🎉 Successfully seeded 5 initiatives!')
  console.log('\nInitiatives created:')
  console.log('1. Khmer New Year 2025 (PUBLISHED, PUBLIC, CULTURAL_EVENT)')
  console.log('2. Swedish-Khmer Business Directory (PUBLISHED, PUBLIC, BUSINESS)')
  console.log('3. Khmer Language Classes (PUBLISHED, MEMBERS_ONLY, EDUCATION)')
  console.log('4. Driving Theory Translation (PUBLISHED, PUBLIC, TRANSLATION)')
  console.log('5. Cooking Workshops (DRAFT, PUBLIC, SOCIAL)')
}

main()
  .catch((e) => {
    console.error('Error seeding initiatives:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
