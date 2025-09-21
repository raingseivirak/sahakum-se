-- Cleanup failed migration record
-- Run this against your production database

-- First, check what's in the migrations table
SELECT
    migration_name,
    started_at,
    finished_at,
    applied_steps_count,
    logs
FROM "_prisma_migrations"
WHERE migration_name = '20250920103000_add_permission_system';

-- Delete the failed migration record
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20250920103000_add_permission_system';

-- Verify the cleanup
SELECT
    migration_name,
    started_at,
    finished_at
FROM "_prisma_migrations"
ORDER BY started_at DESC
LIMIT 5;