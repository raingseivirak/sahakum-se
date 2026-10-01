import {
  BusinessLocationVisibility,
  BusinessServiceArea,
  BusinessStatus,
  PrismaClient,
} from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  ['food-catering', 'Food & catering', 'Mat & catering', 'អាហារ និងសេវាកម្មម្ហូប', 10],
  ['beauty-wellness', 'Beauty & wellness', 'Skönhet & hälsa', 'សម្រស់ និងសុខភាព', 20],
  ['shops-retail', 'Shops & retail', 'Butiker & handel', 'ហាង និងការលក់រាយ', 30],
  ['professional-services', 'Professional services', 'Professionella tjänster', 'សេវាកម្មវិជ្ជាជីវៈ', 40],
  ['home-services', 'Home services', 'Hushållstjänster', 'សេវាកម្មគេហដ្ឋាន', 50],
  ['creative-media', 'Creative & media', 'Kreativt & media', 'ច្នៃប្រឌិត និងប្រព័ន្ធផ្សព្វផ្សាយ', 60],
  ['education-training', 'Education & training', 'Utbildning & kurser', 'ការអប់រំ និងបណ្តុះបណ្តាល', 70],
  ['travel-events', 'Travel & events', 'Resor & evenemang', 'ការធ្វើដំណើរ និងព្រឹត្តិការណ៍', 80],
  ['other', 'Other', 'Övrigt', 'ផ្សេងៗ', 90],
] as const

const tags = [
  ['khmer-speaking', 'Khmer speaking'],
  ['swedish-speaking', 'Swedish speaking'],
  ['english-speaking', 'English speaking'],
  ['online', 'Online'],
  ['delivery', 'Delivery'],
  ['booking-required', 'Booking required'],
  ['family-friendly', 'Family friendly'],
] as const

type DemoBusiness = {
  slug: string
  category: string
  tagSlugs: string[]
  name: string
  summary: string
  description: string
  logoUrl: string
  phone?: string
  email: string
  website?: string
  facebookUrl?: string
  instagramUrl?: string
  address?: string
  city: string
  region?: string
  postalCode?: string
  serviceArea: BusinessServiceArea
  locationVisibility: BusinessLocationVisibility
  displayOwnerName: boolean
  featured: boolean
}

const businesses: DemoBusiness[] = [
  {
    slug: 'demo-angkor-kitchen-stockholm',
    category: 'food-catering',
    tagSlugs: ['khmer-speaking', 'swedish-speaking', 'delivery', 'family-friendly'],
    name: 'Angkor Kitchen Demo',
    summary: 'Fictional Khmer catering with family-style menus for celebrations and community events.',
    description: '<h2>Khmer flavours for every gathering</h2><p>This is a fictional demonstration listing. Angkor Kitchen Demo prepares classic Khmer dishes for private parties, associations and workplaces in the Stockholm area.</p><p>Sample services include buffet menus, vegetarian choices and delivery for larger orders.</p>',
    logoUrl: '/media/businesses/demo-angkor-kitchen.svg',
    phone: '+46 70 000 10 01',
    email: 'angkor-kitchen@example.com',
    website: 'https://example.com/angkor-kitchen',
    address: 'Exempelgatan 12',
    city: 'Stockholm',
    region: 'Stockholms län',
    postalCode: '111 22',
    serviceArea: BusinessServiceArea.LOCAL,
    locationVisibility: BusinessLocationVisibility.EXACT,
    displayOwnerName: true,
    featured: true,
  },
  {
    slug: 'demo-lotus-beauty-malmo',
    category: 'beauty-wellness',
    tagSlugs: ['khmer-speaking', 'english-speaking', 'booking-required'],
    name: 'Lotus Beauty Demo',
    summary: 'Fictional beauty studio offering relaxing treatments by appointment in Malmö.',
    description: '<h2>A calm moment in Malmö</h2><p>This fictional studio demonstrates a business whose owner has chosen to keep their name private.</p><p>Sample services include skincare, occasion makeup and wellness treatments. Advance booking is required.</p>',
    logoUrl: '/media/businesses/demo-lotus-beauty.svg',
    phone: '+46 70 000 10 02',
    email: 'lotus-beauty@example.com',
    instagramUrl: 'https://www.instagram.com/example',
    city: 'Malmö',
    region: 'Skåne län',
    serviceArea: BusinessServiceArea.LOCAL,
    locationVisibility: BusinessLocationVisibility.CITY_ONLY,
    displayOwnerName: false,
    featured: true,
  },
  {
    slug: 'demo-khmer-code-studio',
    category: 'professional-services',
    tagSlugs: ['khmer-speaking', 'swedish-speaking', 'english-speaking', 'online'],
    name: 'Khmer Code Studio Demo',
    summary: 'Fictional online web and digital support for small businesses and community groups.',
    description: '<h2>Simple digital tools for growing ideas</h2><p>This is a fictional online business listing. Khmer Code Studio Demo helps small organisations plan websites, improve accessibility and understand their digital services.</p><p>Meetings are held online in Khmer, Swedish or English.</p>',
    logoUrl: '/media/businesses/demo-khmer-code.svg',
    email: 'hello@khmer-code.example.com',
    website: 'https://example.com/khmer-code',
    city: 'Göteborg',
    region: 'Västra Götalands län',
    serviceArea: BusinessServiceArea.ONLINE,
    locationVisibility: BusinessLocationVisibility.ONLINE_ONLY,
    displayOwnerName: true,
    featured: false,
  },
  {
    slug: 'demo-mekong-home-services-uppsala',
    category: 'home-services',
    tagSlugs: ['khmer-speaking', 'swedish-speaking', 'booking-required'],
    name: 'Mekong Home Services Demo',
    summary: 'Fictional home help and small maintenance service for households around Uppsala.',
    description: '<h2>Practical help close to home</h2><p>This fictional listing shows a local service business. Example work includes furniture assembly, seasonal garden help and simple household tasks.</p><p>Customers can request an estimate before making a booking.</p>',
    logoUrl: '/media/businesses/demo-mekong-home.svg',
    phone: '+46 70 000 10 04',
    email: 'mekong-home@example.com',
    city: 'Uppsala',
    region: 'Uppsala län',
    serviceArea: BusinessServiceArea.LOCAL,
    locationVisibility: BusinessLocationVisibility.CITY_ONLY,
    displayOwnerName: false,
    featured: false,
  },
  {
    slug: 'demo-dara-creative-vasteras',
    category: 'creative-media',
    tagSlugs: ['khmer-speaking', 'english-speaking', 'booking-required'],
    name: 'Dara Creative Media Demo',
    summary: 'Fictional photography and visual storytelling for families, events and local brands.',
    description: '<h2>Stories in pictures</h2><p>This fictional creative business demonstrates a listing with portfolio-style contact links. Sample work includes family portraits, event photography and social media content.</p>',
    logoUrl: '/media/businesses/demo-dara-creative.svg',
    phone: '+46 70 000 10 05',
    email: 'dara-creative@example.com',
    website: 'https://example.com/dara-creative',
    facebookUrl: 'https://www.facebook.com/example',
    city: 'Västerås',
    region: 'Västmanlands län',
    serviceArea: BusinessServiceArea.LOCAL,
    locationVisibility: BusinessLocationVisibility.CITY_ONLY,
    displayOwnerName: true,
    featured: false,
  },
  {
    slug: 'demo-srok-khmer-shop',
    category: 'shops-retail',
    tagSlugs: ['khmer-speaking', 'swedish-speaking', 'online', 'delivery'],
    name: 'Srok Khmer Shop Demo',
    summary: 'Fictional online shop delivering Khmer pantry staples and gifts across Sweden.',
    description: '<h2>A little piece of Cambodia, delivered</h2><p>This fictional nationwide listing shows how an online shop can appear in Khmer Connections. The sample catalogue includes pantry goods, books and celebration gifts.</p><p>Delivery is available across Sweden.</p>',
    logoUrl: '/media/businesses/demo-srok-shop.svg',
    email: 'shop@srok-khmer.example.com',
    website: 'https://example.com/srok-khmer',
    city: 'Sweden',
    serviceArea: BusinessServiceArea.NATIONWIDE,
    locationVisibility: BusinessLocationVisibility.ONLINE_ONLY,
    displayOwnerName: false,
    featured: true,
  },
]

