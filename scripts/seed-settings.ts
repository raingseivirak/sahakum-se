import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSettings() {
  console.log('🌱 Seeding default settings...')

  const defaultSettings = [
    // Organization settings
    { key: 'org_name', value: 'Sahakum Khmer', type: 'TEXT', category: 'organization' },
    { key: 'org_description', value: 'Swedish-Cambodian Association promoting cultural exchange and community support', type: 'TEXT', category: 'organization' },
    { key: 'org_mission', value: 'To preserve Cambodian culture while building bridges between Sweden and Cambodia', type: 'TEXT', category: 'organization' },
    { key: 'org_vision', value: 'A thriving Swedish-Cambodian community that celebrates heritage and embraces integration', type: 'TEXT', category: 'organization' },

    // Contact settings
    { key: 'contact_email', value: 'contact@sahakumkhmer.se', type: 'EMAIL', category: 'contact' },
    { key: 'contact_phone', value: '+46 123 456 789', type: 'TEXT', category: 'contact' },
    { key: 'contact_address', value: 'Stockholm, Sweden', type: 'TEXT', category: 'contact' },
    { key: 'office_hours', value: 'Monday-Friday 9:00-17:00', type: 'TEXT', category: 'contact' },

    // Social media settings
    { key: 'social_facebook', value: 'https://facebook.com/sahakumkhmer', type: 'URL', category: 'social' },
    { key: 'social_instagram', value: 'https://instagram.com/sahakumkhmer', type: 'URL', category: 'social' },

    // Site settings
    { key: 'site_title', value: 'Sahakum Khmer - Swedish-Cambodian Association', type: 'TEXT', category: 'site' },
    { key: 'site_description', value: 'Official website of Sahakum Khmer, the Swedish-Cambodian Association dedicated to cultural preservation and community support', type: 'TEXT', category: 'site' },
    { key: 'default_language', value: 'sv', type: 'TEXT', category: 'site' },

    // Permission settings
    { key: 'permissions_author_edit_others', value: 'false', type: 'BOOLEAN', category: 'permissions' },
    { key: 'permissions_author_publish_direct', value: 'false', type: 'BOOLEAN', category: 'permissions' },
    { key: 'permissions_moderator_edit_others', value: 'true', type: 'BOOLEAN', category: 'permissions' },
    { key: 'permissions_moderator_publish_direct', value: 'false', type: 'BOOLEAN', category: 'permissions' },
    { key: 'content_workflow_enabled', value: 'true', type: 'BOOLEAN', category: 'permissions' },
    { key: 'content_approval_required', value: 'true', type: 'BOOLEAN', category: 'permissions' },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        type: setting.type as any,
        category: setting.category,
      },
    })
    console.log(`✅ Created/updated setting: ${setting.key}`)
  }

  console.log('🎉 Settings seeded successfully!')
}

seedSettings()
  .catch((e) => {
    console.error('❌ Error seeding settings:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })