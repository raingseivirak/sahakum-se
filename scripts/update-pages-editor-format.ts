import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to convert markdown-style content to Sweden Editor HTML format
function convertToEditorFormat(content: string, language: string): string {
  const fontClass = language === 'km' ? 'font-khmer' : 'font-sweden'

  // Convert content to Sweden Editor HTML format
  let editorHTML = content
    // Replace markdown headers with Sweden Editor heading format
    .replace(/^# (.+)$/gm, `<h1 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h1>`)
    .replace(/^## (.+)$/gm, `<h2 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h2>`)
    .replace(/^### (.+)$/gm, `<h3 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h3>`)
    .replace(/^#### (.+)$/gm, `<h4 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h4>`)

    // Replace markdown bold with Sweden Editor bold format
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')

    // Replace markdown links with Sweden Editor link format
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sweden-blue hover:text-sweden-blue-navy underline">$1</a>')

    // Replace markdown lists with Sweden Editor list format
    .replace(/^- (.+)$/gm, `<li class="${fontClass} text-sweden-body">$1</li>`)

    // Wrap list items in proper ul tags
    .replace(/(<li[^>]*>.*<\/li>)/gs, (match) => {
      const listItems = match.split('</li>').filter(item => item.includes('<li')).map(item => item + '</li>').join('')
      return `<ul class="${fontClass} space-y-1">${listItems}</ul>`
    })

    // Replace remaining paragraphs
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim()
      if (!paragraph) return ''

      // Skip if already has HTML tags
      if (paragraph.includes('<h') || paragraph.includes('<ul') || paragraph.includes('<li')) {
        return paragraph
      }

      // Convert to paragraph with Sweden Editor styling
      return `<p class="${fontClass} text-sweden-body leading-sweden-base letter-spacing-sweden-normal">${paragraph}</p>`
    })
    .filter(p => p)
    .join('\n\n')

  return editorHTML
}

async function main() {
  console.log('🔄 Updating pages to use Sweden Editor HTML format...')

  // Get all pages
  const pages = await prisma.contentItem.findMany({
    where: { type: 'PAGE' },
    include: {
      translations: true
    }
  })

  for (const page of pages) {
    console.log(`📝 Updating page: ${page.slug}`)

    for (const translation of page.translations) {
      const updatedContent = convertToEditorFormat(translation.content, translation.language)

      await prisma.contentTranslation.update({
        where: { id: translation.id },
        data: {
          content: updatedContent
        }
      })

      console.log(`  ✅ Updated ${translation.language} translation`)
    }
  }

  console.log('✅ All pages updated to Sweden Editor format!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })