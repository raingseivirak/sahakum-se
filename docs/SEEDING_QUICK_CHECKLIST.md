# Seeding Quick Checklist

## ⚡ Before You Start

```bash
# 1. Verify admin user exists
npx tsx scripts/seed-admin.ts

# 2. Check database is up and schema is current
npm run db:push
```

## 🎯 Critical Field Names (ALWAYS USE THESE)

- ✅ `contentItemId` (NOT `contentId`)
- ✅ `active` (NOT `isActive`)
- ✅ `order` (NOT `sortOrder`)
- ✅ `uploaderId` (NOT `uploadedBy`)

## 📝 Sweden Editor HTML Format Template

```typescript
function generateSwedenEditorHTML(language: string, content: string): string {
  const fontClass = language === 'km' ? 'font-khmer' : 'font-sweden'

  return content
    .replace(/^# (.+)$/gm, `<h1 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h1>`)
    .replace(/^## (.+)$/gm, `<h2 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h2>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sweden-blue hover:text-sweden-blue-navy underline">$1</a>')
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim()
      if (!paragraph || paragraph.includes('<h') || paragraph.includes('<ul')) {
        return paragraph
      }
      return `<p class="${fontClass} text-sweden-body leading-sweden-base letter-spacing-sweden-normal">${paragraph}</p>`
    })
    .filter(p => p)
    .join('\n\n')
}
```

## 🚀 Basic Seeding Script Template

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('Admin user not found. Run seed-admin.ts first.')

  await prisma.contentItem.upsert({
    where: { slug: 'your-slug' },
    update: {},
    create: {
      slug: 'your-slug',
      type: 'PAGE', // or 'POST'
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            language: 'en',
            title: 'English Title',
            content: generateSwedenEditorHTML('en', `# English Content\n\nYour content here.`),
            excerpt: 'Brief description',
            metaDescription: 'SEO description',
            seoTitle: 'SEO Title'
          },
          {
            language: 'sv',
            title: 'Svensk Titel',
            content: generateSwedenEditorHTML('sv', `# Svenskt Innehåll\n\nDitt innehåll här.`),
            excerpt: 'Kort beskrivning',
            metaDescription: 'SEO beskrivning',
            seoTitle: 'SEO Titel'
          },
          {
            language: 'km',
            title: 'ចំណងជើងខ្មែរ',
            content: generateSwedenEditorHTML('km', `# ខ្លឹមសារខ្មែរ\n\nខ្លឹមសាររបស់អ្នកនៅទីនេះ។`),
            excerpt: 'ការពិពណ៌នាខ្លី',
            metaDescription: 'ការពិពណ៌នា SEO',
            seoTitle: 'ចំណងជើង SEO'
          }
        ]
      }
    }
  })

  console.log('✅ Content seeded successfully')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

## ✅ Post-Seeding Verification

```bash
# 1. Test all languages load
curl -s -o /dev/null -w "EN: %{http_code} " http://localhost:3000/en/your-slug
curl -s -o /dev/null -w "SV: %{http_code} " http://localhost:3000/sv/your-slug
curl -s -o /dev/null -w "KM: %{http_code} " http://localhost:3000/km/your-slug

# 2. Verify content format
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.contentItem.findFirst({
  where: { slug: 'your-slug' },
  include: { translations: { where: { language: 'en' } } }
}).then(result => {
  console.log('Has Sweden Editor format:', result.translations[0].content.includes('font-sweden') ? '✅ YES' : '❌ NO');
  process.exit(0);
});
"

# 3. Test admin editing
# Visit http://localhost:3000/en/admin/pages and edit a page
```

## 🔧 If You Need to Convert Existing Content

```bash
# Create conversion script (see docs/SEEDING_GUIDE.md for template)
# Run conversion for posts
node your-conversion-script.js

# Verify conversion worked
curl -s -o /dev/null -w "Converted content: %{http_code} " http://localhost:3000/en/your-content
```

## 📚 Full Documentation

- Complete guide: `docs/SEEDING_GUIDE.md`
- Script examples: `scripts/seed-*.ts`
- API documentation: `docs/SYSTEM_STATUS.md`