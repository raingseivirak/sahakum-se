import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const slug = 'pchum-ben-2026'

const khmerContent = `<p>សមាគមសហគមន៍ខ្មែរស៊ុយអែត មានកិត្តិយសសូមជម្រាបជូនលោក លោកស្រី ពុទ្ធបរិស័ទ និងញាតិមិត្តជិតឆ្ងាយទាំងអស់ឱ្យបានជ្រាបថា សមាគមនឹងរៀបចំពិធីបុណ្យភ្ជុំបិណ្ឌតាមទំនៀមទម្លាប់ប្រពៃណីជាតិខ្មែរ ដើម្បីឧទ្ទិសកុសលផលបុណ្យជូនដល់បុព្វការីជន មាតាបិតា ជីដូនជីតា និងញាតិកាទាំង ៧ សន្តាន ដែលបានចែកឋានទៅកាន់លោកខាងមុខ។</p>
<p>សូមគោរពអញ្ជើញលោក លោកស្រី ពុទ្ធបរិស័ទ និងញាតិមិត្តទាំងអស់ចូលរួមក្នុងកម្មវិធីបុណ្យនេះ និងចូលរួមអនុមោទនាទទួលយកផលបុណ្យតាមសេចក្តីជ្រះថ្លា។</p>
<h2>កម្មវិធីបុណ្យ</h2>
<p><strong>ថ្ងៃសៅរ៍ ទី១៧ ខែតុលា ឆ្នាំ២០២៦</strong></p>
<p><strong>ទីកន្លែង:</strong> Kvarnvägen 4, 177 64 Järfälla, Stockholm</p>
<ul>
<li><strong>១០:០០</strong> — ជួបជុំពុទ្ធបរិស័ទ និងញាតិមិត្តជិតឆ្ងាយ</li>
<li><strong>១០:៣០</strong> — ប្រារព្ធបទនមស្ការ សមាទានសីល រាប់បាត្រ និងវេរភត្តាហារប្រគេនព្រះសង្ឃ</li>
<li><strong>១២:៣០</strong> — ទទួលទានភោជនាហារថ្ងៃត្រង់</li>
<li><strong>១៤:០០</strong> — បង្សុកូលឧទ្ទិសកុសល ចម្រើនព្រះបរិត្ត និងស្តាប់ព្រះធម្មទេសនា</li>
<li><strong>១៥:០០</strong> — ចប់កម្មវិធីបុណ្យ</li>
<li><strong>១៥:១៥</strong> — ប្រជុំវិសេសរយៈពេល ៣០ នាទី សម្រាប់សមាជិកសមាគមសហគមន៍ខ្មែរតែប៉ុណ្ណោះ</li>
</ul>`

const swedishContent = `<p>Sahakumkhmer – Khmeriska Samfundet i Sverige har äran att bjuda in alla buddhister, damer och herrar samt nära och kära till årets Pchum Ben-ceremoni enligt khmerisk tradition.</p>
<p>Ceremonin hålls för att överlämna förtjänst och god karma till våra förfäder, föräldrar, mor- och farföräldrar samt släktingar i de sju generationerna som har gått bort. Vi välkomnar er att delta och ta del av den merit som skapas i en anda av respekt och klarhet.</p>
<h2>Program för ceremonin</h2>
<p><strong>Lördag 17 oktober 2026</strong></p>
<p><strong>Plats:</strong> Kvarnvägen 4, 177 64 Järfälla, Stockholm</p>
<ul>
<li><strong>10:00</strong> — Samling med buddhister och nära vänner</li>
<li><strong>10:30</strong> — Inledande böner, föreskrifter, matoffer och gåvor till munkarna</li>
<li><strong>12:30</strong> — Gemensam lunch</li>
<li><strong>14:00</strong> — Bangsokul-ceremoni, meritöverföring, välsignelser och dharma-predikan</li>
<li><strong>15:00</strong> — Ceremonin avslutas</li>
<li><strong>15:15</strong> — Extra möte i 30 minuter, endast för medlemmar i Sahakumkhmer</li>
</ul>
<p>Tack!</p>`

const englishContent = `<p>Sahakumkhmer – the Khmer Association in Sweden warmly invites Buddhists, families, friends and the wider community to this year's Pchum Ben ceremony, held according to Khmer tradition.</p>
<p>The ceremony is held to dedicate merit and good karma to our ancestors, parents, grandparents and relatives across the seven generations who have passed away. Everyone is welcome to attend and share in the merit created in a spirit of respect and devotion.</p>
<h2>Ceremony programme</h2>
<p><strong>Saturday, 17 October 2026</strong></p>
<p><strong>Location:</strong> Kvarnvägen 4, 177 64 Järfälla, Stockholm</p>
<ul>
<li><strong>10:00</strong> — Gathering with Buddhists, families and friends</li>
<li><strong>10:30</strong> — Opening prayers, taking the precepts, alms round and food offerings to the monks</li>
<li><strong>12:30</strong> — Lunch</li>
<li><strong>14:00</strong> — Bangsokul ceremony, dedication of merit, blessings and Dharma sermon</li>
<li><strong>15:00</strong> — Ceremony ends</li>
<li><strong>15:15</strong> — Special 30-minute meeting for Sahakumkhmer members only</li>
</ul>
<p>Thank you!</p>`

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!admin) throw new Error('Admin user not found. Please run seed-admin.ts first.')

  const startDate = new Date('2026-10-17T10:00:00+02:00')
  const endDate = new Date('2026-10-17T15:45:00+02:00')

  const event = await prisma.event.upsert({
    where: { slug },
    update: {
      startDate,
      endDate,
      allDay: false,
      locationType: 'PHYSICAL',
      venueName: 'Kvarnvägen 4',
      address: 'Kvarnvägen 4',
      postalCode: '177 64',
      city: 'Järfälla',
      country: 'Sweden',
      registrationEnabled: false,
      isFree: true,
      organizer: 'Sahakumkhmer – Khmeriska Samfundet i Sverige',
      contactEmail: 'contact.sahakumkhmer.se@gmail.com',
      featuredImg: '/media/images/pchum-ben-2026.png',
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    create: {
      slug,
      startDate,
      endDate,
      allDay: false,
      locationType: 'PHYSICAL',
      venueName: 'Kvarnvägen 4',
      address: 'Kvarnvägen 4',
      postalCode: '177 64',
      city: 'Järfälla',
      country: 'Sweden',
      registrationEnabled: false,
      isFree: true,
      organizer: 'Sahakumkhmer – Khmeriska Samfundet i Sverige',
      contactEmail: 'contact.sahakumkhmer.se@gmail.com',
      featuredImg: '/media/images/pchum-ben-2026.png',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: admin.id,
    },
  })

  for (const translation of [
    {
      language: 'en',
      title: 'Pchum Ben Ceremony 2026',
      content: englishContent,
      excerpt: 'Everyone is welcome to Sahakumkhmer\'s Pchum Ben ceremony in Järfälla on Saturday, 17 October 2026.',
      seoTitle: 'Pchum Ben Ceremony 2026 | Sahakumkhmer',
      metaDescription: 'Sahakumkhmer\'s Pchum Ben ceremony takes place on Saturday, 17 October 2026 at Kvarnvägen 4 in Järfälla.',
    },
    {
      language: 'km',
      title: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ ២០២៦',
      content: khmerContent,
      excerpt: 'សូមអញ្ជើញចូលរួមពិធីបុណ្យភ្ជុំបិណ្ឌតាមប្រពៃណីខ្មែរ នៅថ្ងៃទី១៧ ខែតុលា ឆ្នាំ២០២៦ នៅ Järfälla។',
      seoTitle: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ ២០២៦ | Sahakumkhmer',
      metaDescription: 'ពិធីបុណ្យភ្ជុំបិណ្ឌរបស់សមាគមសហគមន៍ខ្មែរស៊ុយអែត នៅថ្ងៃទី១៧ ខែតុលា ឆ្នាំ២០២៦ នៅ Kvarnvägen 4, Järfälla។',
    },
    {
      language: 'sv',
      title: 'Pchum Ben-ceremoni 2026',
      content: swedishContent,
      excerpt: 'Välkommen till Sahakumkhmers Pchum Ben-ceremoni i Järfälla lördagen den 17 oktober 2026.',
      seoTitle: 'Pchum Ben-ceremoni 2026 | Sahakumkhmer',
      metaDescription: 'Sahakumkhmers Pchum Ben-ceremoni hålls lördagen den 17 oktober 2026 på Kvarnvägen 4 i Järfälla.',
    },
  ]) {
    await prisma.eventTranslation.upsert({
      where: { eventId_language: { eventId: event.id, language: translation.language } },
      update: translation,
      create: { ...translation, event: { connect: { id: event.id } } },
    })
  }

  console.log(`Published event ${event.slug} (${event.id}) with Khmer and Swedish translations.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
