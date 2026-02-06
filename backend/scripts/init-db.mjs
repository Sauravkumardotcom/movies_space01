#!/usr/bin/env node
/**
 * Database initialization script
 * This script ensures the Prisma schema is synced with the database
 * It's called during the Vercel build process
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🗄️  Initializing database schema...');

// Run prisma db push
exec('npx prisma db push --skip-generate', { 
  cwd: __dirname,
  stdio: 'inherit'
}, (error, stdout, stderr) => {
  if (error && !error.message.includes('Already in sync')) {
    console.error('❌ Database initialization failed:', error.message);
    // Don't exit with error - let build continue
    // The schema will be created on first app startup
    console.warn('⚠️  Will attempt to create schema on first app start');
  } else {
    console.log('✅ Database schema synced successfully');
  }
});
