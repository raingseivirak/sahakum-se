import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Simple HTML generator for Sweden design system
function generateHTML(language: string, content: string): string {
  const fontClass = language === 'km' ? 'font-khmer' : 'font-sweden'

  return content
    .replace(/^# (.+)$/gm, `<h1 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h1>`)
    .replace(/^## (.+)$/gm, `<h2 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h2>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sweden-blue hover:text-sweden-blue-navy underline">$1</a>')
    .split('\n\n')
    .map(p => p.trim() ? (p.includes('<h') ? p : `<p class="${fontClass} text-sweden-body leading-sweden-base letter-spacing-sweden-normal">${p}</p>`) : '')
    .filter(p => p)
    .join('')
}

// Blog articles data - keeping content concise to avoid performance issues
const articles = [
  {
    slug: 'opening-bank-account-sweden',
    featuredImg: '/media/images/bank_sweden.jpg',
    publishedAt: new Date('2025-01-10'),
    en: {
      title: 'Opening a Bank Account in Sweden: A Step-by-Step Guide',
      excerpt: 'Learn how to open your first Swedish bank account, including required documents, best banks for newcomers, and common challenges to avoid.',
      content: `# Opening a Bank Account in Sweden: A Step-by-Step Guide

Opening a bank account is essential for life in Sweden. Here's what you need to know.

## Required Documents

You'll need:
- Valid ID (passport or Swedish ID)
- **Personnummer** (personal number)
- Proof of income or employment
- Proof of address in Sweden

## Best Banks for Newcomers

**Handelsbanken** and **SEB** are newcomer-friendly. **Swedbank** and **Nordea** are also good options.

## Common Challenges

Without a personnummer, try **Forex Bank** or ask about temporary accounts. Some banks offer accounts for students with admission letters.

## Tips for Success

Bring all documents, be patient, and consider booking appointments in advance.`
    },
    sv: {
      title: 'Öppna bankkonto i Sverige: En steg-för-steg guide',
      excerpt: 'Lär dig hur du öppnar ditt första svenska bankkonto, inklusive nödvändiga dokument, bästa bankerna för nykomlingar och vanliga utmaningar att undvika.',
      content: `# Öppna bankkonto i Sverige: En steg-för-steg guide

Att öppna ett bankkonto är viktigt för livet i Sverige. Här är vad du behöver veta.

## Nödvändiga dokument

Du behöver:
- Giltig ID (pass eller svensk legitimation)
- **Personnummer**
- Bevis på inkomst eller anställning
- Adressbevis i Sverige

## Bästa bankerna för nykomlingar

**Handelsbanken** och **SEB** är nybörjarvänliga. **Swedbank** och **Nordea** är också bra alternativ.

## Vanliga utmaningar

Utan personnummer, prova **Forex Bank** eller fråga om tillfälliga konton.

## Tips för framgång

Ta med alla dokument, ha tålamod och överväg att boka tid i förväg.`
    },
    km: {
      title: 'បើកគណនីធនាគារក្នុងប្រទេសស៊ុយអែត: មគ្គុទ្ទេសក៍ជំហានម្តងមួយៗ',
      excerpt: 'ស្វែងយល់របៀបបើកគណនីធនាគារស៊ុយអែតដំបូងរបស់អ្នក រួមទាំងឯកសារចាំបាច់ ធនាគារល្អបំផុតសម្រាប់អ្នកថ្មី និងបញ្ហាប្រឈមមូលដ្ឋានដែលត្រូវជៀសវាង។',
      content: `# បើកគណនីធនាគារក្នុងប្រទេសស៊ុយអែត: មគ្គុទ្ទេសក៍ជំហានម្តងមួយៗ

ការបើកគណនីធនាគារមានសារៈសំខាន់សម្រាប់ជីវិតក្នុងប្រទេសស៊ុយអែត។

## ឯកសារចាំបាច់

អ្នកត្រូវការ:
- កាតសម្គាល់ត្រឹមត្រូវ (លិខិតឆ្លងដែន ឬកាតសម្គាល់ស៊ុយអែត)
- **លេខសម្គាល់បុគ្គល** (personnummer)
- ភស្តុតាងនៃប្រាក់ចំណូល ឬការងារ
- ភស្តុតាងនៃអាសយដ្ឋានក្នុងប្រទេសស៊ុយអែត

## ធនាគារល្អបំផុតសម្រាប់អ្នកថ្មី

**Handelsbanken** និង **SEB** មានភាពងាយស្រួលសម្រាប់អ្នកថ្មី។

## បញ្ហាប្រឈមមូលដ្ឋាន

ដោយគ្មានលេខសម្គាល់បុគ្គល សូមសាកល្បង **Forex Bank** ឬសួរអំពីគណនីបណ្តោះអាសន្ន។

## គន្លឹះសម្រាប់ជោគជ័យ

យកឯកសារទាំងអស់ មានចិត្តអត់ធ្មត់ និងពិចារណាកក់ពេលជាមុន។`
    }
  },
  {
    slug: 'finding-housing-sweden',
    featuredImg: '/media/images/housing_sweden.jpg',
    publishedAt: new Date('2025-01-08'),
    en: {
      title: 'Finding Housing in Sweden: Tips and Strategies',
      excerpt: 'Navigate the Swedish housing market with insider tips on finding apartments, understanding rental queues, and avoiding common pitfalls.',
      content: `# Finding Housing in Sweden: Tips and Strategies

Finding housing in Sweden requires patience and strategy.

## Types of Housing

**First-hand contracts** (förstahandskontrakt) are best but rare. **Second-hand** (andrahandskontrakt) and **subletting** are more common for newcomers.

## Where to Look

- **Blocket.se** - Sweden's largest marketplace
- **Bostadsförmedlingen** - Stockholm housing queue
- **Facebook groups** for your city
- University housing for students

## Red Flags to Avoid

Never pay deposits before viewing. Avoid listings asking for immediate transfers or too-good-to-be-true prices.

## Success Tips

Join housing queues early, be flexible with location, and consider temporary housing while searching.`
    },
    sv: {
      title: 'Hitta boende i Sverige: Tips och strategier',
      excerpt: 'Navigera på den svenska bostadsmarknaden med insidertips för att hitta lägenheter, förstå bostadsköer och undvika vanliga fallgropar.',
      content: `# Hitta boende i Sverige: Tips och strategier

Att hitta boende i Sverige kräver tålamod och strategi.

## Typer av boende

**Förstahandskontrakt** är bäst men sällsynta. **Andrahandskontrakt** och **uthyrning** är vanligare för nykomlingar.

## Var man ska leta

- **Blocket.se** - Sveriges största marknadsplats
- **Bostadsförmedlingen** - Stockholms bostadskö
- **Facebook-grupper** för din stad
- Studentbostäder för studenter

## Röda flaggor att undvika

Betala aldrig depositioner före visning. Undvik annonser som ber om omedelbara överföringar.

## Framgångstips

Gå med i bostadsköer tidigt, var flexibel med plats och överväg tillfälligt boende.`
    },
    km: {
      title: 'រកទីលំនៅក្នុងប្រទេសស៊ុយអែត: គន្លឹះ និងយុទ្ធសាស្ត្រ',
      excerpt: 'រុករកទីផ្សារលំនៅដ្ឋានស៊ុយអែតជាមួយគន្លឹះខាងក្នុងសម្រាប់ការរកបន្ទប់ ការយល់ដឹងអំពីជួរសម្រាប់ជួល និងការជៀសវាងបញ្ហាទូទៅ។',
      content: `# រកទីលំនៅក្នុងប្រទេសស៊ុយអែត: គន្លឹះ និងយុទ្ធសាស្ត្រ

ការរកទីលំនៅក្នុងប្រទេសស៊ុយអែតត្រូវការភាពអត់ធ្មត់ និងយុទ្ធសាស្ត្រ។

## ប្រភេទទីលំនៅ

**កិច្ចសន្យាដំបូង** (förstahandskontrakt) ល្អបំផុតតែកម្រ។ **កិច្ចសន្យាទីពីរ** (andrahandskontrakt) និង **ការជួលរង** កាន់តែទូទៅសម្រាប់អ្នកថ្មី។

## កន្លែងស្វែងរក

- **Blocket.se** - ទីផ្សារធំបំផុតរបស់ស៊ុយអែត
- **Bostadsförmedlingen** - ជួរលំនៅស្តុកហូម
- **ក្រុម Facebook** សម្រាប់ទីក្រុងរបស់អ្នក

## សញ្ញាព្រមានដែលត្រូវជៀសវាង

កុំបង់ប្រាក់កក់មុនពេលមើល។ ជៀសវាងប្រកាសដែលសុំការផ្ទេរភ្លាមៗ។

## គន្លឹះជោគជ័យ

ចូលរួមជួរលំនៅដ្ឋានពីដើម មានភាពបត់បែនជាមួយទីតាំង។`
    }
  },
  {
    slug: 'swedish-healthcare-system',
    featuredImg: '/media/images/healthcare_sweden.jpg',
    publishedAt: new Date('2025-01-05'),
    en: {
      title: 'Understanding the Swedish Healthcare System',
      excerpt: 'Learn how to navigate Swedish healthcare, from registering with a vårdcentral to understanding costs and emergency procedures.',
      content: `# Understanding the Swedish Healthcare System

Sweden has universal healthcare, but you need to understand how it works.

## Getting Started

Register with a **vårdcentral** (health center) in your area. You need a personnummer for this.

## How It Works

For non-emergency issues, call **1177** for medical advice. Visit your vårdcentral for routine care.

## Emergency Care

Call **112** for emergencies. Visit **akutmottagning** (emergency room) for serious issues.

## Costs

Most care costs 200-400 SEK per visit. Dental care is separate and more expensive.

## Important Numbers

- **1177** - Medical advice hotline
- **112** - Emergency services
- Your vårdcentral's direct number`
    },
    sv: {
      title: 'Förstå det svenska sjukvårdssystemet',
      excerpt: 'Lär dig hur du navigerar i svensk sjukvård, från att registrera dig på en vårdcentral till att förstå kostnader och akutrutiner.',
      content: `# Förstå det svenska sjukvårdssystemet

Sverige har allmän sjukvård, men du behöver förstå hur det fungerar.

## Komma igång

Registrera dig på en **vårdcentral** i ditt område. Du behöver personnummer för detta.

## Hur det fungerar

För icke-akuta problem, ring **1177** för medicinsk rådgivning. Besök din vårdcentral för rutinvård.

## Akutvård

Ring **112** för nödsituationer. Besök **akutmottagning** för allvarliga problem.

## Kostnader

De flesta vårdbesök kostar 200-400 SEK. Tandvård är separat och dyrare.

## Viktiga nummer

- **1177** - Medicinsk rådgivning
- **112** - Nödtjänster
- Din vårdcentrals direktnummer`
    },
    km: {
      title: 'ការយល់ដឹងអំពីប្រព័ន្ធថែទាំសុខភាពស៊ុយអែត',
      excerpt: 'ស្វែងយល់របៀបរុករកការថែទាំសុខភាពស៊ុយអែត ពីការចុះបញ្ជីជាមួយ vårdcentral ដល់ការយល់ដឹងអំពីតម្លៃ និងនីតិវិធីបន្ទាន់។',
      content: `# ការយល់ដឹងអំពីប្រព័ន្ធថែទាំសុខភាពស៊ុយអែត

ប្រទេសស៊ុយអែតមានការថែទាំសុខភាពសកល តែអ្នកត្រូវយល់ពីរបៀបដែលវាដំណើរការ។

## ការចាប់ផ្តើម

ចុះបញ្ជីជាមួយ **vårdcentral** (មជ្ឈមណ្ឌលសុខភាព) ក្នុងតំបន់របស់អ្នក។ អ្នកត្រូវការលេខសម្គាល់បុគ្គលសម្រាប់នេះ។

## របៀបដែលវាដំណើរការ

សម្រាប់បញ្ហាមិនបន្ទាន់ ទូរសព្ទ **1177** សម្រាប់ដំបូន្មានវេជ្ជសាស្ត្រ។

## ការថែទាំបន្ទាន់

ទូរសព្ទ **112** សម្រាប់ករណីបន្ទាន់។ ទៅ **akutmottagning** (បន្ទប់응급) សម្រាប់បញ្ហាធ្ងន់ធ្ងរ។

## តម្លៃ

ការថែទាំភាគច្រើនមានតម្លៃ 200-400 SEK ក្នុងមួយការមកពិនិត្យ។

## លេខសំខាន់ៗ

- **1177** - ខ្សែទូរសព្ទដំបូន្មានវេជ្ជសាស្ត្រ
- **112** - សេវាកម្មបន្ទាន់`
    }
  },
  {
    slug: 'learning-swedish-language',
    featuredImg: '/media/images/swedish_learning.jpg',
    publishedAt: new Date('2025-01-03'),
    en: {
      title: 'Learning Swedish: Resources and Tips for Beginners',
      excerpt: 'Start your Swedish language journey with free courses, useful apps, and practical tips for everyday conversations.',
      content: `# Learning Swedish: Resources and Tips for Beginners

Learning Swedish opens many doors in Sweden.

## Free Resources

**SFI** (Svenska för Invandrare) offers free Swedish classes for immigrants. Apply at your local komvux.

## Useful Apps

- **Duolingo** - Great for beginners
- **Babbel** - More structured lessons
- **SVT Play** - Watch Swedish TV with subtitles

## Practice Tips

Start with basic phrases like "Hej" (hello), "Tack" (thanks), and "Ursäkta" (excuse me). Don't be afraid to make mistakes!

## Immersion Strategies

Change your phone language to Swedish, listen to Swedish radio, and try to think in Swedish for a few minutes daily.

## Grammar Basics

Swedish has two genders (en/ett) and simpler grammar than German. Focus on common verb forms first.`
    },
    sv: {
      title: 'Att lära sig svenska: Resurser och tips för nybörjare',
      excerpt: 'Börja din svenska språkresa med gratis kurser, användbara appar och praktiska tips för vardagssamtal.',
      content: `# Att lära sig svenska: Resurser och tips för nybörjare

Att lära sig svenska öppnar många dörrar i Sverige.

## Gratis resurser

**SFI** (Svenska för Invandrare) erbjuder gratis svenskkurser för invandrare. Ansök på din lokala komvux.

## Användbara appar

- **Duolingo** - Bra för nybörjare
- **Babbel** - Mer strukturerade lektioner
- **SVT Play** - Titta på svensk TV med undertexter

## Övningstips

Börja med grundläggande fraser som "Hej", "Tack" och "Ursäkta". Var inte rädd för att göra misstag!

## Strategier för fördjupning

Ändra ditt telefons språk till svenska, lyssna på svensk radio och försök tänka på svenska några minuter dagligen.

## Grundläggande grammatik

Svenska har två genus (en/ett) och enklare grammatik än tyska.`
    },
    km: {
      title: 'ការរៀនភាសាស៊ុយអែត: ធនធាន និងគន្លឹះសម្រាប់អ្នកចាប់ផ្តើម',
      excerpt: 'ចាប់ផ្តើមដំណើរភាសាស៊ុយអែតរបស់អ្នកជាមួយវគ្គសិក្សាឥតគិតថ្លៃ កម្មវិធីមានប្រយោជន៍ និងគន្លឹះ실용적 សម្រាប់ការសន្ទនាប្រចាំថ្ងៃ។',
      content: `# ការរៀនភាសាស៊ុយអែត: ធនធាន និងគន្លឹះសម្រាប់អ្នកចាប់ផ្តើម

ការរៀនភាសាស៊ុយអែតបើកទ្វារជាច្រើនក្នុងប្រទេសស៊ុយអែត។

## ធនធានឥតគិតថ្លៃ

**SFI** (Svenska för Invandrare) ផ្តល់នូវវគ្គសិក្សាភាសាស៊ុយអែតឥតគិតថ្លៃសម្រាប់អ្នកចំណាកស្រុក។

## កម្មវិធីមានប្រយោជន៍

- **Duolingo** - ល្អសម្រាប់អ្នកចាប់ផ្តើម
- **Babbel** - មេរៀនមានរចនាសម្ព័ន្ធ
- **SVT Play** - មើលទូរទស្សន៍ស៊ុយអែតជាមួយចំណងជើងរង

## គន្លឹះអនុវត្ត

ចាប់ផ្តើមជាមួយឃ្លាមូលដ្ឋានដូចជា "Hej" (សួស្តី), "Tack" (អរគុណ), និង "Ursäkta" (សុំទោស)។

## យុទ្ធសាស្ត្រជម្រុះ

ផ្លាស់ប្តូរភាសាទូរស័ព្ទរបស់អ្នកទៅជាភាសាស៊ុយអែត ស្តាប់វិទ្យុស៊ុយអែត។

## វេយ្យាករណ៍មូលដ្ឋាន

ភាសាស៊ុយអែតមានពីរភេទ (en/ett) និងវេយ្យាករណ៍សាមញ្ញជាងភាសាអាល្លឺម៉ង់។`
    }
  },
  {
    slug: 'working-in-sweden-guide',
    featuredImg: '/media/images/work_sweden.jpg',
    publishedAt: new Date('2025-01-01'),
    en: {
      title: 'Working in Sweden: A Complete Guide for Newcomers',
      excerpt: 'Everything you need to know about finding work in Sweden, from CV tips to understanding Swedish workplace culture.',
      content: `# Working in Sweden: A Complete Guide for Newcomers

Sweden has a strong job market with unique workplace culture.

## CV and Application Tips

Swedish CVs should be 1-2 pages, include a photo, and have a **personal letter** (personligt brev). Use chronological format.

## Job Search Platforms

- **Arbetsförmedlingen.se** - Public employment service
- **LinkedIn** - Very popular in Sweden
- **TheLocal.se/jobs** - English-speaking positions
- **Academic Work** - For graduates

## Work Permits

EU citizens can work freely. Non-EU citizens need work permits **before** arriving in Sweden.

## Workplace Culture

Swedes value **work-life balance**, consensus decision-making, and **fika** (coffee breaks). Be punctual and direct in communication.

## Benefits to Expect

- 25 days vacation minimum
- Parental leave (480 days shared)
- Sick leave with pay
- Pension contributions`
    },
    sv: {
      title: 'Att jobba i Sverige: En komplett guide för nykomlingar',
      excerpt: 'Allt du behöver veta om att hitta jobb i Sverige, från CV-tips till att förstå svensk arbetsplatskultur.',
      content: `# Att jobba i Sverige: En komplett guide för nykomlingar

Sverige har en stark arbetsmarknad med unik arbetsplatskultur.

## CV- och ansökningstips

Svenska CV:n ska vara 1-2 sidor, inkludera foto och ha ett **personligt brev**. Använd kronologiskt format.

## Jobbsökningsplattformar

- **Arbetsförmedlingen.se** - Offentlig arbetsförmedling
- **LinkedIn** - Mycket populärt i Sverige
- **TheLocal.se/jobs** - Engelskspråkiga tjänster
- **Academic Work** - För akademiker

## Arbetstillstånd

EU-medborgare kan arbeta fritt. Icke-EU-medborgare behöver arbetstillstånd **innan** ankomst till Sverige.

## Arbetsplatskultur

Svenskar värdesätter **work-life balance**, konsensus och **fika** (kafferast). Var punktlig och direkt i kommunikation.

## Fördelar att förvänta sig

- Minst 25 dagars semester
- Föräldraledighet (480 dagar delat)
- Sjukfrånvaro med lön
- Pensionsavsättningar`
    },
    km: {
      title: 'ការធ្វើការក្នុងប្រទេសស៊ុយអែត: មគ្គុទ្ទេសក៍ពេញលេញសម្រាប់អ្នកថ្មី',
      excerpt: 'អ្វីគ្រប់យ៉ាងដែលអ្នកត្រូវដឹងអំពីការរកការងារក្នុងប្រទេសស៊ុយអែត ពីគន្លឹះ CV ដល់ការយល់ដឹងអំពីវប្បធម៌កន្លែងធ្វើការស៊ុយអែត។',
      content: `# ការធ្វើការក្នុងប្រទេសស៊ុយអែត: មគ្គុទ្ទេសក៍ពេញលេញសម្រាប់អ្នកថ្មី

ប្រទេសស៊ុយអែតមានទីផ្សារការងារដ៏រឹងមាំជាមួយវប្បធម៌កន្លែងធ្វើការតែមួយគត់។

## គន្លឹះ CV និងពាក្យសុំ

CV ស៊ុយអែតគួរតែមាន 1-2 ទំព័រ រួមបញ្ចូលរូបភាព និងមាន **សំបុត្របុគ្គល** (personligt brev)។

## វេទិកាស្វែងរកការងារ

- **Arbetsförmedlingen.se** - សេវាកម្មការងារសាធារណៈ
- **LinkedIn** - ពេញនិយមណាស់ក្នុងប្រទេសស៊ុយអែត
- **TheLocal.se/jobs** - មុខតំណែងភាសាអង់គ្លេស
- **Academic Work** - សម្រាប់បណ្ឌិត

## ការអនុញ្ញាតធ្វើការ

ពលរដ្ឋ EU អាចធ្វើការដោយសេរី។ ពលរដ្ឋក្រៅ EU ត្រូវការការអនុញ្ញាតធ្វើការ **មុនពេល** មកដល់ប្រទេសស៊ុយអែត។

## វប្បធម៌កន្លែងធ្វើការ

ជនជាតិស៊ុយអែតដាក់តម្លៃលើ **តុល្យភាពកិច្ចការ-ជីវិត**, ការសម្រេចចិត្តដោយមតិស្របគ្នា និង **fika** (ការសម្រាកកាហ្វេ)។

## អត្ថប្រយោជន៍ដែលរំពឹងទុក

- វិស្សមកាលអប្បបរមា 25 ថ្ងៃ
- ច្បាប់ឈប់សម្រាកមាតុភាព (480 ថ្ងៃចែករំលែក)
- ច្បាប់ឈប់សម្រាកឈឺជាមួយប្រាក់បៀវត្សរ៍
- ការរួមចំណែកសោធនភាព`
    }
  }
]

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!admin) {
    throw new Error('Admin user not found. Run seed-admin.ts first.')
  }

  console.log('🌱 Seeding 5 blog articles...')

  for (const article of articles) {
    const blogPost = await prisma.contentItem.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        slug: article.slug,
        type: 'POST',
        status: 'PUBLISHED',
        authorId: admin.id,
        publishedAt: article.publishedAt,
        featuredImg: article.featuredImg,
        translations: {
          create: [
            {
              language: 'en',
              title: article.en.title,
              seoTitle: article.en.title,
              metaDescription: article.en.excerpt,
              excerpt: article.en.excerpt,
              content: generateHTML('en', article.en.content)
            },
            {
              language: 'sv',
              title: article.sv.title,
              seoTitle: article.sv.title,
              metaDescription: article.sv.excerpt,
              excerpt: article.sv.excerpt,
              content: generateHTML('sv', article.sv.content)
            },
            {
              language: 'km',
              title: article.km.title,
              seoTitle: article.km.title,
              metaDescription: article.km.excerpt,
              excerpt: article.km.excerpt,
              content: generateHTML('km', article.km.content)
            }
          ]
        }
      }
    })

    console.log(`✅ Created: ${blogPost.slug}`)
  }

  console.log('\n🎉 Successfully seeded 5 blog articles!')
  console.log('📱 Articles available at:')
  articles.forEach(article => {
    console.log(`   - /{locale}/blog/${article.slug}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding articles:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })