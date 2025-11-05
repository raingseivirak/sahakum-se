import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get admin user to use as author
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!admin) {
    throw new Error('Admin user not found. Run seed-admin.ts first.')
  }

  console.log('Creating multilingual pages...')

  // 1. About Sahakum Khmer
  const aboutPage = await prisma.contentItem.upsert({
    where: { slug: 'about-us' },
    update: {},
    create: {
      slug: 'about-us',
      type: 'PAGE',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            language: 'en',
            title: 'About Sahakum Khmer',
            seoTitle: 'About Sahakum Khmer - Swedish-Cambodian Community Organization',
            metaDescription: 'Learn about Sahakum Khmer, a non-profit organization supporting the Cambodian community in Sweden.',
            excerpt: 'Sahakum Khmer is a Swedish non-profit organization dedicated to preserving Cambodian culture and supporting our community in Sweden.',
            content: `
# About Sahakum Khmer

## Our Mission
Sahakum Khmer is a Swedish non-profit organization dedicated to preserving Cambodian culture, traditions, and language while supporting the integration and well-being of the Cambodian community in Sweden.

## Our Vision
We envision a thriving Cambodian-Swedish community where cultural heritage is preserved and celebrated, while members actively participate in Swedish society.

## Our History
Founded in [Year], Sahakum Khmer has been a cornerstone of the Cambodian community in Sweden. Our organization emerged from the need to create a supportive network for Cambodian families and individuals who made Sweden their new home.

## What We Do
- **Cultural Preservation**: Organizing traditional festivals, cultural events, and language classes
- **Community Support**: Providing guidance for newcomers, language assistance, and social services
- **Integration Programs**: Helping community members navigate Swedish society while maintaining their cultural identity
- **Youth Programs**: Engaging young Cambodian-Swedes through cultural activities and mentorship
- **Advocacy**: Representing the interests of the Cambodian community in broader Swedish society

## Contact Us
**Address**: [Organization Address]
**Phone**: [Phone Number]
**Email**: contact.sahakumkhmer.se@gmail.com
**Visit Us**: [Office Hours and Location Details]

Join us in building a stronger, more connected Cambodian-Swedish community.
            `
          },
          {
            language: 'sv',
            title: 'Om Sahakum Khmer',
            seoTitle: 'Om Sahakum Khmer - Svensk-kambodjansk community-organisation',
            metaDescription: 'Lär dig om Sahakum Khmer, en ideell organisation som stöttar den kambodjanska gemenskapen i Sverige.',
            excerpt: 'Sahakum Khmer är en svensk ideell organisation som ägnar sig åt att bevara kambodjansk kultur och stödja vår gemenskap i Sverige.',
            content: `
# Om Sahakum Khmer

## Vårt Uppdrag
Sahakum Khmer är en svensk ideell organisation som ägnar sig åt att bevara kambodjansk kultur, traditioner och språk samtidigt som vi stödjer integration och välbefinnandet för den kambodjanska gemenskapen i Sverige.

## Vår Vision
Vi föreställer oss en blomstrande kambodjansk-svensk gemenskap där kulturarvet bevaras och firas, medan medlemmarna aktivt deltar i det svenska samhället.

## Vår Historia
Grundad [År], har Sahakum Khmer varit en hörnsten i den kambodjanska gemenskapen i Sverige. Vår organisation växte fram ur behovet av att skapa ett stödjande nätverk för kambodjanska familjer och individer som gjorde Sverige till sitt nya hem.

## Vad Vi Gör
- **Kulturbevarande**: Organiserar traditionella festivaler, kulturella evenemang och språkkurser
- **Gemenskapsstöd**: Ger vägledning för nykomlingar, språkhjälp och sociala tjänster
- **Integrationsprogram**: Hjälper gemenskapsmedlemmar att navigera i det svenska samhället samtidigt som de behåller sin kulturella identitet
- **Ungdomsprogram**: Engagerar unga kambodjansk-svenskar genom kulturella aktiviteter och mentorskap
- **Påverkansarbete**: Representerar den kambodjanska gemenskapens intressen i det bredare svenska samhället

## Kontakta Oss
**Adress**: [Organisationens Adress]
**Telefon**: [Telefonnummer]
**E-post**: contact.sahakumkhmer.se@gmail.com
**Besök Oss**: [Öppettider och Platsdetaljer]

Gå med oss i att bygga en starkare, mer sammankopplad kambodjansk-svensk gemenskap.
            `
          },
          {
            language: 'km',
            title: 'អំពីសហគម ខ្មែរ',
            seoTitle: 'អំពីសហគម ខ្មែរ - អង្គការសហគមន៍ស៊ុយអែត-កម្ពុជា',
            metaDescription: 'ស្វែងយល់អំពីសហគម ខ្មែរ អង្គការមិនរកប្រាក់ចំណេញដែលគាំទ្រសហគមន៍ខ្មែរនៅប្រទេសស៊ុយអែត។',
            excerpt: 'សហគម ខ្មែរ គឺជាអង្គការមិនរកប្រាក់ចំណេញរបស់ស៊ុយអែតដែលឧទ្ទិសខ្លួនដើម្បីរក្សាវប្បធម៌ខ្មែរ និងគាំទ្រសហគមន៍របស់យើងនៅស៊ុយអែត។',
            content: `
# អំពីសហគម ខ្មែរ

## បេសកកម្មរបស់យើង
សហគម ខ្មែរ គឺជាអង្គការមិនរកប្រាក់ចំណេញរបស់ស៊ុយអែតដែលឧទ្ទិសខ្លួនដើម្បីរក្សាវប្បធម៌ខ្មែរ ប្រពៃណី និងភាសា ទន្ទឹមនឹងការគាំទ្រដល់ការរួមបញ្ចូល និងសុខុមាលភាពរបស់សហគមន៍ខ្មែរនៅស៊ុយអែត។

## ចក្ខុវិស័យរបស់យើង
យើងមានចក្ខុវិស័យនៃសហគមន៍ខ្មែរ-ស៊ុយអែតដែលរកើនលូតលាស់ ដែលបេតិកភណ្ឌវប្បធម៌ត្រូវបានរក្សា និងអបអរសាទរ ខណៈដែលសមាជិកចូលរួមយ៉ាងសកម្មក្នុងសង្គមស៊ុយអែត។

## ប្រវត្តិរបស់យើង
ត្រូវបានបង្កើតឡើងក្នុងឆ្នាំ [ឆ្នាំ] សហគម ខ្មែរ បានក្លាយជាផ្នែកសំខាន់នៃសហគមន៍ខ្មែរនៅស៊ុយអែត។ អង្គការរបស់យើងបានលេចឡើងពីតម្រូវការបង្កើតបណ្តាញគាំទ្រសម្រាប់គ្រួសារ និងបុគ្គលខ្មែរដែលបានធ្វើឱ្យស៊ុយអែតក្លាយជាផ្ទះថ្មីរបស់ពួកគេ។

## អ្វីដែលយើងធ្វើ
- **ការរក្សាវប្បធម៌**: រៀបចំពិធីបុណ្យប្រពៃណី ព្រឹត្តិការណ៍វប្បធម៌ និងថ្នាក់រៀនភាសា
- **ការគាំទ្រសហគមន៍**: ផ្តល់ការណែនាំសម្រាប់អ្នកមកថ្មី ការជំនួយភាសា និងសេវាកម្មសង្គម
- **កម្មវិធីរួមបញ្ចូល**: ជួយសមាជិកសហគមន៍រុករកផ្លូវក្នុងសង្គមស៊ុយអែត ទន្ទឹមនឹងការរក្សាអត្តសញ្ញាណវប្បធម៌របស់ពួកគេ
- **កម្មវិធីយុវជន**: ចូលរួមជាមួយយុវជនខ្មែរ-ស៊ុយអែតតាមរយៈសកម្មភាពវប្បធម៌ និងការណែនាំ
- **ការតស៊ូមតិ**: តំណាងឱ្យផលប្រយោជន៍របស់សហគមន៍ខ្មែរក្នុងសង្គមស៊ុយអែតទូលំទូលាយ

## ទាក់ទងយើង
**អាសយដ្ឋាន**: [អាសយដ្ឋានអង្គការ]
**ទូរសព្ទ**: [លេខទូរសព្ទ]
**អ៊ីមែល**: contact.sahakumkhmer.se@gmail.com
**មកលេងយើង**: [ម៉ោងធ្វើការ និងព័ត៌មានលម្អិតអំពីទីតាំង]

ចូលរួមជាមួយយើងក្នុងការកសាងសហគមន៍ខ្មែរ-ស៊ុយអែតដែលរឹងមាំ និងភ្ជាប់ទំនាក់ទំនងកាន់តែច្រើន។
            `
          }
        ]
      }
    }
  })

  // 2. Introduction to Cambodia
  const cambodiaPage = await prisma.contentItem.upsert({
    where: { slug: 'cambodia' },
    update: {},
    create: {
      slug: 'cambodia',
      type: 'PAGE',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            language: 'en',
            title: 'Cambodia - Our Heritage',
            seoTitle: 'Cambodia - History, Culture and Heritage | Sahakum Khmer',
            metaDescription: 'Discover the rich history, vibrant culture, and beautiful traditions of Cambodia.',
            excerpt: 'Explore the beautiful Kingdom of Cambodia, its ancient history, rich culture, delicious cuisine, and vibrant festivals.',
            content: `
# Cambodia - Our Heritage

## The Kingdom of Cambodia
Cambodia, officially the Kingdom of Cambodia, is a country located in Southeast Asia. Known for its ancient temples, rich culture, and warm-hearted people, Cambodia has a history spanning over a thousand years.

## History
### Ancient Khmer Empire
The Khmer Empire (802-1431 CE) was one of the most powerful empires in Southeast Asia. The magnificent Angkor Wat, built in the early 12th century, stands as a testament to the architectural and engineering brilliance of our ancestors.

### Modern Cambodia
After periods of colonial rule and conflict, Cambodia has emerged as a nation focused on peace, development, and cultural preservation.

## Culture and Traditions
### Language
The Khmer language is the official language of Cambodia, with its own unique script that has been used for over 1,000 years.

### Religion
Theravada Buddhism is the predominant religion, deeply influencing Cambodian culture, art, and daily life.

### Arts and Crafts
- **Classical Dance**: The Apsara dance is a classical form representing celestial dancers
- **Traditional Music**: Features instruments like the tro (fiddle) and skor (drums)
- **Silk Weaving**: Traditional techniques passed down through generations
- **Stone Carving**: Ancient art form still practiced today

## Festivals and Celebrations
### Khmer New Year (Chaul Chnam Thmey)
Celebrated in April, marking the end of the harvest season and the beginning of the new year.

### Water Festival (Bon Om Touk)
A spectacular festival celebrating the reversal of the Tonle Sap river's flow.

### Pchum Ben
A religious festival honoring ancestors, demonstrating the importance of family and respect for elders.

## Cambodian Cuisine
Cambodian food is known for its balance of sweet, sour, salty, and spicy flavors:
- **Amok**: Traditional fish curry steamed in banana leaves
- **Lok Lak**: Stir-fried beef with vegetables and rice
- **Num Banh Chok**: Khmer noodles with fish curry
- **Kralan**: Bamboo-cooked sticky rice with coconut milk

## Geography and Nature
Cambodia is blessed with diverse landscapes:
- **Angkor Archaeological Park**: UNESCO World Heritage site
- **Tonle Sap Lake**: Southeast Asia's largest freshwater lake
- **Mekong River**: Vital waterway supporting millions of people
- **Cardamom Mountains**: Rich biodiversity and pristine forests
            `
          },
          {
            language: 'sv',
            title: 'Kambodja - Vårt Arv',
            seoTitle: 'Kambodja - Historia, Kultur och Arv | Sahakum Khmer',
            metaDescription: 'Upptäck Kambodjas rika historia, livfulla kultur och vackra traditioner.',
            excerpt: 'Utforska det vackra kungariket Kambodja, dess gamla historia, rika kultur, läckra maträtter och livfulla festivaler.',
            content: `
# Kambodja - Vårt Arv

## Kungariket Kambodja
Kambodja, officiellt Kungariket Kambodja, är ett land beläget i Sydostasien. Känt för sina gamla tempel, rika kultur och varmhjärtade människor, har Kambodja en historia som sträcker sig över tusen år.

## Historia
### Det Gamla Khmer-imperiet
Khmer-imperiet (802-1431 e.Kr.) var ett av de mäktigaste imperierna i Sydostasien. Det magnifika Angkor Wat, byggt i början av 1100-talet, står som ett vittnesbörd om våra förfäders arkitektoniska och tekniska briljans.

### Det Moderna Kambodja
Efter perioder av kolonialstyre och konflikt har Kambodja framträtt som en nation fokuserad på fred, utveckling och kulturell bevarande.

## Kultur och Traditioner
### Språk
Khmer-språket är det officiella språket i Kambodja, med sitt eget unika skriftsystem som har använts i över 1 000 år.

### Religion
Theravada-buddhismen är den dominerande religionen och påverkar djupt kambodjansk kultur, konst och dagligt liv.

### Konst och Hantverk
- **Klassisk Dans**: Apsara-dansen är en klassisk form som representerar himmelska dansare
- **Traditionell Musik**: Innehåller instrument som tro (fiol) och skor (trummor)
- **Sidenvävning**: Traditionella tekniker som förts vidare genom generationer
- **Stenhuggning**: Gammal konstform som fortfarande praktiseras idag

## Festivaler och Firanden
### Khmer Nyår (Chaul Chnam Thmey)
Firas i april och markerar slutet på skördesäsongen och början på det nya året.

### Vattenfestivalen (Bon Om Touk)
En spektakulär festival som firar vändningen av Tonle Sap-flodems flöde.

### Pchum Ben
En religiös festival som hedrar förfäder och visar vikten av familj och respekt för äldre.

## Kambodjansk Matkultur
Kambodjansk mat är känd för sin balans av söta, sura, salta och kryddiga smaker:
- **Amok**: Traditionell fiskcurry ångkokt i bananblad
- **Lok Lak**: Wokstekt nötkött med grönsaker och ris
- **Num Banh Chok**: Khmer-nudlar med fiskcurry
- **Kralan**: Bambukokad klibbig ris med kokosmjölk

## Geografi och Natur
Kambodja är välsignat med mångsidiga landskap:
- **Angkor Arkeologiska Park**: UNESCO:s världsarv
- **Tonle Sap-sjön**: Sydostasiens största sötvattensjö
- **Mekong-floden**: Vital vattenväg som försörjer miljontals människor
- **Cardamom-bergen**: Rik biologisk mångfald och orörda skogar
            `
          },
          {
            language: 'km',
            title: 'កម្ពុជា - បេតិកភណ្ឌរបស់យើង',
            seoTitle: 'កម្ពុជា - ប្រវត្តិសាស្ត្រ វប្បធម៌ និងបេតិកភណ្ឌ | សហគម ខ្មែរ',
            metaDescription: 'ស្វែងរកប្រវត្តិសាស្ត្រដ៏សម្បូរបែប វប្បធម៌រស់រវើក និងប្រពៃណីដ៏ស្រស់ស្អាតរបស់កម្ពុជា។',
            excerpt: 'ស្វែងយល់ពីព្រះរាជាណាចក្រកម្ពុជាដ៏ស្រស់ស្អាត ប្រវត្តិសាស្ត្របុរាណ វប្បធម៌សម្បូរបែប អាហារឆ្ងាញ់ និងពិធីបុណ្យរស់រវើក។',
            content: `
# កម្ពុជា - បេតិកភណ្ឌរបស់យើង

## ព្រះរាជាណាចក្រកម្ពុជា
កម្ពុជា ជាផ្លូវការគឺព្រះរាជាណាចក្រកម្ពុជា គឺជាប្រទេសមួយដែលមានទីតាំងនៅអាស៊ីអាគ្នេយ៍។ ល្បីល្បាញដោយសាររបស់ប្រាសាទបុរាណ វប្បធម៌សម្បូរបែប និងប្រជាជនចិត្តស្រឡាញ់ កម្ពុជាមានប្រវត្តិសាស្ត្រលើសពីមួយពាន់ឆ្នាំ។

## ប្រវត្តិសាស្ត្រ
### អាណាចក្រខ្មែរបុរាណ
អាណាចក្រខ្មែរ (៨០២-១៤៣១ គ.ស.) គឺជាអាណាចក្រដ៏មានអំណាចមួយក្នុងចំណោមអាណាចក្រនៅអាស៊ីអាគ្នេយ៍។ ប្រាសាទអង្គរវត្តដ៏អស្ចារ្យ ដែលត្រូវបានសាងសង់នៅដើមសតវត្សទី១២ ឈរជាសក្ខីភាពនៃភាពប្រណិតខាងស្ថាបត្យកម្ម និងវិស្វកម្មរបស់បុព្វបុរសយើង។

### កម្ពុជាសម័យទំនើប
បន្ទាប់ពីរយៈពេលនៃការគ្រប់គ្រងអាណានិគម និងជម្លោះ កម្ពុជាបានលេចឡើងជាប្រទេសដែលផ្តោតលើសន្តិភាព ការអភិវឌ្ឍន៍ និងការរក្សាវប្បធម៌។

## វប្បធម៌ និងប្រពៃណី
### ភាសា
ភាសាខ្មែរគឺជាភាសាផ្លូវការរបស់កម្ពុជា ដែលមានអក្សរសាស្ត្រតែមួយគត់ដែលត្រូវបានប្រើប្រាស់អស់រយៈពេលលើសពី១០០០ឆ្នាំ។

### សាសនា
ព្រះពុទ្ធសាសនាថេរវាទគឺជាសាសនាចម្បង ដែលមានឥទ្ធិពលយ៉ាងជ្រាលជ្រៅដល់វប្បធម៌ ศិល្បៈ និងជីវិតប្រចាំថ្ងៃរបស់ខ្មែរ។

### សិល្បៈ និងសិប្បកម្ម
- **របាំបុរាណ**: របាំអប្សរាគឺជាទម្រង់បុរាណដែលតំណាងឱ្យនាងរាំសួគ៌
- **តន្ត្រីប្រពៃណី**: មានដូចជាត្រូ (ខ្សែ) និងស្គរ (ស្គរ)
- **ការត្បាញសូត្រ**: បច្ចេកទេសប្រពៃណីដែលបាននឹកស្រលាញ់តាមជំនាន់
- **ការឆ្លាក់ថ្ម**: ទម្រង់សិល្បៈបុរាណដែលនៅតែត្រូវបានអនុវត្តសព្វថ្ងៃ

## ពិធីបុណ្យ និងការអបអរសាទរ
### បុណ្យចូលឆ្នាំថ្មីខ្មែរ (ចូល ឆ្នាំ ថ្មី)
ត្រូវបានអបអរសាទរក្នុងខែមេសា សម្គាល់ការបញ្ចប់នៃរដូវច្រូតកាត់ និងការចាប់ផ្តើមឆ្នាំថ្មី។

### បុណ្យអុំទូក (បុណ្យ អុំ ទូក)
ពិធីបុណ្យដ៏អស្ចារ្យដែលអបអរសាទរការបត់ទិសដៃទន្លេទន្លេសាប។

### បុណ្យភ្ជុំបិណ្ឌ
ពិធីបុណ្យសាសនាដើម្បីបូជាដល់បុព្វបុរស បង្ហាញពីសារៈសំខាន់នៃគ្រួសារ និងការគោរពចំពោះអ្នកចាស់។

## មុខម្ហូបខ្មែរ
អាហារខ្មែរល្បីល្បាញដោយសារតុល្យភាពនៃរសជាតិផ្អែម ជូរ ប្រៃ និងហឹរ៖
- **អាម៉ុក**: ការីត្រីប្រពៃណីចំហុយក្នុងស្លឹកចេក
- **លុកឡាក**: សាច់គោលាល់ជាមួយបន្លែ និងបាយ
- **នំបញ្ចុក**: មីខ្មែរជាមួយការីត្រី
- **ក្រឡាន**: បាយដំណើបចំអិនក្នុងឫស្សីជាមួយទឹកដូងកូស

## ភូមិសាស្ត្រ និងធម្មជាតិ
កម្ពុជាមានអំណោយទេសភាពចម្រុះ៖
- **ឧទ្យានបុរាណវិទ្យាអង្គរ**: កេរ្តិ៍ដំណែលពិភពលោករបស់យូណេស្កូ
- **បឹងទន្លេសាប**: បឹងទឹកសាបធំបំផុតនៅអាស៊ីអាគ្នេយ៍
- **ទន្លេមេគង្គ**: ផ្លូវទឹកសំខាន់ដែលផ្គត់ផ្គង់ដល់មនុស្សរាប់លាននាក់
- **ខ្នងក្រាំម**: ភាពចម្រុះនៃជីវចម្រុះ និងព្រៃឈើបរិសុទ្ធ
            `
          }
        ]
      }
    }
  })

  // 3. Guide for Newcomers
  const guidePage = await prisma.contentItem.upsert({
    where: { slug: 'living-in-sweden' },
    update: {},
    create: {
      slug: 'living-in-sweden',
      type: 'PAGE',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            language: 'en',
            title: 'Living in Sweden - A Guide for Newcomers',
            seoTitle: 'Living in Sweden Guide for Cambodian Newcomers | Sahakum Khmer',
            metaDescription: 'Essential information for Cambodians moving to Sweden - housing, healthcare, transport, and integration tips.',
            excerpt: 'Essential information and practical guidance for Cambodians starting their new life in Sweden.',
            content: `
# Living in Sweden - A Guide for Newcomers

Welcome to Sweden! This comprehensive guide will help you navigate your new life in Sweden, covering everything from housing to healthcare.

## Getting Started

### Personal Number (Personnummer)
Your personal number is essential for most services in Sweden. You'll need it for:
- Opening bank accounts
- Accessing healthcare
- Signing rental agreements
- Getting a job

**How to get it**: Visit the Swedish Tax Agency (Skatteverket) with your passport and residence permit.

### Bank Account
Most transactions in Sweden are cashless. Opening a bank account is crucial:
- **Required documents**: Personal number, ID, proof of address
- **Major banks**: Handelsbanken, SEB, Swedbank, Nordea
- **Tip**: Book an appointment in advance

## Housing

### Types of Housing
- **Rental apartments (hyresrätt)**: Most common, especially for newcomers
- **Cooperative apartments (bostadsrätt)**: You buy a share in the cooperative
- **Houses**: For families looking for more space

### Finding Housing
- **Boplats**: Official housing queue system
- **Private landlords**: Check Blocket, Facebook groups
- **Student housing**: If you're studying
- **Temporary housing**: While searching for permanent housing

### Housing Rights
- Rent increases are regulated by law
- Tenants have strong protection against eviction
- You can sublet with landlord's permission

## Healthcare

### Healthcare System
Sweden offers universal healthcare funded by taxes.

### Getting Healthcare
- **Health center (vårdcentral)**: For non-emergency care
- **Emergency room (akutmottagning)**: For emergencies only
- **1177**: National health information and advice line

### Cost
- Doctor visits: Around 300 SEK
- Medication: Subsidized after 2,300 SEK per year
- Free for children under 18

## Transportation

### Public Transport
- **SL (Stockholm)**: Buses, metro, trains, and ferries
- **Monthly cards**: Around 900 SEK for adults
- **Apps**: SL app for tickets and journey planning

### Biking
- Sweden is very bike-friendly
- Many cities have excellent bike lanes
- Don't forget lights and helmet!

### Driving
- You may drive with your foreign license for one year
- After that, you need a Swedish license
- Theory and practical tests required

## Work and Education

### Working in Sweden
- **Arbetsförmedlingen**: Public employment service
- **CV format**: Different from many countries
- **Work culture**: Flat hierarchy, work-life balance important
- **Language**: Swedish helpful but English often sufficient

### Learning Swedish
- **SFI (Svenska för invandrare)**: Free Swedish classes for immigrants
- **Komvux**: Municipal adult education
- **Universities**: Offer Swedish courses
- **Apps**: Duolingo, Babbel for additional practice

## Daily Life

### Shopping
- **ICA, Coop, Willys**: Major grocery chains
- **Opening hours**: Many stores close early on Sundays
- **Systembolaget**: Government monopoly for alcohol sales

### Weather and Clothing
- **Winter**: Very cold and dark, invest in warm clothes
- **Summer**: Mild and bright, enjoy the midnight sun
- **Layers**: Essential for changing weather

### Cultural Tips
- **Fika**: Coffee break culture is important
- **Allemansrätten**: Right to roam in nature
- **Punctuality**: Being on time is very important
- **Personal space**: Swedes value personal space

## Integration Support

### Government Services
- **Migrationsverket**: Migration agency
- **Försäkringskassan**: Social insurance agency
- **Skatteverket**: Tax agency

### Community Resources
- **Libraries**: Free internet, books, language exchange
- **Folkhögskolor**: Folk high schools for adult education
- **Sports clubs**: Great way to meet people and stay active

### Language Exchange
- **Språkcafé**: Informal language practice sessions
- **Conversation groups**: Many libraries and community centers host these
- **Tandem partnerships**: One-on-one language exchange

## Emergency Information

### Important Numbers
- **112**: Emergency services (police, fire, ambulance)
- **1177**: Healthcare advice
- **114 14**: Police (non-emergency)

### Useful Websites
- **krisinformation.se**: Crisis information
- **1177.se**: Healthcare information
- **migrationsverket.se**: Migration information

Remember, integration takes time. Be patient with yourself and don't hesitate to ask for help. The Swedish system is designed to support newcomers, and there are many resources available to help you succeed.
            `
          },
          {
            language: 'sv',
            title: 'Att Bo i Sverige - En Guide för Nykomlingar',
            seoTitle: 'Att Bo i Sverige Guide för Kambodjanska Nykomlingar | Sahakum Khmer',
            metaDescription: 'Viktig information för kambodjanare som flyttar till Sverige - boende, sjukvård, transport och integrationstips.',
            excerpt: 'Viktig information och praktisk vägledning för kambodjanare som börjar sitt nya liv i Sverige.',
            content: `
# Att Bo i Sverige - En Guide för Nykomlingar

Välkommen till Sverige! Den här omfattande guiden hjälper dig att navigera ditt nya liv i Sverige och täcker allt från boende till sjukvård.

## Att Komma Igång

### Personnummer
Ditt personnummer är viktigt för de flesta tjänster i Sverige. Du behöver det för att:
- Öppna bankkonton
- Få tillgång till sjukvård
- Skriva hyreskontrakt
- Få ett jobb

**Hur du får det**: Besök Skatteverket med ditt pass och uppehållstillstånd.

### Bankkonto
De flesta transaktioner i Sverige är kontantlösa. Att öppna ett bankkonto är avgörande:
- **Nödvändiga dokument**: Personnummer, ID, adressbevis
- **Stora banker**: Handelsbanken, SEB, Swedbank, Nordea
- **Tips**: Boka tid i förväg

## Boende

### Typer av Boenden
- **Hyresrätter**: Vanligast, särskilt för nykomlingar
- **Bostadsrätter**: Du köper en andel i bostadsrättsföreningen
- **Hus**: För familjer som söker mer utrymme

### Att Hitta Boende
- **Boplats**: Officiellt bostadskösystem
- **Privata hyresvärdar**: Kolla Blocket, Facebook-grupper
- **Studentboende**: Om du studerar
- **Tillfälligt boende**: Medan du söker permanent boende

### Bostadsrätter
- Hyreshöjningar regleras av lag
- Hyresgäster har stark skydd mot vräkning
- Du kan hyra ut i andra hand med hyresvärdens tillstånd

## Sjukvård

### Sjukvårdssystemet
Sverige erbjuder allmän sjukvård finansierad av skatter.

### Få Sjukvård
- **Vårdcentral**: För icke-akut vård
- **Akutmottagning**: Endast för akuta fall
- **1177**: Nationell hälsoinformation och rådgivningslinje

### Kostnad
- Läkarbesök: Omkring 300 SEK
- Medicin: Subventionerad efter 2 300 SEK per år
- Gratis för barn under 18 år

## Transport

### Kollektivtrafik
- **SL (Stockholm)**: Bussar, tunnelbana, tåg och färjor
- **Månadskort**: Omkring 900 SEK för vuxna
- **Appar**: SL-appen för biljetter och reseplanering

### Cykling
- Sverige är mycket cykelvänligt
- Många städer har utmärkta cykelbanor
- Glöm inte ljus och hjälm!

### Bilkörning
- Du får köra med ditt utländska körkort i ett år
- Därefter behöver du svenskt körkort
- Teori- och praktiska prov krävs

## Arbete och Utbildning

### Att Arbeta i Sverige
- **Arbetsförmedlingen**: Offentlig arbetsförmedling
- **CV-format**: Skiljer sig från många länder
- **Arbetskultur**: Platt hierarki, balans mellan arbete och privatliv viktig
- **Språk**: Svenska hjälpsamt men engelska ofta tillräckligt

### Lära sig Svenska
- **SFI (Svenska för invandrare)**: Gratis svensklektioner för invandrare
- **Komvux**: Kommunal vuxenutbildning
- **Universitet**: Erbjuder svenska kurser
- **Appar**: Duolingo, Babbel för extra övning

## Dagligt Liv

### Shopping
- **ICA, Coop, Willys**: Stora livsmedelskedjor
- **Öppettider**: Många butiker stänger tidigt på söndagar
- **Systembolaget**: Statlig monopol för alkoholförsäljning

### Väder och Kläder
- **Vinter**: Mycket kallt och mörkt, investera i varma kläder
- **Sommar**: Milt och ljust, njut av midnattssolen
- **Lager**: Viktigt för växlande väder

### Kulturella Tips
- **Fika**: Kafferast-kulturen är viktig
- **Allemansrätten**: Rätten att vistas i naturen
- **Punktlighet**: Att vara i tid är mycket viktigt
- **Personligt utrymme**: Svenskar värdesätter personligt utrymme

## Integrationsstöd

### Statliga Tjänster
- **Migrationsverket**: Migrationsmyndigheten
- **Försäkringskassan**: Sociala försäkringsmyndigheten
- **Skatteverket**: Skattemyndigheten

### Gemenskapsresurser
- **Bibliotek**: Gratis internet, böcker, språkutbyte
- **Folkhögskolor**: För vuxenutbildning
- **Idrottsklubbar**: Bra sätt att träffa människor och hålla sig aktiv

### Språkutbyte
- **Språkcafé**: Informella språkövningssessioner
- **Samtalsgrupper**: Många bibliotek och community centers arrangerar dessa
- **Tandem-partnerskap**: Ett-mot-ett språkutbyte

## Nödinformation

### Viktiga Nummer
- **112**: Nödtjänster (polis, brandkår, ambulans)
- **1177**: Sjukvårdsrådgivning
- **114 14**: Polis (icke-akut)

### Användbara Webbsidor
- **krisinformation.se**: Krisinformation
- **1177.se**: Sjukvårdsinformation
- **migrationsverket.se**: Migrationsinformation

Kom ihåg att integration tar tid. Ha tålamod med dig själv och tveka inte att be om hjälp. Det svenska systemet är utformat för att stödja nykomlingar, och det finns många resurser tillgängliga för att hjälpa dig lyckas.
            `
          },
          {
            language: 'km',
            title: 'ការរស់នៅក្នុងប្រទេសស៊ុយអែត - មគ្គុទ្ទេសក៍សម្រាប់អ្នកមកថ្មី',
            seoTitle: 'មគ្គុទ្ទេសក៍ការរស់នៅស៊ុយអែតសម្រាប់ខ្មែរថ្មី | សហគម ខ្មែរ',
            metaDescription: 'ព័ត៌មានសំខាន់សម្រាប់ខ្មែរដែលផ្លាស់ទីទៅស៊ុយអែត - លំនៅដ្ឋាន សុខាភិបាល ដឹកជញ្ជូន និងគន្លឹះរួមបញ្ចូល។',
            excerpt: 'ព័ត៌មានសំខាន់ និងការណែនាំជាក់ស្តែងសម្រាប់ខ្មែរដែលចាប់ផ្តើមជីវិតថ្មីនៅស៊ុយអែត។',
            content: `
# ការរស់នៅក្នុងប្រទេសស៊ុយអែត - មគ្គុទ្ទេសក៍សម្រាប់អ្នកមកថ្មី

សូមស្វាគមន៍មកកាន់ស៊ុយអែត! មគ្គុទ្ទេសក៍ដ៏ទូលំទូលាយនេះនឹងជួយអ្នកក្នុងការដំណើរជីវិតថ្មីនៅស៊ុយអែត ដែលគ្របដណ្តប់ពីលំនៅដ្ឋានរហូតដល់សុខាភិបាល។

## ការចាប់ផ្តើម

### លេខសំគាល់បុគ្គល (Personnummer)
លេខសំគាល់បុគ្គលរបស់អ្នកមានសារៈសំខាន់សម្រាប់សេវាកម្មភាគច្រើននៅស៊ុយអែត។ អ្នកត្រូវការវាសម្រាប់៖
- បើកគណនីធនាគារ
- ទទួលបានសេវាសុខាភិបាល
- ចុះហត្ថលេខាលើកិច្ចព្រមព្រៀងជួល
- រកការងារ

**របៀបទទួលបាន**: ទៅមន្រ្តីពន្ធដារស៊ុយអែត (Skatteverket) ជាមួយលិខិតឆ្លងដែន និងលិខិតអនុញ្ញាតស្នាក់នៅ។

### គណនីធនាគារ
ប្រតិបត្តិការភាគច្រើននៅស៊ុយអែតមិនប្រើប្រាក់សាច់។ ការបើកគណនីធនាគារមានសារៈសំខាន់៖
- **ឯកសារចាំបាច់**: លេខសំគាល់បុគ្គល អត្តសញ្ញាណបត្រ ភស្តុតាងអាសយដ្ឋាន
- **ធនាគារធំៗ**: Handelsbanken, SEB, Swedbank, Nordea
- **ជំនួយ**: កក់ពេលជួបជាមុន

## លំនៅដ្ឋាន

### ប្រភេទលំនៅដ្ឋាន
- **ផ្ទះជួល (hyresrätt)**: ធម្មតាបំផុត ជាពិសេសសម្រាប់អ្នកមកថ្មី
- **ផ្ទះសហករ (bostadsrätt)**: អ្នកទិញភាគហ៊ុនក្នុងសហករ
- **ផ្ទះ**: សម្រាប់គ្រួសារដែលចង់បានកន្លែងធំជាង

### ការរកលំនៅដ្ឋាន
- **Boplats**: ប្រព័ន្ធជួរការរកលំនៅដ្ឋានផ្លូវការ
- **ម្ចាស់ផ្ទះឯកជន**: ពិនិត្យ Blocket ក្រុម Facebook
- **លំនៅដ្ឋានសិស្ស**: ប្រសិនបើអ្នកកំពុងសិក្សា
- **លំនៅដ្ឋានបណ្តោះអាសន្ន**: ខណៈពេលកំពុងរកលំនៅដ្ឋានអចិន្ត្រៃយ៍

### សិទ្ធិលំនៅដ្ឋាន
- ការកើនឡើងថ្លៃជួលត្រូវបានគ្រប់គ្រងដោយច្បាប់
- អ្នកជួលមានការការពារដ៏រឹងមាំប្រឆាំងនឹងការបណ្តេញចេញ
- អ្នកអាចជួលបន្តជាមួយការអនុញ្ញាតពីម្ចាស់ផ្ទះ

## សុខាភិបាល

### ប្រព័ន្ធសុខាភិបាល
ស៊ុយអែតផ្តល់សុខាភិបាលសកលដែលផ្តល់មូលនិធិដោយពន្ធ។

### ទទួលបានសុខាភិបាល
- **មណ្ឌលសុខភាព (vårdcentral)**: សម្រាប់ការថែទាំមិនបន្ទាន់
- **បន្ទប់បន្ទាន់ (akutmottagning)**: សម្រាប់ករណីបន្ទាន់តែប៉ុណ្ណោះ
- **1177**: បណ្តាញព័ត៌មានសុខភាព និងការប្រឹក្សាយោបល់ជាតិ

### ថ្លៃដើម
- ការពិនិត្យវេជ្ជបណ្ឌិត: ប្រហែល 300 SEK
- ថ្នាំ: ផ្តល់បំណាច់បន្ទាប់ពី 2,300 SEK ក្នុងមួយឆ្នាំ
- ឥតគិតថ្លៃសម្រាប់កុមារក្រោម 18 ឆ្នាំ

## ការដឹកជញ្ជូន

### ការដឹកជញ្ជូនសាធារណៈ
- **SL (Stockholm)**: រថយន្ត រថភ្លើងក្រោមដី រថភ្លើង និងកប៉ាល់
- **កាតប្រចាំខែ**: ប្រហែល 900 SEK សម្រាប់មនុស្សពេញវ័យ
- **កម្មវិធី**: កម្មវិធី SL សម្រាប់សំបុត្រ និងការរៀបចំការធ្វើដំណើរ

### ការជិះកង់
- ស៊ុយអែតមានលក្ខណៈងាយស្រួលសម្រាប់កង់
- ទីក្រុងជាច្រើនមានផ្លូវកង់ឆ្នើម
- កុំបំភ្លេចអំពូល និងមួកការពារ!

### ការបើកបរ
- អ្នកអាចបើកបរជាមួយប័ណ្ណបើកបរបរទេសរបស់អ្នកមួយឆ្នាំ
- បន្ទាប់មក អ្នកត្រូវការប័ណ្ណបើកបរស៊ុយអែត
- ត្រូវការការសាកល្បងទ្រឹស្តី និងជាក់ស្តែង

## ការងារ និងការអប់រំ

### ការងារនៅស៊ុយអែត
- **Arbetsförmedlingen**: សេវាការងារសាធារណៈ
- **ទ្រង់ទ្រាយ CV**: ខុសពីប្រទេសជាច្រើន
- **វប្បធម៌ការងារ**: យុទ្ធសាស្ត្រស្ទាបស្ទើរ តុល្យភាពការងារ-ជីវិតមានសារៈសំខាន់
- **ភាសា**: ភាសាស៊ុយអែតមានប្រយោជន៍ ប៉ុន្តែភាសាអង់គ្លេសច្រើនតែគ្រប់គ្រាន់

### ការរៀនភាសាស៊ុយអែត
- **SFI (Svenska för invandrare)**: មេរៀនភាសាស៊ុយអែតឥតគិតថ្លៃសម្រាប់អ្នកអន្តោប្រវេសន៍
- **Komvux**: ការអប់រំមនុស្សពេញវ័យក្រុង
- **សាកលវិទ្យាល័យ**: ផ្តល់វគ្គភាសាស៊ុយអែត
- **កម្មវិធី**: Duolingo, Babbel សម្រាប់ការអនុវត្តបន្ថែម

## ជីវិតប្រចាំថ្ងៃ

### ការទិញទំនិញ
- **ICA, Coop, Willys**: ខ្សែក្រុមហ៊ុនអាហារធំៗ
- **ពេលវេលាបើក**: ហាងជាច្រើនបិទមុនមេរៀលថ្ងៃអាទិត្យ
- **Systembolaget**: ឯកជនរដ្ឋសម្រាប់ការលក់គ្រឿងស្រវឹង

### អាកាសធាតុ និងសម្លៀកបំពាក់
- **រដូវរងារ**: ត្រជាក់ និងងងឹតខ្លាំង វិនិយោគលើសម្លៀកបំពាក់កក់ក្តៅ
- **រដូវក្តៅ**: មិនសូវកក់ក្តៅ និងភ្លឺ រីករាយជាមួយព្រះអាទិត្យពាក់កណ្តាលអធ្រាត្រ
- **ស្រទាប់**: សំខាន់សម្រាប់អាកាសធាតុផ្លាស់ប្តូរ

### គន្លឹះវប្បធម៌
- **Fika**: វប្បធម៌ការសម្រាកកាហ្វេមានសារៈសំខាន់
- **Allemansrätten**: សិទ្ធិដើរក្នុងធម្មជាតិ
- **ការទៀងត្រង់**: ការមកឱ្យកាលយ៉ាងសំខាន់
- **កន្លែងបុគ្គល**: ស៊ុយអែតកោរពកន្លែងបុគ្គល

## ការគាំទ្រការរួមបញ្ចូល

### សេវាកម្មរដ្ឋាភិបាល
- **Migrationsverket**: ភ្នាក់ងារអន្តោប្រវេសន៍
- **Försäkringskassan**: ភ្នាក់ងារធានារ៉ាប់រងសង្គម
- **Skatteverket**: ភ្នាក់ងារពន្ធដារ

### ធនធានសហគមន៍
- **បណ្ណាល័យ**: អ៊ីនធឺណិតឥតគិតថ្លៃ សៀវភៅ ការប្តូរភាសា
- **Folkhögskolor**: សាលាប្រជាជនសម្រាប់ការអប់រំមនុស្សពេញវ័យ
- **ក្លឹបកីឡា**: វិធីល្អក្នុងការជួបមនុស្ស និងរក្សាសុខភាព

### ការប្តូរភាសា
- **Språkcafé**: សម័យកិច្ចអនុវត្តភាសាក្រៅបទប្បញ្ញត្តិ
- **ក្រុមសន្ទនា**: បណ្ណាល័យ និងមណ្ឌលសហគមន៍ជាច្រើនរៀបចំ
- **ភាពជាដៃគូ Tandem**: ការប្តូរភាសាមនុស្សម្នាក់ទល់នឹងម្នាក់

## ព័ត៌មានបន្ទាន់

### លេខសំខាន់ៗ
- **112**: សេវាបន្ទាន់ (ប៉ូលីស ពន្លត់អគ្គិភ័យ ការសង្គ្រោះ)
- **1177**: ការប្រឹក្សាសុខាភិបាល
- **114 14**: ប៉ូលីស (មិនបន្ទាន់)

### វេបសាយមានប្រយោជន៍
- **krisinformation.se**: ព័ត៌មានវិបត្តិ
- **1177.se**: ព័ត៌មានសុខាភិបាល
- **migrationsverket.se**: ព័ត៌មានអន្តោប្រវេសន៍

ចូរចងចាំថា ការរួមបញ្ចូលត្រូវការពេលវេលា។ សូមអត់ធ្មត់ជាមួយខ្លួនអ្នក និងកុំស្ទាក់ស្ទើរក្នុងការសុំជំនួយ។ ប្រព័ន្ធស៊ុយអែតត្រូវបានរចនាឡើងដើម្បីគាំទ្រអ្នកមកថ្មី ហើយមានធនធានជាច្រើនដែលអាចប្រើបានដើម្បីជួយអ្នកឱ្យទទួលបានជោគជ័យ។
            `
          }
        ]
      }
    }
  })

  // 4. Support Resources
  const supportPage = await prisma.contentItem.upsert({
    where: { slug: 'support-resources' },
    update: {},
    create: {
      slug: 'support-resources',
      type: 'PAGE',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            language: 'en',
            title: 'Support Resources',
            seoTitle: 'Support Resources for Cambodians in Sweden | Sahakum Khmer',
            metaDescription: 'Legal aid, language courses, community services and support resources for the Cambodian community in Sweden.',
            excerpt: 'Comprehensive list of support resources available to the Cambodian community in Sweden.',
            content: `
# Support Resources

Finding the right support when you need it is crucial for successful integration. Here's a comprehensive guide to resources available to the Cambodian community in Sweden.

## Legal Aid and Rights

### Legal Assistance
- **Rättshjälp**: State-funded legal aid for those who qualify
- **Juridiska fakulteten**: Law schools often provide free legal clinics
- **Advokater för mänskliga rättigheter**: Lawyers for human rights
- **Contact**: Call local municipality for referrals

### Know Your Rights
- **Diskrimineringsombudsmannen (DO)**: Anti-discrimination ombudsman
- **Hyresgästföreningen**: Tenant's rights organization
- **Konsumentverket**: Consumer protection agency
- **Website**: forsakringskassan.se for social benefits information

## Language Learning

### Swedish Language Courses
- **SFI (Svenska för invandrare)**: Free Swedish for immigrants
  - Available at local schools and community centers
  - Different levels from beginner to advanced
  - Often includes cultural orientation

### Komvux (Municipal Adult Education)
- **Academic Swedish**: For higher education preparation
- **Vocational Swedish**: Job-specific language training
- **Evening classes**: For working adults
- **Distance learning**: Online options available

### Private Language Schools
- **Folkuniversitetet**: Popular adult education association
- **Medborgarskolan**: Adult education organization
- **Language cafés**: Informal conversation practice
- **University courses**: Swedish language courses for academic purposes

## Employment Support

### Arbetsförmedlingen (Employment Service)
- **Job search assistance**: CV help, interview preparation
- **Validation of foreign credentials**: Getting your qualifications recognized
- **Work training programs**: On-the-job training opportunities
- **Language support**: Work-related Swedish courses

### Professional Development
- **YrkesAkademin**: Vocational training academy
- **Validation councils**: Professional credential recognition
- **Networking events**: Industry-specific meetups
- **Mentorship programs**: Professional guidance from experienced workers

## Healthcare Support

### Mental Health Resources
- **1177 Vårdguiden**: Health information and advice
- **Kuratorer**: Social counselors in healthcare
- **Psykiatri**: Psychiatric services through healthcare centers
- **Crisis support**: 24/7 helplines for emergency situations

### Cultural-Sensitive Healthcare
- **Interpreters**: Free interpretation services in healthcare
- **Cultural mediators**: Understanding healthcare systems
- **Women's health**: Specialized services for women
- **Traditional medicine**: Information about complementary treatments

## Family and Children Support

### Parental Support
- **Föräldrastöd**: Municipality parental support programs
- **Family counseling**: Professional family therapy services
- **Parenting classes**: Cultural adaptation for child-rearing
- **Open preschools**: Free activities for children and parents

### Children's Services
- **School support**: Extra help for children learning Swedish
- **After-school programs**: Academic and social support
- **Youth centers**: Activities and guidance for teenagers
- **Cultural programs**: Maintaining Cambodian identity for children

## Financial Assistance

### Social Benefits
- **Försäkringskassan**: Social insurance agency
  - Child allowance (barnbidrag)
  - Housing allowance (bostadsbidrag)
  - Parental leave benefits
  - Sickness benefits

### Emergency Financial Help
- **Socialtjänst**: Municipal social services
- **Crisis funds**: Emergency financial assistance
- **Food banks**: Free food distribution centers
- **Charity organizations**: Religious and secular support groups

## Housing Assistance

### Finding Housing
- **Boplats**: Official housing queue system
- **Housing advisors**: Municipal housing guidance
- **Tenant associations**: Support with rental issues
- **Emergency housing**: Temporary accommodation services

### Housing Rights
- **Rent tribunals**: Dispute resolution for tenants
- **Housing allowance**: Financial support for rent
- **Renovation grants**: Support for home improvements
- **Energy efficiency**: Programs to reduce utility costs

## Community Organizations

### Cambodian Organizations
- **Sahakum Khmer**: Our organization - cultural preservation and support
- **Local Cambodian associations**: City-specific community groups
- **Buddhist temples**: Spiritual and community support
- **Cultural centers**: Events and cultural activities

### Multicultural Organizations
- **Red Cross**: International humanitarian support
- **Caritas**: Catholic charity organization
- **Islamic organizations**: Support for Muslim community members
- **Interfaith councils**: Multi-religious cooperation groups

## Education Support

### Adult Education
- **Grundvux**: Basic adult education equivalent to elementary/middle school
- **Gymnasievux**: Upper secondary education for adults
- **Higher education**: University preparation and support
- **Study financing**: CSN student aid and loans

### Professional Training
- **Vocational programs**: Job-specific training courses
- **Apprenticeships**: Learn while working programs
- **Certification courses**: Professional skill development
- **Recognition of prior learning**: Credit for experience and foreign education

## Technology and Digital Support

### Digital Inclusion
- **Computer courses**: Basic computer skills training
- **Internet access**: Free wifi locations and digital support
- **BankID**: Help setting up digital identification
- **E-government services**: Using online government services

### Language Learning Apps
- **Duolingo**: Free language learning app
- **Babbel**: Comprehensive language courses
- **SVT Play**: Swedish TV with subtitles for language learning
- **SR Play**: Swedish radio for listening practice

## Emergency Contacts

### National Emergency Services
- **112**: Police, fire, ambulance (emergency)
- **114 14**: Police (non-emergency)
- **1177**: Healthcare advice and information
- **020-22 00 60**: Crisis support helpline

### Local Contacts
- **Municipality office**: Local government services
- **Library**: Information and internet access
- **Tourist information**: General guidance and maps
- **Sahakum Khmer office**: Our organization's direct support

## How to Access These Resources

1. **Start with your municipality**: Most services are organized locally
2. **Bring identification**: Personal number and ID required for most services
3. **Ask for interpretation**: Free interpretation available for most services
4. **Be patient**: Some services may have waiting lists
5. **Keep documents**: Save all important paperwork and correspondence

Remember, asking for help is not a sign of weakness - it's a smart way to navigate your new life in Sweden. These resources exist to support you and your family's success and integration.

For immediate assistance or questions about any of these resources, contact Sahakum Khmer at contact.sahakumkhmer.se@gmail.com or visit our office during regular hours.
            `
          },
          {
            language: 'sv',
            title: 'Stödresurser',
            seoTitle: 'Stödresurser för Kambodjanare i Sverige | Sahakum Khmer',
            metaDescription: 'Juridisk hjälp, språkkurser, gemenskapstjänster och stödresurser för den kambodjanska gemenskapen i Sverige.',
            excerpt: 'Omfattande lista över stödresurser tillgängliga för den kambodjanska gemenskapen i Sverige.',
            content: `
# Stödresurser

Att hitta rätt stöd när du behöver det är avgörande för framgångsrik integration. Här är en omfattande guide till resurser tillgängliga för den kambodjanska gemenskapen i Sverige.

## Juridisk Hjälp och Rättigheter

### Juridisk Assistans
- **Rättshjälp**: Statligt finansierad juridisk hjälp för de som kvalificerar sig
- **Juridiska fakulteten**: Juristutbildningar erbjuder ofta gratis juridiska kliniker
- **Advokater för mänskliga rättigheter**: Advokater för mänskliga rättigheter
- **Kontakt**: Ring din lokala kommun för hänvisningar

### Känn Dina Rättigheter
- **Diskrimineringsombudsmannen (DO)**: Antidiskrimineringsombudsman
- **Hyresgästföreningen**: Hyresgästers rättighetsorganisation
- **Konsumentverket**: Konsumentskyddsmyndighet
- **Webbsida**: forsakringskassan.se för information om sociala förmåner

## Språkinlärning

### Svenska Språkkurser
- **SFI (Svenska för invandrare)**: Gratis svenska för invandrare
  - Tillgängligt på lokala skolor och föreningshus
  - Olika nivåer från nybörjare till avancerad
  - Inkluderar ofta kulturell orientering

### Komvux (Kommunal Vuxenutbildning)
- **Akademisk svenska**: För förberedelse till högre utbildning
- **Yrkessvenska**: Arbetsspecifik språkutbildning
- **Kvällsklasser**: För arbetande vuxna
- **Distansutbildning**: Online-alternativ tillgängliga

### Privata Språkskolor
- **Folkuniversitetet**: Populär vuxenutbildningsorganisation
- **Medborgarskolan**: Vuxenutbildningsorganisation
- **Språkcaféer**: Informell konversationsträning
- **Universitetskurser**: Svenskkurser för akademiska ändamål

## Anställningsstöd

### Arbetsförmedlingen
- **Jobbsökningshjälp**: CV-hjälp, intervjuförberedelse
- **Validering av utländska meriter**: Få dina kvalifikationer erkända
- **Arbetspraktik**: Praktikplatser för yrkeserfarenhet
- **Språkstöd**: Arbetsrelaterade svenskkurser

### Professionell Utveckling
- **YrkesAkademin**: Yrkesutbildningsakademi
- **Valideringsråd**: Erkännande av yrkeskompetens
- **Nätverksevenemang**: Branschspecifika träffar
- **Mentorprogram**: Professionell vägledning från erfarna arbetare

## Sjukvårdsstöd

### Mentalvårdsresurser
- **1177 Vårdguiden**: Hälsoinformation och rådgivning
- **Kuratorer**: Socialrådgivare inom sjukvård
- **Psykiatri**: Psykiatriska tjänster genom vårdcentraler
- **Krisstöd**: 24/7 hjälplinjer för nödsituationer

### Kulturellt Anpassad Sjukvård
- **Tolkar**: Gratis tolktjänster inom sjukvård
- **Kulturella medlare**: Förståelse för sjukvårdssystem
- **Kvinnohälsa**: Specialiserade tjänster för kvinnor
- **Traditionell medicin**: Information om komplementära behandlingar

## Familje- och Barnstöd

### Föräldrastöd
- **Föräldrastöd**: Kommunala föräldrastödsprogram
- **Familjerådgivning**: Professionell familjeterapi
- **Föräldrakurser**: Kulturell anpassning för barnuppfostran
- **Öppna förskolor**: Gratis aktiviteter för barn och föräldrar

### Barntjänster
- **Skolstöd**: Extra hjälp för barn som lär sig svenska
- **Fritidsprogram**: Akademiskt och socialt stöd
- **Ungdomsgårdar**: Aktiviteter och vägledning för tonåringar
- **Kulturprogram**: Bevara kambodjansk identitet för barn

## Ekonomiskt Stöd

### Sociala Förmåner
- **Försäkringskassan**: Socialförsäkringsmyndighet
  - Barnbidrag
  - Bostadsbidrag
  - Föräldrapenning
  - Sjukpenning

### Akut Ekonomisk Hjälp
- **Socialtjänst**: Kommunala socialtjänster
- **Krisfonder**: Akut ekonomisk hjälp
- **Matbanker**: Gratis matdistribution
- **Välgörenhetsorganisationer**: Religiösa och sekulära stödgrupper

## Bostadsstöd

### Hitta Boende
- **Boplats**: Officiellt bostadskösystem
- **Bostadsrådgivare**: Kommunal boendeguidning
- **Hyresgästföreningar**: Stöd med hyresfrågor
- **Akutboende**: Tillfälliga boendealternativ

### Bostadsrättigheter
- **Hyresnämnder**: Tvistlösning för hyresgäster
- **Bostadsbidrag**: Ekonomiskt stöd för hyra
- **Renoveringsbidrag**: Stöd för hemförbättringar
- **Energieffektivitet**: Program för att minska elkostnader

## Gemenskapsorganisationer

### Kambodjanska Organisationer
- **Sahakum Khmer**: Vår organisation - kulturell bevarande och stöd
- **Lokala kambodjanska föreningar**: Stadsspecifika gemenskapsgrupper
- **Buddhistiska tempel**: Andligt och gemenskapsstöd
- **Kulturcentra**: Evenemang och kulturella aktiviteter

### Mångkulturella Organisationer
- **Röda Korset**: Internationellt humanitärt stöd
- **Caritas**: Katolsk välgörenhetsorganisation
- **Islamiska organisationer**: Stöd för muslimska gemenskapsmedlemmar
- **Interfaith-råd**: Multi-religiösa samarbetsgrupper

## Utbildningsstöd

### Vuxenutbildning
- **Grundvux**: Grundläggande vuxenutbildning motsvarande grundskola
- **Gymnasievux**: Gymnasial vuxenutbildning
- **Högre utbildning**: Universitetsförberedelse och stöd
- **Studiefinansiering**: CSN studiebidrag och lån

### Yrkesutbildning
- **Yrkesprogram**: Jobbspecifika utbildningskurser
- **Lärlingsplatser**: Lär-medan-du-arbetar-program
- **Certifieringskurser**: Utveckling av yrkeskompetens
- **Realkompetens**: Tillgodoräkning för erfarenhet och utländsk utbildning

## Teknik och Digital Support

### Digital Inkludering
- **Datorkurser**: Grundläggande datorkunskapsträning
- **Internetåtkomst**: Gratis wifi-platser och digitalt stöd
- **BankID**: Hjälp med att sätta upp digital identifiering
- **E-förvaltning**: Använda online-myndighetsservice

### Språkinlärningsappar
- **Duolingo**: Gratis språkinlärningsapp
- **Babbel**: Omfattande språkkurser
- **SVT Play**: Svensk TV med undertexter för språkinlärning
- **SR Play**: Svensk radio för lyssningsträning

## Nödkontakter

### Nationella Räddningstjänster
- **112**: Polis, brandkår, ambulans (nödsituation)
- **114 14**: Polis (icke-nödsituation)
- **1177**: Sjukvårdsrådgivning och information
- **020-22 00 60**: Krisstöd hjälplinje

### Lokala Kontakter
- **Kommunkontor**: Lokala myndighetstjänster
- **Bibliotek**: Information och internetåtkomst
- **Turistinformation**: Allmän vägledning och kartor
- **Sahakum Khmer kontor**: Vår organisations direkta stöd

## Hur man Kommer Åt Dessa Resurser

1. **Börja med din kommun**: De flesta tjänster organiseras lokalt
2. **Ta med legitimation**: Personnummer och ID krävs för de flesta tjänster
3. **Be om tolkning**: Gratis tolkning tillgänglig för de flesta tjänster
4. **Ha tålamod**: Vissa tjänster kan ha väntelistor
5. **Behåll dokument**: Spara all viktig dokumentation och korrespondens

Kom ihåg att be om hjälp är inte ett tecken på svaghet - det är ett smart sätt att navigera ditt nya liv i Sverige. Dessa resurser finns för att stödja dig och din familjs framgång och integration.

För omedelbar hjälp eller frågor om någon av dessa resurser, kontakta Sahakum Khmer på contact.sahakumkhmer.se@gmail.com eller besök vårt kontor under ordinarie öppettider.
            `
          },
          {
            language: 'km',
            title: 'ធនធានគាំទ្រ',
            seoTitle: 'ធនធានគាំទ្រសម្រាប់ខ្មែរនៅស៊ុយអែត | សហគម ខ្មែរ',
            metaDescription: 'ជំនួយផ្នែកច្បាប់ វគ្គភាសា សេវាកម្មសហគមន៍ និងធនធានគាំទ្រសម្រាប់សហគមន៍ខ្មែរនៅស៊ុយអែត។',
            excerpt: 'បញ្ជីទូលំទូលាយនៃធនធានគាំទ្រដែលមានសម្រាប់សហគមន៍ខ្មែរនៅស៊ុយអែត។',
            content: `
# ធនធានគាំទ្រ

ការរកឃើញការគាំទ្រត្រឹមត្រូវនៅពេលដែលអ្នកត្រូវការ គឺមានសារៈសំខាន់សម្រាប់ការរួមបញ្ចូលដោយជោគជ័យ។ នេះគឺជាមគ្គុទ្ទេសក៍ទូលំទូលាយចំពោះធនធានដែលមានសម្រាប់សហគមន៍ខ្មែរនៅស៊ុយអែត។

## ជំនួយផ្នែកច្បាប់ និងសិទ្ធិ

### ជំនួយផ្នែកច្បាប់
- **Rättshjälp**: ជំនួយផ្នែកច្បាប់ដែលផ្តល់មូលនិធិដោយរដ្ឋសម្រាប់អ្នកដែលមានលក្ខណៈសម្បត្តិគ្រប់គ្រាន់
- **Juridiska fakulteten**: សាលាច្បាប់ច្រើនតែផ្តល់គ្លីនីកច្បាប់ឥតគិតថ្លៃ
- **Advokater för mänskliga rättigheter**: មេធាវីសម្រាប់សិទ្ធិមនុស្ស
- **ទំនាក់ទំនង**: ទូរសព្ទទៅក្រុងតូចមូលដ្ឋានសម្រាប់ការបញ្ជូនបន្ត

### ស្គាល់សិទ្ធិរបស់អ្នក
- **Diskrimineringsombudsmannen (DO)**: អ្នកតស៊ូមតិប្រឆាំងការរើសអើង
- **Hyresgästföreningen**: អង្គការសិទ្ធិអ្នកជួល
- **Konsumentverket**: ភ្នាក់ងារការពារអ្នកប្រើប្រាស់
- **វេបសាយ**: forsakringskassan.se សម្រាប់ព័ត៌មានអំពីផលប្រយោជន៍សង្គម

## ការរៀនភាសា

### វគ្គរៀនភាសាស៊ុយអែត
- **SFI (Svenska för invandrare)**: ភាសាស៊ុយអែតឥតគិតថ្លៃសម្រាប់អ្នកអន្តោប្រវេសន៍
  - មានផ្តល់នៅសាលារៀន និងមណ្ឌលសហគមន៍មូលដ្ឋាន
  - កម្រិតផ្សេងៗពីអ្នកចាប់ផ្តើមរហូតដល់កម្រិតខ្ពស់
  - ច្រើនតែរួមបញ្ចូលការតំរង់ទិសវប្បធម៌

### Komvux (ការអប់រំមនុស្សពេញវ័យក្រុង)
- **ភាសាស៊ុយអែតសាកលវិទ្យាល័យ**: សម្រាប់ការរៀបចំការអប់រំកម្រិតខ្ពស់
- **ភាសាស៊ុយអែតវិជ្ជាជីវៈ**: ការបណ្តុះបណ្តាលភាសាជាក់លាក់តាមការងារ
- **ថ្នាក់រាត្រី**: សម្រាប់មនុស្សពេញវ័យដែលកំពុងធ្វើការ
- **ការរៀនពីចម្ងាយ**: ជម្រើសអនឡាញមាន

### សាលាភាសាឯកជន
- **Folkuniversitetet**: សមាគមការអប់រំមនុស្សពេញវ័យដែលមានប្រជាប្រិយភាព
- **Medborgarskolan**: អង្គការការអប់រំមនុស្សពេញវ័យ
- **កាហ្វេភាសា**: ការអនុវត្តសន្ទនាក្រៅបទប្បញ្ញត្តិ
- **វគ្គសាកលវិទ្យាល័យ**: វគ្គភាសាស៊ុយអែតសម្រាប់គោលបំណងសាកលវិទ្យាល័យ

## ការគាំទ្រការងារ

### Arbetsförmedlingen (សេវាការងារ)
- **ជំនួយការស្វែងរកការងារ**: ជំនួយ CV ការរៀបចំការសាកសួរ
- **ការបញ្ជាក់ឯកសារបរទេស**: ទទួលបានការទទួលស្គាល់លក្ខណៈសម្បត្តិរបស់អ្នក
- **កម្មវិធីបណ្តុះបណ្តាលការងារ**: ឱកាសបណ្តុះបណ្តាលក្នុងការងារ
- **ការគាំទ្រភាសា**: វគ្គភាសាស៊ុយអែតពាក់ព័ន្ធនឹងការងារ

### ការអភិវឌ្ឍវិជ្ជាជីវៈ
- **YrkesAkademin**: បណ្ឌិត្យសភាបណ្តុះបណ្តាលវិជ្ជាជីវៈ
- **ក្រុមប្រឹក្សាបញ្ជាក់**: ការទទួលស្គាល់ឯកសារវិជ្ជាជីវៈ
- **ព្រឹត្តិការណ៍បណ្តាញ**: ការជួបជុំជាក់លាក់តាមឧស្សាហកម្ម
- **កម្មវិធីណែនាំ**: ការណែនាំវិជ្ជាជីវៈពីកម្មករមានបទពិសោធន៍

## ការគាំទ្រសុខាភិបាល

### ធនធានសុខភាពចិត្ត
- **1177 Vårdguiden**: ព័ត៌មានសុខភាព និងការប្រឹក្សា
- **Kuratorer**: ទីប្រឹក្សាសង្គមក្នុងសុខាភិបាល
- **Psykiatri**: សេវាកម្មវិកលចរិកតាមរយៈមណ្ឌលសុខភាព
- **ការគាំទ្រវិបត្តិ**: បណ្តាញជំនួយ 24/7 សម្រាប់ស្ថានការណ៍បន្ទាន់

### សុខាភិបាលដែលមានភាពឆ្លាតវៃផ្នែកវប្បធម៌
- **បកប្រែ**: សេវាកម្មបកប្រែឥតគិតថ្លៃក្នុងសុខាភិបាល
- **អ្នកសម្របសម្រួលវប្បធម៌**: ការយល់ដឹងអំពីប្រព័ន្ធសុខាភិបាល
- **សុខភាពស្ត្រី**: សេវាកម្មជំនាញសម្រាប់ស្ត្រី
- **ថ្នាំប្រពៃណី**: ព័ត៌មានអំពីការព្យាបាលបំពេញ

## ការគាំទ្រគ្រួសារ និងកុមារ

### ការគាំទ្រឪពុកម្តាយ
- **Föräldrastöd**: កម្មវិធីគាំទ្រឪពុកម្តាយក្រុង
- **ការប្រឹក្សាគ្រួសារ**: សេវាកម្មព្យាបាលគ្រួសារវិជ្ជាជីវៈ
- **ថ្នាក់ឪពុកម្តាយ**: ការសម្របវប្បធម៌សម្រាប់ការចិញ្ចឹមកូន
- **មត្តេយ្យសិក្សាបើកចំហ**: សកម្មភាពឥតគិតថ្លៃសម្រាប់កុមារ និងឪពុកម្តាយ

### សេវាកម្មកុមារ
- **ការគាំទ្រសាលារៀន**: ជំនួយបន្ថែមសម្រាប់កុមារដែលកំពុងរៀនភាសាស៊ុយអែត
- **កម្មវិធីក្រៅម៉ោងសិក្សា**: ការគាំទ្រសាកលវិទ្យាល័យ និងសង្គម
- **មណ្ឌលយុវជន**: សកម្មភាព និងការណែនាំសម្រាប់អ្នកជំទង់
- **កម្មវិធីវប្បធម៌**: រក្សាអត្តសញ្ញាណខ្មែរសម្រាប់កុមារ

## ជំនួយហិរញ្ញវត្ថុ

### ផលប្រយោជន៍សង្គម
- **Försäkringskassan**: ភ្នាក់ងារធានារ៉ាប់រងសង្គម
  - ការឧបត្ថម្ភកុមារ (barnbidrag)
  - ការឧបត្ថម្ភលំនៅដ្ឋាន (bostadsbidrag)
  - ផលប្រយោជន៍ឈប់សម្រាកមាតុភាព
  - ផលប្រយោជន៍ឈឺ

### ជំនួយហិរញ្ញវត្ថុបន្ទាន់
- **Socialtjänst**: សេវាកម្មសង្គមក្រុង
- **មូលនិធិវិបត្តិ**: ជំនួយហិរញ្ញវត្ថុបន្ទាន់
- **ធនាគារអាហារ**: មណ្ឌលចែកចាយអាហារឥតគិតថ្លៃ
- **អង្គការសប្បុរសធម៌**: ក្រុមគាំទ្រសាសនា និងលោកិក

## ជំនួយលំនៅដ្ឋាន

### រកឃើញលំនៅដ្ឋាន
- **Boplats**: ប្រព័ន្ធជួរលំនៅដ្ឋានផ្លូវការ
- **ទីប្រឹក្សាលំនៅដ្ឋាន**: ការណែនាំលំនៅដ្ឋានក្រុង
- **សមាគមអ្នកជួល**: ការគាំទ្រជាមួយបញ្ហាជួល
- **លំនៅដ្ឋានបន្ទាន់**: សេវាកម្មលំនៅដ្ឋានបណ្តោះអាសន្ន

### សិទ្ធិលំនៅដ្ឋាន
- **ប្រឹក្សាជួល**: ការដោះស្រាយវិវាទសម្រាប់អ្នកជួល
- **ការឧបត្ថម្ភលំនៅដ្ឋាន**: ការគាំទ្រហិរញ្ញវត្ថុសម្រាប់ថ្លៃជួល
- **ការឧបត្ថម្ភជួសជុល**: ការគាំទ្រការកែលម្អផ្ទះ
- **ប្រសិទ្ធភាពថាមពល**: កម្មវិធីកាត់បន្ថយថ្លៃភ្លើង

## អង្គការសហគមន៍

### អង្គការខ្មែរ
- **សហគម ខ្មែរ**: អង្គការរបស់យើង - ការរក្សាវប្បធម៌ និងការគាំទ្រ
- **សមាគមខ្មែរមូលដ្ឋាន**: ក្រុមសហគមន៍ជាក់លាក់តាមទីក្រុង
- **វត្តព្រះពុទ្ធសាសនា**: ការគាំទ្រខាងវិញ្ញាណ និងសហគមន៍
- **មណ្ឌលវប្បធម៌**: ព្រឹត្តិការណ៍ និងសកម្មភាពវប្បធម៌

### អង្គការពហុវប្បធម៌
- **ឈើឆ្កាងក្រហម**: ការគាំទ្រមនុស្សធម៌អន្តរជាតិ
- **Caritas**: អង្គការសប្បុរសធម៌កាតូលិក
- **អង្គការអ៊ីស្លាម**: ការគាំទ្រសម្រាប់សមាជិកសហគមន៍មូស្លីម
- **ក្រុមប្រឹក្សាអន្តរសាសនា**: ក្រុមសហប្រតិបត្តិការពហុសាសនា

## ការគាំទ្រការអប់រំ

### ការអប់រំមនុស្សពេញវ័យ
- **Grundvux**: ការអប់រំមនុស្សពេញវ័យមូលដ្ឋានស្មើនឹងបឋមសិក្សា/មធ្យមសិក្សាតូច
- **Gymnasievux**: ការអប់រំមធ្យមសិក្សាលើសម្រាប់មនុស្សពេញវ័យ
- **ការអប់រំកម្រិតខ្ពស់**: ការរៀបចំ និងការគាំទ្រសាកលវិទ្យាល័យ
- **ហិរញ្ញប្បទានសិក្សា**: ជំនួយ និងកម្ចីសិស្ស CSN

### ការបណ្តុះបណ្តាលវិជ្ជាជីវៈ
- **កម្មវិធីវិជ្ជាជីវៈ**: វគ្គបណ្តុះបណ្តាលជាក់លាក់តាមការងារ
- **កន្លែងកម្មសិក្សា**: កម្មវិធីរៀន-ខណៈពេល-អ្នក-ធ្វើការ
- **វគ្គវិញ្ញាបនបត្រ**: ការអភិវឌ្ឍជំនាញវិជ្ជាជីវៈ
- **ការទទួលស្គាល់ការរៀនសូត្រមុន**: ការទទួលស្គាល់បទពិសោធន៍ និងការអប់រំបរទេស

## បច្ចេកវិទ្យា និងការគាំទ្រឌីជីថល

### ការរួមបញ្ចូលឌីជីថល
- **វគ្គកុំព្យូទ័រ**: ការបណ្តុះបណ្តាលជំនាញកុំព្យូទ័រមូលដ្ឋាន
- **ការចូលប្រើអ៊ីនធឺណិត**: ទីតាំង wifi ឥតគិតថ្លៃ និងការគាំទ្រឌីជីថល
- **BankID**: ជំនួយការដំឡើងការកំណត់អត្តសញ្ញាណឌីជីថល
- **សេវាកម្មរដ្ឋាភិបាលអេឡិចត្រូនិច**: ការប្រើប្រាស់សេវាកម្មរដ្ឋាភិបាលអនឡាញ

### កម្មវិធីរៀនភាសា
- **Duolingo**: កម្មវិធីរៀនភាសាឥតគិតថ្លៃ
- **Babbel**: វគ្គភាសាទូលំទូលាយ
- **SVT Play**: ទូរទស្សន៍ស៊ុយអែតជាមួយចំណងជើងរងសម្រាប់ការរៀនភាសា
- **SR Play**: វិទ្យុស៊ុយអែតសម្រាប់ការអនុវត្តស្តាប់

## ទំនាក់ទំនងបន្ទាន់

### សេវាកម្មសង្គ្រោះជាតិ
- **112**: ប៉ូលីស ពន្លត់អគ្គិភ័យ ការសង្គ្រោះ (បន្ទាន់)
- **114 14**: ប៉ូលីស (មិនបន្ទាន់)
- **1177**: ការប្រឹក្សា និងព័ត៌មានសុខាភិបាល
- **020-22 00 60**: បណ្តាញជំនួយគាំទ្រវិបត្តិ

### ទំនាក់ទំនងមូលដ្ឋាន
- **ការិយាល័យក្រុង**: សេវាកម្មរដ្ឋាភិបាលមូលដ្ឋាន
- **បណ្ណាល័យ**: ព័ត៌មាន និងការចូលប្រើអ៊ីនធឺណិត
- **ព័ត៌មានទេសចរណ៍**: ការណែនាំទូទៅ និងផែនទី
- **ការិយាល័យសហគម ខ្មែរ**: ការគាំទ្រដោយផ្ទាល់របស់អង្គការយើង

## របៀបចូលប្រើធនធានទាំងនេះ

១. **ចាប់ផ្តើមជាមួយក្រុងរបស់អ្នក**: សេវាកម្មភាគច្រើនត្រូវបានរៀបចំក្នុងមូលដ្ឋាន
២. **នាំយកការកំណត់អត្តសញ្ញាណ**: លេខសំគាល់បុគ្គល និងអត្តសញ្ញាណបត្រត្រូវការសម្រាប់សេវាកម្មភាគច្រើន
៣. **សុំការបកប្រែ**: ការបកប្រែឥតគិតថ្លៃមានសម្រាប់សេវាកម្មភាគច្រើន
៤. **មានអត្ថធ្មត់**: សេវាកម្មខ្លះអាចមានបញ្ជីរង់ចាំ
៥. **រក្សាឯកសារ**: រក្សាទុកឯកសារសំខាន់ៗ និងការឆ្លើយឆ្លងទាំងអស់

ចូរចងចាំថា ការសុំជំនួយមិនមែនជាសញ្ញានៃភាពខ្សោយទេ - វាគឺជាវិធីឆ្លាតវៃក្នុងការដើរតាមជីវិតថ្មីរបស់អ្នកនៅស៊ុយអែត។ ធនធានទាំងនេះមានដើម្បីគាំទ្រអ្នក និងជោគជ័យ និងការរួមបញ្ចូលរបស់គ្រួសារអ្នក។

សម្រាប់ជំនួយបន្ទាន់ ឬសំណួរអំពីធនធានណាមួយក្នុងចំណោមនេះ សូមទាក់ទងមកសហគម ខ្មែរនៅ contact.sahakumkhmer.se@gmail.com ឬមកលេងការិយាល័យរបស់យើងក្នុងម៉ោងធម្មតា។
            `
          }
        ]
      }
    }
  })

  console.log('✅ Created pages:')
  console.log(`- About Sahakum Khmer (${aboutPage.id})`)
  console.log(`- Cambodia - Our Heritage (${cambodiaPage.id})`)
  console.log(`- Living in Sweden Guide (${guidePage.id})`)
  console.log(`- Support Resources (${supportPage.id})`)

  console.log('✅ All pages created successfully with content in English, Swedish, and Khmer!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })