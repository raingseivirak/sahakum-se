# Seeding Guide for Sahakum Khmer CMS

This guide explains how to seed multilingual content that is compatible with the Sweden Editor (swedit-editor).

## Overview

The Sahakum Khmer CMS uses a custom Sweden Editor built with TipTap that generates specific HTML with Sweden brand-compliant CSS classes. When seeding content, it's crucial that the HTML format matches what the editor produces.

## Sweden Editor HTML Format

### Font Classes
- **Swedish/English content**: `font-sweden`
- **Khmer content**: `font-khmer`

### Typography Classes

#### Headings
```html
<h1 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Heading Text</h1>
<h2 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Subheading</h2>
<h3 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Section Title</h3>
<h4 class="font-sweden text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">Subsection</h4>
```

#### Paragraphs
```html
<p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal">Paragraph text content.</p>
```

#### Bold Text
```html
<strong class="font-semibold">Bold text</strong>
```

#### Lists
```html
<ul class="font-sweden space-y-1">
  <li class="font-sweden text-sweden-body">List item 1</li>
  <li class="font-sweden text-sweden-body">List item 2</li>
</ul>

<ol class="font-sweden space-y-1">
  <li class="font-sweden text-sweden-body">Numbered item 1</li>
  <li class="font-sweden text-sweden-body">Numbered item 2</li>
</ol>
```

#### Links
```html
<a href="https://example.com" class="text-sweden-blue hover:text-sweden-blue-navy underline">Link text</a>
```

#### Blockquotes
```html
<blockquote class="font-sweden border-l-4 border-sweden-blue pl-4 italic text-sweden-body">
  <p class="font-sweden text-sweden-body leading-sweden-base letter-spacing-sweden-normal">Quote text</p>
</blockquote>
```

#### Code
```html
<code class="bg-sweden-neutral-100 px-1 py-0.5 rounded text-sm font-mono">inline code</code>

<pre class="bg-sweden-neutral-100 p-4 rounded-md font-mono text-sm">
<code>code block</code>
</pre>
```

## Language-Specific Considerations

### Khmer Content
For Khmer language content, replace `font-sweden` with `font-khmer`:

```html
<h1 class="font-khmer text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">ចំណងជើងខ្មែរ</h1>
<p class="font-khmer text-sweden-body leading-sweden-base letter-spacing-sweden-normal">អត្ថបទខ្មែរ។</p>
<ul class="font-khmer space-y-1">
  <li class="font-khmer text-sweden-body">ចំណុច១</li>
</ul>
```

## Critical Field Names & API Standards

### Database Field Naming Conventions
**Always use these exact field names in seeding scripts and API calls:**

- ✅ `contentItemId` (NOT `contentId`)
- ✅ `active` (NOT `isActive`)
- ✅ `order` (NOT `sortOrder`)
- ✅ `uploaderId` (NOT `uploadedBy`)

### Content Format Flow Requirements

#### 1. Pre-Seeding Checklist
```bash
# Verify admin user exists
npx tsx scripts/seed-admin.ts

# Check current schema field names
npx prisma studio  # Verify actual field names in database
```

#### 2. Content Format Standards
- **ALL content must use Sweden Editor HTML format**
- **Existing markdown content requires conversion**
- **API routes must use correct field names**

#### 3. Post-Seeding Validation
```bash
# Test content loading
curl -s -o /dev/null -w "%{http_code} " http://localhost:3000/en/your-page

# Check content format in database
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.contentItem.findFirst({
  where: { slug: 'your-page' },
  include: { translations: true }
}).then(result => {
  console.log('Content preview:', result.translations[0].content.substring(0, 200));
  console.log('Has Sweden Editor format:', result.translations[0].content.includes('font-sweden'));
  process.exit(0);
});
"
```

## Database Schema

### ContentItem Structure
```typescript
{
  slug: string,           // URL-friendly identifier
  type: 'PAGE' | 'POST',  // Content type
  status: 'PUBLISHED',    // Publication status
  authorId: string,       // Reference to admin user
  publishedAt: Date,      // Publication timestamp
  translations: [         // Array of language versions
    {
      language: 'en' | 'sv' | 'km',
      title: string,
      content: string,      // Sweden Editor HTML format
      excerpt: string,
      metaDescription: string,
      seoTitle: string
    }
  ]
}
```

## Seeding Scripts

