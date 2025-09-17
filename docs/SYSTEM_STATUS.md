# Sahakum Khmer CMS - System Status & Documentation

Last updated: September 17, 2025

## 🚀 Current System Status

### Working Features ✅
- **Homepage** - Fully functional with Sweden Brand design
  - Services section with dynamic content from database
  - Featured pages with excerpts and images
  - Multilingual support (EN/SV/KM)
  - Responsive design with Sweden Brand colors and typography

- **Authentication System** - NextAuth.js implementation
  - Admin login: `admin@sahakumkhmer.se` / `admin123`
  - Role-based access control (ADMIN, EDITOR, USER)
  - Session management working

- **Admin Panel** - Functional admin interface
  - Pages management (create, edit, delete, publish)
  - Posts/Blog management with WYSIWYG editor
  - Media management with file upload and organization
  - Services management with featured images and themes
  - Members management
  - Users management with role assignment

- **Content Management** - Full CMS functionality
  - Multilingual content (EN/SV/KM)
  - Featured images for all content types
  - SEO fields (meta description, SEO title)
  - Content status management (DRAFT/PUBLISHED/ARCHIVED)
  - Sweden Editor (TipTap) with brand-compliant styling

- **Blog System** - Complete blog functionality
  - Blog index page (`/blog`) with post listings
  - Individual blog post pages (`/blog/[slug]`)
  - Direct database queries for optimal performance
  - Support for categories, tags, and featured images

- **Public API Endpoints** - Working public APIs
  - `/api/public/pages` - Get published pages
  - `/api/public/posts` - Get published blog posts
  - `/api/public/services` - Get active services

### Recent Fixes (September 17, 2025) 🔧

1. **Services Section Runtime Error** - FIXED
   - Added missing `featuredImg`, `colorTheme`, `buttonText` fields to Service schema
   - Updated services-section.tsx component interface
   - Fixed API to return all required fields
   - Re-seeded services with correct data structure

2. **Page Saving Error** - FIXED
   - Fixed field name mismatch: `contentId` → `contentItemId` in pages API
   - Page editing and saving now works correctly

3. **Media Sync API** - FIXED
   - Fixed field name mismatch: `uploadedBy` → `uploaderId`
   - Media file synchronization now works

4. **Schema Management** - IMPROVED
   - Created smart schema configuration that adapts to environment
   - No more manual commenting/uncommenting of `directUrl`
   - Single schema works for both local and production

5. **Content Format Migration** - COMPLETED
   - Converted all blog posts from basic HTML to Sweden Editor format
   - Added proper CSS classes (`font-sweden`, `text-sweden-heading`, etc.)
   - Fixed API field name errors (`contentId` → `contentItemId`)
   - All content now compatible with TipTap WYSIWYG editor

6. **Blog Navigation Issue** - FIXED
   - Fixed blog page infinite loading caused by circular API dependency
   - Replaced internal `fetch()` calls with direct database queries
   - Blog service button now works correctly (`/blog` route)

## 🏗️ Database Schema

### Core Models
- **User** - Authentication and authorization
- **ContentItem** - Pages and posts with multilingual support
- **ContentTranslation** - Translations for content items
- **Service** - Homepage services with themes and featured images
- **Member** - Community member profiles
- **MembershipRequest** - Join requests from users
- **MediaFile** - File management system

### Field Naming Conventions
- Use `active` instead of `isActive`
- Use `order` instead of `sortOrder`
- Use `contentItemId` instead of `contentId`
- Use `uploaderId` instead of `uploadedBy`

## 📁 Project Structure

```
sahakum-khmer-cms/
├── src/
│   ├── app/
│   │   ├── [locale]/           # Multilingual routing
│   │   │   ├── admin/          # Admin panel pages
│   │   │   │   ├── pages/      # Page management
│   │   │   │   ├── posts/      # Blog management
│   │   │   │   ├── services/   # Services management
│   │   │   │   ├── members/    # Member management
│   │   │   │   └── media/      # Media management
│   │   │   ├── join/           # Membership application
│   │   │   ├── blog/           # Public blog
│   │   │   └── [slug]/         # Dynamic pages
│   │   └── api/
│   │       ├── public/         # Public APIs (no auth)
│   │       ├── pages/          # Page management APIs
│   │       ├── posts/          # Post management APIs
│   │       ├── services/       # Services management APIs
│   │       ├── members/        # Member management APIs
│   │       └── media/          # Media management APIs
│   ├── components/
│   │   ├── admin/              # Admin-specific components
│   │   ├── homepage/           # Homepage components
│   │   ├── ui/                 # Shared UI components
│   │   └── layout/             # Layout components
│   └── lib/                    # Utilities and configurations
├── scripts/                    # Database seeding scripts
├── prisma/                     # Database schema and migrations
└── public/
    └── media/                  # Static media files
        ├── images/
        ├── documents/
        └── videos/
```

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Database operations
npm run db:push          # Sync schema to database
npm run db:migrate       # Create migration
npm run db:reset         # Reset database (WARNING: DATA LOSS)

