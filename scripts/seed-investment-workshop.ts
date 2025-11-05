import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Investment Workshop Events...')

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: {
      role: 'ADMIN'
    }
  })

  if (!admin) {
    throw new Error('Admin user not found. Please run seed-admin.ts first.')
  }

  console.log('Admin user found:', admin.email)

  // Event 1: Saturday November 1, 2025 at 18:00
  const event1 = await prisma.event.create({
    data: {
      slug: 'investment-workshop-nov-1-2025',
      startDate: new Date('2025-11-01T18:00:00+01:00'), // 6:00 PM Swedish time (UTC+1)
      endDate: new Date('2025-11-01T20:00:00+01:00'),   // 8:00 PM (assuming 2 hour workshop)
      allDay: false,
      locationType: 'VIRTUAL',
      virtualUrl: 'https://www.facebook.com/profile.php?id=61580379945977',
      registrationEnabled: false, // No registration needed
      isFree: true,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: admin.id,
      organizer: 'Sahakum Khmer',
      contactEmail: 'contact.sahakumkhmer.se@gmail.com',
      translations: {
        create: [
          {
            language: 'en',
            title: 'How to be an investor and invest safely for beginners',
            content: `<h2>Workshop: How to be an investor and invest safely for beginners</h2>
<p>Join us this Saturday for an educational workshop on investment basics!</p>

<h3>What you'll learn:</h3>
<ul>
<li>Investment fundamentals for beginners</li>
<li>How to invest safely and minimize risks</li>
<li>Different investment options available</li>
<li>Building a diversified portfolio</li>
<li>Common mistakes to avoid</li>
</ul>

<h3>Details:</h3>
<ul>
<li><strong>When:</strong> Saturday, November 1st at 6:00 PM</li>
<li><strong>Duration:</strong> Approximately 2 hours</li>
<li><strong>Format:</strong> Virtual workshop via Facebook</li>
<li><strong>Cost:</strong> FREE</li>
<li><strong>Registration:</strong> Not required - just join!</li>
</ul>

<p>This is the same workshop offered on both Saturday and Sunday. You can attend either session, or both if you'd like to hear it again!</p>

<p><strong>How to join:</strong> Visit our <a href="https://www.facebook.com/profile.php?id=61580379945977" target="_blank">Facebook page</a> at the scheduled time.</p>`,
            excerpt: 'Free virtual workshop for beginners on how to invest safely. Join us Saturday, November 1st at 6:00 PM via Facebook.',
            metaDescription: 'Join our free virtual workshop on investment basics for beginners. Learn how to invest safely and build a diversified portfolio. No registration required.',
            seoTitle: 'Investment Workshop for Beginners | Sahakum Khmer'
          },
          {
            language: 'sv',
            title: 'Hur man blir investerare och investerar säkert för nybörjare',
            content: `<h2>Workshop: Hur man blir investerare och investerar säkert för nybörjare</h2>
<p>Gå med oss denna lördag för en utbildande workshop om investeringsgrunderna!</p>

<h3>Vad du kommer att lära dig:</h3>
<ul>
<li>Investeringsgrunder för nybörjare</li>
<li>Hur man investerar säkert och minimerar risker</li>
<li>Olika investeringsalternativ som finns tillgängliga</li>
<li>Bygga en diversifierad portfölj</li>
<li>Vanliga misstag att undvika</li>
</ul>

<h3>Detaljer:</h3>
<ul>
<li><strong>När:</strong> Lördag 1 november kl. 18:00</li>
<li><strong>Varaktighet:</strong> Cirka 2 timmar</li>
<li><strong>Format:</strong> Virtuell workshop via Facebook</li>
<li><strong>Kostnad:</strong> GRATIS</li>
<li><strong>Anmälan:</strong> Krävs inte - bara gå med!</li>
</ul>

<p>Detta är samma workshop som erbjuds både på lördag och söndag. Du kan delta i endera sessionen, eller båda om du vill höra det igen!</p>

<p><strong>Hur man går med:</strong> Besök vår <a href="https://www.facebook.com/profile.php?id=61580379945977" target="_blank">Facebook-sida</a> vid schemalagd tid.</p>`,
            excerpt: 'Gratis virtuell workshop för nybörjare om hur man investerar säkert. Gå med oss lördag 1 november kl. 18:00 via Facebook.',
            metaDescription: 'Delta i vår gratis virtuella workshop om investeringsgrunder för nybörjare. Lär dig hur man investerar säkert och bygger en diversifierad portfölj.',
            seoTitle: 'Investeringsworkshop för Nybörjare | Sahakum Khmer'
          },
          {
            language: 'km',
            title: 'របៀបក្លាយជាអ្នកវិនិយោគ និងវិនិយោគដោយសុវត្ថិភាពសម្រាប់អ្នកចាប់ផ្តើមដំបូង',
            content: `<h2>សិក្ខាសាលា៖ របៀបក្លាយជាអ្នកវិនិយោគ និងវិនិយោគដោយសុវត្ថិភាពសម្រាប់អ្នកចាប់ផ្តើមដំបូង</h2>
<p>សួស្តី! សិក្ខាសាលាស្តីអំពី របៀបក្លាយជាអ្នកវិនិយោគនេះ មាននៅសប្តាហ៍នេះ គឺថ្ងៃសៅរ៍ ទី១ ខែវិច្ឆិកា វេលាម៉ោង ៦:០០។</p>

<h3>អ្វីដែលអ្នកនឹងរៀន៖</h3>
<ul>
<li>គោលការណ៍មូលដ្ឋាននៃការវិនិយោគសម្រាប់អ្នកចាប់ផ្តើម</li>
<li>របៀបវិនិយោគដោយសុវត្ថិភាព និងកាត់បន្ថយហានិភ័យ</li>
<li>ជម្រើសវិនិយោគផ្សេងៗដែលមាន</li>
<li>ការបង្កើតផលប័ត្រចម្រុះ</li>
<li>កំហុសទូទៅដែលត្រូវជៀសវាង</li>
</ul>

<h3>ព័ត៌មានលម្អិត៖</h3>
<ul>
<li><strong>ពេលវេលា៖</strong> ថ្ងៃសៅរ៍ ទី១ ខែវិច្ឆិកា វេលាម៉ោង ៦:០០ ល្ងាច</li>
<li><strong>រយៈពេល៖</strong> ប្រហែល ២ ម៉ោង</li>
<li><strong>ទម្រង់៖</strong> សិក្ខាសាលាតាមអនឡាញតាមរយៈ Facebook</li>
<li><strong>តម្លៃ៖</strong> ឥតគិតថ្លៃ</li>
<li><strong>ការចុះឈ្មោះ៖</strong> មិនចាំបាច់ចុះឈ្មោះទេ - គ្រាន់តែចូលរួម!</li>
</ul>

<p>អ្នកអាចបញ្ចូលវាទៅក្នុងប្រតិទិនរបស់អ្នក។ ពួកវាជាសិក្ខាសាលាដូចគ្នា។ អ្នកអាចចូលរួមមួយក្នុងចំណោមណាមួយ ឬទាំងពីរ ប្រសិនបើអ្នកចង់ស្តាប់ម្តងទៀត។</p>

<p><strong>របៀបចូលរួម៖</strong> សូមចូលទៅកាន់ <a href="https://www.facebook.com/profile.php?id=61580379945977" target="_blank">ទំព័រ Facebook</a> របស់យើងនៅពេលវេលាកំណត់។</p>`,
            excerpt: 'សិក្ខាសាលាឥតគិតថ្លៃតាមអនឡាញសម្រាប់អ្នកចាប់ផ្តើមអំពីរបៀបវិនិយោគដោយសុវត្ថិភាព។ ចូលរួមជាមួយយើងថ្ងៃសៅរ៍ ទី១ ខែវិច្ឆិកា វេលាម៉ោង ៦:០០ ល្ងាច។',
            metaDescription: 'ចូលរួមសិក្ខាសាលាឥតគិតថ្លៃរបស់យើងអំពីគោលការណ៍មូលដ្ឋាននៃការវិនិយោគសម្រាប់អ្នកចាប់ផ្តើម។ រៀនរបៀបវិនិយោគដោយសុវត្ថិភាព។',
            seoTitle: 'សិក្ខាសាលាវិនិយោគសម្រាប់អ្នកចាប់ផ្តើម | សហគមន៍ខ្មែរ'
          }
        ]
      }
    },
    include: {
      translations: true
    }
  })

  console.log('✅ Event 1 created:', event1.slug)

  // Event 2: Sunday November 2, 2025 at 18:00
  const event2 = await prisma.event.create({
    data: {
      slug: 'investment-workshop-nov-2-2025',
      startDate: new Date('2025-11-02T18:00:00+01:00'), // 6:00 PM Swedish time (UTC+1)
      endDate: new Date('2025-11-02T20:00:00+01:00'),   // 8:00 PM (assuming 2 hour workshop)
      allDay: false,
      locationType: 'VIRTUAL',
      virtualUrl: 'https://www.facebook.com/profile.php?id=61580379945977',
      registrationEnabled: false, // No registration needed
      isFree: true,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: admin.id,
      organizer: 'Sahakum Khmer',
      contactEmail: 'contact.sahakumkhmer.se@gmail.com',
      translations: {
        create: [
          {
            language: 'en',
            title: 'How to be an investor and invest safely for beginners',
            content: `<h2>Workshop: How to be an investor and invest safely for beginners</h2>
<p>Join us this Sunday for an educational workshop on investment basics!</p>

<h3>What you'll learn:</h3>
<ul>
<li>Investment fundamentals for beginners</li>
<li>How to invest safely and minimize risks</li>
<li>Different investment options available</li>
<li>Building a diversified portfolio</li>
<li>Common mistakes to avoid</li>
</ul>

<h3>Details:</h3>
<ul>
<li><strong>When:</strong> Sunday, November 2nd at 6:00 PM</li>
<li><strong>Duration:</strong> Approximately 2 hours</li>
<li><strong>Format:</strong> Virtual workshop via Facebook</li>
<li><strong>Cost:</strong> FREE</li>
<li><strong>Registration:</strong> Not required - just join!</li>
</ul>

<p>This is the same workshop offered on both Saturday and Sunday. You can attend either session, or both if you'd like to hear it again!</p>

<p><strong>How to join:</strong> Visit our <a href="https://www.facebook.com/profile.php?id=61580379945977" target="_blank">Facebook page</a> at the scheduled time.</p>`,
            excerpt: 'Free virtual workshop for beginners on how to invest safely. Join us Sunday, November 2nd at 6:00 PM via Facebook.',
            metaDescription: 'Join our free virtual workshop on investment basics for beginners. Learn how to invest safely and build a diversified portfolio. No registration required.',
            seoTitle: 'Investment Workshop for Beginners | Sahakum Khmer'
          },
          {
            language: 'sv',
            title: 'Hur man blir investerare och investerar säkert för nybörjare',
            content: `<h2>Workshop: Hur man blir investerare och investerar säkert för nybörjare</h2>
<p>Gå med oss denna söndag för en utbildande workshop om investeringsgrunderna!</p>

<h3>Vad du kommer att lära dig:</h3>
<ul>
<li>Investeringsgrunder för nybörjare</li>
<li>Hur man investerar säkert och minimerar risker</li>
<li>Olika investeringsalternativ som finns tillgängliga</li>
<li>Bygga en diversifierad portfölj</li>
<li>Vanliga misstag att undvika</li>
</ul>

<h3>Detaljer:</h3>
<ul>
<li><strong>När:</strong> Söndag 2 november kl. 18:00</li>
<li><strong>Varaktighet:</strong> Cirka 2 timmar</li>
<li><strong>Format:</strong> Virtuell workshop via Facebook</li>
<li><strong>Kostnad:</strong> GRATIS</li>
<li><strong>Anmälan:</strong> Krävs inte - bara gå med!</li>
</ul>

<p>Detta är samma workshop som erbjuds både på lördag och söndag. Du kan delta i endera sessionen, eller båda om du vill höra det igen!</p>

<p><strong>Hur man går med:</strong> Besök vår <a href="https://www.facebook.com/profile.php?id=61580379945977" target="_blank">Facebook-sida</a> vid schemalagd tid.</p>`,
            excerpt: 'Gratis virtuell workshop för nybörjare om hur man investerar säkert. Gå med oss söndag 2 november kl. 18:00 via Facebook.',
            metaDescription: 'Delta i vår gratis virtuella workshop om investeringsgrunder för nybörjare. Lär dig hur man investerar säkert och bygger en diversifierad portfölj.',
            seoTitle: 'Investeringsworkshop för Nybörjare | Sahakum Khmer'
          },
          {
            language: 'km',
            title: 'របៀបក្លាយជាអ្នកវិនិយោគ និងវិនិយោគដោយសុវត្ថិភាពសម្រាប់អ្នកចាប់ផ្តើមដំបូង',
            content: `<h2>សិក្ខាសាលា៖ របៀបក្លាយជាអ្នកវិនិយោគ និងវិនិយោគដោយសុវត្ថិភាពសម្រាប់អ្នកចាប់ផ្តើមដំបូង</h2>
<p>សួស្តី! សិក្ខាសាលាស្តីអំពី របៀបក្លាយជាអ្នកវិនិយោគនេះ មាននៅសប្តាហ៍នេះ គឺថ្ងៃអាទិត្យ ទី២ ខែវិច្ឆិកា វេលាម៉ោង ៦:០០។</p>

<h3>អ្វីដែលអ្នកនឹងរៀន៖</h3>
<ul>
<li>គោលការណ៍មូលដ្ឋាននៃការវិនិយោគសម្រាប់អ្នកចាប់ផ្តើម</li>
<li>របៀបវិនិយោគដោយសុវត្ថិភាព និងកាត់បន្ថយហានិភ័យ</li>
<li>ជម្រើសវិនិយោគផ្សេងៗដែលមាន</li>
<li>ការបង្កើតផលប័ត្រចម្រុះ</li>
<li>កំហុសទូទៅដែលត្រូវជៀសវាង</li>
</ul>

<h3>ព័ត៌មានលម្អិត៖</h3>
<ul>
<li><strong>ពេលវេលា៖</strong> ថ្ងៃអាទិត្យ ទី២ ខែវិច្ឆិកា វេលាម៉ោង ៦:០០ ល្ងាច</li>
<li><strong>រយៈពេល៖</strong> ប្រហែល ២ ម៉ោង</li>
<li><strong>ទម្រង់៖</strong> សិក្ខាសាលាតាមអនឡាញតាមរយៈ Facebook</li>
<li><strong>តម្លៃ៖</strong> ឥតគិតថ្លៃ</li>
<li><strong>ការចុះឈ្មោះ៖</strong> មិនចាំបាច់ចុះឈ្មោះទេ - គ្រាន់តែចូលរួម!</li>
</ul>

<p>អ្នកអាចបញ្ចូលវាទៅក្នុងប្រតិទិនរបស់អ្នក។ ពួកវាជាសិក្ខាសាលាដូចគ្នា។ អ្នកអាចចូលរួមមួយក្នុងចំណោមណាមួយ ឬទាំងពីរ ប្រសិនបើអ្នកចង់ស្តាប់ម្តងទៀត។</p>

<p><strong>របៀបចូលរួម៖</strong> សូមចូលទៅកាន់ <a href="https://www.facebook.com/profile.php?id=61580379945977" target="_blank">ទំព័រ Facebook</a> របស់យើងនៅពេលវេលាកំណត់។</p>`,
            excerpt: 'សិក្ខាសាលាឥតគិតថ្លៃតាមអនឡាញសម្រាប់អ្នកចាប់ផ្តើមអំពីរបៀបវិនិយោគដោយសុវត្ថិភាព។ ចូលរួមជាមួយយើងថ្ងៃអាទិត្យ ទី២ ខែវិច្ឆិកា វេលាម៉ោង ៦:០០ ល្ងាច។',
            metaDescription: 'ចូលរួមសិក្ខាសាលាឥតគិតថ្លៃរបស់យើងអំពីគោលការណ៍មូលដ្ឋាននៃការវិនិយោគសម្រាប់អ្នកចាប់ផ្តើម។ រៀនរបៀបវិនិយោគដោយសុវត្ថិភាព។',
            seoTitle: 'សិក្ខាសាលាវិនិយោគសម្រាប់អ្នកចាប់ផ្តើម | សហគមន៍ខ្មែរ'
          }
        ]
      }
    },
    include: {
      translations: true
    }
  })

  console.log('✅ Event 2 created:', event2.slug)

  console.log('\n✅ Successfully seeded 2 Investment Workshop events!')
  console.log('\nEvents created:')
  console.log('1. Saturday, November 1, 2025 at 18:00')
  console.log('2. Sunday, November 2, 2025 at 18:00')
  console.log('\nBoth events:')
  console.log('- FREE')
  console.log('- No registration required')
  console.log('- Virtual via Facebook')
  console.log('- Available in English, Swedish, and Khmer')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
