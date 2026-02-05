const fs = require('fs');
const path = require('path');

const distDir = './backend/dist';

function fixAliases(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixAliases(filePath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Replace path aliases - handle different depths
      content = content.replace(/from ['"]@utils\//g, "from '../utils/");
      content = content.replace(/from ['"]@config\//g, "from '../config/");
      content = content.replace(/from ['"]@middleware\//g, "from '../middleware/");
      content = content.replace(/from ['"]@lib\//g, "from '../lib/");
      content = content.replace(/from ['"]@types\//g, "from '../types/");
      content = content.replace(/from ['"]@services\//g, "from '../services/");
      content = content.replace(/from ['"]@routes\//g, "from '../routes/");
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed: ${filePath}`);
      }
    }
  }
}

fixAliases(distDir);
console.log('Alias resolution complete!');
