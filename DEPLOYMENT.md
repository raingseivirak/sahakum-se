# Deployment Guide - Sahakum Khmer CMS

This guide covers deploying the Sahakum Khmer CMS to Vercel with Supabase database and automatic GitHub Actions deployment.

## Prerequisites

- [Vercel Account](https://vercel.com)
- [Supabase Account](https://supabase.com)
- [GitHub Repository](https://github.com)
- Node.js 18+ installed locally

## 1. Supabase Setup

### Create a New Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Set project name: `sahakum-khmer-cms`
5. Choose a database password (save this!)
6. Select a region (closest to your users)

### Database Configuration
1. In Supabase dashboard, go to Settings → Database
2. Copy the **Connection String** (URI format)
3. Copy the **Direct Connection String** (for migrations)
4. Go to Settings → API
5. Copy the **Project URL**
6. Copy the **anon/public key**
7. Copy the **service_role key** (keep this secret!)

### Set Up Database Schema
```bash
# Copy production schema
cp prisma/schema.prisma.production prisma/schema.prisma

# Generate Prisma client
npx prisma generate

# Deploy migrations to Supabase
npx prisma migrate deploy
```

## 2. Vercel Setup

### Install Vercel CLI
```bash
npm install -g vercel@latest
```

### Link Project to Vercel
```bash
# In your project directory
vercel

# Follow the prompts:
# ? Set up and deploy "~/sahakum-khmer-cms"? [Y/n] y
# ? Which scope? Your username
# ? Link to existing project? [y/N] n
# ? What's your project's name? sahakum-khmer-cms
# ? In which directory is your code located? ./
```

### Configure Environment Variables in Vercel

Go to your Vercel dashboard → Project → Settings → Environment Variables

Add these variables for **Production**:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres

NEXTAUTH_SECRET=your-very-long-random-secret-here-32-chars-min

NEXTAUTH_URL=https://your-app-name.vercel.app

SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co

SUPABASE_ANON_KEY=your-anon-key-from-supabase

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase

NODE_ENV=production
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with your Supabase database password
- Replace `YOUR_PROJECT_ID` with your actual Supabase project ID
- Replace `your-app-name` with your actual Vercel app name
- Generate a strong `NEXTAUTH_SECRET` (at least 32 characters)

## 3. GitHub Actions Setup

### Required Secrets

In your GitHub repository, go to Settings → Secrets and Variables → Actions

Add these **Repository Secrets**:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
DATABASE_URL=your-supabase-connection-string
```

### Get Vercel Credentials

1. **Vercel Token**:
   ```bash
   vercel login
   # Generate token at: https://vercel.com/account/tokens
   ```

2. **Organization ID**:
   ```bash
   cat .vercel/project.json
   # Copy "orgId" value
   ```

3. **Project ID**:
   ```bash
   cat .vercel/project.json
   # Copy "projectId" value
   ```

## 4. Package.json Scripts

Update your `package.json` with deployment scripts:

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:seed": "tsx scripts/seed-admin.ts",
    "deploy:preview": "vercel",
    "deploy:production": "vercel --prod",
    "postinstall": "prisma generate"
  }
}
```

## 5. Deployment Process

### Automatic Deployment (Recommended)

The GitHub Actions workflow will automatically:

1. **On Pull Request**: Deploy preview to Vercel
2. **On Push to Main**: Deploy to production

### Manual Deployment

```bash
# Preview deployment
npm run deploy:preview

# Production deployment
npm run deploy:production

# Run database migrations
npm run db:migrate
```

## 6. First-Time Setup After Deployment

### 1. Create Admin User
```bash
# SSH into your deployment or run locally with production DB
npx tsx scripts/seed-admin.ts
```

### 2. Seed Initial Data
```bash
# Run other seeding scripts as needed
npx tsx scripts/seed-categories-tags.ts
npx tsx scripts/seed-services.ts
npx tsx scripts/seed-pages-final.ts
```

### 3. Configure Media Storage

For production media storage, consider:
- **Supabase Storage** (recommended)
- **Vercel Blob Storage**
- **AWS S3**
- **Cloudinary**

## 7. Domain Configuration (Optional)

### Custom Domain Setup
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update `NEXTAUTH_URL` in environment variables
4. Update DNS records as instructed by Vercel

## 8. Monitoring and Maintenance

### Database Monitoring
- Monitor in Supabase Dashboard
- Set up alerts for connection limits
- Regular backups (Supabase handles this automatically)

### Application Monitoring
- Use Vercel Analytics
- Monitor function execution times
- Check deployment logs

### Performance Optimization
```bash
# Analyze bundle size
npm run build

# Check for unused dependencies
npx depcheck
```

## 9. Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Test database connection
   npx prisma db pull
   ```

2. **Build Failures**
   ```bash
   # Check TypeScript errors
   npm run type-check

   # Check linting
   npm run lint
   ```

3. **Migration Issues**
   ```bash
   # Reset database (careful!)
   npx prisma migrate reset

   # Deploy specific migration
   npx prisma migrate deploy
   ```

### Environment Variables Checklist

- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `DIRECT_URL` - Supabase direct connection
- [ ] `NEXTAUTH_SECRET` - Random secret (32+ chars)
- [ ] `NEXTAUTH_URL` - Your domain URL
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase private key

## 10. Security Considerations

- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Use environment variables for all sensitive data
- Enable Supabase RLS (Row Level Security) if needed
- Regular security updates for dependencies

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Review GitHub Actions workflow logs
4. Ensure all environment variables are set correctly

---

## Quick Deployment Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Vercel project linked
- [ ] Environment variables configured
- [ ] GitHub secrets added
- [ ] Repository pushed to GitHub
- [ ] Admin user created
- [ ] Initial data seeded
- [ ] Domain configured (if custom)
- [ ] SSL certificate active