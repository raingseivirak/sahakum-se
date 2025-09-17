import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSwedenEditorHTML(language: string, markdownContent: string): string {
  const fontClass = language === 'km' ? 'font-khmer' : 'font-sweden'

  // Convert markdown-style content to Sweden Editor HTML
  return markdownContent
    // Headers
    .replace(/^# (.+)$/gm, `<h1 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h1>`)
    .replace(/^## (.+)$/gm, `<h2 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h2>`)
    .replace(/^### (.+)$/gm, `<h3 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h3>`)
    .replace(/^#### (.+)$/gm, `<h4 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h4>`)

    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sweden-blue hover:text-sweden-blue-navy underline">$1</a>')

    // Lists
    .replace(/^- (.+)$/gm, (match, item) => `<li class="${fontClass} text-sweden-body">${item}</li>`)
    .replace(/^(\d+)\. (.+)$/gm, (match, num, item) => `<li class="${fontClass} text-sweden-body">${item}</li>`)

    // Convert remaining paragraphs
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim()

      // Handle lists
      if (paragraph.includes('<li')) {
        const isNumbered = /^\d+\./.test(paragraph)
        const listItems = paragraph.split('\n').filter(line => line.includes('<li'))
        const listClass = `${fontClass} space-y-1`
        return isNumbered
          ? `<ol class="${listClass}">\n${listItems.join('\n')}\n</ol>`
          : `<ul class="${listClass}">\n${listItems.join('\n')}\n</ul>`
      }

      if (!paragraph || paragraph.includes('<h') || paragraph.includes('<ul') || paragraph.includes('<ol')) {
        return paragraph
      }
      return `<p class="${fontClass} text-sweden-body leading-sweden-base letter-spacing-sweden-normal">${paragraph}</p>`
    })
    .filter(p => p)
    .join('')
}

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!admin) {
    throw new Error('Admin user not found. Run seed-admin.ts first.')
  }

  // English content
  const englishContent = `# How to Apply for a Personal Number (Personnummer) in Sweden

Getting a personal number (personnummer) is one of the most important steps when moving to Sweden. This unique identifier is essential for accessing most services in Swedish society.

## What is a Personal Number?

A **personal number** is a unique 10-digit identifier assigned to everyone registered in Sweden. It follows the format: YYMMDD-XXXX, where the first six digits represent your birth date, and the last four digits are assigned based on your birth location and include a check digit.

## Who Needs a Personal Number?

You need a personal number if you:

- Plan to stay in Sweden for more than one year
- Are an EU/EEA citizen living in Sweden
- Are a non-EU citizen with a residence permit
- Need to work, study, or access healthcare in Sweden

## Required Documents

Before applying, gather these essential documents:

### For EU/EEA Citizens:
- Valid passport or national ID card
- Proof of employment or study in Sweden
- Proof of residence (rental contract or property ownership)

### For Non-EU Citizens:
- Valid passport
- Residence permit from the Swedish Migration Agency
- Proof of residence in Sweden
- Employment contract or admission letter (if applicable)

## Step-by-Step Application Process

### 1. **Visit Skatteverket**
The Swedish Tax Agency (Skatteverket) handles personal number applications. You must visit in person - online applications are not available for initial registration.

### 2. **Book an Appointment**
Visit [skatteverket.se](https://www.skatteverket.se) to book an appointment at your local office. Appointments are usually required and can be booked online.

### 3. **Complete Form SKV 7408**
Fill out the application form "Anmälan för personer som ska folkbokföras" (Registration for persons to be registered in the population register).

### 4. **Submit Your Application**
Bring all required documents and the completed form to your appointment. The officer will review your documents and process your application.

## Processing Time

- **EU/EEA citizens**: Usually 2-4 weeks
- **Non-EU citizens**: Can take 4-8 weeks depending on your situation
- **Urgent cases**: May be processed faster with valid reasons

## What Happens After Approval?

Once approved, you will:

1. Receive a registration certificate (personbevis)
2. Be assigned your personal number
3. Be registered in the Swedish population register
4. Receive information about tax obligations

## Important Tips

**Before your appointment:**
- Make copies of all documents
- Ensure all documents are translated to Swedish if needed
- Bring original documents for verification

**Common mistakes to avoid:**
- Not bringing all required documents
- Applying before you have a valid residence permit
- Not updating your address if you move during the process

## After Getting Your Personal Number

With your personal number, you can:

- Open a Swedish bank account
- Sign up for healthcare services
- Apply for Swedish ID card (legitimation)
- Register for various government services
- Sign rental agreements more easily

## Getting Help

If you need assistance with your application:

- Contact Skatteverket directly: 0771-567 567
- Visit their website: [skatteverket.se](https://www.skatteverket.se)
- Seek help from your local kommun's integration services
- Contact organizations like Sahakum Khmer for community support

Remember, having a personal number is crucial for establishing your life in Sweden. Take time to prepare your documents carefully and don't hesitate to ask for help if you need it.`

  // Swedish content
  const swedishContent = `# Så ansöker du om personnummer i Sverige

Att få ett personnummer är ett av de viktigaste stegen när du flyttar till Sverige. Denna unika identifierare är nödvändig för att få tillgång till de flesta tjänster i det svenska samhället.

## Vad är ett personnummer?

Ett **personnummer** är en unik 10-siffrig identifierare som tilldelas alla som är registrerade i Sverige. Det följer formatet: ÅÅMMDD-XXXX, där de första sex siffrorna representerar ditt födelsedatum, och de sista fyra siffrorna tilldelas baserat på din födelseort och inkluderar en kontrollsiffra.

## Vem behöver ett personnummer?

Du behöver ett personnummer om du:

- Planerar att stanna i Sverige i mer än ett år
- Är EU/EES-medborgare som bor i Sverige
- Är icke-EU-medborgare med uppehållstillstånd
- Behöver arbeta, studera eller få tillgång till sjukvård i Sverige

## Nödvändiga dokument

Innan du ansöker, samla dessa viktiga dokument:

### För EU/EES-medborgare:
- Giltigt pass eller nationellt ID-kort
- Bevis på anställning eller studier i Sverige
- Bostadsbevis (hyreskontrakt eller fastighetsägande)

### För icke-EU-medborgare:
- Giltigt pass
- Uppehållstillstånd från Migrationsverket
- Bostadsbevis i Sverige
- Anställningskontrakt eller antagningsbesked (om tillämpligt)

## Steg-för-steg ansökningsprocess

### 1. **Besök Skatteverket**
Skatteverket hanterar ansökningar om personnummer. Du måste besöka personligen - onlineansökningar är inte tillgängliga för initial registrering.

### 2. **Boka tid**
Besök [skatteverket.se](https://www.skatteverket.se) för att boka tid på ditt lokala kontor. Tider krävs vanligtvis och kan bokas online.

### 3. **Fyll i blankett SKV 7408**
Fyll i ansökningsblanketten "Anmälan för personer som ska folkbokföras".

### 4. **Lämna in din ansökan**
Ta med alla nödvändiga dokument och den ifyllda blanketten till din tid. Handläggaren kommer att granska dina dokument och behandla din ansökan.

## Handläggningstid

- **EU/EES-medborgare**: Vanligtvis 2-4 veckor
- **Icke-EU-medborgare**: Kan ta 4-8 veckor beroende på din situation
- **Brådskande fall**: Kan behandlas snabbare med giltiga skäl

## Vad händer efter godkännande?

När det godkänts kommer du att:

1. Få ett registreringsbevis (personbevis)
2. Tilldelas ditt personnummer
3. Registreras i det svenska befolkningsregistret
4. Få information om skattskyldigheter

## Viktiga tips

**Innan ditt möte:**
- Gör kopior av alla dokument
- Se till att alla dokument är översatta till svenska om det behövs
- Ta med originaldokument för verifiering

**Vanliga misstag att undvika:**
- Att inte ta med alla nödvändiga dokument
- Att ansöka innan du har giltigt uppehållstillstånd
- Att inte uppdatera din adress om du flyttar under processen

## Efter att ha fått ditt personnummer

Med ditt personnummer kan du:

- Öppna ett svenskt bankkonto
- Registrera dig för sjukvårdstjänster
- Ansöka om svensk legitimation
- Registrera dig för olika statliga tjänster
- Skriva hyreskontrakt lättare

## Få hjälp

Om du behöver hjälp med din ansökan:

- Kontakta Skatteverket direkt: 0771-567 567
- Besök deras webbplats: [skatteverket.se](https://www.skatteverket.se)
- Sök hjälp från din lokala kommuns integrationstjänster
- Kontakta organisationer som Sahakum Khmer för samhällsstöd

Kom ihåg att ha ett personnummer är avgörande för att etablera ditt liv i Sverige. Ta tid att förbereda dina dokument noggrant och tveka inte att be om hjälp om du behöver det.`

  // Khmer content
  const khmerContent = `# របៀបដាក់ពាក្យសុំលេខសម្គាល់បុគ្គល (Personnummer) ក្នុងប្រទេសស៊ុយអែត

ការទទួលបានលេខសម្គាល់បុគ្គល (personnummer) គឺជាជំហានសំខាន់បំផុតមួយនៅពេលផ្លាស់ទីលំនៅទៅប្រទេសស៊ុយអែត។ លេខសម្គាល់តែមួយនេះមានសារៈសំខាន់សម្រាប់ការទទួលបានសេវាកម្មភាគច្រើនក្នុងសង្គមស៊ុយអែត។

## លេខសម្គាល់បុគ្គលជាអ្វី?

**លេខសម្គាល់បុគ្គល** គឺជាលេខសម្គាល់តែមួយ ១០ខ្ទង់ដែលបានកំណត់ឱ្យមនុស្សគ្រប់រូបដែលបានចុះបញ្ជីក្នុងប្រទេសស៊ុយអែត។ វាមានទម្រង់៖ YYMMDD-XXXX ដែលលេខប្រាំមួយខ្ទង់ដំបូងតំណាងឱ្យកាលបរិច្ឆេទកំណើតរបស់អ្នក ហើយលេខបួនខ្ទង់ចុងក្រោយត្រូវបានកំណត់ដោយផ្អែកលើទីកន្លែងកំណើតរបស់អ្នក និងរួមបញ្ចូលលេខពិនិត្យ។

## តើអ្នកណាចាំបាច់មានលេខសម្គាល់បុគ្គល?

អ្នកត្រូវការលេខសម្គាល់បុគ្គលប្រសិនបើអ្នក៖

- គ្រោងនឹងស្នាក់នៅក្នុងប្រទេសស៊ុយអែតច្រើនជាងមួយឆ្នាំ
- ជាពលរដ្ឋ EU/EEA ដែលរស់នៅក្នុងប្រទេសស៊ុយអែត
- ជាពលរដ្ឋក្រៅ EU ដែលមានអាជ្ញាប័ណ្ណស្នាក់នៅ
- ត្រូវការធ្វើការ សិក្សា ឬទទួលបានការថែទាំសុខភាពក្នុងប្រទេសស៊ុយអែត

## ឯកសារចាំបាច់

មុនពេលដាក់ពាក្យសុំ សូមប្រមូលឯកសារសំខាន់ៗទាំងនេះ៖

### សម្រាប់ពលរដ្ឋ EU/EEA៖
- លិខិតឆ្លងដែនត្រឹមត្រូវ ឬកាតសម្គាល់ជាតិ
- ភស្តុតាងនៃការងារ ឬការសិក្សាក្នុងប្រទេសស៊ុយអែត
- ភស្តុតាងនៃទីលំនៅ (កិច្ចសន្យាជួល ឬកម្មសិទ្ធិអចលនទ្រព្យ)

### សម្រាប់ពលរដ្ឋក្រៅ EU៖
- លិខិតឆ្លងដែនត្រឹមត្រូវ
- អាជ្ញាប័ណ្ណស្នាក់នៅពីភ្នាក់ងារចំណាកស្រុកស៊ុយអែត
- ភស្តុតាងនៃទីលំនៅក្នុងប្រទេសស៊ុយអែត
- កិច្ចសន្យាការងារ ឬលិខិតទទួលសិក្សា (បើមាន)

## ដំណើរការដាក់ពាក្យសុំតាមជំហាន

### ១. **ទៅមន្ទីរពន្ធដារ (Skatteverket)**
ភ្នាក់ងារពន្ធដារស៊ុយអែត (Skatteverket) គ្រប់គ្រងការដាក់ពាក្យសុំលេខសម្គាល់បុគ្គល។ អ្នកត្រូវតែទៅដោយផ្ទាល់ - ការដាក្ពាក្យសុំតាមអនឡាញមិនមានសម្រាប់ការចុះបញ្ជីដំបូងទេ។

### ២. **កក់ពេលណាត់ជួប**
ទៅកាន់ [skatteverket.se](https://www.skatteverket.se) ដើម្បីកក់ពេលណាត់ជួបនៅការិយាល័យក្នុងតំបន់របស់អ្នក។ ពេលណាត់ជួបជាទូទៅត្រូវបានទាមទារ ហើយអាចកក់បានតាមអនឡាញ។

### ៣. **បំពេញទម្រង់ SKV 7408**
បំពេញទម្រង់ពាក្យសុំ "Anmälan för personer som ska folkbokföras" (ការចុះបញ្ជីសម្រាប់បុគ្គលដែលនឹងត្រូវចុះបញ្ជីក្នុងបញ្ជីប្រជាជន)។

### ៤. **ដាក់ពាក្យសុំរបស់អ្នក**
យកឯកសារចាំបាច់ទាំងអស់ និងទម្រង់ដែលបានបំពេញរួចទៅកាន់ការណាត់ជួបរបស់អ្នក។ មន្ត្រីនឹងពិនិត្យឯកសាររបស់អ្នក និងដំណើរការពាក្យសុំរបស់អ្នក។

## រយៈពេលដំណើរការ

- **ពលរដ្ឋ EU/EEA**: ជាធម្មតា ២-៤ សប្តាហ៍
- **ពលរដ្ឋក្រៅ EU**: អាចចំណាយពេល ៤-៨ សប្តាហ៍ អាស្រ័យលើស្ថានភាពរបស់អ្នក
- **ករណីបន្ទាន់**: អាចត្រូវបានដំណើរការលឿនជាងមុនជាមួយហេតុផលត្រឹមត្រូវ

## អ្វីកើតឡើងបន្ទាប់ពីការអនុម័ត?

នៅពេលដែលត្រូវបានអនុម័ត អ្នកនឹង៖

1. ទទួលបានវិញ្ញាបនបត្រចុះបញ្ជី (personbevis)
2. ត្រូវបានកំណត់លេខសម្គាល់បុគ្គលរបស់អ្នក
3. ត្រូវបានចុះបញ្ជីក្នុងបញ្ជីប្រជាជនស៊ុយអែត
4. ទទួលបានព័ត៌មានអំពីកាតព្វកិច្ចពន្ធដារ

## គន្លឹះសំខាន់ៗ

**មុនពេលណាត់ជួបរបស់អ្នក៖**
- ថតចម្លងឯកសារទាំងអស់
- ធានាថាឯកសារទាំងអស់ត្រូវបានបកប្រែជាភាសាស៊ុយអែត បើចាំបាច់
- យកឯកសារដើមសម្រាប់ការផ្ទៀងផ្ទាត់

**កំហុសទូទៅដែលត្រូវជៀសវាង៖**
- មិនយកឯកសារចាំបាច់ទាំងអស់
- ដាក់ពាក្យសុំមុនពេលមានអាជ្ញាប័ណ្ណស្នាក់នៅត្រឹមត្រូវ
- មិនកែប្រែអាសយដ្ឋានរបស់អ្នកប្រសិនបើអ្នកផ្លាស់ទីកំឡុងពេលដំណើរការ

## បន្ទាប់ពីទទួលបានលេខសម្គាល់បុគ្គលរបស់អ្នក

ជាមួយលេខសម្គាល់បុគ្គលរបស់អ្នក អ្នកអាច៖

- បើកគណនីធនាគារស៊ុយអែត
- ចុះឈ្មោះសម្រាប់សេវាកម្មថែទាំសុខភាព
- ដាក់ពាក្យសុំកាតសម្គាល់ស៊ុយអែត (legitimation)
- ចុះបញ្ជីសម្រាប់សេវាកម្មរដ្ឋាភិបាលផ្សេងៗ
- ចុះហត្ថលេខាលើកិច្ចសន្យាជួលបានកាន់តែងាយ

## ទទួលបានជំនួយ

ប្រសិនបើអ្នកត្រូវការជំនួយជាមួយពាក្យសុំរបស់អ្នក៖

- ទាក់ទង Skatteverket ដោយផ្ទាល់៖ 0771-567 567
- ទៅកាន់គេហទំព័ររបស់ពួកគេ៖ [skatteverket.se](https://www.skatteverket.se)
- ស្វែងរកជំនួយពីសេវាកម្មរួមបញ្ចូលរបស់ក្រុមរដ្ឋបាលមូលដ្ឋានក្នុងតំបន់របស់អ្នក
- ទាក់ទងអង្គការដូចជា Sahakum Khmer សម្រាប់ការគាំទ្រសហគមន៍

សូមចាំថា ការមានលេខសម្គាល់បុគ្គលមានសារៈសំខាន់ណាស់សម្រាប់ការបង្កើតជីវិតរបស់អ្នកនៅក្នុងប្រទេសស៊ុយអែត។ សូមចំណាយពេលដើម្បីរៀបចំឯកសាររបស់អ្នកដោយប្រុងប្រយ័ត្ន ហើយកុំសៀនអៀនក្នុងការសុំជំនួយប្រសិនបើអ្នកត្រូវការ។`

  // Create the blog post
  const blogPost = await prisma.contentItem.upsert({
    where: { slug: 'how-to-apply-for-personnummer' },
    update: {},
    create: {
      slug: 'how-to-apply-for-personnummer',
      type: 'POST',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      featuredImg: '/media/images/sweden_documents.jpg', // You can add an appropriate image
      translations: {
        create: [
          {
            language: 'en',
            title: 'How to Apply for a Personal Number (Personnummer) in Sweden',
            seoTitle: 'Complete Guide: How to Apply for Personnummer in Sweden 2025',
            metaDescription: 'Step-by-step guide on how to apply for a Swedish personal number (personnummer). Learn about required documents, processing time, and what to expect.',
            excerpt: 'A comprehensive guide to getting your Swedish personal number (personnummer), including required documents, step-by-step process, and important tips for a successful application.',
            content: generateSwedenEditorHTML('en', englishContent)
          },
          {
            language: 'sv',
            title: 'Så ansöker du om personnummer i Sverige',
            seoTitle: 'Komplett guide: Så ansöker du om personnummer i Sverige 2025',
            metaDescription: 'Steg-för-steg guide för att ansöka om svenskt personnummer. Lär dig om nödvändiga dokument, handläggningstid och vad du kan förvänta dig.',
            excerpt: 'En omfattande guide för att få ditt svenska personnummer, inklusive nödvändiga dokument, steg-för-steg process och viktiga tips för en framgångsrik ansökan.',
            content: generateSwedenEditorHTML('sv', swedishContent)
          },
          {
            language: 'km',
            title: 'របៀបដាក់ពាក្យសុំលេខសម្គាល់បុគ្គល (Personnummer) ក្នុងប្រទេសស៊ុយអែត',
            seoTitle: 'មគ្គុទ្ទេសក៍ពេញលេញ: របៀបដាក់ពាក្យសុំ Personnummer ក្នុងប្រទេសស៊ុយអែត ២០២៥',
            metaDescription: 'មគ្គុទ្ទេសក៍ជំហានម្តងមួយៗសម្រាប់ការដាក់ពាក្យសុំលេខសម្គាល់បុគ្គលស៊ុយអែត។ ស្វែងយល់អំពីឯកសារចាំបាច់ រយៈពេលដំណើរការ និងអ្វីដែលត្រូវរំពឹងទុក។',
            excerpt: 'មគ្គុទ្ទេសក៍ទូលំទូលាយសម្រាប់ការទទួលបានលេខសម្គាល់បុគ្គលស៊ុយអែតរបស់អ្នក រួមទាំងឯកសារចាំបាច់ ដំណើរការជំហានម្តងមួយៗ និងគន្លឹះសំខាន់ៗសម្រាប់ការដាក់ពាក្យសុំដោយជោគជ័យ។',
            content: generateSwedenEditorHTML('km', khmerContent)
          }
        ]
      }
    }
  })

  console.log(`✅ Created blog post: ${blogPost.slug}`)
  console.log(`📝 Title (EN): How to Apply for a Personal Number (Personnummer) in Sweden`)
  console.log(`📝 Title (SV): Så ansöker du om personnummer i Sverige`)
  console.log(`📝 Title (KM): របៀបដាក់ពាក្យសុំលេខសម្គាល់បុគ្គល (Personnummer) ក្នុងប្រទេសស៊ុយអែត`)
  console.log(`🌐 Available at:`)
  console.log(`   - /en/blog/how-to-apply-for-personnummer`)
  console.log(`   - /sv/blog/how-to-apply-for-personnummer`)
  console.log(`   - /km/blog/how-to-apply-for-personnummer`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })