#!/usr/bin/env node

/**
 * Smart schema configuration for local vs production
 * This script modifies the schema.prisma file based on environment
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

// Read the current schema
let schema = fs.readFileSync(schemaPath, 'utf8');

if (isProduction) {
  // For production: add directUrl
  if (!schema.includes('directUrl')) {
    schema = schema.replace(
      /datasource db \{[\s\S]*?\}/,
      `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`
    );
    console.log('✅ Added directUrl for production deployment');
  }
} else {
  // For local development: remove directUrl if it exists
  if (schema.includes('directUrl')) {
    schema = schema.replace(
      /datasource db \{[\s\S]*?\}/,
      `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
    );
    console.log('✅ Removed directUrl for local development');
  }
}

// Write the modified schema back
fs.writeFileSync(schemaPath, schema);
console.log('🎯 Schema configured for', isProduction ? 'production' : 'local development');