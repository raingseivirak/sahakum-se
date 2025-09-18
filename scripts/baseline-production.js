#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Baselining production database migrations...');
console.log('⚠️  WARNING: This is for emergency use only!');
console.log('📝 Use this only if production has schema but no migration history');

// Single clean init migration to mark as applied
const migrations = [
  '20250918133234_init'
];

try {
  // Set up schema for production
  execSync('node scripts/setup-schema.js', { stdio: 'inherit' });

  // Mark each migration as applied
  for (const migration of migrations) {
    console.log(`📝 Marking migration ${migration} as applied...`);
    execSync(`npx prisma migrate resolve --applied "${migration}"`, { stdio: 'inherit' });
  }

  console.log('✅ All migrations marked as applied in production database');
  console.log('🚀 Production database is now ready for future migrations');

} catch (error) {
  console.error('❌ Error during baseline:', error.message);
  process.exit(1);
}