import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const slug = 'pchum-ben-2026-community-and-togetherness'

// HTML matches the paragraph and bold extensions in the Swedish Editor.
function editorHTML(language: string, paragraphs: string[], closing: string) {
  const classes = `${language === 'km' ? 'font-khmer' : 'font-sweden'} text-sweden-body leading-sweden-base letter-spacing-sweden-normal`
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return paragraphs.map(text => `<p class="${classes}">${escape(text)}</p>`).join('')
    + `<p class="${classes}"><strong class="font-semibold">${escape(closing)}</strong></p>`
}

const translations = [
  {
    language: 'en',
    title: 'Pchum Ben 2026: A Day of Community and Togetherness',
    excerpt: 'Thank you to everyone who joined Sahakum Khmer’s Pchum Ben celebration in Järfälla on 17 October 2026—a day of community and togetherness.',
    paragraphs: [
      'On Saturday, 17 October 2026, Sahakum Khmer held our Pchum Ben celebration in Järfälla. It was an opportunity to come together, strengthen friendships and share an occasion that means so much to our community.',
      'The celebration welcomed members, non-members and their families. Bringing people together across generations is an important part of our association’s work. Together, we keep our connection to Khmer culture alive while building friendships here in Sweden.',
      'Thank you to everyone who joined us and to those who contributed their time, care and practical support before and during the event. Your participation helps our association grow and creates more opportunities for our community to meet and support one another.',
      'Following the celebration, we also held an extraordinary general meeting to discuss the association’s future. Thank you to the members who stayed and took part.',
      'We look forward to welcoming you to future activities and continuing to build our community together.',
    ],
    closing: 'A warm thank you from Sahakum Khmer!',
  },
  {
    language: 'sv',
    title: 'Pchum Ben 2026 – en dag av gemenskap',
    excerpt: 'Tack till alla som deltog i Sahakum Khmers Pchum Ben-firande i Järfälla den 17 oktober 2026—en dag av gemenskap och möten mellan generationer.',
    paragraphs: [
      'Lördagen den 17 oktober 2026 anordnade Sahakum Khmer ett Pchum Ben-firande i Järfälla. Det blev ett tillfälle att träffas, stärka gemenskapen och dela en betydelsefull högtid för vår förening och vårt nätverk.',
      'Firandet välkomnade både medlemmar, personer som ännu inte är medlemmar och deras familjer. Att skapa möten mellan generationer är en viktig del av föreningens arbete. Tillsammans håller vi den khmeriska kulturen levande och bygger vänskap här i Sverige.',
      'Vi vill tacka alla som deltog och alla som bidrog med tid, engagemang och praktisk hjälp inför och under dagen. Er medverkan hjälper föreningen att växa och skapar fler möjligheter att träffas och stötta varandra.',
      'Efter firandet höll vi även ett extra föreningsmöte för att diskutera föreningens framtid. Tack till alla medlemmar som stannade kvar och deltog.',
      'Vi ser fram emot att välkomna er till kommande aktiviteter och fortsätta bygga vår gemenskap tillsammans.',
    ],
    closing: 'Ett varmt tack från Sahakum Khmer!',
  },
  {
    language: 'km',
    title: 'បុណ្យភ្ជុំបិណ្ឌ ឆ្នាំ២០២៦៖ ជួបជុំគ្នាក្នុងសហគមន៍',
    excerpt: 'សូមអរគុណដល់អ្នកទាំងអស់គ្នាដែលបានចូលរួមពិធីបុណ្យភ្ជុំបិណ្ឌរបស់សមាគមសហគមខ្មែរ នៅ Järfälla កាលពីថ្ងៃទី១៧ ខែតុលា ឆ្នាំ២០២៦។',
    paragraphs: [
      'កាលពីថ្ងៃសៅរ៍ ទី១៧ ខែតុលា ឆ្នាំ២០២៦ សមាគមសហគមខ្មែរបានរៀបចំពិធីបុណ្យភ្ជុំបិណ្ឌនៅ Järfälla។ ពិធីនេះជាឱកាសសម្រាប់យើងជួបជុំគ្នា ពង្រឹងចំណងមិត្តភាព និងចែករំលែកពេលវេលាដ៏មានអត្ថន័យសម្រាប់សហគមន៍របស់យើង។',
      'ការជួបជុំនេះបានបើកទទួលស្វាគមន៍ទាំងសមាជិក អ្នកមិនមែនជាសមាជិក និងក្រុមគ្រួសារ។ ការភ្ជាប់ទំនាក់ទំនងរវាងមនុស្សគ្រប់ជំនាន់ គឺជាផ្នែកមួយដ៏សំខាន់នៃការងាររបស់សមាគម ដើម្បីរួមគ្នាថែរក្សាវប្បធម៌ខ្មែរ និងកសាងចំណងមិត្តភាពនៅប្រទេសស៊ុយអែត។',
      'យើងខ្ញុំសូមថ្លែងអំណរគុណដល់អ្នកទាំងអស់គ្នាដែលបានចូលរួម ព្រមទាំងអ្នកដែលបានចំណាយពេលវេលា និងកម្លាំងកាយចិត្តជួយរៀបចំពិធីនេះ។ ការចូលរួមរបស់អ្នកទាំងអស់គ្នាជួយឱ្យសមាគមរបស់យើងរីកចម្រើន និងបង្កើតឱកាសឱ្យសហគមន៍បានជួបជុំ និងជួយគ្នាទៅវិញទៅមក។',
      'បន្ទាប់ពីពិធីបុណ្យ យើងក៏បានបើកមហាសន្និបាតវិសាមញ្ញ ដើម្បីពិភាក្សាអំពីអនាគតរបស់សមាគម។ សូមអរគុណដល់សមាជិកដែលបានបន្តចូលរួមក្នុងកិច្ចប្រជុំនេះ។',
      'យើងខ្ញុំទន្ទឹងរង់ចាំស្វាគមន៍អ្នកទាំងអស់គ្នាក្នុងសកម្មភាពនាពេលខាងមុខ និងបន្តកសាងសហគមន៍របស់យើងរួមគ្នា។',
    ],
    closing: 'សូមអរគុណពីសមាគមសហគមខ្មែរ!',
  },
].map(({ paragraphs, closing, ...translation }) => ({
  ...translation,
  seoTitle: `${translation.title} | Sahakum Khmer`,
  metaDescription: translation.excerpt,
  content: editorHTML(translation.language, paragraphs, closing),
}))

