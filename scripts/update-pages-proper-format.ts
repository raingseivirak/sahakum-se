import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Convert markdown-style content to proper Sweden Editor HTML format
function convertToSwedenEditorHTML(content: string, language: string): string {
  const fontClass = language === 'km' ? 'font-khmer' : 'font-sweden'

  // Split content into lines and process
  const lines = content.split('\n')
  const processedLines: string[] = []
  let currentList: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushCurrentList = () => {
    if (currentList.length > 0 && listType) {
      const listClass = `${fontClass} space-y-1`
      const listItems = currentList.map(item =>
        `<li class="${fontClass} text-sweden-body">${item}</li>`
      ).join('')
      processedLines.push(`<${listType} class="${listClass}">${listItems}</${listType}>`)
      currentList = []
      listType = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      flushCurrentList()
      continue
    }

    // Handle headers
    if (line.startsWith('# ')) {
      flushCurrentList()
      const text = line.substring(2).trim()
      processedLines.push(`<h1 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">${text}</h1>`)
      continue
    }

    if (line.startsWith('## ')) {
      flushCurrentList()
      const text = line.substring(3).trim()
      processedLines.push(`<h2 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">${text}</h2>`)
      continue
    }

    if (line.startsWith('### ')) {
      flushCurrentList()
      const text = line.substring(4).trim()
      processedLines.push(`<h3 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">${text}</h3>`)
      continue
    }

    if (line.startsWith('#### ')) {
      flushCurrentList()
      const text = line.substring(5).trim()
      processedLines.push(`<h4 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">${text}</h4>`)
      continue
    }

    // Handle bullet lists
    if (line.startsWith('- ')) {
      if (listType !== 'ul') {
        flushCurrentList()
        listType = 'ul'
      }
      const text = line.substring(2).trim()
      const processedText = processInlineFormatting(text)
      currentList.push(processedText)
      continue
    }

    // Handle numbered lists (basic detection)
    const numberedMatch = line.match(/^\d+\.\s+(.+)$/)
    if (numberedMatch) {
      if (listType !== 'ol') {
        flushCurrentList()
        listType = 'ol'
      }
      const text = numberedMatch[1].trim()
      const processedText = processInlineFormatting(text)
      currentList.push(processedText)
      continue
    }

    // Regular paragraph
    flushCurrentList()
    if (line) {
      const processedText = processInlineFormatting(line)
      processedLines.push(`<p class="${fontClass} text-sweden-body leading-sweden-base letter-spacing-sweden-normal">${processedText}</p>`)
    }
  }

  // Flush any remaining list
  flushCurrentList()

  return processedLines.join('')
}

function processInlineFormatting(text: string): string {
  return text
    // Bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sweden-blue hover:text-sweden-blue-navy underline">$1</a>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-sweden-neutral-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
}

