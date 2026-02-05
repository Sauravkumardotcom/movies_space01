import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, 'backend', 'dist');

async function walkDir(dir) {
  const files = [];
  function walk(d) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }
  walk(dir);
  return files;
}

function calculateRelativePath(fromFile, toModule) {
  const fromDir = path.dirname(fromFile);
  const relativePath = path.relative(fromDir, toModule);
  return './' + relativePath.replace(/\\/g, '/');
}

async function fixAliases() {
  console.log('🔧 Fixing all path aliases in dist folder...\n');

  const files = await walkDir(distPath);
  let fixedCount = 0;
  let filesModified = new Set();

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    // Fix @config/* -> ./config/*
    content = content.replace(/from\s+['"]@config\/([^'"]+)['"]/g, (match, module) => {
      const toPath = path.join(distPath, 'config', module + '.js');
      const rel = calculateRelativePath(file, toPath);
      return `from '${rel}'`;
    });

    // Fix @middleware/* -> ./middleware/*
    content = content.replace(/from\s+['"]@middleware\/([^'"]+)['"]/g, (match, module) => {
      const toPath = path.join(distPath, 'middleware', module + '.js');
      const rel = calculateRelativePath(file, toPath);
      return `from '${rel}'`;
    });

    // Fix @routes/* -> ./routes/*
    content = content.replace(/from\s+['"]@routes\/([^'"]+)['"]/g, (match, module) => {
      const toPath = path.join(distPath, 'routes', module + '.js');
      const rel = calculateRelativePath(file, toPath);
      return `from '${rel}'`;
    });

    // Fix @services/* -> ./services/*
    content = content.replace(/from\s+['"]@services\/([^'"]+)['"]/g, (match, module) => {
      const toPath = path.join(distPath, 'services', module + '.js');
      const rel = calculateRelativePath(file, toPath);
      return `from '${rel}'`;
    });

    // Fix @utils/* -> ./utils/*
    content = content.replace(/from\s+['"]@utils\/([^'"]+)['"]/g, (match, module) => {
      const toPath = path.join(distPath, 'utils', module + '.js');
      const rel = calculateRelativePath(file, toPath);
      return `from '${rel}'`;
    });

    // Fix @types/* -> ./types/*
    content = content.replace(/from\s+['"]@types\/([^'"]+)['"]/g, (match, module) => {
      const toPath = path.join(distPath, 'types', module + '.js');
      const rel = calculateRelativePath(file, toPath);
      return `from '${rel}'`;
    });

    // Fix @lib/* -> ./lib/*
    content = content.replace(/from\s+['"]@lib\/([^'"]+)['"]/g, (match, module) => {
      const toPath = path.join(distPath, 'lib', module + '.js');
      const rel = calculateRelativePath(file, toPath);
      return `from '${rel}'`;
    });

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      filesModified.add(file);
      fixedCount++;
      const relativePath = path.relative(distPath, file);
      console.log(`✓ Fixed: ${relativePath}`);
    }
  }

  console.log(`\n✅ Total files modified: ${fixedCount}`);
  console.log(`✅ All path aliases resolved to relative imports`);
}

fixAliases().catch(console.error);
