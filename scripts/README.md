# Seeding Scripts

This directory contains scripts for populating the Sahakum Khmer CMS with initial data.

## Available Scripts

### Core Setup Scripts

#### `seed-admin.ts`
Creates the initial admin user for the system.
```bash
npx tsx scripts/seed-admin.ts
```
- **Email**: admin@sahakumkhmer.se
- **Password**: admin123
- **Role**: ADMIN

#### `seed-services.ts`
Creates homepage services section with multilingual content.
```bash
npx tsx scripts/seed-services.ts
```
Creates: Community, Blog, Support, Membership services

#### `seed-categories-tags.ts` ❌ BROKEN - NEEDS REWRITE
Creates initial categories and tags for content organization.
```bash
npx tsx scripts/seed-categories-tags.ts
```
**Status**: Uses old field names (`isActive`, `sortOrder`), needs complete rewrite for current schema

#### `seed-members.ts` ❌ BROKEN - NEEDS REWRITE
Creates sample member profiles.
```bash
npx tsx scripts/seed-members.ts
```
**Status**: Uses old Member schema fields (`memberNumber`, `isActive`), needs complete rewrite

### Content Scripts

#### `seed-pages.ts`
Creates the main static pages with multilingual content.
```bash
npx tsx scripts/seed-pages.ts
```
Creates:
- About Sahakum Khmer (`/about-us`)
- Cambodia - Our Heritage (`/cambodia`)
- Living in Sweden Guide (`/living-in-sweden`)
- Support Resources (`/support-resources`)

#### `seed-pages-final.ts`
Updates existing pages with complete Sweden Editor HTML format.
```bash
npx tsx scripts/seed-pages-final.ts
```

#### `seed-personnummer-blog.ts`
Creates a comprehensive blog post about applying for personnummer.
```bash
npx tsx scripts/seed-personnummer-blog.ts
```
Creates: `/blog/how-to-apply-for-personnummer` in EN/SV/KM

### Media & Enhancement Scripts

#### `add-featured-images.ts`
Adds featured images to content items.
```bash
npx tsx scripts/add-featured-images.ts
```
**Note**: May fail if pages don't exist yet

#### `sync-media.ts`
Synchronizes media files from filesystem to database.
```bash
npx tsx scripts/sync-media.ts
```

### Legacy/Utility Scripts

#### `template-page-seeder.ts`
Template for creating new page seeding scripts.

#### `update-pages-editor-format.ts`
Converts existing markdown-style content to Sweden Editor HTML format.
```bash
npx tsx scripts/update-pages-editor-format.ts
```

#### `update-pages-proper-format.ts`
Updates pages to use proper Sweden Editor HTML structure.
```bash
npx tsx scripts/update-pages-proper-format.ts
```

## Running Order

When setting up the system from scratch:

1. **One-Command Setup** (Recommended)
   ```bash
   npm run setup
   ```
   This automatically: starts Docker → syncs database → seeds admin user

2. **Manual Setup** (If needed)
   ```bash
   npm run db:push              # Sync database schema
   npx tsx scripts/seed-admin.ts  # Create admin user
   npx tsx scripts/seed-services.ts  # Create homepage services
   npx tsx scripts/seed-pages.ts     # Create main pages
   npx tsx scripts/seed-personnummer-blog.ts  # Create blog content
   ```

3. **Full Content Restore** (After database reset)
   ```bash
   npx tsx scripts/seed-admin.ts
   npx tsx scripts/seed-services.ts
   npx tsx scripts/seed-pages.ts
   npx tsx scripts/seed-pages-final.ts
   npx tsx scripts/seed-personnummer-blog.ts
   ```

## Sweden Editor Compatibility

All content seeding scripts now generate HTML that is compatible with the Sweden Editor (swedit-editor). This includes:

- Proper CSS classes for Sweden brand typography
- Correct font classes (`font-sweden` / `font-khmer`)
- Semantic HTML structure
- TipTap-compatible formatting

## Testing Seeded Content

After running seeding scripts:

```bash
# Start development server
npm run dev

# Test page accessibility
curl -s -o /dev/null -w "EN: %{http_code} " http://localhost:3000/en/about-us
curl -s -o /dev/null -w "SV: %{http_code} " http://localhost:3000/sv/about-us
curl -s -o /dev/null -w "KM: %{http_code} " http://localhost:3000/km/about-us
```

## Creating New Seeding Scripts

See `/docs/SEEDING_GUIDE.md` for detailed instructions on creating new seeding scripts that are compatible with the Sweden Editor.

## Troubleshooting

### Common Issues

1. **"Admin user not found"**
   - Run `seed-admin.ts` first

2. **Database connection errors**
   - Check `.env` file for correct `DATABASE_URL`
   - Ensure PostgreSQL is running

3. **Content formatting issues**
   - Verify Sweden Editor CSS classes are correct
   - Check `/docs/SEEDING_GUIDE.md` for proper format

### Debug Commands

```bash
# View database in browser
npx prisma studio

# Check pages API
curl -s "http://localhost:3000/api/public/pages" | jq

# Reset database (caution!)
npx prisma migrate reset
```