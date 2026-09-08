const fs = require('fs');
const path = require('path');

const esmDir = path.resolve(__dirname, '../dist/esm');

function fixEsmDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      fixEsmDir(fullPath);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.d.ts')) {
      let content = fs.readFileSync(fullPath, 'utf-8');

      // Match relative imports and exports: from './...' or from '../...'
      content = content.replace(/(from\s+['"])(\.[^'"]+?)(['"])/g, (match, p1, p2, p3) => {
        if (p2.endsWith('.js')) return match;
        // Check if target is a directory with index.js or a direct file
        const targetPath = path.resolve(dir, p2);
        if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
          return `${p1}${p2}/index.js${p3}`;
        }
        return `${p1}${p2}.js${p3}`;
      });

      // Match dynamic import('./...')
      content = content.replace(/(import\s*\(\s*['"])(\.[^'"]+?)(['"]\s*\))/g, (match, p1, p2, p3) => {
        if (p2.endsWith('.js')) return match;
        return `${p1}${p2}.js${p3}`;
      });

      fs.writeFileSync(fullPath, content);
    }
  }
}

// 1. Ensure dist/esm has package.json with type: module
fs.mkdirSync(esmDir, { recursive: true });
fs.writeFileSync(
  path.join(esmDir, 'package.json'),
  JSON.stringify({ type: 'module' }, null, 2) + '\n'
);

// 2. Fix extensionless specifiers in dist/esm
fixEsmDir(esmDir);
console.log('[Build] ESM module manifest and fully-specified extensions generated successfully.');
