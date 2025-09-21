const { execSync } = require('child_process');

console.log('🔧 Resolving failed migration...');

try {
  // First, setup the schema for production
  execSync('node scripts/setup-schema.js', { stdio: 'inherit' });

  // Mark the failed migration as resolved
  console.log('📝 Marking migration as resolved...');
  execSync('npx prisma migrate resolve --applied 20250920103000_add_permission_system', { stdio: 'inherit' });

  // Try to deploy migrations again
  console.log('🚀 Deploying migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('✅ Migration resolved successfully!');
} catch (error) {
  console.error('❌ Failed to resolve migration:', error.message);
  process.exit(1);
}