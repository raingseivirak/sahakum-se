import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Template script for seeding pages with Sweden Editor compatible format
 *
 * Copy this file and modify for your specific pages.
 * This ensures proper Sweden Editor HTML formatting.
 */

// Helper function to generate Sweden Editor compatible HTML
function generateSwedenEditorHTML(language: string, content: {
  title: string
  sections: Array<{
    type: 'heading' | 'paragraph' | 'list' | 'numbered-list'
    level?: 1 | 2 | 3 | 4  // for headings
    text?: string           // for headings and paragraphs
    items?: string[]        // for lists
  }>
}): string {
  const fontClass = language === 'km' ? 'font-khmer' : 'font-sweden'

  let html = ''

  // Add main title
  html += `<h1 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">${content.title}</h1>`

  // Process sections
  content.sections.forEach(section => {
    switch (section.type) {
      case 'heading':
        const level = section.level || 2
        html += `<h${level} class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">${section.text}</h${level}>`
        break

      case 'paragraph':
        // Process inline formatting in paragraphs
        let paragraphText = section.text || ''
        // Bold text
        paragraphText = paragraphText.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        // Links
        paragraphText = paragraphText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sweden-blue hover:text-sweden-blue-navy underline">$1</a>')

        html += `<p class="${fontClass} text-sweden-body leading-sweden-base letter-spacing-sweden-normal">${paragraphText}</p>`
        break

      case 'list':
        if (section.items && section.items.length > 0) {
          html += `<ul class="${fontClass} space-y-1">`
          section.items.forEach(item => {
            // Process inline formatting in list items
            let itemText = item
            itemText = itemText.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            itemText = itemText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sweden-blue hover:text-sweden-blue-navy underline">$1</a>')

            html += `<li class="${fontClass} text-sweden-body">${itemText}</li>`
          })
          html += `</ul>`
        }
        break

      case 'numbered-list':
        if (section.items && section.items.length > 0) {
          html += `<ol class="${fontClass} space-y-1">`
          section.items.forEach(item => {
            // Process inline formatting
            let itemText = item
            itemText = itemText.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            itemText = itemText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sweden-blue hover:text-sweden-blue-navy underline">$1</a>')

            html += `<li class="${fontClass} text-sweden-body">${itemText}</li>`
          })
          html += `</ol>`
        }
        break
    }
  })

  return html
}

async function main() {
  console.log('🔄 Seeding template pages...')

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!admin) {
    throw new Error('Admin user not found. Run seed-admin.ts first.')
  }

  // Example page data structure
  const pageData = {
    slug: 'example-page',  // Change this to your page slug
    translations: {
      en: {
        title: 'Example Page Title',
        seoTitle: 'Example Page - SEO Title',
        metaDescription: 'Meta description for SEO purposes',
        excerpt: 'Brief excerpt about this page',
        content: {
          title: 'Example Page Title',
          sections: [
            {
              type: 'heading' as const,
              level: 2 as const,
              text: 'Section Heading'
            },
            {
              type: 'paragraph' as const,
              text: 'This is a paragraph with **bold text** and a [link](https://example.com).'
            },
            {
              type: 'heading' as const,
              level: 3 as const,
              text: 'Subsection'
            },
            {
              type: 'list' as const,
              items: [
                'First bullet point with **bold text**',
                'Second bullet point with [a link](https://example.com)',
                'Third bullet point'
              ]
            },
            {
              type: 'numbered-list' as const,
              items: [
                'First numbered item',
                'Second numbered item',
                'Third numbered item'
              ]
            }
          ]
        }
      },
      sv: {
        title: 'Exempel Sidtitel',
        seoTitle: 'Exempel Sida - SEO Titel',
        metaDescription: 'Meta beskrivning för SEO ändamål',
        excerpt: 'Kort utdrag om denna sida',
        content: {
          title: 'Exempel Sidtitel',
          sections: [
            {
              type: 'heading' as const,
              level: 2 as const,
              text: 'Sektionsrubrik'
            },
            {
              type: 'paragraph' as const,
              text: 'Detta är ett stycke med **fet text** och en [länk](https://example.com).'
            }
            // Add more sections as needed
          ]
        }
      },
      km: {
        title: 'ចំណងជើងទំព័រឧទាហរណ៍',
        seoTitle: 'ទំព័រឧទាហរណ៍ - ចំណងជើង SEO',
        metaDescription: 'ការពណ៌នា Meta សម្រាប់គោលបំណង SEO',
        excerpt: 'ចំណុចសំខាន់អំពីទំព័រនេះ',
        content: {
          title: 'ចំណងជើងទំព័រឧទាហរណ៍',
          sections: [
            {
              type: 'heading' as const,
              level: 2 as const,
              text: 'ចំណងជើងផ្នែក'
            },
            {
              type: 'paragraph' as const,
              text: 'នេះគឺជាកថាខណ្ឌមួយដែលមាន **អត្ថបទដិត** និង [តំណភ្ជាប់](https://example.com)។'
            }
            // Add more sections as needed
          ]
        }
      }
    }
  }

  // Create the page
  const page = await prisma.contentItem.upsert({
    where: { slug: pageData.slug },
    update: {},
    create: {
      slug: pageData.slug,
      type: 'PAGE',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            language: 'en',
            title: pageData.translations.en.title,
            seoTitle: pageData.translations.en.seoTitle,
            metaDescription: pageData.translations.en.metaDescription,
            excerpt: pageData.translations.en.excerpt,
            content: generateSwedenEditorHTML('en', pageData.translations.en.content)
          },
          {
            language: 'sv',
            title: pageData.translations.sv.title,
            seoTitle: pageData.translations.sv.seoTitle,
            metaDescription: pageData.translations.sv.metaDescription,
            excerpt: pageData.translations.sv.excerpt,
            content: generateSwedenEditorHTML('sv', pageData.translations.sv.content)
          },
          {
            language: 'km',
            title: pageData.translations.km.title,
            seoTitle: pageData.translations.km.seoTitle,
            metaDescription: pageData.translations.km.metaDescription,
            excerpt: pageData.translations.km.excerpt,
            content: generateSwedenEditorHTML('km', pageData.translations.km.content)
          }
        ]
      }
    }
  })

  console.log(`✅ Created page: ${page.slug} (${page.id})`)
  console.log('✅ Template page seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

/*
 * USAGE INSTRUCTIONS:
 *
 * 1. Copy this file to create your own seeding script:
 *    cp scripts/template-page-seeder.ts scripts/seed-my-pages.ts
 *
 * 2. Modify the pageData object with your content
 *
 * 3. Update the slug to match your desired URL
 *
 * 4. Fill in content for all three languages (en, sv, km)
 *
 * 5. Run the script:
 *    npx tsx scripts/seed-my-pages.ts
 *
 * CONTENT STRUCTURE:
 * - Use 'heading' for section titles (levels 1-4)
 * - Use 'paragraph' for regular text
 * - Use 'list' for bullet points
 * - Use 'numbered-list' for numbered items
 * - Use **text** for bold formatting
 * - Use [text](url) for links
 *
 * The script automatically applies the correct Sweden Editor CSS classes
 * based on the language and content type.
 */