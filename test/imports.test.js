const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.')
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

let failed = false;

function checkImport(file) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /from ['"](.+)['"]/g;
  const dir = path.dirname(file);
  for (const match of content.matchAll(regex)) {
    const p = match[1];
    if (p.startsWith('.')) {
      const resolved = path.resolve(dir, p);
      const possibilities = [
        resolved,
        resolved + '.ts',
        resolved + '.tsx',
        path.join(resolved, 'index.ts'),
        path.join(resolved, 'index.tsx')
      ];
      const exists = possibilities.some(f => fs.existsSync(f));
      if (!exists) {
        console.error(`Missing import ${p} in ${file}`);
        failed = true;
      }
    }
  }
}

files.forEach(checkImport);

if (failed) {
  process.exit(1);
} else {
  console.log('All import paths valid.');
}
