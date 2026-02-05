#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'backend', 'dist');

// Mapping of TypeScript path aliases to relative paths
const aliasMap = {
  '@config': './config',
  '@middleware': './middleware',
  '@routes': './routes',
  '@services': './services',
  '@types': './types',
  '@utils': './utils',
  '@lib': './lib',
};

function replaceAliases(content) {
  let updated = content;
  for (const [alias, relative] of Object.entries(aliasMap)) {
    // Match import/require statements with the alias
    // Pattern: from '@config/...' or require('@config/...')
    const regex = new RegExp(`['"]${alias}/`, 'g');
    updated = updated.replace(regex, `'${relative}/`);
    
    // Also handle cases without subpath
    const regexNoSubpath = new RegExp(`['"]${alias}['"]`, 'g');
    updated = updated.replace(regexNoSubpath, `'${relative}'`);
  }
  return updated;
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDir(filePath);
    } else if (file.endsWith('.js')) {
      console.log(`Processing: ${filePath}`);
      let content = fs.readFileSync(filePath, 'utf8');
      const updated = replaceAliases(content);
      
      if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf8');
        console.log(`  ✓ Updated`);
      }
    }
  }
}

console.log('Fixing TypeScript path aliases in compiled code...');
if (fs.existsSync(distDir)) {
  processDir(distDir);
  console.log('✅ Alias resolution complete!');
} else {
  console.error(`❌ dist directory not found: ${distDir}`);
  process.exit(1);
}
