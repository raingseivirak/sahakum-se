#!/bin/bash

# Sweden Sans Font Download Script
# This script helps download and set up the official Sweden Sans fonts

echo "🇸🇪 Sweden Sans Font Setup Script"
echo "=================================="
echo ""

# Create fonts directory
echo "📁 Creating fonts directory..."
mkdir -p public/fonts/sweden-sans

echo "⚠️  MANUAL DOWNLOAD REQUIRED"
echo ""
echo "Please follow these steps to download Sweden Sans fonts:"
echo ""
echo "1. 🌐 Visit: https://sharingsweden.se/the-sweden-brand/brand-visual-identity/typography"
echo "2. 📜 Scroll to 'Main typeface' section" 
echo "3. 📥 Click 'Download Sweden Sans family (ZIP 220.6 KB)'"
echo "4. 📦 Extract the downloaded ZIP file"
echo "5. 📋 Copy these files to public/fonts/sweden-sans/:"
echo ""
echo "   Required files:"
echo "   ✅ SwedenSans-Book.woff2"
echo "   ✅ SwedenSans-Book.woff"
echo "   ✅ SwedenSans-Regular.woff2" 
echo "   ✅ SwedenSans-Regular.woff"
echo "   ✅ SwedenSans-Semibold.woff2"
echo "   ✅ SwedenSans-Semibold.woff"
echo "   ✅ SwedenSans-Bold.woff2"
echo "   ✅ SwedenSans-Bold.woff"
echo ""

# Check if fonts exist
if [ -f "public/fonts/sweden-sans/SwedenSans-Regular.woff2" ]; then
    echo "✅ Sweden Sans fonts found! Enabling font declarations..."
    
    # Uncomment the @font-face declarations in CSS
    sed -i.bak 's|/\*@font-face|@font-face|g; s|\*/||g' src/app/[locale]/globals.css
    
    echo "✅ Font declarations activated!"
    echo "🚀 Restart your dev server: npm run dev"
else
    echo "⏳ Fonts not found. Complete the manual download steps above."
    echo ""
    echo "📝 After downloading, run this script again:"
    echo "   chmod +x scripts/download-sweden-sans.sh"
    echo "   ./scripts/download-sweden-sans.sh"
fi

echo ""
echo "📖 Current Status:"
echo "   🔄 Using Inter font as temporary fallback"
echo "   ✅ Noto Sans Khmer working via Google Fonts"
echo ""
echo "🎯 Next Steps:"
echo "   1. Download Sweden Sans fonts (see instructions above)"
echo "   2. Run this script again to activate them"
echo "   3. Test fonts: http://localhost:3000"
echo ""
