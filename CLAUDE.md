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

## 🛡️ SECURITY: XSS Protection & Editor Sanitization

**CRITICAL**: All user content is sanitized using DOMPurify to prevent XSS attacks.

**If you modify the Swedish Editor (`src/components/editor/sweden-editor.tsx`):**
- Add new TipTap extensions → Update `src/lib/sanitize.ts` ALLOWED_TAGS
- Add new CSS classes → Verify they pass class regex validation
- Add new HTML attributes → Add to ALLOWED_ATTR array
- **Test thoroughly**: Create content in admin → View on frontend → Verify formatting preserved

**Files involved in sanitization:**
- `src/lib/sanitize.ts` - Main sanitization configuration
- `src/app/[locale]/[slug]/page.tsx` - Dynamic pages (uses `createSafeHTML`)
- `src/app/[locale]/blog/[slug]/page.tsx` - Blog posts (uses `createSafeHTML`)

**Last XSS fix**: 2025-01-22 - Added DOMPurify for Swedish editor compatibility

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

## 🚨 CRITICAL: Database Migration Flow

### ✅ **CORRECT Migration Flow:**
1. **Local Development:**
   - Make schema changes in `prisma/schema.prisma`
   - Run `npx prisma migrate dev --name description` to create migration
   - Test locally with seeding scripts

2. **Production Deployment:**
   - Push code to GitHub (includes migration files)
   - GitHub Actions automatically runs `npx prisma migrate deploy`
   - Production gets updated safely through the pipeline

### ❌ **NEVER DO THIS:**
- **NEVER** run scripts directly against production database
- **NEVER** bypass the GitHub Actions pipeline for production changes
- **NEVER** use direct DATABASE_URL for production operations outside of emergency

### 📝 **Remember:**
- **ONLY** test scripts locally, then deploy through proper channels
- Migrations should handle both schema changes AND data seeding
- Production database operations must go through the proper CI/CD pipeline
- This prevents data corruption, conflicts, and maintains audit trail

## 🚨 CRITICAL: Google Analytics Implementation

### ⚠️ **Current Implementation (Sept 23, 2025)**
**Status**: Complex but necessary for production stability

The current Google Analytics implementation in `/src/components/analytics/google-analytics.tsx` is **intentionally complex** and **NOT standard practice**. This was implemented to solve specific production issues.

### 🔧 **Why It's Complex:**
1. **Production gtag Errors**: Users experiencing `window.gtag is not a function` errors
2. **Strict CSP Requirements**: Content Security Policy blocking standard implementations
3. **GDPR Compliance**: Cookie consent management delays script loading
4. **SSR/Hydration Timing**: Next.js server-side rendering complications
5. **Multi-language Support**: Complex routing adds timing challenges

### 📋 **Current Features (Not Standard):**
```javascript
// Multiple protective layers implemented:
- Global gtag fallback function (prevents errors)
- Script loading state management (gtagReady tracking)
- Multiple existence checks (window.gtag validation)
- Suspense boundaries (SSR compatibility)
- CSP-compliant script injection
- Consent-based conditional loading
```

### 🎯 **Future Simplification Plan:**

**Phase 1**: ✅ **Fix Production (Current)**
- Keep complex implementation until production is stable
- Monitor for 1+ weeks after deployment
- Ensure no gtag errors in production logs

**Phase 2**: 📋 **Simplify Implementation (Future)**
Once production is stable, refactor to standard approach:

```javascript
// Target: Clean, standard, GDPR-compliant implementation
export function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    setHasConsent(isAnalyticsAllowed())
    const handleConsent = () => setHasConsent(isAnalyticsAllowed())
    window.addEventListener('consentChanged', handleConsent)
    return () => window.removeEventListener('consentChanged', handleConsent)
  }, [])

  if (!hasConsent) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      <Script id="ga">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', {
          anonymize_ip: true,
          allow_google_signals: false
        });
      `}</Script>
    </>
  )
}
```

### 📚 **Key Files:**
- `/src/components/analytics/google-analytics.tsx` - Main implementation
- `/src/lib/analytics.ts` - Helper functions with safety checks
- `/src/middleware.ts` - CSP configuration for Google Analytics
- `/src/lib/cookie-consent.ts` - GDPR consent management

### 🤖 **Notes for Future Developers:**
- Current complexity is temporary solution for production stability
- Standard implementations failed due to timing/CSP/consent issues
- Do NOT modify current implementation without understanding production context
- Plan simplification only after confirming 1+ weeks of production stability
- Always test any changes with GDPR consent flow and CSP headers

### 📅 **Timeline:**
- **Sept 23, 2025**: Complex implementation deployed to fix production errors
- **Target**: 1 week stability monitoring
- **Future**: Simplify to standard implementation while maintaining GDPR compliance