import { prisma } from '../src/lib/prisma'

async function seedActivityLogs() {
  console.log('🏃 Seeding activity logs...')

  try {
    // First, get the admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!adminUser) {
      console.log('❌ No admin user found. Please run seed-admin script first.')
      return
    }

    console.log(`📋 Found admin user: ${adminUser.email}`)

    // Create sample activity logs
    const activityLogs = [
      {
        userId: adminUser.id,
        action: 'page.created',
        resourceType: 'PAGE',
        resourceId: 'sample-page-1',
        description: 'Created page: "About Us"',
        newValues: { title: 'About Us', slug: 'about-us' },
        metadata: { language: 'en' }
      },
      {
        userId: adminUser.id,
        action: 'page.updated',
        resourceType: 'PAGE',
        resourceId: 'sample-page-2',
        description: 'Updated page: "Living in Sweden" (title, content)',
        oldValues: { title: 'Old Title' },
        newValues: { title: 'Living in Sweden' },
        metadata: { changedFields: ['title', 'content'], language: 'en' }
      },
      {
        userId: adminUser.id,
        action: 'post.created',
        resourceType: 'POST',
        resourceId: 'sample-post-1',
        description: 'Created post: "How to Apply for Personnummer"',
        newValues: { title: 'How to Apply for Personnummer', status: 'PUBLISHED' },
        metadata: { language: 'en' }
      },
      {
        userId: adminUser.id,
        action: 'auth.login',
        resourceType: 'AUTH',
        description: 'User login: admin@sahakumkhmer.se',
        metadata: { email: adminUser.email, loginMethod: 'credentials' }
      },
      {
        userId: adminUser.id,
        action: 'user.created',
        resourceType: 'USER',
        resourceId: 'sample-user-1',
        description: 'Created user: "John Doe"',
        newValues: { name: 'John Doe', email: 'john@example.com', role: 'AUTHOR' }
      },
      {
        userId: adminUser.id,
        action: 'membership.approved',
        resourceType: 'MEMBERSHIP_REQUEST',
        resourceId: 'sample-request-1',
        description: 'Approved membership request from: "Jane Smith"',
        metadata: { applicantName: 'Jane Smith', reviewerNotes: 'All requirements met' }
      },
      {
        userId: adminUser.id,
        action: 'settings.updated',
        resourceType: 'SETTINGS',
        resourceId: 'site-title',
        description: 'Updated setting: "site-title"',
        oldValues: { 'site-title': 'Old Site Title' },
        newValues: { 'site-title': 'Sahakum Khmer Community' }
      },
      {
        userId: adminUser.id,
        action: 'media.uploaded',
        resourceType: 'MEDIA',
        resourceId: 'sample-image-1',
        description: 'Uploaded media: "hero-image.jpg"',
        newValues: { filename: 'hero-image.jpg', size: 1024000, type: 'image/jpeg' }
      }
    ]

    // Insert activity logs with some time spacing
    for (let i = 0; i < activityLogs.length; i++) {
      const activityData = {
        ...activityLogs[i],
        createdAt: new Date(Date.now() - (i * 2 * 60 * 60 * 1000)), // 2 hours apart
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Test Script)'
      }

      await prisma.activityLog.create({
        data: activityData
      })

      console.log(`✅ Created activity: ${activityData.description}`)
    }

    console.log('🎉 Activity logs seeded successfully!')

    // Display summary
    const totalActivities = await prisma.activityLog.count()
    console.log(`📊 Total activities in database: ${totalActivities}`)

  } catch (error) {
    console.error('❌ Error seeding activity logs:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedActivityLogs()