# Next.js Dynamic Route Conflicts and Solutions

## Overview

This document explains a routing conflict we encountered between dynamic pages and blog posts, and how we resolved it to prevent future issues.

## The Problem

### Route Structure That Caused Conflicts

We had two dynamic routes that could potentially conflict:

1. **Blog Posts**: `/[locale]/blog/[slug]/page.tsx`
2. **Dynamic Pages**: `/[locale]/[slug]/page.tsx`

### The Issue

When we tried to access blog posts in preview mode using URLs like:
- `/en/blog/post-slug?preview=postId`

Next.js's routing system had difficulty determining which route should handle the request, especially when:
- The blog post slug contained spaces (e.g., "post 1" became "post%201")
- The post didn't have translations in the requested language
- We were using preview mode with ID-based lookup instead of slug-based lookup

### Specific Symptoms

1. **404 Errors**: Preview URLs were returning 404 even though the routes existed
2. **Empty Database Results**: The `getPost` function was receiving empty objects `{}` instead of post data
3. **Translation Issues**: Posts with only one language translation (e.g., Swedish) couldn't be previewed in other languages (e.g., English)

## The Solution

### 1. Query Parameter Approach

Instead of creating a separate preview route (`/admin/posts/[id]/preview`), we used query parameters on the existing blog route:

```typescript
// Before (problematic)
/en/admin/posts/cmfjiqetq0004l0sqf89mqsxd/preview

// After (working)
/en/blog/any-slug?preview=cmfjiqetq0004l0sqf89mqsxd
```

### 2. Smart Database Querying

Modified the `getPost` function to handle preview mode differently:

```typescript
async function getPost(slug: string, locale: string, isPreview = false, previewId?: string) {
  let whereClause: any = { type: 'POST' }

  // In preview mode with ID, fetch by ID instead of slug
  if (isPreview && previewId) {
    whereClause.id = previewId
  } else {
    whereClause.slug = slug
    if (!isPreview) {
      whereClause.status = 'PUBLISHED'
    }
  }

  const post = await prisma.contentItem.findFirst({
    where: whereClause,
    include: {
      translations: isPreview && previewId ? {
        // In preview mode, get all translations
      } : {
        where: { language: locale }
      },
      // ... other includes
    }
  })

  // Smart translation fallback for preview mode
  let translation
  if (isPreview && previewId) {
    translation = post.translations.find(t => t.language === locale) || post.translations[0]
  } else {
    translation = post.translations[0]
  }
}
```

### 3. Language Fallback Logic

In preview mode, if the requested language translation doesn't exist, fall back to any available translation:

```typescript
// Try to find requested locale, fall back to first available
translation = post.translations.find(t => t.language === locale) || post.translations[0]
```

### 4. Preview Parameter Handling

Updated the component to properly detect and handle preview parameters:

```typescript
export default async function BlogPostPage({ params, searchParams }: BlogPostPageProps) {
  const isPreview = searchParams.preview === 'true' || !!searchParams.preview
  const previewId = typeof searchParams.preview === 'string' && searchParams.preview !== 'true'
    ? searchParams.preview
    : undefined

  const post = await getPost(params.slug, params.locale, isPreview, previewId)
}
```

## Best Practices to Avoid Similar Issues

### 1. Route Hierarchy Planning

When designing dynamic routes, consider the hierarchy:

```
✅ Good - Specific to General
/[locale]/blog/[slug]        (specific)
/[locale]/admin/[...path]    (admin area)
/[locale]/[slug]             (catch-all for pages)

❌ Bad - Could cause conflicts
/[locale]/[type]/[slug]      (too generic)
/[locale]/[slug]             (too broad)
```

### 2. Query Parameters vs Route Parameters

For temporary or conditional states (like preview), use query parameters:

```typescript
✅ Good
/blog/post-slug?preview=true&id=123

❌ Potentially problematic
/blog/post-slug/preview/123
```

### 3. Database Query Optimization

Always consider edge cases in your database queries:
- Missing translations
- Unpublished content in preview mode
- Slug vs ID-based lookups

### 4. Debugging Route Issues

When experiencing routing issues:

1. **Add Console Logs**: Temporarily add logging to see what parameters are being received
2. **Check Route Priority**: Ensure more specific routes are defined before general ones
3. **Test Edge Cases**: Test with special characters in slugs, missing translations, etc.
4. **Use Next.js Route Debugging**: Enable verbose logging to see route matching

### 5. Preview Implementation Pattern

For preview functionality, follow this pattern:

```typescript
// 1. Use query parameters on existing routes
const previewUrl = `/${locale}/blog/${slug}?preview=${postId}`

// 2. Handle both slug and ID-based lookups
if (isPreview && previewId) {
  // Fetch by ID, ignore slug
  whereClause.id = previewId
} else {
  // Normal slug-based lookup
  whereClause.slug = slug
}

// 3. Implement language fallback for preview
const translation = isPreview
  ? post.translations.find(t => t.language === locale) || post.translations[0]
  : post.translations[0]
```

## Files Modified

- `src/app/[locale]/blog/[slug]/page.tsx` - Main blog post page with preview support
- `src/app/[locale]/admin/posts/[id]/edit/page.tsx` - Updated preview button
- Removed: `src/app/[locale]/admin/posts/[id]/preview/page.tsx` - Dedicated preview route (problematic)

## Testing Checklist

When implementing similar functionality, test:

- [ ] Normal blog post access
- [ ] Preview mode with published posts
- [ ] Preview mode with unpublished posts
- [ ] Posts with missing translations in requested language
- [ ] Posts with special characters in slugs
- [ ] Preview URLs with different locales
- [ ] Authentication for preview access

## Related Issues

This routing conflict can occur in any Next.js application with:
- Multiple dynamic route segments
- Content management with preview functionality
- Multilingual content with optional translations
- Slug-based and ID-based content lookup

Always test the interaction between different dynamic routes and consider using query parameters for conditional rendering or data fetching.