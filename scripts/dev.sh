#!/bin/bash

# Development server startup script for Sahakum Khmer CMS
# This ensures you're running from the correct directory

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting Sahakum Khmer CMS Development Server"
echo "================================================="
echo ""
echo "📁 Project Directory: $PROJECT_DIR"
echo ""

# Change to project directory
cd "$PROJECT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found. You may need to configure environment variables."
fi

# Start Docker if needed for database
echo "🐳 Checking Docker services..."
if ! docker-compose ps | grep -q "sahakum_postgres.*Up"; then
    echo "🔧 Starting PostgreSQL database..."
    docker-compose up -d
    sleep 3
fi

# Start development server
echo "🌟 Starting Next.js development server..."
echo "📊 Project: Sahakum Khmer CMS (Trilingual)"
echo "🌐 URL: http://localhost:3000"
echo ""
echo "Available routes:"
echo "  • http://localhost:3000/sv (Swedish - Default)"
echo "  • http://localhost:3000/en (English)"
echo "  • http://localhost:3000/km (Khmer)"
echo "  • http://localhost:3000/sv/admin (Admin Dashboard)"
echo ""

npm run dev
