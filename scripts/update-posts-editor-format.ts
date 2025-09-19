import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to convert markdown-style content to Sweden Editor HTML format
function convertToEditorFormat(content: string, language: string): string {
  const fontClass = language === 'km' ? 'font-khmer' : 'font-sweden'

  // If content already has proper Sweden Editor format, return as is
  if (content.includes('text-sweden-heading') && content.includes('text-sweden-body')) {
    return content
  }

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

    // Process line by line for better list and paragraph handling
    .split('\n')
    .map(line => {
      line = line.trim()
      if (!line) return ''

      // Skip lines that already have HTML tags
      if (line.includes('<h') || line.includes('<p') || line.includes('<ul') || line.includes('<li')) {
        return line
      }

      // Handle bullet lists
      if (line.startsWith('- ')) {
        const text = line.substring(2).trim()
        return `<li class="${fontClass} text-sweden-body">${text}</li>`
      }

      // Handle numbered lists
      const numberedMatch = line.match(/^\d+\.\s+(.+)$/)
      if (numberedMatch) {
        const text = numberedMatch[1].trim()
        return `<li class="${fontClass} text-sweden-body">${text}</li>`
      }

      // Convert remaining lines to paragraphs
      if (line) {
        return `<p class="${fontClass} text-sweden-body leading-sweden-base letter-spacing-sweden-normal">${line}</p>`
      }

      return ''
    })
    .filter(line => line)
    .join('')

  // Wrap consecutive list items in proper ul tags
  editorHTML = editorHTML.replace(/(<li[^>]*>.*?<\/li>)+/g, (match) => {
    return `<ul class="${fontClass} space-y-1">${match}</ul>`
  })

  return editorHTML
}

async function main() {
  console.log('🔄 Updating blog posts to use Sweden Editor HTML format...')

  // Get all blog posts
  const posts = await prisma.contentItem.findMany({
    where: { type: 'POST' },
    include: {
      translations: true
    }
  })

  for (const post of posts) {
    console.log(`📝 Updating post: ${post.slug}`)

    for (const translation of post.translations) {
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

  console.log('✅ All blog posts updated to Sweden Editor format!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })