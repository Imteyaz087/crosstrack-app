const fs = require('fs');
const path = require('path');

const errors = [];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const imports = content.match(/from\s+['"]([^'"]+)['"]/g) || [];

  imports.forEach(imp => {
    const match = imp.match(/from\s+['"]([^'"]+)['"]/);
    if (!match) return;

    let modPath = match[1];
    if (!modPath.startsWith('.') && !modPath.startsWith('@/')) return;
    if (modPath.startsWith('@/')) modPath = modPath.replace('@/', 'src/');
    else modPath = path.resolve(path.dirname(filePath), modPath);

    const exts = ['', '.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];
    const found = exts.some(ext => fs.existsSync(modPath + ext));
    if (!found) errors.push({ file: filePath, import: match[1], resolved: modPath });
  });
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walkDir(full);
    else if (f.endsWith('.ts') || f.endsWith('.tsx')) checkFile(full);
  });
}

walkDir('src');
if (errors.length === 0) console.log('ALL IMPORTS RESOLVE CORRECTLY');
else {
  console.log('IMPORT ERRORS:');
  errors.forEach(e => console.log('  ', e.file, '->', e.import));
}