### 1. Prerequisites
Ensure admin user exists:
```bash
npx tsx scripts/seed-admin.ts
```

### 2. Basic Page Seeding

Create a seeding script following this pattern:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!admin) {
    throw new Error('Admin user not found. Run seed-admin.ts first.')
  }

  // Create page with multilingual content
  const page = await prisma.contentItem.upsert({
    where: { slug: 'page-slug' },
    update: {},
    create: {
      slug: 'page-slug',
      type: 'PAGE',
      status: 'PUBLISHED',
      authorId: admin.id,
      publishedAt: new Date(),
      translations: {
        create: [
          {
            language: 'en',
            title: 'Page Title',
            seoTitle: 'SEO Title for Search Engines',
            metaDescription: 'Meta description for SEO',
            excerpt: 'Brief excerpt about the page',
            content: generateSwedenEditorHTML('en', englishContent)
          },
          {
            language: 'sv',
            title: 'Sidans Titel',
            seoTitle: 'SEO Titel för Sökmotorer',
            metaDescription: 'Meta beskrivning för SEO',
            excerpt: 'Kort utdrag om sidan',
            content: generateSwedenEditorHTML('sv', swedishContent)
          },
          {
            language: 'km',
            title: 'ចំណងជើងទំព័រ',
            seoTitle: 'ចំណងជើង SEO សម្រាប់ម៉ាស៊ីនស្វែងរក',
            metaDescription: 'ការពណ៌នា Meta សម្រាប់ SEO',
            excerpt: 'ចំណុចសំខាន់អំពីទំព័រ',
            content: generateSwedenEditorHTML('km', khmerContent)
          }
        ]
      }
    }
  })

  console.log(`✅ Created page: ${page.slug}`)
}
```

### 3. Content Conversion Helper

```typescript
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

    // Convert remaining paragraphs
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim()
      if (!paragraph || paragraph.includes('<h') || paragraph.includes('<ul') || paragraph.includes('<ol')) {
        return paragraph
      }
      return `<p class="${fontClass} text-sweden-body leading-sweden-base letter-spacing-sweden-normal">${paragraph}</p>`
    })
    .filter(p => p)
    .join('')
}
```

## Running Seeding Scripts

### Available Scripts
```bash
# Seed admin user (run first)
npx tsx scripts/seed-admin.ts

# Seed categories and tags
npx tsx scripts/seed-categories-tags.ts

# Seed main pages (current implementation)
npx tsx scripts/seed-pages.ts

