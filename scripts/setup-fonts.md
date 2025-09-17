# Font Setup Instructions

## 📋 Required Fonts

### 1. Sweden Sans (Official Sweden Brand Font)

**Download from:** [Sweden Brand Typography](https://sharingsweden.se/the-sweden-brand/brand-visual-identity/typography)

**Steps:**
1. Visit https://sharingsweden.se/the-sweden-brand/brand-visual-identity/typography
2. Scroll to "Main typeface" section
3. Click "Download Sweden Sans family (ZIP 220.6 KB)"
4. Extract the ZIP file
5. Copy the .woff2 and .woff files to: `public/fonts/sweden-sans/`

**Required files:**
- SwedenSans-Book.woff2
- SwedenSans-Book.woff
- SwedenSans-Regular.woff2
- SwedenSans-Regular.woff  
- SwedenSans-Semibold.woff2
- SwedenSans-Semibold.woff
- SwedenSans-Bold.woff2
- SwedenSans-Bold.woff

### 2. Noto Sans Khmer (Already configured via Google Fonts CDN)

**Status:** ✅ Already working via Google Fonts CDN import

**URL:** https://fonts.google.com/noto/specimen/Noto+Sans+Khmer

## 🔧 Implementation Status

### ✅ Completed:
- Updated CSS font-face declarations for Sweden Sans
- Updated font family variables in CSS
- Updated Tailwind config to use Sweden Sans
- Configured proper font fallbacks

### ⏳ Pending:
- Download Sweden Sans fonts from official source
- Place font files in `public/fonts/sweden-sans/` directory

## 🚀 After Font Installation

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test fonts on different pages:
   - Swedish (sv): Should use Sweden Sans
   - English (en): Should use Sweden Sans  
   - Khmer (km): Should use Noto Sans Khmer

## 🐛 Troubleshooting

If fonts don't load:

1. **Check file paths:** Ensure fonts are in `public/fonts/sweden-sans/`
2. **Check file names:** Must match exactly (case-sensitive)
3. **Clear browser cache:** Hard reload (Cmd/Ctrl + Shift + R)
4. **Check Network tab:** Verify font files load without 404 errors

## 📖 Font Usage Examples

```css
/* Swedish/English text */
.swedish-text {
  font-family: 'Sweden Sans', system-ui, sans-serif;
}

/* Khmer text */
.khmer-text {
  font-family: 'Noto Sans Khmer', system-ui, sans-serif;
}

/* Multilingual fallback */
.multilingual-text {
  font-family: 'Sweden Sans', 'Noto Sans Khmer', system-ui, sans-serif;
}
```

## 🎯 Sweden Brand Compliance

According to [Sweden Brand Guidelines](https://sharingsweden.se/the-sweden-brand/brand-visual-identity/typography):

- **Sweden Sans:** Main typeface for Swedish/English content
- **Noto Sans:** Alternative/supporting typeface for non-roman languages
- **Font weights:** Book (300), Regular (400), Semibold (600), Bold (700)