# Seeding
npx tsx scripts/seed-admin.ts           # Create admin user
npx tsx scripts/seed-services.ts        # Create homepage services
npx tsx scripts/seed-pages.ts           # Create main pages
npx tsx scripts/seed-personnummer-blog.ts # Create blog content

# Production setup
npm run setup            # Automated setup (Docker + DB + Admin)
npm run build           # Build for production
npm run lint            # Check code quality
npm run type-check      # TypeScript validation
```

## 🌐 API Endpoints

### Public APIs (No Authentication)
- `GET /api/public/pages?language={locale}&limit={n}` - Get published pages
- `GET /api/public/posts?language={locale}&limit={n}` - Get published posts
- `GET /api/public/services?language={locale}` - Get active services

### Admin APIs (Authentication Required)
- `GET /api/pages` - List all pages
- `GET /api/pages/{id}` - Get specific page
- `PUT /api/pages/{id}` - Update page
- `DELETE /api/pages/{id}` - Delete page
- `POST /api/pages` - Create new page

- `GET /api/services` - List all services
- `PUT /api/services/{id}` - Update service (toggle active, change order, etc.)

- `GET /api/media` - List media files
- `POST /api/media/sync` - Sync filesystem with database

## 🎨 Design System

### Sweden Brand Integration
- **Colors**: Navy (#1e3a8a), Gold (#d97706), Blue (#2563eb)
- **Typography**: Sweden Sans font family
- **Components**: Consistent with Sweden.se visual identity

### Multilingual Support
- **Languages**: English (en), Swedish (sv), Khmer (km)
- **Fonts**: Sweden Sans for EN/SV, Custom Khmer fonts for KM
- **Content**: All content models support translations

## 🚨 Known Issues & Limitations

### Requires Attention
1. **Services Admin Form** - Edit forms for services may need MediaSelector integration
2. **Member Profile Images** - Upload functionality may need testing
3. **Blog Categories/Tags** - Seeding scripts are outdated, need rewrite
4. **Media Upload** - Direct upload through admin may need testing

### Outdated Scripts
- `scripts/seed-categories-tags.ts` - Uses old field names
- `scripts/seed-members.ts` - Uses old Member schema fields

## 📝 Recent Database Changes

### Service Model Updates
```sql
ALTER TABLE services ADD COLUMN featuredImg TEXT;
ALTER TABLE services ADD COLUMN colorTheme TEXT DEFAULT 'navy';
ALTER TABLE service_translations ADD COLUMN buttonText TEXT DEFAULT 'Learn More';
```

### Field Name Standardization
- All boolean fields now use `active` instead of `isActive`
- All order fields now use `order` instead of `sortOrder`
- All foreign keys use proper naming (e.g., `contentItemId`)

## 🔐 Authentication & Authorization

### Default Admin User
- **Email**: admin@sahakumkhmer.se
- **Password**: admin123
- **Role**: ADMIN

### Role Permissions
- **ADMIN**: Full access to all features
- **EDITOR**: Content management (pages, posts, media)
- **USER**: Basic access (future membership features)

## 🌍 Deployment Configuration

### Environment Variables Required
```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...  # For production (Supabase)
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
```

### Vercel Deployment
- GitHub Actions workflow configured
- Automatic deployments on main branch
- Database migrations run on deployment
- Preview deployments for PRs

## 📋 Testing Checklist

### Core Functionality
- [ ] Homepage loads and displays services
- [ ] Admin login works
- [ ] Page creation/editing works
- [ ] Blog post creation works
- [ ] Blog index page loads (`/blog`)
- [ ] Blog service navigation works from homepage
- [ ] Individual blog posts are accessible
- [ ] Media upload and sync works
- [ ] Multilingual content displays correctly
- [ ] Membership form submission works

### API Endpoints
- [ ] Public APIs return correct data
- [ ] Admin APIs require authentication
- [ ] CRUD operations work for all models
- [ ] Field validation works correctly

This documentation should be updated whenever major changes are made to the system.