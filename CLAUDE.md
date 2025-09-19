# Claude Code Configuration

This file contains configuration and helpful commands for Claude Code when working with the Sahakum Khmer CMS project.

## Project Overview
- **Framework**: Next.js 14.2.32 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Internationalization**: next-intl (Swedish, English, Khmer)
- **Deployment**: Vercel + Supabase
- **Styling**: Tailwind CSS + shadcn/ui components

## Development Commands

### Database Commands
```bash
# 🚀 One-command setup (starts Docker + sets up database + seeds admin)
npm run setup

# Individual commands:
npm run docker:up        # Start PostgreSQL Docker container
npm run db:push          # Sync schema to database
npm run db:reset         # Reset database completely
npm run db:seed          # Seed admin user
npm run db:studio        # View database in browser
npm run docker:logs      # View database logs
```

### Development Server
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Code Quality
```bash
# Run linting (with errors ignored)
npm run lint

# Run type checking (with errors ignored)
npm run type-check

# Sync media files
npm run sync-media
```

### Deployment Commands
```bash
# Deploy to preview
npm run deploy:preview

# Deploy to production
npm run deploy:production

# Database migrations for production
npm run db:migrate
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

### Required for Local Development
```env
DATABASE_URL="postgresql://sahakum:password@localhost:5432/sahakum_khmer_cms"
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Required for Production (Vercel Secrets)
```env
DATABASE_URL="postgresql://user:pass@host:5432/database"
DIRECT_URL="postgresql://user:pass@host:5432/database"
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

## Project Structure

```
sahakum-khmer-se/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   ├── api/               # API routes
│   │   └── auth/              # Authentication pages
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   └── middleware.ts          # Next.js middleware
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── scripts/                   # Utility scripts
├── public/                    # Static assets
└── docker-compose.yml         # Local database setup
```

## Common Tasks

### Adding a new page
1. Create page component in `src/app/[locale]/your-page/page.tsx`
2. Add translations to `messages/` files
3. Update navigation if needed

### Adding a new API endpoint
1. Create route handler in `src/app/api/your-endpoint/route.ts`
2. Add authentication if needed
3. Update Prisma schema if database changes required

### Database Schema Changes
1. Modify `prisma/schema.prisma`
2. Run `npx prisma db push` for development
3. Create migration with `npx prisma migrate dev --name change-description`

### Seeding Data
- Admin user: `npx tsx scripts/seed-admin.ts` ✅
- Services: `npx tsx scripts/seed-services.ts` ✅
- Pages: `npx tsx scripts/seed-pages.ts` ✅
- Blog posts: `npx tsx scripts/seed-personnummer-blog.ts` ✅
- Categories/Tags: `npx tsx scripts/seed-categories-tags.ts` ✅
- Members: `npx tsx scripts/seed-members.ts` ❌ BROKEN

## Troubleshooting

### Build Errors
- TypeScript errors are ignored during builds (`next.config.js`)
- ESLint errors are ignored during builds
- Use `npm run type-check` to see TypeScript issues

### Database Issues
- Ensure Docker is running for local database
- Reset database if schema mismatches occur
- Check environment variables are correct

### Development Server
- Default port: 3000
- Admin login: admin@sahakumkhmer.se / HelloCambodia123
- Check console for API errors

## Deployment

### GitHub Actions
- Automatic deployment on commits to `main`/`master`
- Runs linting, type-checking, and build tests
- Deploys to Vercel with database migrations

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

## Smart Schema Management

The project uses a **single** `prisma/schema.prisma` file that automatically adapts:

- **Local Development**: Uses only `DATABASE_URL` (no `directUrl`)
- **Production**: Automatically adds `directUrl` for Supabase connection pooling

This happens via `scripts/setup-schema.js` which runs before:
- `npm run dev` / `npm run build`
- `npm run db:push` / `npm run db:generate`
- All database operations

**No more manual schema switching!** ✨

## 🚨 CRITICAL INFORMATION FOR CLAUDE CODE

### Recent Major Fixes (Sept 17, 2025)
1. **Services Section Runtime Error** - FIXED ✅
   - Added `featuredImg`, `colorTheme`, `buttonText` fields to Service schema
   - Updated API to return all required fields
   - Component interface now matches database schema

2. **Page Saving Error** - FIXED ✅
   - Fixed field name: `contentId` → `contentItemId` in pages API
   - Page editing/saving now works correctly

3. **Media Sync Error** - FIXED ✅
   - Fixed field name: `uploadedBy` → `uploaderId` in media API

### ⚠️ IMPORTANT FIELD NAMING CONVENTIONS
**ALWAYS use these field names (NOT the old ones):**
- `active` (NOT `isActive`)
- `order` (NOT `sortOrder`)
- `contentItemId` (NOT `contentId`)
- `uploaderId` (NOT `uploadedBy`)

### 🔧 Working Features
- **Homepage** - Fully functional with services section
- **Admin Panel** - Pages, posts, media, services management
- **Authentication** - Login: `admin@sahakumkhmer.se` / `admin123`
- **Multilingual** - EN/SV/KM support working
- **APIs** - Public APIs working, admin APIs require auth

### ❌ Known Broken Scripts
- `scripts/seed-categories-tags.ts` - Uses old field names
- `scripts/seed-members.ts` - Uses old schema fields

### 📚 Documentation Locations
- **System Status**: `/docs/SYSTEM_STATUS.md` - Comprehensive system documentation
- **Scripts Guide**: `/scripts/README.md` - All seeding scripts with status
- **This File**: Quick reference and critical info

### 🤖 Notes for Claude Code
- Always use the TodoWrite tool for multi-step tasks
- Run `npm run lint` and `npm run type-check` after code changes
- Test locally before deployment
- Use field naming conventions above to avoid API errors
- Check `/docs/SYSTEM_STATUS.md` for complete feature status
- Schema automatically adapts to environment - no manual changes needed
- Use `npm run setup` for first-time setup