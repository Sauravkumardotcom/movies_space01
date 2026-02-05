import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'backend', 'dist');

async function fixFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    const original = content;
    
    // Replace all path aliases with relative paths
    content = content.replaceAll("from '@utils/", "from '../utils/");
    content = content.replaceAll("from '@config/", "from '../config/");
    content = content.replaceAll("from '@middleware/", "from '../middleware/");
    content = content.replaceAll("from '@lib/", "from '../lib/");
    content = content.replaceAll("from '@types/", "from '../types/");
    content = content.replaceAll("from '@services/", "from '../services/");
    content = content.replaceAll("from '@routes/", "from '../routes/");
    
    if (content !== original) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${path.relative(distDir, filePath)}`);
    }
  } catch (error) {
    console.error(`✗ Error in ${filePath}:`, error.message);
  }
}

async function walkDir(dir) {
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        await walkDir(filePath);
      } else if (file.endsWith('.js')) {
        await fixFile(filePath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

console.log('Fixing path aliases in dist folder...');
await walkDir(distDir);
console.log('Complete!');