# Update existing content to Sweden Editor format
npx tsx scripts/update-pages-editor-format.ts
```

### Order of Operations
1. **Admin User**: `seed-admin.ts`
2. **Categories/Tags**: `seed-categories-tags.ts` (if needed)
3. **Content**: Your content seeding script
4. **Format Update**: Run format conversion if content wasn't created with proper format

## Content Guidelines

### Structure
- Use semantic HTML hierarchy (h1 → h2 → h3 → h4)
- Keep content well-organized with clear sections
- Include proper meta information for SEO

### Multilingual Content
- Ensure cultural appropriateness for each language
- Swedish content should follow Swedish writing conventions
- Khmer content should use proper Khmer script and cultural context
- English content should be clear and accessible

### SEO Optimization
- Unique, descriptive titles for each language
- Meta descriptions under 160 characters
- SEO titles optimized for search engines
- Relevant excerpts for content previews

## Testing Seeded Content

### Verification Steps
1. **Check database**: Verify records are created correctly
2. **Test frontend**: Visit pages in all languages
3. **Test editor**: Open pages in admin to verify editing works
4. **Validate HTML**: Ensure proper CSS classes are applied

### Test URLs
```bash
# Test page accessibility
curl -s -o /dev/null -w "%{http_code} " http://localhost:3000/en/page-slug
curl -s -o /dev/null -w "%{http_code} " http://localhost:3000/sv/page-slug
curl -s -o /dev/null -w "%{http_code} " http://localhost:3000/km/page-slug
```

### Admin Testing
1. Navigate to `/en/admin/pages`
2. Open a seeded page for editing
3. Verify content displays correctly in Sweden Editor
4. Make a small edit and save
5. Confirm formatting is preserved

## Content Format Migration & Conversion

### When Existing Content Needs Format Update

If you have existing content that's not in Sweden Editor format, follow these steps:

#### 1. Create Conversion Script Template
```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function convertToEditorFormat(content, language) {
  const fontClass = language === 'km' ? 'font-khmer' : 'font-sweden'

  // Convert markdown/basic HTML to Sweden Editor HTML format
  let editorHTML = content
    // Replace markdown headers
    .replace(/^# (.+)$/gm, `<h1 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h1>`)
    .replace(/^## (.+)$/gm, `<h2 class="${fontClass} text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight">$1</h2>`)
    // Replace bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Replace links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-sweden-blue hover:text-sweden-blue-navy underline">$1</a>')
    // Convert paragraphs
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

  return editorHTML
}

async function main() {
  // Get all content items that need conversion
  const items = await prisma.contentItem.findMany({
    where: { type: 'POST' }, // or 'PAGE'
    include: { translations: true }
  })

  for (const item of items) {
    console.log(`📝 Converting: ${item.slug}`)

    for (const translation of item.translations) {
      const updatedContent = convertToEditorFormat(translation.content, translation.language)

      await prisma.contentTranslation.update({
        where: { id: translation.id },
        data: { content: updatedContent }
      })

      console.log(`  ✅ Updated ${translation.language} translation`)
    }
  }

  console.log('✅ All content converted to Sweden Editor format!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

#### 2. API Field Name Fix

If you encounter `Unknown argument 'contentId'` errors:

```typescript
// ❌ WRONG - Old field name
await prisma.contentTranslation.deleteMany({
  where: { contentId: params.id }
})

// ✅ CORRECT - Current field name
await prisma.contentTranslation.deleteMany({
  where: { contentItemId: params.id }
})
```

**Files to check for field name issues:**
- `src/app/api/pages/[id]/route.ts`
- `src/app/api/posts/[id]/route.ts`
- `scripts/seed-*.ts` files

#### 3. Verification Steps After Conversion
```bash
# 1. Test content loads properly
curl -s -o /dev/null -w "Status: %{http_code} " http://localhost:3000/en/your-content

# 2. Check if content has proper format
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.contentItem.findFirst({
  where: { slug: 'test-slug' },
  include: { translations: { where: { language: 'en' } } }
}).then(result => {
  const content = result.translations[0].content;
  console.log('Content preview:', content.substring(0, 300));
  console.log('Has Sweden Editor format:', content.includes('font-sweden') ? '✅ YES' : '❌ NO');
  process.exit(0);
});
"

# 3. Test admin editing works
# Visit http://localhost:3000/en/admin/pages and try editing a page
```

## Troubleshooting

### Common Issues

#### Incorrect Font Classes
**Problem**: Content displays with wrong typography
**Solution**: Ensure `font-sweden` for Swedish/English, `font-khmer` for Khmer

#### Missing CSS Classes
**Problem**: Content lacks proper Sweden brand styling
**Solution**: Verify all required CSS classes are present:
- `text-sweden-heading leading-sweden-tight letter-spacing-sweden-tight` for headings
- `text-sweden-body leading-sweden-base letter-spacing-sweden-normal` for paragraphs

#### Editor Compatibility Issues
**Problem**: Content doesn't load properly in editor
**Solution**: Check that HTML structure matches TipTap expectations

#### Database Conflicts
**Problem**: Seeding fails due to existing data
**Solution**: Use `upsert` instead of `create`, or clear existing data first

### Debugging Commands
```bash
# Check existing pages
npx prisma studio

# View page content
curl -s "http://localhost:3000/api/public/pages" | jq

# Check specific page
curl -s "http://localhost:3000/en/page-slug" | grep -o 'class="[^"]*"' | head -10
```

## Best Practices

1. **Always test in all three languages** (en, sv, km)
2. **Use semantic HTML structure** for accessibility
3. **Include proper meta information** for SEO
4. **Follow Sweden brand guidelines** for typography
5. **Test editor compatibility** after seeding
6. **Use meaningful slugs** for URLs
7. **Keep content culturally appropriate** for each language
8. **Version control your seeding scripts** for reproducibility

## Example: Complete Page Seeding

See `scripts/seed-pages-final.ts` for a complete example of seeding multilingual pages with proper Sweden Editor format.

This includes:
- About page with mission, vision, history
- Cambodia heritage page with culture and traditions
- Living in Sweden guide for newcomers
- Support resources directory

Each page includes all three languages with culturally appropriate content and proper Sweden Editor HTML formatting.