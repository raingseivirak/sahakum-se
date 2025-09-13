# Sahakum Khmer CMS - Project Plan & Documentation

## 📖 Project Overview

**Organization:** Sahakum Khmer - Swedish non-profit organization
**Mission:** Helping Cambodians integrate into Swedish society through community connections and cultural exchange
**Project:** Custom trilingual CMS website (Swedish/English/Khmer)

### 🎯 Goals
- Build community connections between Cambodians and Swedes
- Provide integration resources and guides
- Share cultural events and cooking activities
- Support both cultural preservation and social adaptation

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend:** Next.js 14 (App Router) + TypeScript
- **UI Framework:** shadcn/ui + Tailwind CSS
- **Database:** Supabase (Production) + PostgreSQL (Local Docker)
- **ORM:** Prisma
- **Authentication:** Supabase Auth
- **File Storage:** Supabase Storage
- **Validation:** Zod + React Hook Form
- **Internationalization:** next-intl
- **Rich Text Editor:** TipTap/Novel
- **Deployment:** Vercel (Frontend) + Supabase (Backend)
- **Cost:** $0 (free tiers only)

### Local Development Setup
```bash
# Docker Compose for local PostgreSQL
docker-compose up -d

# Development server
npm run dev

# Database management
npx prisma studio
```

---

## 🎨 Design System

### Brand Alignment (Sweden Brand Guidelines)

**Primary Colors (Sweden Brand Compliant):**
- Sweden Blue: `#006AA7` - Headers, navigation, primary buttons
- Light Sweden Blue: `#0093BD` - Links, secondary elements
- Sweden Yellow: `#FECC02` - CTA buttons, highlights (sparingly)

**Secondary Colors (Cultural Integration):**
- Cambodian Gold: `#d69e2e` - Decorative elements from logo
- Navy Blue: `#1a365d` - Dark variant from logo

**Typography:**
- Primary: "Helvetica Neue", Helvetica, Arial, sans-serif
- Headings: Sweden Blue, semi-bold
- Body: Dark gray (#333333)
- Line height: 1.6

**Design Principles:**
- Minimalism (Swedish design tradition)
- High contrast accessibility
- Mobile-first responsive
- Cultural elements as accents only
- Sweden brand dominates visual hierarchy

---

## 📋 Content Structure

### Main Menu (Trilingual)
- About Us (Om oss / អំពីយើង)
- Cambodia (Kambodja / កម្ពុជា)
- Living in Sweden (Leva i Sverige / រស់នៅស៊ុយអែត)
- Community (Gemenskap / សហគមន៍)
- Membership (Medlemskap / ការចុះឈ្មោះជាសមាជិក)
- News & Blog (Nyheter & Blogg / ព័ត៌មាន និង ប្លក់)

### Static Pages
- About Sahakum Khmer (mission, vision, history, contact)
- Introduction to Cambodia (history, culture, food, festivals)
- Guide for Newcomers (documents, housing, healthcare, transport)
- Support Resources (legal aid, language courses, community services)

### Dynamic Collections
- Events - Community activities, workshops, cultural events
- Community Voices - Stories and experiences from members
- News - Organizational updates and Sweden-Cambodia relations
- Recipes & Food Culture - Cooking events and traditional dishes

---

## 🗄️ Database Schema

### Core Tables
```sql
-- Content Management
content_items (id, slug, type, status, created_at, updated_at, author_id)
content_translations (id, content_id, language, title, content, excerpt, meta_description, seo_title)

-- Categories & Tags
categories (id, slug, type, parent_id)
category_translations (id, category_id, language, name, description)
tags (id, slug)
tag_translations (id, tag_id, language, name)

-- Media Management
media_files (id, url, alt_text, caption, file_type, file_size, content_id)

-- User Management (via Supabase Auth)
profiles (id, email, role, first_name, last_name, avatar_url, created_at)

-- Content Relationships
content_categories (content_id, category_id)
content_tags (content_id, tag_id)
```

### Supported Languages
- `sv` - Swedish (primary)
- `en` - English
- `km` - Khmer (Cambodian)

---

## 🚀 Development Phases

### Phase 1: Foundation (Week 1)
**Status:** ✅ 100% Complete
- [x] Initialize Next.js 14 project with TypeScript + Turbopack
- [x] Configure Tailwind CSS + shadcn/ui components + Sweden brand colors
- [x] Set up Docker Compose for local PostgreSQL (port 5433)
- [x] Design and implement database schema (trilingual support)
- [x] Configure Prisma ORM with migrations (completed successfully)
- [x] Set up internationalization (next-intl) with Swedish/English/Khmer
- [x] Create basic project structure and folders
- [x] Install essential CMS dependencies (Zod, React Hook Form, TipTap, etc.)
- [x] Create basic homepage with Sweden brand styling

**Deliverable:** ✅ Working development environment with trilingual support

### Phase 2: Design System (Week 2)
**Status:** ✅ 100% Complete
- [x] Implement Sweden-compliant color palette (#006AA7, #FECC02)
- [x] Build core UI components (Header, Footer, Cards, Buttons)
- [x] Create responsive layout system with proper containers
- [x] Implement typography system with Sweden brand fonts
- [x] Build functional language switcher component (Swedish/English/Khmer)
- [x] Create admin panel dashboard with wireframes
- [x] Enhanced homepage with Sweden brand compliance
- [x] Working internationalization middleware
- [x] Professional layout components with hover effects

**Deliverable:** ✅ Complete design system + functional trilingual website

### Phase 3: Content Management (Week 3)
**Status:** ⏳ Pending
- [ ] Implement admin authentication (Supabase Auth)
- [ ] Build rich text editor (TipTap integration)
- [ ] Create image upload system (Supabase Storage)
- [ ] Implement page management CRUD
- [ ] Build blog/news management system
- [ ] Add form validation (Zod + React Hook Form)
- [ ] Create content preview functionality

**Deliverable:** Functional admin panel

### Phase 4: Public Website (Week 4)
**Status:** ⏳ Pending
- [ ] Build trilingual homepage
- [ ] Create all static pages
- [ ] Implement blog/news listing with pagination
- [ ] Add search and filter functionality
- [ ] Build contact forms
- [ ] Implement SEO optimization (metadata, sitemaps)
- [ ] Add analytics integration

**Deliverable:** Complete public website

### Phase 5: Deployment & Testing (Week 5)
**Status:** ⏳ Pending
- [ ] Deploy to Vercel
- [ ] Configure Supabase production environment
- [ ] Set up custom domain (sahakumkhmer.se)
- [ ] Add monitoring and error tracking
- [ ] Conduct user acceptance testing
- [ ] Content migration and optimization
- [ ] Performance optimization

**Deliverable:** Live production website

---

## 📦 Dependencies

### Core Dependencies
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "@supabase/supabase-js": "^2.38.0",
  "prisma": "^5.6.0",
  "@prisma/client": "^5.6.0",
  "next-intl": "^3.0.0",
  "zod": "^3.22.0",
  "react-hook-form": "^7.47.0",
  "@hookform/resolvers": "^3.3.0",
  "@tiptap/react": "^2.1.0",
  "@tiptap/starter-kit": "^2.1.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.0.0"
}
```

### Development Dependencies
```json
{
  "@types/node": "^20.0.0",
  "@types/react": "^18.0.0",
  "eslint": "^8.0.0",
  "eslint-config-next": "^14.0.0",
  "prettier": "^3.0.0",
  "husky": "^8.0.0",
  "lint-staged": "^15.0.0"
}
```

---

## 🔧 Configuration Files

### Docker Compose (Local Development)
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: sahakum_khmer_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Environment Variables
```env
# .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sahakum_khmer_dev"
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📝 Content Guidelines

### Tone & Voice
- **Friendly and supportive** - Welcoming to newcomers
- **Community-oriented** - Emphasis on connection and belonging
- **Respectful** - Cultural sensitivity in all content
- **Informative** - Clear, practical guidance

### Visual Content
- Community photos from events
- Cambodian food and cultural celebrations
- Integration success stories
- Swedish-Cambodian cultural exchange moments

### SEO Strategy
- Clear, descriptive titles (e.g., "How to find housing in Sweden")
- Multilingual meta descriptions
- Structured data markup
- Local SEO optimization for Swedish cities

---

## 🎯 Success Metrics

### Technical Metrics
- Page load speed < 2 seconds
- 95%+ accessibility score (WCAG 2.1 AA)
- Mobile-first responsive design
- SEO score > 90

### Content Metrics
- Trilingual content coverage
- Community engagement
- Resource usage tracking
- Event participation

---

## 📞 Contact & Support

**Project Lead:** [Your Name]
**Organization:** Sahakum Khmer
**Technical Stack:** Next.js + TypeScript + Supabase + Vercel

---

## 📚 Resources

- [Sweden Brand Guidelines](https://sharingsweden.se/the-sweden-brand/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎉 Latest Progress Update

**Phase 1 & 2 Complete!** (2025-01-13)

✅ **Fully functional trilingual website**
- Next.js 14 with App Router and TypeScript + Turbopack
- Complete Sweden brand-compliant design system (#006AA7, #FECC02)
- PostgreSQL database running in Docker (port 5433)
- Complete trilingual database schema (Swedish/English/Khmer)
- Prisma ORM with working migrations
- Full internationalization with next-intl + middleware
- Professional UI components (Header, Footer, Cards, Language Switcher)
- Admin panel dashboard with Sweden brand styling
- Responsive design with hover effects and transitions

**Live features:**
- Working language switcher (Swedish/English/Khmer)
- Professional homepage with call-to-action sections
- Admin dashboard with content management wireframes
- Sweden brand compliance throughout

**To start development:**
```bash
cd sahakum-khmer-cms
docker-compose up -d        # Start PostgreSQL
npm run dev                 # Start Next.js (running on http://localhost:3000)
```

**Next Phase Ready:** Content Management implementation (Phase 3)

---

*Last Updated: 2025-01-13*
*Status: Phase 1 Complete - Ready for Phase 2*