import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'backend', 'dist');

const aliasPatterns = [
  /from\s+['"]@\w+\//g,
  /from\s+['"]@\w+['"]$/gm,
  /import\s+['"]@\w+\//g,
];

async function auditDist() {
  const results = {
    totalFiles: 0,
    filesWithAliases: 0,
    aliasCount: 0,
    offendingFiles: {},
  };

  async function scanDir(dir) {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
          await scanDir(filePath);
        } else if (file.endsWith('.js')) {
          results.totalFiles++;
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const aliases = [];

            for (const pattern of aliasPatterns) {
              let match;
              const regexCopy = new RegExp(pattern.source, pattern.flags);
              while ((match = regexCopy.exec(content)) !== null) {
                aliases.push(match[0]);
              }
            }

            if (aliases.length > 0) {
              results.filesWithAliases++;
              results.aliasCount += aliases.length;
              results.offendingFiles[path.relative(distDir, filePath)] = [
                ...new Set(aliases),
              ];
            }
          } catch (error) {
            console.error(`Error reading ${filePath}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error.message);
    }
  }

  console.log('🔍 Auditing dist folder for unresolved path aliases...\n');
  await scanDir(distDir);

  console.log('📊 AUDIT RESULTS:');
  console.log(`   Total .js files: ${results.totalFiles}`);
  console.log(`   Files with aliases: ${results.filesWithAliases}`);
  console.log(`   Total alias occurrences: ${results.aliasCount}\n`);

  if (results.filesWithAliases > 0) {
    console.log('❌ OFFENDING FILES:\n');
    for (const [file, aliases] of Object.entries(results.offendingFiles)) {
      console.log(`   ${file}`);
      aliases.forEach((alias) => console.log(`      • ${alias}`));
    }
  } else {
    console.log('✅ All aliases resolved! dist is clean.');
  }

  return results;
}

await auditDist();
