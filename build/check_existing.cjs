const fs = require('fs');
const path = require('path');

const missing = JSON.parse(fs.readFileSync('D:/AIproject/菜谱/build/chunks/missing.json', 'utf8'));
const imgDir = 'D:/AIproject/菜谱/assets/images';
const existingFiles = fs.readdirSync(imgDir).filter(f => f.endsWith('.png'));

const normalizedFiles = {};
for (const f of existingFiles) {
  const base = f.replace(/\.png$/, '');
  const norm = base.replace(/[\s／\/]/g, '');
  normalizedFiles[norm] = f;
}

const alreadyExist = [];
const trulyMissing = [];

for (const name of missing) {
  const norm = name.replace(/[\s／\/]/g, '');
  if (normalizedFiles[norm]) {
    alreadyExist.push({ recipeName: name, actualFile: normalizedFiles[norm] });
  } else {
    trulyMissing.push(name);
  }
}

process.stdout.write('Already have image files (name mismatch): ' + alreadyExist.length + '\n');
for (const e of alreadyExist) {
  process.stdout.write('  recipe: "' + e.recipeName + '" -> file: "' + e.actualFile + '"\n');
}

process.stdout.write('\nTruly missing (no image file at all): ' + trulyMissing.length + '\n');
for (const t of trulyMissing) {
  process.stdout.write('  ' + t + '\n');
}
