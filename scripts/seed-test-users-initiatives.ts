import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding test users, initiatives, and tasks...\n')

  // Clean up existing test data
  console.log('Cleaning up existing test data...')
  await prisma.task.deleteMany({
    where: {
      initiative: {
        slug: {
          in: ['khmer-language-classes-2025', 'swedish-khmer-festival-2025', 'youth-mentorship-program']
        }
      }
    }
  })
  await prisma.initiativeMember.deleteMany({
    where: {
      initiative: {
        slug: {
          in: ['khmer-language-classes-2025', 'swedish-khmer-festival-2025', 'youth-mentorship-program']
        }
      }
    }
  })
  await prisma.initiativeTranslation.deleteMany({
    where: {
      initiative: {
        slug: {
          in: ['khmer-language-classes-2025', 'swedish-khmer-festival-2025', 'youth-mentorship-program']
        }
      }
    }
  })
  await prisma.initiative.deleteMany({
    where: {
      slug: {
        in: ['khmer-language-classes-2025', 'swedish-khmer-festival-2025', 'youth-mentorship-program']
      }
    }
  })
  console.log('✅ Cleaned up existing test data\n')

  // Hash the default password
  const hashedPassword = await bcrypt.hash('HelloCambodia123', 10)

  // Create test users
  console.log('Creating test users...')
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sophy.chan@test.com' },
      update: {},
      create: {
        email: 'sophy.chan@test.com',
        name: 'Sophy Chan',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        profileImage: '/media/images/profile1.jpg',
      },
    }),
    prisma.user.upsert({
      where: { email: 'david.andersson@test.com' },
      update: {},
      create: {
        email: 'david.andersson@test.com',
        name: 'David Andersson',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        profileImage: '/media/images/profile2.jpg',
      },
    }),
    prisma.user.upsert({
      where: { email: 'srey.pov@test.com' },
      update: {},
      create: {
        email: 'srey.pov@test.com',
        name: 'Srey Pov',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        profileImage: '/media/images/profile3.jpg',
      },
    }),
    prisma.user.upsert({
      where: { email: 'erik.nilsson@test.com' },
      update: {},
      create: {
        email: 'erik.nilsson@test.com',
        name: 'Erik Nilsson',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        profileImage: '/media/images/profile4.jpg',
      },
    }),
    prisma.user.upsert({
      where: { email: 'channary.sok@test.com' },
      update: {},
      create: {
        email: 'channary.sok@test.com',
        name: 'Channary Sok',
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        profileImage: '/media/images/profile5.jpg',
      },
    }),
  ])

  console.log(`✅ Created ${users.length} test users\n`)

  // Get admin user to be project lead
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@sahakumkhmer.se' },
  })

  if (!admin) {
    console.log('❌ Admin user not found. Please run seed-admin.ts first.')
    return
  }

  // Create initiatives
  console.log('Creating initiatives...')

  // Initiative 1: Khmer Language Classes (Published, lots of tasks)
  const khmerClasses = await prisma.initiative.create({
    data: {
      slug: 'khmer-language-classes-2025',
      status: 'PUBLISHED',
      category: 'EDUCATION',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-06-30'),
      featuredImage: '/media/images/khmer_language.jpg',
      projectLeadId: admin.id,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Khmer Language Classes 2025',
            shortDescription: 'Weekly Khmer language classes for beginners and intermediate learners',
            description: '<p>Join our comprehensive Khmer language program designed for Swedish-Khmer community members who want to learn or improve their Khmer language skills.</p><p>Classes are held every Saturday from January to June 2025.</p>',
          },
          {
            language: 'sv',
            title: 'Khmer-språkkurser 2025',
            shortDescription: 'Veckovisa Khmer-språkkurser för nybörjare och mellannivå',
            description: '<p>Delta i vårt omfattande Khmer-språkprogram utformat för svensk-kambodjanska samhällsmedlemmar som vill lära sig eller förbättra sina Khmer-språkkunskaper.</p><p>Klasserna hålls varje lördag från januari till juni 2025.</p>',
          },
          {
            language: 'km',
            title: 'ថ្នាក់រៀនភាសាខ្មែរឆ្នាំ ២០២៥',
            shortDescription: 'ថ្នាក់រៀនភាសាខ្មែរប្រចាំសប្តាហ៍សម្រាប់អ្នកចាប់ផ្តើម និងកម្រិតមធ្យម',
            description: '<p>ចូលរួមកម្មវិធីភាសាខ្មែររបស់យើងដែលរចនាឡើងសម្រាប់សមាជិកសហគមន៍ស៊ុយអែត-ខ្មែរដែលចង់រៀន ឬកែលម្អជំនាញភាសាខ្មែររបស់ពួកគេ។</p><p>ថ្នាក់រៀនធ្វើឡើងរៀងរាល់ថ្ងៃសៅរ៍ពីខែមករាដល់ខែមិថុនា ២០២៥។</p>',
          },
        ],
      },
    },
  })

  // Initiative 2: Cultural Festival Planning (Published phase)
  const culturalFestival = await prisma.initiative.create({
    data: {
      slug: 'swedish-khmer-festival-2025',
      status: 'PUBLISHED',
      category: 'CULTURAL_EVENT',
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-08-15'),
      featuredImage: '/media/images/festival.jpg',
      projectLeadId: users[0].id, // Sophy Chan
      translations: {
        create: [
          {
            language: 'en',
            title: 'Swedish-Khmer Cultural Festival 2025',
            shortDescription: 'Annual festival celebrating Swedish-Khmer culture and heritage',
            description: '<p>Planning and organizing our biggest cultural event of the year featuring traditional dance, music, food, and art from both Swedish and Khmer cultures.</p>',
          },
          {
            language: 'sv',
            title: 'Svensk-Khmer Kulturfestival 2025',
            shortDescription: 'Årlig festival som firar svensk-kambodjansk kultur och arv',
            description: '<p>Planering och organisering av vårt största kulturella evenemang på året med traditionell dans, musik, mat och konst från både svensk och kambodjansk kultur.</p>',
          },
          {
            language: 'km',
            title: 'ពិធីបុណ្យវប្បធម៌ស៊ុយអែត-ខ្មែរ ២០២៥',
            shortDescription: 'ពិធីបុណ្យប្រចាំឆ្នាំដែលអបអរវប្បធម៌ និងបេតិកភណ្ឌស៊ុយអែត-ខ្មែរ',
            description: '<p>ការរៀបចំ និងរៀបចំព្រឹត្តិការណ៍វប្បធម៌ធំបំផុតរបស់យើងក្នុងឆ្នាំនេះដែលមានរបាំប្រពៃណី តន្ត្រី អាហារ និងសិល្បៈពីវប្បធម៌ស៊ុយអែត និងខ្មែរ។</p>',
          },
        ],
      },
    },
  })

  // Initiative 3: Youth Mentorship Program (Published)
  const youthMentorship = await prisma.initiative.create({
    data: {
      slug: 'youth-mentorship-program',
      status: 'PUBLISHED',
      category: 'SOCIAL',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-05-31'),
      featuredImage: '/media/images/youth.jpg',
      projectLeadId: users[1].id, // David Andersson
      translations: {
        create: [
          {
            language: 'en',
            title: 'Youth Mentorship Program',
            shortDescription: 'Connecting young Swedish-Khmer youth with experienced mentors',
            description: '<p>A mentorship program pairing young community members with experienced professionals to provide guidance, support, and career development opportunities.</p>',
          },
          {
            language: 'sv',
            title: 'Ungdomsmentorskapsprogram',
            shortDescription: 'Kopplar samman unga svensk-kambodjanska ungdomar med erfarna mentorer',
            description: '<p>Ett mentorskapsprogram som parar ihop unga samhällsmedlemmar med erfarna yrkesverksamma för att ge vägledning, stöd och karriärutvecklingsmöjligheter.</p>',
          },
          {
            language: 'km',
            title: 'កម្មវិធីណែនាំយុវជន',
            shortDescription: 'ភ្ជាប់យុវជនស៊ុយអែត-ខ្មែរជាមួយអ្នកណែនាំដែលមានបទពិសោធន៍',
            description: '<p>កម្មវិធីណែនាំដែលភ្ជាប់សមាជិកយុវជនជាមួយអ្នកជំនាញដែលមានបទពិសោធន៍ ដើម្បីផ្តល់ការណែនាំ ការគាំទ្រ និងឱកាសអភិវឌ្ឍន៍អាជីព។</p>',
          },
        ],
      },
    },
  })

  console.log(`✅ Created ${3} initiatives\n`)

  // Add team members to initiatives
  console.log('Adding team members to initiatives...')

  // Khmer Language Classes team
  await Promise.all([
    prisma.initiativeMember.create({
      data: {
        initiativeId: khmerClasses.id,
        userId: admin.id,
        role: 'LEAD',
        contributionNote: 'Project Lead and Curriculum Developer',
        joinedAt: new Date('2024-12-01'),
      },
    }),
    prisma.initiativeMember.create({
      data: {
        initiativeId: khmerClasses.id,
        userId: users[0].id, // Sophy Chan
        role: 'CO_LEAD',
        contributionNote: 'Lead Instructor',
        joinedAt: new Date('2024-12-05'),
      },
    }),
    prisma.initiativeMember.create({
      data: {
        initiativeId: khmerClasses.id,
        userId: users[2].id, // Srey Pov
        role: 'MEMBER',
        contributionNote: 'Assistant Instructor',
        joinedAt: new Date('2024-12-10'),
      },
    }),
    prisma.initiativeMember.create({
      data: {
        initiativeId: khmerClasses.id,
        userId: users[4].id, // Channary Sok
        role: 'MEMBER',
        contributionNote: 'Materials Coordinator',
        joinedAt: new Date('2024-12-15'),
      },
    }),
  ])

  // Cultural Festival team
  await Promise.all([
    prisma.initiativeMember.create({
      data: {
        initiativeId: culturalFestival.id,
        userId: users[0].id, // Sophy Chan
        role: 'LEAD',
        contributionNote: 'Festival Director',
        joinedAt: new Date('2024-11-01'),
      },
    }),
    prisma.initiativeMember.create({
      data: {
        initiativeId: culturalFestival.id,
        userId: users[1].id, // David Andersson
        role: 'CO_LEAD',
        contributionNote: 'Logistics Coordinator',
        joinedAt: new Date('2024-11-05'),
      },
    }),
    prisma.initiativeMember.create({
      data: {
        initiativeId: culturalFestival.id,
        userId: users[3].id, // Erik Nilsson
        role: 'MEMBER',
        contributionNote: 'Sponsorship Manager',
        joinedAt: new Date('2024-11-10'),
      },
    }),
    prisma.initiativeMember.create({
      data: {
        initiativeId: culturalFestival.id,
        userId: admin.id,
        role: 'MEMBER',
        contributionNote: 'Advisor',
        joinedAt: new Date('2024-11-15'),
      },
    }),
  ])

  // Youth Mentorship team
  await Promise.all([
    prisma.initiativeMember.create({
      data: {
        initiativeId: youthMentorship.id,
        userId: users[1].id, // David Andersson
        role: 'LEAD',
        contributionNote: 'Program Director',
        joinedAt: new Date('2024-08-01'),
      },
    }),
    prisma.initiativeMember.create({
      data: {
        initiativeId: youthMentorship.id,
        userId: users[2].id, // Srey Pov
        role: 'CO_LEAD',
        contributionNote: 'Mentorship Coordinator',
        joinedAt: new Date('2024-08-05'),
      },
    }),
    prisma.initiativeMember.create({
      data: {
        initiativeId: youthMentorship.id,
        userId: users[4].id, // Channary Sok
        role: 'MEMBER',
        contributionNote: 'Outreach Specialist',
        joinedAt: new Date('2024-08-10'),
      },
    }),
  ])

  console.log('✅ Added team members to initiatives\n')

  // Create tasks with various statuses
  console.log('Creating tasks...')

  // Tasks for Khmer Language Classes
  const khmerClassesTasks = await Promise.all([
    // TODO tasks
    prisma.task.create({
      data: {
        initiativeId: khmerClasses.id,
        titleEn: 'Prepare lesson materials for Week 5',
        titleSv: 'Förbered lektionsmaterial för vecka 5',
        titleKm: 'រៀបចំសម្ភារៈមេរៀនសម្រាប់សប្តាហ៍ទី៥',
        descriptionEn: 'Create worksheets and handouts for the upcoming lesson on Khmer consonants.',
        descriptionSv: 'Skapa arbetsblad och handouts för den kommande lektionen om khmerkonsonanter.',
        descriptionKm: 'បង្កើតសន្លឹកការងារ និងឯកសារសម្រាប់មេរៀនខាងមុខអំពីព្យញ្ជនៈខ្មែរ។',
        status: 'TODO',
        priority: 'MEDIUM',
        assignedToId: users[2].id, // Srey Pov
        dueDate: new Date('2025-02-15'),
      },
    }),
    prisma.task.create({
      data: {
        initiativeId: khmerClasses.id,
        titleEn: 'Update class attendance roster',
        titleSv: 'Uppdatera närvarolista för klassen',
        titleKm: 'ធ្វើបច្ចុប្បន្នភាពបញ្ជីវត្តមានថ្នាក់',
        status: 'TODO',
        priority: 'LOW',
        assignedToId: users[4].id, // Channary Sok
        dueDate: new Date('2025-02-10'),
      },
    }),
    prisma.task.create({
      data: {
        initiativeId: khmerClasses.id,
        titleEn: 'Order new textbooks for advanced class',
        titleSv: 'Beställ nya läroböcker för avancerad klass',
        titleKm: 'បញ្ជាទិញសៀវភៅថ្មីសម្រាប់ថ្នាក់កម្រិតខ្ពស់',
        descriptionEn: 'Contact publisher and order 15 copies of advanced Khmer textbooks.',
        status: 'TODO',
        priority: 'HIGH',
        assignedToId: admin.id,
        dueDate: new Date('2025-02-05'),
      },
    }),

    // IN_PROGRESS tasks
    prisma.task.create({
      data: {
        initiativeId: khmerClasses.id,
        titleEn: 'Conduct Week 4 beginner class',
        titleSv: 'Genomför vecka 4 nybörjarklass',
        titleKm: 'បង្រៀនថ្នាក់អ្នកចាប់ផ្តើមសប្តាហ៍ទី៤',
        descriptionEn: 'Teach vowels and basic sentence structure to beginner students.',
        descriptionSv: 'Lär ut vokaler och grundläggande meningsstruktur till nybörjare.',
        descriptionKm: 'បង្រៀនស្រៈ និងរចនាសម្ព័ន្ធប្រយោគមូលដ្ឋានដល់សិស្សអ្នកចាប់ផ្តើម។',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        assignedToId: users[0].id, // Sophy Chan
        dueDate: new Date('2025-02-03'),
      },
    }),
    prisma.task.create({
      data: {
        initiativeId: khmerClasses.id,
        titleEn: 'Review and grade homework assignments',
        titleSv: 'Granska och betygsätt hemuppgifter',
        titleKm: 'ពិនិត្យ និងដាក់ពិន្ទុកិច្ចការផ្ទះ',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assignedToId: users[2].id, // Srey Pov
      },
    }),

    // COMPLETED tasks
    prisma.task.create({
      data: {
        initiativeId: khmerClasses.id,
        titleEn: 'Set up classroom for new term',
        titleSv: 'Ställ in klassrum för ny termin',
        titleKm: 'រៀបចំបន្ទប់រៀនសម្រាប់ឆមាសថ្មី',
        descriptionEn: 'Arrange desks, set up projector, and prepare teaching materials.',
        status: 'COMPLETED',
        priority: 'HIGH',
        assignedToId: users[4].id, // Channary Sok
        completedAt: new Date('2025-01-12'),
      },
    }),
    prisma.task.create({
      data: {
        initiativeId: khmerClasses.id,
        titleEn: 'Send welcome email to all registered students',
        titleSv: 'Skicka välkomstmail till alla registrerade studenter',
        titleKm: 'ផ្ញើអ៊ីមែលស្វាគមន៍ទៅកាន់សិស្សដែលបានចុះឈ្មោះទាំងអស់',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        assignedToId: admin.id,
        completedAt: new Date('2025-01-10'),
      },
    }),

    // BLOCKED task
    prisma.task.create({
      data: {
        initiativeId: khmerClasses.id,
        titleEn: 'Install language learning software on classroom computers',
        titleSv: 'Installera språkinlärningsprogram på klassrumsdatorer',
        titleKm: 'ដំឡើងកម្មវិធីរៀនភាសានៅលើកុំព្យូទ័របន្ទប់រៀន',
        descriptionEn: 'Waiting for IT department approval and software licenses.',
        descriptionSv: 'Väntar på IT-avdelningens godkännande och mjukvarulicenser.',
        descriptionKm: 'រង់ចាំការអនុម័តពីផ្នែកព័ត៌មានវិទ្យា និងអាជ្ញាប័ណ្ណកម្មវិធី។',
        status: 'BLOCKED',
        priority: 'HIGH',
        assignedToId: users[4].id, // Channary Sok
        dueDate: new Date('2025-02-20'),
      },
    }),
  ])

  // Tasks for Cultural Festival
  const culturalFestivalTasks = await Promise.all([
    prisma.task.create({
      data: {
        initiativeId: culturalFestival.id,
        titleEn: 'Secure festival venue',
        titleSv: 'Säkra festivalplats',
        titleKm: 'ធានាកន្លែងរៀបចំពិធីបុណ្យ',
        descriptionEn: 'Contact and book a suitable venue that can accommodate 500+ people.',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        assignedToId: users[1].id, // David Andersson
        dueDate: new Date('2025-02-28'),
      },
    }),
    prisma.task.create({
      data: {
        initiativeId: culturalFestival.id,
        titleEn: 'Design festival poster and promotional materials',
        titleSv: 'Designa festivalaffisch och marknadsföringsmaterial',
        titleKm: 'រចនាផ្ទាំងរូបភាព និងសម្ភារៈផ្សព្វផ្សាយពិធីបុណ្យ',
        status: 'TODO',
        priority: 'HIGH',
        assignedToId: users[0].id, // Sophy Chan
        dueDate: new Date('2025-03-15'),
      },
    }),
    prisma.task.create({
      data: {
        initiativeId: culturalFestival.id,
        titleEn: 'Recruit traditional dance performers',
        titleSv: 'Rekrytera traditionella dansare',
        titleKm: 'ជ្រើសរើសអ្នករាំប្រពៃណី',
        descriptionEn: 'Contact dance groups and schedule auditions.',
        status: 'TODO',
        priority: 'MEDIUM',
        assignedToId: users[0].id, // Sophy Chan
        dueDate: new Date('2025-03-31'),
      },
    }),
    prisma.task.create({
      data: {
        initiativeId: culturalFestival.id,
        titleEn: 'Reach out to potential sponsors',
        titleSv: 'Kontakta potentiella sponsorer',
        titleKm: 'ទាក់ទងអ្នកឧបត្ថម្ភសក្តានុពល',
        descriptionEn: 'Prepare sponsorship packages and contact local businesses.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedToId: users[3].id, // Erik Nilsson
        dueDate: new Date('2025-03-01'),
      },
    }),
    prisma.task.create({
      data: {
        initiativeId: culturalFestival.id,
        titleEn: 'Create festival budget spreadsheet',
        titleSv: 'Skapa budgetark för festival',
        titleKm: 'បង្កើតតារាងថវិកាពិធីបុណ្យ',
        status: 'COMPLETED',
        priority: 'HIGH',
        assignedToId: users[1].id, // David Andersson
        completedAt: new Date('2025-01-20'),
      },
    }),
  ])

  // Tasks for Youth Mentorship
  const youthMentorshipTasks = await Promise.all([
    prisma.task.create({
      data: {
        initiativeId: youthMentorship.id,
        titleEn: 'Match mentees with mentors for Q1',
        titleSv: 'Matcha mentees med mentorer för Q1',
        titleKm: 'ផ្គូផ្គងអ្នកទទួលការណែនាំជាមួយអ្នកណែនាំសម្រាប់ត្រីមាសទី១',
        descriptionEn: 'Review applications and create mentor-mentee pairs based on interests and goals.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedToId: users[2].id, // Srey Pov
        dueDate: new Date('2025-02-10'),
      },
    }),
    prisma.task.create({
      data: {
        initiativeId: youthMentorship.id,
        titleEn: 'Organize mentorship kickoff event',
        titleSv: 'Organisera mentorskaps startmöte',
        titleKm: 'រៀបចំព្រឹត្តិការណ៍ចាប់ផ្តើមកម្មវិធីណែនាំ',
        descriptionEn: 'Plan and host an event where mentors and mentees can meet and connect.',
        status: 'TODO',
        priority: 'MEDIUM',
        assignedToId: users[1].id, // David Andersson
        dueDate: new Date('2025-02-25'),
      },
    }),
    prisma.task.create({
      data: {
        initiativeId: youthMentorship.id,
        titleEn: 'Create mentorship resource guide',
        titleSv: 'Skapa mentorskapsresursguide',
        titleKm: 'បង្កើតមគ្គុទ្ទេសក៍ធនធានកម្មវិធីណែនាំ',
        descriptionEn: 'Compile helpful resources, tips, and best practices for mentors.',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        assignedToId: users[4].id, // Channary Sok
        completedAt: new Date('2025-01-18'),
      },
    }),
    prisma.task.create({
      data: {
        initiativeId: youthMentorship.id,
        titleEn: 'Send monthly check-in survey to participants',
        titleSv: 'Skicka månatlig uppföljningsenkät till deltagare',
        titleKm: 'ផ្ញើការស្ទង់មតិតាមដានប្រចាំខែទៅកាន់អ្នកចូលរួម',
        status: 'TODO',
        priority: 'LOW',
        assignedToId: users[2].id, // Srey Pov
        dueDate: new Date('2025-02-28'),
      },
    }),
  ])

  const totalTasks = khmerClassesTasks.length + culturalFestivalTasks.length + youthMentorshipTasks.length
  console.log(`✅ Created ${totalTasks} tasks across all initiatives\n`)

  console.log('🎉 Seeding complete!\n')
  console.log('Test users created (all with password: HelloCambodia123):')
  console.log('  • sophy.chan@test.com (Lead: Cultural Festival, Co-Lead: Khmer Classes)')
  console.log('  • david.andersson@test.com (Lead: Youth Mentorship, Co-Lead: Cultural Festival)')
  console.log('  • srey.pov@test.com (Co-Lead: Youth Mentorship, Member: Khmer Classes)')
  console.log('  • erik.nilsson@test.com (Member: Cultural Festival)')
  console.log('  • channary.sok@test.com (Member: Khmer Classes, Youth Mentorship)')
  console.log('\nInitiatives created:')
  console.log('  • Khmer Language Classes 2025 (8 tasks: 3 TODO, 2 IN_PROGRESS, 2 COMPLETED, 1 BLOCKED)')
  console.log('  • Swedish-Khmer Cultural Festival 2025 (5 tasks: 2 TODO, 2 IN_PROGRESS, 1 COMPLETED)')
  console.log('  • Youth Mentorship Program (4 tasks: 2 TODO, 1 IN_PROGRESS, 1 COMPLETED)')
  console.log('\n✨ You can now login with any test user to see their initiatives and tasks!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