async function main() {
  console.log('Seeding Khmer Connections demo data...')

  const owner = await prisma.member.upsert({
    where: { memberNumber: 'KC-DEMO-001' },
    update: {
      firstName: 'Sophea',
      lastName: 'Demo',
      active: true,
    },
    create: {
      memberNumber: 'KC-DEMO-001',
      firstName: 'Sophea',
      lastName: 'Demo',
      firstNameKhmer: 'សុភា',
      email: 'khmer.connections.demo@example.com',
      city: 'Stockholm',
      country: 'Sweden',
      active: true,
      skills: [],
      interests: [],
    },
  })

  const categoryIds = new Map<string, string>()
  for (const [slug, nameEn, nameSv, nameKm, order] of categories) {
    const category = await prisma.businessCategory.upsert({
      where: { slug },
      update: { nameEn, nameSv, nameKm, order, active: true },
      create: { slug, nameEn, nameSv, nameKm, order, active: true },
    })
    categoryIds.set(slug, category.id)
  }

  const tagIds = new Map<string, string>()
  for (const [slug, name] of tags) {
    const tag = await prisma.businessTag.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    })
    tagIds.set(slug, tag.id)
  }

  for (const demo of businesses) {
    const categoryId = categoryIds.get(demo.category)
    if (!categoryId) throw new Error(`Missing category: ${demo.category}`)

    const assignments = demo.tagSlugs.map((slug) => {
      const tagId = tagIds.get(slug)
      if (!tagId) throw new Error(`Missing tag: ${slug}`)
      return { tagId }
    })

    const data = {
      ownerId: owner.id,
      categoryId,
      name: demo.name,
      summary: demo.summary,
      description: demo.description,
      logoUrl: demo.logoUrl,
      images: [],
      phone: demo.phone ?? null,
      email: demo.email,
      website: demo.website ?? null,
      facebookUrl: demo.facebookUrl ?? null,
      instagramUrl: demo.instagramUrl ?? null,
      address: demo.address ?? null,
      city: demo.city,
      region: demo.region ?? null,
      postalCode: demo.postalCode ?? null,
      country: 'Sweden',
      serviceArea: demo.serviceArea,
      locationVisibility: demo.locationVisibility,
      displayOwnerName: demo.displayOwnerName,
      status: BusinessStatus.APPROVED,
      reviewNote: null,
      reviewedAt: new Date(),
      reviewedById: null,
      featured: demo.featured,
      publishedAt: new Date(),
    }

    await prisma.business.upsert({
      where: { slug: demo.slug },
      update: {
        ...data,
        tags: { deleteMany: {}, create: assignments },
      },
      create: {
        slug: demo.slug,
        ...data,
        tags: { create: assignments },
      },
    })
    console.log(`  ✓ ${demo.name}`)
  }

  console.log(`Seeded ${businesses.length} fictional businesses.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
