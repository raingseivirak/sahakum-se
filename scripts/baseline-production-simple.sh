#!/bin/bash

echo "🔄 Baselining production database migrations..."

# Exit on any error
set -e

# Set up schema for production
node scripts/setup-schema.js

# Mark all existing migrations as applied
echo "📝 Marking migrations as applied..."

npx prisma migrate resolve \
  --applied "20250918133234_init"

echo "✅ All migrations marked as applied in production database"
echo "🚀 Production database is now ready for future migrations"