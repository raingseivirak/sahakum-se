import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Board Members...')

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: {
      role: 'ADMIN'
    }
  })

  if (!admin) {
    throw new Error('Admin user not found. Please run seed-admin.ts first.')
  }

  console.log('Admin user found:', admin.email)

  // Delete existing board members
  await prisma.boardMember.deleteMany({})
  console.log('Cleared existing board members')

  // Chairman
  const chairman = await prisma.boardMember.create({
    data: {
      slug: 'sophal-kim',
      firstName: 'Sophal',
      lastName: 'Kim',
      firstNameKhmer: 'សុផល',
      lastNameKhmer: 'គឹម',
      email: 'sophal.kim@sahakumkhmer.se',
      phone: '+46 70 123 4567',
      profileImage: '/media/images/placeholder-profile.jpg',
      order: 0,
      isChairman: true,
      active: true,
      joinedBoard: new Date('2020-01-15'),
      translations: {
        create: [
          {
            language: 'en',
            position: 'Chairman',
            education: 'Master\'s degree in Business Administration from Stockholm University. Bachelor\'s degree in Economics from Royal University of Phnom Penh.',
            vision: 'To build a strong, united Cambodian-Swedish community that preserves our cultural heritage while embracing integration into Swedish society. I envision Sahakum Khmer as a bridge between two cultures, helping new arrivals thrive in Sweden while maintaining connections to our roots.',
            bio: 'Sophal has been living in Sweden since 2005 and has dedicated the past 15 years to community building and cultural preservation. As Chairman, he leads with compassion and vision, always putting the community\'s needs first.'
          },
          {
            language: 'sv',
            position: 'Ordförande',
            education: 'Magisterexamen i företagsekonomi från Stockholms universitet. Kandidatexamen i ekonomi från Royal University of Phnom Penh.',
            vision: 'Att bygga en stark, enad kambodjansk-svensk gemenskap som bevarar vårt kulturarv samtidigt som vi omfamnar integration i det svenska samhället. Jag ser Sahakum Khmer som en bro mellan två kulturer, som hjälper nyanlända att blomstra i Sverige samtidigt som vi behåller kontakten med våra rötter.',
            bio: 'Sophal har bott i Sverige sedan 2005 och har ägnat de senaste 15 åren åt att bygga gemenskaper och bevara kulturen. Som ordförande leder han med medkänsla och vision, alltid med gemenskapens behov i främsta rummet.'
          },
          {
            language: 'km',
            position: 'ប្រធាន',
            education: 'បរិញ្ញាបត្រជាន់ខ្ពស់ផ្នែកគ្រប់គ្រងពាណិជ្ជកម្មពីសាកលវិទ្យាល័យ Stockholm។ បរិញ្ញាបត្រផ្នែកសេដ្ឋកិច្ចពីសាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ។',
            vision: 'ដើម្បីកសាងសហគមន៍កម្ពុជា-ស៊ុយអែតដ៏រឹងមាំ និងរួបរួមគ្នា ដែលរក្សាបាននូវបេតិកភណ្ឌវប្បធម៌របស់យើង ខណៈពេលដែលទទួលយកការរួមបញ្ចូលទៅក្នុងសង្គមស៊ុយអែត។ ខ្ញុំមើលឃើញសហគមន៍ខ្មែរជាស្ពានភ្ជាប់រវាងវប្បធម៌ទាំងពីរ ជួយអ្នកមកថ្មីឱ្យរីកចម្រើននៅស៊ុយអែត ខណៈពេលដែលរក្សាទំនាក់ទំនងទៅកាន់ប្រភពដើមរបស់យើង។',
            bio: 'សុផលបានរស់នៅស៊ុយអែតតាំងពីឆ្នាំ 2005 និងបានលះបង់ពេល 15 ឆ្នាំចុងក្រោយនេះដើម្បីកសាងសហគមន៍ និងរក្សាវប្បធម៌។ ក្នុងនាមជាប្រធាន គាត់ដឹកនាំដោយក្តីមេត្តាករុណា និងចក្ខុវិស័យ ដោយតែងតែដាក់តម្រូវការរបស់សហគមន៍ជាអាទិភាព។'
          }
        ]
      }
    },
    include: {
      translations: true
    }
  })

  console.log('✅ Chairman created:', chairman.slug)

  // Board Member 1
  const member1 = await prisma.boardMember.create({
    data: {
      slug: 'dara-chan',
      firstName: 'Dara',
      lastName: 'Chan',
      firstNameKhmer: 'ដារ៉ា',
      lastNameKhmer: 'ចាន់',
      email: 'dara.chan@sahakumkhmer.se',
      profileImage: '/media/images/placeholder-profile.jpg',
      order: 1,
      isChairman: false,
      active: true,
      joinedBoard: new Date('2020-06-01'),
      translations: {
        create: [
          {
            language: 'en',
            position: 'Vice Chairman & Treasurer',
            education: 'Bachelor\'s degree in Accounting from Uppsala University. Certified Public Accountant (CPA).',
            vision: 'Ensuring financial transparency and sustainability for our organization, so we can continue serving our community for generations to come.',
            bio: 'Dara brings 10 years of financial expertise to the board, ensuring responsible management of community resources.'
          },
          {
            language: 'sv',
            position: 'Vice ordförande & Kassör',
            education: 'Kandidatexamen i redovisning från Uppsala universitet. Auktoriserad revisor.',
            vision: 'Säkerställa finansiell transparens och hållbarhet för vår organisation, så att vi kan fortsätta tjäna vår gemenskap i generationer framöver.',
            bio: 'Dara bidrar med 10 års finansiell expertis till styrelsen och säkerställer ansvarsfull förvaltning av gemenskapens resurser.'
          },
          {
            language: 'km',
            position: 'អនុប្រធាន និង ហិរញ្ញិក',
            education: 'បរិញ្ញាបត្រផ្នែកគណនេយ្យពីសាកលវិទ្យាល័យ Uppsala។ គណនេយ្យករសាធារណៈអាជ្ញាប័ណ្ណ។',
            vision: 'ធានាឱ្យមានតម្លាភាពហិរញ្ញវត្ថុ និងនិរន្តរភាពសម្រាប់អង្គការរបស់យើង ដើម្បីឱ្យយើងអាចបន្តបម្រើសហគមន៍របស់យើងសម្រាប់ជំនាន់ក្រោយ។',
            bio: 'ដារ៉ានាំយកជំនាញហិរញ្ញវត្ថុ 10 ឆ្នាំមកក្នុងក្រុមប្រឹក្សា ធានាការគ្រប់គ្រងធនធានសហគមន៍ប្រកបដោយការទទួលខុសត្រូវ។'
          }
        ]
      }
    }
  })

  console.log('✅ Board member created:', member1.slug)

  // Board Member 2
  const member2 = await prisma.boardMember.create({
    data: {
      slug: 'sokha-prak',
      firstName: 'Sokha',
      lastName: 'Prak',
      firstNameKhmer: 'សុខា',
      lastNameKhmer: 'ប្រាក់',
      email: 'sokha.prak@sahakumkhmer.se',
      profileImage: '/media/images/placeholder-profile.jpg',
      order: 2,
      isChairman: false,
      active: true,
      joinedBoard: new Date('2021-03-15'),
      translations: {
        create: [
          {
            language: 'en',
            position: 'Board Member & Cultural Director',
            education: 'Master\'s degree in Cultural Studies from Lund University. Background in Cambodian traditional arts.',
            vision: 'Preserving and promoting Cambodian culture through educational programs, festivals, and artistic events that inspire both young and old.',
            bio: 'Sokha is passionate about keeping Cambodian traditions alive in Sweden through dance, music, and cultural education.'
          },
          {
            language: 'sv',
            position: 'Styrelseledamot & Kulturchef',
            education: 'Magisterexamen i kulturstudier från Lunds universitet. Bakgrund inom kambodjansk traditionell konst.',
            vision: 'Bevara och främja kambodjansk kultur genom utbildningsprogram, festivaler och konstnärliga evenemang som inspirerar både unga och gamla.',
            bio: 'Sokha brinner för att hålla kambodjanska traditioner levande i Sverige genom dans, musik och kulturell utbildning.'
          },
          {
            language: 'km',
            position: 'សមាជិកក្រុមប្រឹក្សា និង នាយកវប្បធម៌',
            education: 'បរិញ្ញាបត្រជាន់ខ្ពស់ផ្នែកសិក្សាវប្បធម៌ពីសាកលវិទ្យាល័យ Lund។ មានប្រវត្តិផ្នែកសិល្បៈប្រពៃណីកម្ពុជា។',
            vision: 'រក្សា និងលើកកម្ពស់វប្បធម៌កម្ពុជាតាមរយៈកម្មវិធីអប់រំ ពិធីបុណ្យ និងព្រឹត្តិការណ៍សិល្បៈដែលបំផុសគំនិតទាំងយុវជន និងមនុស្សចាស់។',
            bio: 'សុខាមានចិត្តក្តៅក្នុងការរក្សាប្រពៃណីកម្ពុជាឱ្យនៅរស់នៅស៊ុយអែតតាមរយៈរបាំ តន្ត្រី និងការអប់រំវប្បធម៌។'
          }
        ]
      }
    }
  })

  console.log('✅ Board member created:', member2.slug)

  // Board Member 3
  const member3 = await prisma.boardMember.create({
    data: {
      slug: 'kosal-ouk',
      firstName: 'Kosal',
      lastName: 'Ouk',
      firstNameKhmer: 'កុសល',
      lastNameKhmer: 'អូក',
      email: 'kosal.ouk@sahakumkhmer.se',
      profileImage: '/media/images/placeholder-profile.jpg',
      order: 3,
      isChairman: false,
      active: true,
      joinedBoard: new Date('2021-09-01'),
      translations: {
        create: [
          {
            language: 'en',
            position: 'Board Member & Youth Coordinator',
            education: 'Bachelor\'s degree in Social Work from Gothenburg University. Youth leadership training certification.',
            vision: 'Empowering Cambodian-Swedish youth to embrace both cultures, achieve their dreams, and become future community leaders.',
            bio: 'Kosal focuses on youth programs, mentorship, and creating opportunities for young Cambodians in Sweden.'
          },
          {
            language: 'sv',
            position: 'Styrelseledamot & Ungdomskoordinator',
            education: 'Kandidatexamen i socialt arbete från Göteborgs universitet. Certifiering i ungdomsledarskap.',
            vision: 'Ge kambodjansk-svenska ungdomar möjlighet att omfamna båda kulturerna, förverkliga sina drömmar och bli framtidens samhällsledare.',
            bio: 'Kosal fokuserar på ungdomsprogram, mentorskap och att skapa möjligheter för unga kambodjan er i Sverige.'
          },
          {
            language: 'km',
            position: 'សមាជិកក្រុមប្រឹក្សា និង សម្របសម្រួលយុវជន',
            education: 'បរិញ្ញាបត្រផ្នែកការងារសង្គមពីសាកលវិទ្យាល័យ Gothenburg។ វិញ្ញាបនបត្របណ្តុះបណ្តាលអ្នកដឹកនាំយុវជន។',
            vision: 'ផ្តល់សិទ្ធិអំណាចដល់យុវជនកម្ពុជា-ស៊ុយអែតឱ្យទទួលយកវប្បធម៌ទាំងពីរ សម្រេចបាននូវក្តីសុបិនរបស់ពួកគេ និងក្លាយជាអ្នកដឹកនាំសហគមន៍ក្នុងអនាគត។',
            bio: 'កុសលផ្តោតលើកម្មវិធីយុវជន ការណែនាំ និងការបង្កើតឱកាសសម្រាប់យុវជនកម្ពុជានៅស៊ុយអែត។'
          }
        ]
      }
    }
  })

  console.log('✅ Board member created:', member3.slug)

  // Board Member 4
  const member4 = await prisma.boardMember.create({
    data: {
      slug: 'chenda-sok',
      firstName: 'Chenda',
      lastName: 'Sok',
      firstNameKhmer: 'ចិន្តា',
      lastNameKhmer: 'សុខ',
      email: 'chenda.sok@sahakumkhmer.se',
      profileImage: '/media/images/placeholder-profile.jpg',
      order: 4,
      isChairman: false,
      active: true,
      joinedBoard: new Date('2022-01-10'),
      translations: {
        create: [
          {
            language: 'en',
            position: 'Board Member & Integration Specialist',
            education: 'Master\'s degree in Migration and Integration Studies from Malmö University. Social work experience with immigrant communities.',
            vision: 'Helping newly arrived Cambodians navigate Swedish systems, find employment, and build fulfilling lives in their new home.',
            bio: 'Chenda specializes in integration support, providing guidance on housing, employment, education, and civic participation.'
          },
          {
            language: 'sv',
            position: 'Styrelseledamot & Integrationsspecialist',
            education: 'Magisterexamen i migrations- och integrationsstudier från Malmö universitet. Erfarenhet av socialt arbete med invandrarsamhällen.',
            vision: 'Hjälpa nyanlända kambodjanare att navigera i svenska system, hitta arbete och bygga meningsfulla liv i sitt nya hem.',
            bio: 'Chenda specialiserar sig på integrationsstöd och ger vägledning om boende, sysselsättning, utbildning och medborgerligt deltagande.'
          },
          {
            language: 'km',
            position: 'សមាជិកក្រុមប្រឹក្សា និង អ្នកឯកទេសរួមបញ្ចូល',
            education: 'បរិញ្ញាបត្រជាន់ខ្ពស់ផ្នែកសិក្សាអន្តោប្រវេសន៍ និងរួមបញ្ចូលពីសាកលវិទ្យាល័យ Malmö។ បទពិសោធន៍ការងារសង្គមជាមួយសហគមន៍អន្តោប្រវេសន៍។',
            vision: 'ជួយជនជាតិកម្ពុជាដែលទើបមកដល់ថ្មីក្នុងការធ្វើដំណើរក្នុងប្រព័ន្ធស៊ុយអែត រកការងារធ្វើ និងកសាងជីវិតដែលពេញចិត្តនៅក្នុងផ្ទះថ្មីរបស់ពួកគេ។',
            bio: 'ចិន្តាមានជំនាញពិសេសក្នុងការគាំទ្រការរួមបញ្ចូល ផ្តល់ការណែនាំអំពីលំនៅដ្ឋាន ការងារ ការអប់រំ និងការចូលរួមរបស់ពលរដ្ឋ។'
          }
        ]
      }
    }
  })

  console.log('✅ Board member created:', member4.slug)

  // Board Member 5
  const member5 = await prisma.boardMember.create({
    data: {
      slug: 'narin-men',
      firstName: 'Narin',
      lastName: 'Men',
      firstNameKhmer: 'នារិន',
      lastNameKhmer: 'ម៉ែន',
      email: 'narin.men@sahakumkhmer.se',
      profileImage: '/media/images/placeholder-profile.jpg',
      order: 5,
      isChairman: false,
      active: true,
      joinedBoard: new Date('2022-06-01'),
      translations: {
        create: [
          {
            language: 'en',
            position: 'Board Member & Communications Director',
            education: 'Bachelor\'s degree in Communications and Media Studies from Stockholm University. Digital marketing certification.',
            vision: 'Building awareness of Sahakum Khmer\'s mission through strategic communications, social media, and community outreach.',
            bio: 'Narin manages our communication channels, website, and social media, ensuring our message reaches both Cambodian and Swedish audiences.'
          },
          {
            language: 'sv',
            position: 'Styrelseledamot & Kommunikationschef',
            education: 'Kandidatexamen i kommunikation och mediestudier från Stockholms universitet. Certifiering i digital marknadsföring.',
            vision: 'Bygga medvetenhet om Sahakum Khmers uppdrag genom strategisk kommunikation, sociala medier och samhällsutåtriktad verksamhet.',
            bio: 'Narin hanterar våra kommunikationskanaler, webbplats och sociala medier och säkerställer att vårt budskap når både kambodjanska och svenska publik.'
          },
          {
            language: 'km',
            position: 'សមាជិកក្រុមប្រឹក្សា និង នាយកទំនាក់ទំនង',
            education: 'បរិញ្ញាបត្រផ្នែកទំនាក់ទំនង និងសិក្សាប្រព័ន្ធផ្សព្វផ្សាយពីសាកលវិទ្យាល័យ Stockholm។ វិញ្ញាបនបត្រទីផ្សារឌីជីថល។',
            vision: 'កសាងការយល់ដឹងអំពីបេសកកម្មរបស់សហគមន៍ខ្មែរតាមរយៈទំនាក់ទំនងយុទ្ធសាស្ត្រ ប្រព័ន្ធផ្សព្វផ្សាយសង្គម និងការឈានដល់សហគមន៍។',
            bio: 'នារិនគ្រប់គ្រងช្រងទំនាក់ទំនងរបស់យើង គេហទំព័រ និងប្រព័ន្ធផ្សព្វផ្សាយសង្គម ធានាថាសារររបស់យើងឈានដល់ទស្សនិកជនទាំងកម្ពុជា និងស៊ុយអែត។'
          }
        ]
      }
    }
  })

  console.log('✅ Board member created:', member5.slug)

  console.log('\n✅ Successfully seeded 6 board members!')
  console.log('\nBoard composition:')
  console.log('- 1 Chairman')
  console.log('- 5 Board Members')
  console.log('\nAll members have:')
  console.log('- Full translations in English, Swedish, and Khmer')
  console.log('- Education backgrounds')
  console.log('- Personal visions for the association')
  console.log('\nYou can view the board at: http://localhost:3000/en/board')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