async function main() {
  const existing = await prisma.contentItem.findUnique({ where: { slug }, include: { translations: true } })
  if (existing) {
    if (existing.type !== 'POST' || existing.status !== 'PUBLISHED' || translations.some(expected => {
      const actual = existing.translations.find(t => t.language === expected.language)
      return !actual || Object.entries(expected).some(([key, value]) => actual[key as keyof typeof actual] !== value)
    })) throw new Error('Existing post differs; no content was overwritten.')
    console.log('Verified existing published recap in en, sv and km. No changes needed.')
    return
  }
  const event = await prisma.event.findUnique({ where: { slug: 'pchum-ben-2026' }, select: { authorId: true } })
  if (!event) throw new Error('Pchum Ben source event not found.')
  if (!process.argv.includes('--publish')) {
    console.log(JSON.stringify({ slug, status: 'PUBLISHED', translations }, null, 2))
    console.log('Dry run only. Pass --publish to create this single post.')
    return
  }
  const post = await prisma.contentItem.create({
    data: { slug, type: 'POST', status: 'PUBLISHED', authorId: event.authorId, publishedAt: new Date(), translations: { create: translations } },
    include: { translations: { select: { language: true, title: true } } },
  })
  console.log(JSON.stringify({ id: post.id, slug: post.slug, status: post.status, translations: post.translations }, null, 2))
}

main().catch(() => { console.error('Recap seed failed; check database connectivity and whether the post already exists.'); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
