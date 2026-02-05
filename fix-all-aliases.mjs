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

function replaceAliases(content, filePath) {
  let updated = content;
  
  // First, replace TypeScript aliases
  for (const [alias, relative] of Object.entries(aliasMap)) {
    // Match import/require statements with the alias and subpath
    // Pattern: from '@config/...' or require('@config/...')
    const regexWithSubpath = new RegExp(`['"]${alias}/`, 'g');
    updated = updated.replace(regexWithSubpath, `'${relative}/`);
    
    // Handle cases without subpath - need to add /index for directories
    // Pattern: '@middleware' -> './middleware/index'
    const regexNoSubpath = new RegExp(`['"]${alias}(['"])`,'g');
    updated = updated.replace(regexNoSubpath, `'${relative}/index'$1`);
  }
  
  // Fix relative imports - add /index only for directories, not files
  const relativeImportRegex = /from\s+['"](\.\.\/.+?)['"];/g;
  updated = updated.replace(relativeImportRegex, (match, importPath) => {
    // Skip if it already has /index or has a file extension
    if (importPath.includes('/index') || importPath.includes('.js') || importPath.includes('.ts')) {
      return match;
    }
    
    // Get absolute path to check if it's a directory
    const currentDir = path.dirname(filePath);
    const resolvedPath = path.resolve(currentDir, importPath);
    
    // Check if resolved path is a directory that contains index.js
    const indexPath = resolvedPath + '/index.js';
    if (fs.existsSync(indexPath)) {
      // It's a directory with index.js - add /index
      const pathWithIndex = importPath + '/index';
      return `from '${pathWithIndex}';`;
    }
    
    // It's likely a direct file import or doesn't exist yet
    return match;
  });
  
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
      const updated = replaceAliases(content, filePath);
      
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
