import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get admin user to be the author
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  })

  if (!admin) {
    console.error('Admin user not found. Please run seed-admin.ts first.')
    process.exit(1)
  }

  console.log('Creating sample events...')

  // Event 1: Physical Event - Public Registration - Free
  const event1 = await prisma.event.upsert({
    where: { slug: 'khmer-new-year-2025' },
    update: {},
    create: {
      slug: 'khmer-new-year-2025',
      startDate: new Date('2025-04-14T10:00:00'),
      endDate: new Date('2025-04-14T18:00:00'),
      allDay: false,
      locationType: 'PHYSICAL',
      venueName: 'Stockholm Community Center',
      address: 'Torsgatan 19',
      postalCode: '113 62',
      city: 'Stockholm',
      country: 'Sweden',
      registrationEnabled: true,
      registrationType: 'PUBLIC',
      registrationDeadline: new Date('2025-04-10T23:59:59'),
      maxCapacity: 150,
      currentAttendees: 0,
      isFree: true,
      organizer: 'Sahakum Khmer',
      contactEmail: 'info@sahakumkhmer.se',
      featuredImg: '/media/images/khmer-new-year.jpg',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            language: 'en',
            title: 'Khmer New Year Celebration 2025',
            content: `<p>Join us for a vibrant celebration of Khmer New Year (Chaul Chnam Thmey)! Experience traditional music, dance performances, authentic Khmer cuisine, and cultural activities for all ages.</p>

<h2>Event Highlights</h2>
<ul>
  <li>Traditional Apsara dance performances</li>
  <li>Live Khmer music and cultural shows</li>
  <li>Authentic Khmer food and refreshments</li>
  <li>Activities for children and families</li>
  <li>Community gathering and networking</li>
</ul>

<h2>Schedule</h2>
<p><strong>10:00 AM</strong> - Doors open, registration<br>
<strong>11:00 AM</strong> - Traditional blessing ceremony<br>
<strong>12:00 PM</strong> - Lunch and cultural performances<br>
<strong>3:00 PM</strong> - Games and activities for children<br>
<strong>6:00 PM</strong> - Event concludes</p>

<p>This is a free event open to everyone. Please register to help us plan accordingly!</p>`,
            excerpt: 'Celebrate Khmer New Year with traditional music, dance, food, and cultural activities. Free event for the whole community!',
            seoTitle: 'Khmer New Year 2025 Celebration in Stockholm | Sahakum Khmer',
            metaDescription: 'Join Sahakum Khmer for Khmer New Year celebration in Stockholm. Traditional dance, music, food and family activities. April 14, 2025.',
          },
          {
            language: 'sv',
            title: 'Khmer nyårsfirande 2025',
            content: `<p>Följ med oss för ett livligt firande av Khmer nyår (Chaul Chnam Thmey)! Upplev traditionell musik, dansföreställningar, autentisk khmermat och kulturella aktiviteter för alla åldrar.</p>

<h2>Evenemangshöjdpunkter</h2>
<ul>
  <li>Traditionella Apsara-dansföreställningar</li>
  <li>Levande khmermusik och kulturella shower</li>
  <li>Autentisk khmermat och förfriskningar</li>
  <li>Aktiviteter för barn och familjer</li>
  <li>Gemenskapsmöte och nätverkande</li>
</ul>

<h2>Schema</h2>
<p><strong>10:00</strong> - Dörrarna öppnas, registrering<br>
<strong>11:00</strong> - Traditionell välsignelseceremoni<br>
<strong>12:00</strong> - Lunch och kulturella föreställningar<br>
<strong>15:00</strong> - Spel och aktiviteter för barn<br>
<strong>18:00</strong> - Evenemanget avslutas</p>

<p>Detta är ett gratis evenemang öppet för alla. Vänligen registrera dig för att hjälpa oss planera!</p>`,
            excerpt: 'Fira Khmer nyår med traditionell musik, dans, mat och kulturella aktiviteter. Gratis evenemang för hela samhället!',
            seoTitle: 'Khmer nyårsfirande 2025 i Stockholm | Sahakum Khmer',
            metaDescription: 'Följ med Sahakum Khmer för Khmer nyårsfirande i Stockholm. Traditionell dans, musik, mat och familjeaktiviteter. 14 april 2025.',
          },
          {
            language: 'km',
            title: 'ពិធីបុណ្យចូលឆ្នាំថ្មីខ្មែរ ២០២៥',
            content: `<p>សូមអញ្ជើញចូលរួមជាមួយយើងខ្ញុំក្នុងការប្រារព្ធពិធីបុណ្យចូលឆ្នាំថ្មីខ្មែរដ៏រស់រវើក! សូមបទពិសោធន៍តន្ត្រីប្រពៃណី ការសម្តែងរបាំ អាហារខ្មែរដើម និងសកម្មភាពវប្បធម៌សម្រាប់គ្រប់វ័យ។</p>

<h2>ការសម្តែងពិសេស</h2>
<ul>
  <li>ការសម្តែងរបាំអប្សរាប្រពៃណី</li>
  <li>តន្ត្រីខ្មែរផ្ទាល់ និងការសម្តែងវប្បធម៌</li>
  <li>អាហារខ្មែរដើម និងភេសជ្ជៈ</li>
  <li>សកម្មភាពសម្រាប់កុមារ និងគ្រួសារ</li>
  <li>ការជួបជុំសហគមន៍ និងបណ្តាញ</li>
</ul>

<h2>កាលវិភាគ</h2>
<p><strong>ម៉ោង ១០:០០ ព្រឹក</strong> - បើកទ្វារ ចុះឈ្មោះ<br>
<strong>ម៉ោង ១១:០០ ព្រឹក</strong> - ពិធីពរជ័យប្រពៃណី<br>
<strong>ម៉ោង ១២:០០ ថ្ងៃត្រង់</strong> - អាហារថ្ងៃត្រង់ និងការសម្តែងវប្បធម៌<br>
<strong>ម៉ោង ៣:០០ រសៀល</strong> - ល្បែង និងសកម្មភាពសម្រាប់កុមារ<br>
<strong>ម៉ោង ៦:០០ ល្ងាច</strong> - បញ្ចប់កម្មវិធី</p>

<p>នេះជាព្រឹត្តិការណ៍ឥតគិតថ្លៃសម្រាប់អ្នករាល់គ្នា។ សូមចុះឈ្មោះដើម្បីជួយយើងរៀបចំ!</p>`,
            excerpt: 'ប្រារព្ធពិធីបុណ្យចូលឆ្នាំថ្មីខ្មែរជាមួយតន្ត្រី របាំ អាហារ និងសកម្មភាពវប្បធម៌ប្រពៃណី។ ឥតគិតថ្លៃសម្រាប់សហគមន៍!',
            seoTitle: 'ពិធីបុណ្យចូលឆ្នាំថ្មីខ្មែរ ២០២៥ នៅ Stockholm | Sahakum Khmer',
            metaDescription: 'ចូលរួមជាមួយ Sahakum Khmer សម្រាប់ពិធីបុណ្យចូលឆ្នាំខ្មែរនៅ Stockholm។ របាំ តន្ត្រី អាហារប្រពៃណី និងសកម្មភាពគ្រួសារ។ ១៤ មេសា ២០២៥។',
          },
        ],
      },
    },
  })

  // Event 2: Virtual Event - Members Only - Free
  const event2 = await prisma.event.upsert({
    where: { slug: 'swedish-integration-workshop' },
    update: {},
    create: {
      slug: 'swedish-integration-workshop',
      startDate: new Date('2025-02-15T18:00:00'),
      endDate: new Date('2025-02-15T20:00:00'),
      allDay: false,
      locationType: 'VIRTUAL',
      virtualUrl: 'https://meet.google.com/sahakum-workshop',
      registrationEnabled: true,
      registrationType: 'MEMBERS_ONLY',
      registrationDeadline: new Date('2025-02-14T23:59:59'),
      maxCapacity: 50,
      currentAttendees: 0,
      isFree: true,
      organizer: 'Sahakum Khmer Integration Team',
      contactEmail: 'integration@sahakumkhmer.se',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            language: 'en',
            title: 'Swedish Integration Workshop for New Arrivals',
            content: `<p>Exclusive workshop for Sahakum Khmer members focusing on practical tips for integrating into Swedish society. Learn about the Swedish system, work culture, and daily life from experienced community members.</p>

<h2>Topics Covered</h2>
<ul>
  <li>Understanding Swedish bureaucracy (Skatteverket, Försäkringskassan, etc.)</li>
  <li>Job hunting and CV writing in Sweden</li>
  <li>Swedish workplace culture and expectations</li>
  <li>Healthcare system navigation</li>
  <li>Education system for children</li>
  <li>Housing and rights as a tenant</li>
</ul>

<h2>Workshop Format</h2>
<p>This online workshop will feature presentations by experienced community members, followed by Q&A sessions. All participants will receive a digital resource pack with useful links and templates.</p>

<p><strong>Language:</strong> Presentations in English and Swedish with Khmer translation available.</p>

<p><strong>Note:</strong> This event is exclusively for Sahakum Khmer members. Please log in to register.</p>`,
            excerpt: 'Members-only virtual workshop on integrating into Swedish society. Practical tips on work, healthcare, education, and daily life.',
            seoTitle: 'Swedish Integration Workshop for Members | Sahakum Khmer',
            metaDescription: 'Online workshop for Sahakum members on Swedish integration. Learn about work, healthcare, education and daily life. February 15, 2025.',
          },
          {
            language: 'sv',
            title: 'Svensk integrationsworkshop för nyanlända',
            content: `<p>Exklusiv workshop för Sahakum Khmer-medlemmar med fokus på praktiska tips för att integrera i det svenska samhället. Lär dig om det svenska systemet, arbetskulturen och vardagslivet från erfarna samhällsmedlemmar.</p>

<h2>Ämnen som täcks</h2>
<ul>
  <li>Förstå svensk byråkrati (Skatteverket, Försäkringskassan, etc.)</li>
  <li>Jobbsökning och CV-skrivning i Sverige</li>
  <li>Svensk arbetsplatskultur och förväntningar</li>
  <li>Navigering av sjukvårdssystemet</li>
  <li>Utbildningssystem för barn</li>
  <li>Boende och rättigheter som hyresgäst</li>
</ul>

<h2>Workshopformat</h2>
<p>Denna online-workshop kommer att innehålla presentationer av erfarna samhällsmedlemmar, följt av frågestunder. Alla deltagare får ett digitalt resurspaket med användbara länkar och mallar.</p>

<p><strong>Språk:</strong> Presentationer på engelska och svenska med khmer-översättning tillgänglig.</p>

<p><strong>Obs:</strong> Detta evenemang är exklusivt för Sahakum Khmer-medlemmar. Vänligen logga in för att registrera dig.</p>`,
            excerpt: 'Virtuell workshop endast för medlemmar om integration i det svenska samhället. Praktiska tips om arbete, sjukvård, utbildning och vardagsliv.',
            seoTitle: 'Svensk integrationsworkshop för medlemmar | Sahakum Khmer',
            metaDescription: 'Online workshop för Sahakum-medlemmar om svensk integration. Lär dig om arbete, sjukvård, utbildning och vardagsliv. 15 februari 2025.',
          },
          {
            language: 'km',
            title: 'វគ្គបណ្តុះបណ្តាលអំពីការធ្វើសមាហរណកម្មក្នុងសង្គមស៊ុយអែតសម្រាប់អ្នកមកថ្មី',
            content: `<p>វគ្គបណ្តុះបណ្តាលពិសេសសម្រាប់សមាជិក Sahakum Khmer ដែលផ្តោតលើគន្លឹះអនុវត្តន៍ដើម្បីធ្វើសមាហរណកម្មក្នុងសង្គមស៊ុយអែត។ រៀនអំពីប្រព័ន្ធស៊ុយអែត វប្បធម៌ការងារ និងជីវិតប្រចាំថ្ងៃពីសមាជិកសហគមន៍ដែលមានបទពិសោធន៍។</p>

<h2>ប្រធានបទដែលគ្រប់ដណ្តប់</h2>
<ul>
  <li>ការយល់ដឹងអំពី관료制度ស៊ុយអែត (Skatteverket, Försäkringskassan ។ល។)</li>
  <li>ការស្វែងរកការងារ និងការសរសេរប្រវត្តិរូបសង្ខេបនៅស៊ុយអែត</li>
  <li>វប្បធម៌ការងារ និងការរំពឹងទុកនៅកន្លែងធ្វើការស៊ុយអែត</li>
  <li>ការណែនាំប្រព័ន្ធថែទាំសុខភាព</li>
  <li>ប្រព័ន្ធអប់រំសម្រាប់កុមារ</li>
  <li>លំនៅដ្ឋាន និងសិទ្ធិជាអ្នកជួល</li>
</ul>

<h2>ទម្រង់វគ្គបណ្តុះបណ្តាល</h2>
<p>វគ្គបណ្តុះបណ្តាលតាមអ៊ីនធឺណិតនេះនឹងមានការបង្ហាញដោយសមាជិកសហគមន៍ដែលមានបទពិសោធន៍ បន្ទាប់មកសម័យសំណួរ និងចម្លើយ។ អ្នកចូលរួមទាំងអស់នឹងទទួលបានកញ្ចប់ធនធានឌីជីថលជាមួយនឹងតំណភ្ជាប់ និងគំរូមានប្រយោជន៍។</p>

<p><strong>ភាសា:</strong> ការបង្ហាញជាភាសាអង់គ្លេស និងស៊ុយអែត ជាមួយការបកប្រែជាភាសាខ្មែរ។</p>

<p><strong>ចំណាំ:</strong> ព្រឹត្តិការណ៍នេះសម្រាប់តែសមាជិក Sahakum Khmer។ សូមចូលគណនីដើម្បីចុះឈ្មោះ។</p>`,
            excerpt: 'វគ្គបណ្តុះបណ្តាលតាមអ៊ីនធឺណិតសម្រាប់សមាជិកអំពីការធ្វើសមាហរណកម្មក្នុងសង្គមស៊ុយអែត។ គន្លឹះអនុវត្តន៍អំពីការងារ សុខភាព អប់រំ និងជីវិតប្រចាំថ្ងៃ។',
            seoTitle: 'វគ្គបណ្តុះបណ្តាលសមាហរណកម្មស៊ុយអែតសម្រាប់សមាជិក | Sahakum Khmer',
            metaDescription: 'វគ្គបណ្តុះបណ្តាលតាមអ៊ីនធឺណិតសម្រាប់សមាជិក Sahakum អំពីការធ្វើសមាហរណកម្មស៊ុយអែត។ ១៥ កុម្ភៈ ២០២៥។',
          },
        ],
      },
    },
  })

  // Event 3: Hybrid Event - No Registration - Free
  const event3 = await prisma.event.upsert({
    where: { slug: 'community-coffee-meetup' },
    update: {},
    create: {
      slug: 'community-coffee-meetup',
      startDate: new Date('2025-01-25T14:00:00'),
      endDate: new Date('2025-01-25T16:00:00'),
      allDay: false,
      locationType: 'HYBRID',
      venueName: 'Café Rådhuset',
      address: 'Hamngatan 4',
      postalCode: '111 47',
      city: 'Stockholm',
      country: 'Sweden',
      virtualUrl: 'https://meet.google.com/sahakum-coffee',
      registrationEnabled: false,
      isFree: true,
      organizer: 'Sahakum Khmer Social Committee',
      contactEmail: 'social@sahakumkhmer.se',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            language: 'en',
            title: 'Monthly Community Coffee Meetup',
            content: `<p>Join fellow Cambodian Swedes for a casual coffee meetup! Whether you're new to Sweden or have been here for years, this is a great opportunity to connect with the community, practice languages, and make new friends.</p>

<h2>What to Expect</h2>
<ul>
  <li>Informal conversations in Khmer, Swedish, or English</li>
  <li>Share experiences and advice</li>
  <li>Network with community members</li>
  <li>Learn about upcoming events and activities</li>
  <li>Bring children - family-friendly atmosphere</li>
</ul>

<h2>Hybrid Format</h2>
<p>You can join us either <strong>in person</strong> at Café Rådhuset in Stockholm, or <strong>virtually</strong> via Google Meet. The café is centrally located near T-Centralen.</p>

<p><strong>No registration required!</strong> Just show up in person or click the virtual meeting link. Coffee and fika are on your own.</p>

<p>We host this meetup every last Saturday of the month. See you there!</p>`,
            excerpt: 'Casual monthly coffee meetup for the Cambodian Swedish community. In-person in Stockholm or join virtually. No registration needed!',
            seoTitle: 'Monthly Community Coffee Meetup | Sahakum Khmer Stockholm',
            metaDescription: 'Join Sahakum Khmer for casual coffee meetup in Stockholm or online. Connect with community, practice languages, make friends. Last Saturday monthly.',
          },
          {
            language: 'sv',
            title: 'Månatligt gemenskapskaffemöte',
            content: `<p>Följ med kambodjanska svenskar för ett avslappnat kaffemöte! Oavsett om du är ny i Sverige eller har bott här i flera år, är detta ett utmärkt tillfälle att ansluta dig till gemenskapen, öva språk och skaffa nya vänner.</p>

<h2>Vad du kan förvänta dig</h2>
<ul>
  <li>Informella samtal på khmer, svenska eller engelska</li>
  <li>Dela erfarenheter och råd</li>
  <li>Nätverka med samhällsmedlemmar</li>
  <li>Lär dig om kommande evenemang och aktiviteter</li>
  <li>Ta med barn - familjevänlig atmosfär</li>
</ul>

<h2>Hybridformat</h2>
<p>Du kan gå med oss antingen <strong>personligen</strong> på Café Rådhuset i Stockholm, eller <strong>virtuellt</strong> via Google Meet. Kaféet ligger centralt nära T-Centralen.</p>

<p><strong>Ingen registrering krävs!</strong> Kom bara personligen eller klicka på den virtuella möteslänken. Kaffe och fika står du för själv.</p>

<p>Vi anordnar detta möte varje sista lördag i månaden. Vi ses där!</p>`,
            excerpt: 'Avslappnat månatligt kaffemöte för det kambodjanska svenska samhället. Personligen i Stockholm eller gå med virtuellt. Ingen registrering behövs!',
            seoTitle: 'Månatligt gemenskapskaffemöte | Sahakum Khmer Stockholm',
            metaDescription: 'Följ med Sahakum Khmer för avslappnat kaffemöte i Stockholm eller online. Anslut med gemenskapen, öva språk, skaffa vänner. Sista lördagen varje månad.',
          },
          {
            language: 'km',
            title: 'ការជួបជុំផឹកកាហ្វេសហគមន៍ប្រចាំខែ',
            content: `<p>ចូលរួមជាមួយជនជាតិខ្មែរស៊ុយអែតសម្រាប់ការជួបជុំផឹកកាហ្វេធម្មតា! មិនថាអ្នកទើបមកស៊ុយអែតថ្មី ឬបានរស់នៅទីនេះអស់ច្រើនឆ្នាំ នេះគឺជាឱកាសដ៏ល្អក្នុងការភ្ជាប់ជាមួយសហគមន៍ អនុវត្តភាសា និងបង្កើតមិត្តភក្តិថ្មី។</p>

<h2>អ្វីដែលអ្នកអាចរំពឹងទុក</h2>
<ul>
  <li>ការសន្ទនាក្រៅផ្លូវការជាភាសាខ្មែរ ស៊ុយអែត ឬអង់គ្លេស</li>
  <li>ចែករំលែកបទពិសោធន៍ និងដំបូន្មាន</li>
  <li>បណ្តាញជាមួយសមាជិកសហគមន៍</li>
  <li>ស្វែងយល់អំពីព្រឹត្តិការណ៍ និងសកម្មភាពខាងមុខ</li>
  <li>នាំកុមារមក - បរិយាកាសសម្រាប់គ្រួសារ</li>
</ul>

<h2>ទម្រង់ច្របាច់</h2>
<p>អ្នកអាចចូលរួមជាមួយយើងខ្ញុំ <strong>ដោយផ្ទាល់</strong> នៅ Café Rådhuset ក្នុងទីក្រុង Stockholm ឬ <strong>តាមអ៊ីនធឺណិត</strong> តាមរយៈ Google Meet។ ហាងកាហ្វេស្ថិតនៅកណ្តាលទីក្រុងជិត T-Centralen។</p>

<p><strong>មិនចាំបាច់ចុះឈ្មោះទេ!</strong> គ្រាន់តែមកដោយផ្ទាល់ ឬចុចតំណភ្ជាប់ប្រជុំតាមអ៊ីនធឺណិត។ កាហ្វេ និង fika អ្នកទិញផ្ទាល់។</p>

<p>យើងរៀបចំការជួបជុំនេះរៀងរាល់ថ្ងៃសៅរ៍ចុងក្រោយនៃខែ។ ជួបគ្នា!</p>`,
            excerpt: 'ការជួបជុំផឹកកាហ្វេធម្មតាប្រចាំខែសម្រាប់សហគមន៍ជនជាតិខ្មែរស៊ុយអែត។ ដោយផ្ទាល់នៅ Stockholm ឬចូលរួមតាមអ៊ីនធឺណិត។ មិនចាំបាច់ចុះឈ្មោះ!',
            seoTitle: 'ការជួបជុំផឹកកាហ្វេសហគមន៍ប្រចាំខែ | Sahakum Khmer Stockholm',
            metaDescription: 'ចូលរួមជាមួយ Sahakum Khmer សម្រាប់ការជួបជុំផឹកកាហ្វេធម្មតានៅ Stockholm ឬតាមអ៊ីនធឺណិត។ ភ្ជាប់ជាមួយសហគមន៍។ ថ្ងៃសៅរ៍ចុងក្រោយប្រចាំខែ។',
          },
        ],
      },
    },
  })

  // Event 4: Physical Event - Public Registration - Free with Limited Capacity
  const event4 = await prisma.event.upsert({
    where: { slug: 'swedish-language-conversation-practice' },
    update: {},
    create: {
      slug: 'swedish-language-conversation-practice',
      startDate: new Date('2025-02-01T10:00:00'),
      endDate: new Date('2025-02-01T12:00:00'),
      allDay: false,
      locationType: 'PHYSICAL',
      venueName: 'Sahakum Khmer Office',
      address: 'Sveavägen 98',
      postalCode: '113 50',
      city: 'Stockholm',
      country: 'Sweden',
      registrationEnabled: true,
      registrationType: 'PUBLIC',
      registrationDeadline: new Date('2025-01-30T23:59:59'),
      maxCapacity: 20,
      currentAttendees: 0,
      isFree: true,
      organizer: 'Sahakum Khmer Language Group',
      contactEmail: 'language@sahakumkhmer.se',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            language: 'en',
            title: 'Swedish Language Conversation Practice',
            content: `<p>Practice your Swedish in a friendly, supportive environment! This conversation practice session is designed for beginners to intermediate Swedish learners in the Cambodian community.</p>

<h2>Session Details</h2>
<ul>
  <li>Small group format (max 20 participants) for personalized attention</li>
  <li>Led by experienced Swedish speakers from our community</li>
  <li>Focus on everyday conversation and practical vocabulary</li>
  <li>Safe space to make mistakes and learn</li>
  <li>Coffee and snacks provided</li>
</ul>

<h2>What to Bring</h2>
<ul>
  <li>Notebook and pen (optional)</li>
  <li>Questions or topics you want to practice</li>
  <li>Positive attitude!</li>
</ul>

<h2>Who Should Attend</h2>
<p>This session is perfect for:</p>
<ul>
  <li>New arrivals learning Swedish</li>
  <li>Anyone wanting to improve their speaking confidence</li>
  <li>Preparation for SFI exams or job interviews</li>
  <li>Parents wanting to help children with Swedish homework</li>
</ul>

<p><strong>Limited to 20 participants</strong> - Register early to secure your spot!</p>`,
            excerpt: 'Practice Swedish conversation in a friendly environment. Small group format for beginners to intermediate learners. Free with limited spots!',
            seoTitle: 'Swedish Language Conversation Practice | Sahakum Khmer',
            metaDescription: 'Practice Swedish conversation with Sahakum Khmer. Small group, friendly environment for beginners-intermediate. Free, limited spots. February 1, 2025.',
          },
          {
            language: 'sv',
            title: 'Svenskt språksamtalspraktik',
            content: `<p>Öva din svenska i en vänlig, stödjande miljö! Denna samtalspraktik är utformad för nybörjare till mellanliggande svensklärare i den kambodjanska gemenskapen.</p>

<h2>Sessionsdetaljer</h2>
<ul>
  <li>Liten gruppformat (max 20 deltagare) för personlig uppmärksamhet</li>
  <li>Leds av erfarna svensktalare från vår gemenskap</li>
  <li>Fokus på vardagliga samtal och praktiskt ordförråd</li>
  <li>Säkert utrymme att göra misstag och lära sig</li>
  <li>Kaffe och snacks tillhandahålls</li>
</ul>

<h2>Vad ska tas med</h2>
<ul>
  <li>Anteckningsbok och penna (valfritt)</li>
  <li>Frågor eller ämnen du vill öva</li>
  <li>Positiv attityd!</li>
</ul>

<h2>Vem ska delta</h2>
<p>Denna session är perfekt för:</p>
<ul>
  <li>Nyanlända som lär sig svenska</li>
  <li>Alla som vill förbättra sitt talande självförtroende</li>
  <li>Förberedelse för SFI-prov eller jobbintervjuer</li>
  <li>Föräldrar som vill hjälpa barn med svenska läxor</li>
</ul>

<p><strong>Begränsat till 20 deltagare</strong> - Registrera dig tidigt för att säkra din plats!</p>`,
            excerpt: 'Öva svenskt samtal i en vänlig miljö. Liten gruppformat för nybörjare till mellanliggande lärare. Gratis med begränsade platser!',
            seoTitle: 'Svenskt språksamtalspraktik | Sahakum Khmer',
            metaDescription: 'Öva svenskt samtal med Sahakum Khmer. Liten grupp, vänlig miljö för nybörjare-mellanliggande. Gratis, begränsade platser. 1 februari 2025.',
          },
          {
            language: 'km',
            title: 'ការអនុវត្តសន្ទនាភាសាស៊ុយអែត',
            content: `<p>អនុវត្តភាសាស៊ុយអែតរបស់អ្នកក្នុងបរិយាកាសមិត្តភាព និងគាំទ្រ! វគ្គអនុវត្តសន្ទនានេះត្រូវបានរចនាឡើងសម្រាប់អ្នកសិក្សាភាសាស៊ុយអែតកម្រិតដំបូង ទៅកម្រិតមធ្យមក្នុងសហគមន៍កម្ពុជា។</p>

<h2>ព័ត៌មានលម្អិតវគ្គសិក្សា</h2>
<ul>
  <li>ទម្រង់ក្រុមតូច (អតិបរមា ២០ នាក់) សម្រាប់ការយកចិត្តទុកដាក់លម្អិត</li>
  <li>ដឹកនាំដោយអ្នកនិយាយភាសាស៊ុយអែតដែលមានបទពិសោធន៍ពីសហគមន៍របស់យើង</li>
  <li>ផ្តោតលើការសន្ទនាប្រចាំថ្ងៃ និងវាក្យសព្ទអនុវត្តន៍</li>
  <li>ទីកន្លែងសុវត្ថិភាពដើម្បីធ្វើកំហុស និងរៀន</li>
  <li>កាហ្វេ និងអាហារសម្ល្ក</li>
</ul>

<h2>អ្វីដែលត្រូវយកមក</h2>
<ul>
  <li>សៀវភៅកត់ត្រា និងប៊ិច (ជាជម្រើស)</li>
  <li>សំណួរ ឬប្រធានបទដែលអ្នកចង់អនុវត្ត</li>
  <li>អាកប្បកិរិយាវិជ្ជមាន!</li>
</ul>

<h2>អ្នកណាគួរចូលរួម</h2>
<p>វគ្គសិក្សានេះល្អឥតខ្ចោះសម្រាប់៖</p>
<ul>
  <li>អ្នកទើបមកថ្មីកំពុងរៀនភាសាស៊ុយអែត</li>
  <li>អ្នកដែលចង់កែលម្អទំនុកចិត្តក្នុងការនិយាយ</li>
  <li>ការរៀបចំសម្រាប់ការប្រឡង SFI ឬការសម្ភាសន៍ការងារ</li>
  <li>ឪពុកម្តាយចង់ជួយកូនជាមួយលំហាត់ភាសាស៊ុយអែត</li>
</ul>

<p><strong>កំណត់ត្រឹម ២០ នាក់</strong> - ចុះឈ្មោះមុនដើម្បីធានាកន្លែង!</p>`,
            excerpt: 'អនុវត្តការសន្ទនាភាសាស៊ុយអែតក្នុងបរិយាកាសមិត្តភាព។ ទម្រង់ក្រុមតូចសម្រាប់អ្នកសិក្សាកម្រិតដំបូង ទៅមធ្យម។ ឥតគិតថ្លៃ មានកន្លែងមានកំណត់!',
            seoTitle: 'ការអនុវត្តសន្ទនាភាសាស៊ុយអែត | Sahakum Khmer',
            metaDescription: 'អនុវត្តការសន្ទនាភាសាស៊ុយអែតជាមួយ Sahakum Khmer។ ក្រុមតូច បរិយាកាសមិត្តភាពសម្រាប់កម្រិតដំបូង-មធ្យម។ ឥតគិតថ្លៃ កន្លែងមានកំណត់។ ១ កុម្ភៈ ២០២៥។',
          },
        ],
      },
    },
  })

  console.log('✅ Sample events created successfully!')
  console.log('\nCreated events:')
  console.log('1.', event1.slug, '- Physical, Public, Free')
  console.log('2.', event2.slug, '- Virtual, Members Only, Free')
  console.log('3.', event3.slug, '- Hybrid, No Registration, Free')
  console.log('4.', event4.slug, '- Physical, Public, Limited Capacity')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