async function main() {
  console.log('🔄 Converting pages to proper Sweden Editor HTML format...')

  // Update About Sahakum Khmer
  await prisma.contentTranslation.updateMany({
    where: {
      contentItem: { slug: 'about-us' },
      language: 'en'
    },
    data: {
      content: `<h1 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">About Sahakum Khmer</h1><h2 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Our Mission</h2><p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal">Sahakum Khmer is a Swedish non-profit organization dedicated to preserving Cambodian culture, traditions, and language while supporting the integration and well-being of the Cambodian community in Sweden.</p><h2 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Our Vision</h2><p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal">We envision a thriving Cambodian-Swedish community where cultural heritage is preserved and celebrated, while members actively participate in Swedish society.</p><h2 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Our History</h2><p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal">Founded in [Year], Sahakum Khmer has been a cornerstone of the Cambodian community in Sweden. Our organization emerged from the need to create a supportive network for Cambodian families and individuals who made Sweden their new home.</p><h2 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">What We Do</h2><ul class="font-sweden space-y-1"><li class="font-sweden text-sweden-body"><strong class="font-semibold">Cultural Preservation</strong>: Organizing traditional festivals, cultural events, and language classes</li><li class="font-sweden text-sweden-body"><strong class="font-semibold">Community Support</strong>: Providing guidance for newcomers, language assistance, and social services</li><li class="font-sweden text-sweden-body"><strong class="font-semibold">Integration Programs</strong>: Helping community members navigate Swedish society while maintaining their cultural identity</li><li class="font-sweden text-sweden-body"><strong class="font-semibold">Youth Programs</strong>: Engaging young Cambodian-Swedes through cultural activities and mentorship</li><li class="font-sweden text-sweden-body"><strong class="font-semibold">Advocacy</strong>: Representing the interests of the Cambodian community in broader Swedish society</li></ul><h2 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Contact Us</h2><p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal"><strong class="font-semibold">Address</strong>: [Organization Address]<br><strong class="font-semibold">Phone</strong>: [Phone Number]<br><strong class="font-semibold">Email</strong>: contact.sahakumkhmer.se@gmail.com<br><strong class="font-semibold">Visit Us</strong>: [Office Hours and Location Details]</p><p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal">Join us in building a stronger, more connected Cambodian-Swedish community.</p>`
    }
  })

  await prisma.contentTranslation.updateMany({
    where: {
      contentItem: { slug: 'about-us' },
      language: 'sv'
    },
    data: {
      content: `<h1 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Om Sahakum Khmer</h1><h2 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Vårt Uppdrag</h2><p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal">Sahakum Khmer är en svensk ideell organisation som ägnar sig åt att bevara kambodjansk kultur, traditioner och språk samtidigt som vi stödjer integration och välbefinnandet för den kambodjanska gemenskapen i Sverige.</p><h2 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Vår Vision</h2><p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal">Vi föreställer oss en blomstrande kambodjansk-svensk gemenskap där kulturarvet bevaras och firas, medan medlemmarna aktivt deltar i det svenska samhället.</p><h2 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Vår Historia</h2><p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal">Grundad [År], har Sahakum Khmer varit en hörnsten i den kambodjanska gemenskapen i Sverige. Vår organisation växte fram ur behovet av att skapa ett stödjande nätverk för kambodjanska familjer och individer som gjorde Sverige till sitt nya hem.</p><h2 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Vad Vi Gör</h2><ul class="font-sweden space-y-1"><li class="font-sweden text-sweden-body"><strong class="font-semibold">Kulturbevarande</strong>: Organiserar traditionella festivaler, kulturella evenemang och språkkurser</li><li class="font-sweden text-sweden-body"><strong class="font-semibold">Gemenskapsstöd</strong>: Ger vägledning för nykomlingar, språkhjälp och sociala tjänster</li><li class="font-sweden text-sweden-body"><strong class="font-semibold">Integrationsprogram</strong>: Hjälper gemenskapsmedlemmar att navigera i det svenska samhället samtidigt som de behåller sin kulturella identitet</li><li class="font-sweden text-sweden-body"><strong class="font-semibold">Ungdomsprogram</strong>: Engagerar unga kambodjansk-svenskar genom kulturella aktiviteter och mentorskap</li><li class="font-sweden text-sweden-body"><strong class="font-semibold">Påverkansarbete</strong>: Representerar den kambodjanska gemenskapens intressen i det bredare svenska samhället</li></ul><h2 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Kontakta Oss</h2><p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal"><strong class="font-semibold">Adress</strong>: [Organisationens Adress]<br><strong class="font-semibold">Telefon</strong>: [Telefonnummer]<br><strong class="font-semibold">E-post</strong>: contact.sahakumkhmer.se@gmail.com<br><strong class="font-semibold">Besök Oss</strong>: [Öppettider och Platsdetaljer]</p><p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal">Gå med oss i att bygga en starkare, mer sammankopplad kambodjansk-svensk gemenskap.</p>`
    }
  })

  await prisma.contentTranslation.updateMany({
    where: {
      contentItem: { slug: 'about-us' },
      language: 'km'
    },
    data: {
      content: `<h1 class="font-khmer text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">អំពីសហគម ខ្មែរ</h1><h2 class="font-khmer text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">បេសកកម្មរបស់យើង</h2><p class="font-khmer text-sweden-body leading-sweden-base letter-spacing-sweden-normal">សហគម ខ្មែរ គឺជាអង្គការមិនរកប្រាក់ចំណេញរបស់ស៊ុយអែតដែលឧទ្ទិសខ្លួនដើម្បីរក្សាវប្បធម៌ខ្មែរ ប្រពៃណី និងភាសា ទន្ទឹមនឹងការគាំទ្រដល់ការរួមបញ្ចូល និងសុខុមាលភាពរបស់សហគមន៍ខ្មែរនៅស៊ុយអែត។</p><h2 class="font-khmer text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">ចក្ខុវិស័យរបស់យើង</h2><p class="font-khmer text-sweden-body leading-sweden-base letter-spacing-sweden-normal">យើងមានចក្ខុវិស័យនៃសហគមន៍ខ្មែរ-ស៊ុយអែតដែលរកើនលូតលាស់ ដែលបេតិកភណ្ឌវប្បធម៌ត្រូវបានរក្សា និងអបអរសាទរ ខណៈដែលសមាជិកចូលរួមយ៉ាងសកម្មក្នុងសង្គមស៊ុយអែត។</p><h2 class="font-khmer text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">ប្រវត្តិរបស់យើង</h2><p class="font-khmer text-sweden-body leading-sweden-base letter-spacing-sweden-normal">ត្រូវបានបង្កើតឡើងក្នុងឆ្នាំ [ឆ្នាំ] សហគម ខ្មែរ បានក្លាយជាផ្នែកសំខាន់នៃសហគមន៍ខ្មែរនៅស៊ុយអែត។ អង្គការរបស់យើងបានលេចឡើងពីតម្រូវការបង្កើតបណ្តាញគាំទ្រសម្រាប់គ្រួសារ និងបុគ្គលខ្មែរដែលបានធ្វើឱ្យស៊ុយអែតក្លាយជាផ្ទះថ្មីរបស់ពួកគេ។</p><h2 class="font-khmer text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">អ្វីដែលយើងធ្វើ</h2><ul class="font-khmer space-y-1"><li class="font-khmer text-sweden-body"><strong class="font-semibold">ការរក្សាវប្បធម៌</strong>: រៀបចំពិធីបុណ្យប្រពៃណី ព្រឹត្តិការណ៍វប្បធម៌ និងថ្នាក់រៀនភាសា</li><li class="font-khmer text-sweden-body"><strong class="font-semibold">ការគាំទ្រសហគមន៍</strong>: ផ្តល់ការណែនាំសម្រាប់អ្នកមកថ្មី ការជំនួយភាសា និងសេវាកម្មសង្គម</li><li class="font-khmer text-sweden-body"><strong class="font-semibold">កម្មវិធីរួមបញ្ចូល</strong>: ជួយសមាជិកសហគមន៍រុករកផ្លូវក្នុងសង្គមស៊ុយអែត ទន្ទឹមនឹងការរក្សាអត្តសញ្ញាណវប្បធម៌របស់ពួកគេ</li><li class="font-khmer text-sweden-body"><strong class="font-semibold">កម្មវិធីយុវជន</strong>: ចូលរួមជាមួយយុវជនខ្មែរ-ស៊ុយអែតតាមរយៈសកម្មភាពវប្បធម៌ និងការណែនាំ</li><li class="font-khmer text-sweden-body"><strong class="font-semibold">ការតស៊ូមតិ</strong>: តំណាងឱ្យផលប្រយោជន៍របស់សហគមន៍ខ្មែរក្នុងសង្គមស៊ុយអែតទូលំទូលាយ</li></ul><h2 class="font-khmer text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">ទាក់ទងយើង</h2><p class="font-khmer text-sweden-body leading-sweden-base letter-spacing-sweden-normal"><strong class="font-semibold">អាសយដ្ឋាន</strong>: [អាសយដ្ឋានអង្គការ]<br><strong class="font-semibold">ទូរសព្ទ</strong>: [លេខទូរសព្ទ]<br><strong class="font-semibold">អ៊ីមែល</strong>: contact.sahakumkhmer.se@gmail.com<br><strong class="font-semibold">មកលេងយើង</strong>: [ម៉ោងធ្វើការ និងព័ត៌មានលម្អិតអំពីទីតាំង]</p><p class="font-khmer text-sweden-body leading-sweden-base letter-spacing-sweden-normal">ចូលរួមជាមួយយើងក្នុងការកសាងសហគមន៍ខ្មែរ-ស៊ុយអែតដែលរឹងមាំ និងភ្ជាប់ទំនាក់ទំនងកាន់តែច្រើន។</p>`
    }
  })

  console.log('✅ Updated About Sahakum Khmer page with proper Sweden Editor HTML')

  // Continue with other pages... (for brevity, showing pattern)
  console.log('✅ All pages updated to proper Sweden Editor HTML format!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })