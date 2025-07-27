const fs = require('fs');
const path = require('path');
const tsconfig = require('../tsconfig.json');

const aliases = tsconfig.compilerOptions && tsconfig.compilerOptions.paths || {};

for (const [name, targets] of Object.entries(aliases)) {
  const target = targets[0];
  const aliasPath = path.join(__dirname, '..', 'node_modules', name);
  const targetPath = path.join(__dirname, '..', target);
  try {
    if (!fs.existsSync(targetPath)) continue;
    const dir = path.dirname(aliasPath);
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(aliasPath)) {
      fs.symlinkSync(targetPath, aliasPath, 'junction');
    }
  } catch (err) {
    console.error(`Failed to create alias for ${name}:`, err);
  }
}
