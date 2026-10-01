import { z } from 'zod'
import type { Prisma } from '@prisma/client'

const optionalContact = z.string().trim().max(250).optional().or(z.literal(''))
const optionalUrl = z.string().trim().max(500).refine(
  value => !value || value.startsWith('/') || /^https?:\/\//i.test(value),
  'Use a valid web address'
).optional().or(z.literal(''))

export const businessInputSchema = z.object({
  name: z.string().trim().min(2, 'Business name is required').max(120),
  summary: z.string().trim().min(10, 'Add a short summary').max(240),
  description: z.string().trim().min(20, 'Add a business description').max(20000),
  categoryId: z.string().trim().min(1, 'Choose a category'),
  tagIds: z.array(z.string()).max(8).refine(values => new Set(values).size === values.length, 'Choose each tag once').default([]),
  logoUrl: optionalUrl,
  phone: optionalContact,
  email: z.string().trim().email('Use a valid email').optional().or(z.literal('')),
  website: optionalUrl,
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  address: z.string().trim().max(250).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City is required').max(100),
  region: z.string().trim().max(100).optional().or(z.literal('')),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')),
  country: z.string().trim().min(2).max(100).default('Sweden'),
  serviceArea: z.enum(['LOCAL', 'NATIONWIDE', 'ONLINE', 'INTERNATIONAL']),
  locationVisibility: z.enum(['EXACT', 'CITY_ONLY', 'ONLINE_ONLY']),
  displayOwnerName: z.boolean().default(false),
  action: z.enum(['save', 'submit']).default('save'),
}).superRefine((value, context) => {
  if (value.action === 'submit' && !value.phone && !value.email && !value.website && !value.facebookUrl && !value.instagramUrl) {
    context.addIssue({ code: 'custom', path: ['phone'], message: 'Add at least one public contact method' })
  }
  if (value.locationVisibility === 'EXACT' && !value.address) {
    context.addIssue({ code: 'custom', path: ['address'], message: 'Add an address or show the city only' })
  }
})

export type BusinessInput = z.infer<typeof businessInputSchema>

export function makeSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'business'
}

export async function uniqueBusinessSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>,
  currentSlug?: string
): Promise<string> {
  const base = makeSlug(name)
  if (base === currentSlug || !(await exists(base))) return base

  for (let number = 2; number < 1000; number += 1) {
    const candidate = `${base}-${number}`
    if (candidate === currentSlug || !(await exists(candidate))) return candidate
  }

  return `${base}-${Date.now()}`
}

export function categoryName(
  category: { nameEn: string; nameSv: string; nameKm: string },
  locale: string
): string {
  if (locale === 'sv') return category.nameSv
  if (locale === 'km') return category.nameKm
  return category.nameEn
}

export const businessInclude = {
  category: true,
  tags: { include: { tag: true } },
  owner: {
    select: {
      id: true,
      userId: true,
      firstName: true,
      lastName: true,
      firstNameKhmer: true,
      lastNameKhmer: true,
    },
  },
} as const

export type BusinessWithDetails = Prisma.BusinessGetPayload<{ include: typeof businessInclude }>
