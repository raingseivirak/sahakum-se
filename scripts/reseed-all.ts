#!/usr/bin/env tsx
/**
 * Complete Database Reseeding Script
 * Run this after database migration to restore all content
 */

import { execSync } from 'child_process'

const scripts = [
  {
    name: 'Admin User',
    command: 'npx tsx scripts/seed-admin.ts',
    description: 'Creates admin user (admin@sahakumkhmer.se)',
    status: '✅ Working'
  },
  {
    name: 'Services',
    command: 'npx tsx scripts/seed-services.ts',
    description: 'Seeds service offerings and content',
    status: '✅ Working'
  },
  {
    name: 'Pages Content',
    command: 'npx tsx scripts/seed-pages-final.ts',
    description: 'Seeds main pages (About, Cambodia, Living, Support)',
    status: '✅ Working'
  },
  {
    name: 'Original Blog Post',
    command: 'npx tsx scripts/seed-personnummer-blog.ts',
    description: 'Seeds the detailed Personnummer guide',
    status: '✅ Working'
  },
  {
    name: 'Additional Blog Articles',
    command: 'npx tsx scripts/seed-blog-articles.ts',
    description: 'Seeds 5 practical blog articles',
    status: '✅ Working'
  },
  {
    name: 'Categories & Tags',
    command: 'npx tsx scripts/seed-categories-tags.ts',
    description: 'Seeds blog categories and tags for Cambodian Community',
    status: '✅ Working'
  },
  {
    name: 'Settings',
    command: 'npx tsx scripts/seed-settings.ts',
    description: 'Seeds organization settings and configuration',
    status: '✅ Working'
  }
]

const brokenScripts = [
  {
    name: 'Members',
    command: 'npx tsx scripts/seed-members.ts',
    description: 'Organization members',
    status: '❌ Broken - uses old schema fields'
  }
]

async function runScript(script: any) {
  console.log(`\n🌱 ${script.name}`)
  console.log(`📄 ${script.description}`)
  console.log(`⚡ Running: ${script.command}`)

  try {
    execSync(script.command, { stdio: 'inherit' })
    console.log(`✅ ${script.name} completed successfully`)
  } catch (error) {
    console.error(`❌ ${script.name} failed:`, error)
    throw error
  }
}

async function main() {
  console.log('🚀 Starting Complete Database Reseeding...')
  console.log('=' .repeat(60))

  // Run working scripts in order
  for (const script of scripts) {
    await runScript(script)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Brief pause between scripts
  }

  console.log('\n' + '=' .repeat(60))
  console.log('🎉 All seeding completed successfully!')
  console.log('\n📊 Seeded Content Summary:')
  scripts.forEach(script => {
    console.log(`   ✅ ${script.name} - ${script.description}`)
  })

  console.log('\n⚠️  Broken Scripts (skip for now):')
  brokenScripts.forEach(script => {
    console.log(`   ${script.status} ${script.name} - ${script.description}`)
  })

  console.log('\n🔑 Admin Login:')
  console.log('   Email: admin@sahakumkhmer.se')
  console.log('   Password: HelloCambodia123')

  console.log('\n🌐 Available Content:')
  console.log('   - Homepage with services section')
  console.log('   - About Us, Cambodia, Living in Sweden, Support Resources pages')
  console.log('   - 6 blog articles (1 detailed + 5 practical guides)')
  console.log('   - 10 categories (News, Events, Culture, Integration, Community + subcategories)')
  console.log('   - 24 tags (languages, festivals, culture, integration, community)')
  console.log('   - Organization settings (contact info, social media, site config)')
  console.log('   - Multilingual support (EN/SV/KM)')
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('\n💥 Reseeding failed:', error.message)
      process.exit(1)
    })
}

export { main as reseedAll }