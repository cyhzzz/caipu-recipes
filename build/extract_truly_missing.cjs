const fs = require('fs');

const missing = JSON.parse(fs.readFileSync('D:/AIproject/菜谱/build/chunks/missing.json', 'utf8'));
const allPrompts = JSON.parse(fs.readFileSync('D:/AIproject/菜谱/build/chunks/missing_prompts.json', 'utf8'));
const imgDir = 'D:/AIproject/菜谱/assets/images';
const existingFiles = fs.readdirSync(imgDir).filter(f => f.endsWith('.png'));

const normalizedFiles = {};
for (const f of existingFiles) {
  const base = f.replace(/\.png$/, '');
  const norm = base.replace(/[\s／\/]/g, '');
  normalizedFiles[norm] = f;
}

// Get prompts for truly missing recipes only
const trulyMissingPrompts = [];
for (const p of allPrompts) {
  const norm = p.name.replace(/[\s／\/]/g, '');
  if (!normalizedFiles[norm]) {
    trulyMissingPrompts.push(p);
  }
}

// Output as compact format: one per line as name|||prompt
const lines = trulyMissingPrompts.map(p => p.name + '|||' + p.cat + '|||' + p.prompt);
fs.writeFileSync('D:/AIproject/菜谱/build/chunks/truly_missing.txt', lines.join('\n\n'), 'utf8');

process.stdout.write('Total truly missing: ' + trulyMissingPrompts.length + '\n');
// Output first 5 names
process.stdout.write('First 5: ' + trulyMissingPrompts.slice(0, 5).map(p => p.name).join(', ') + '\n');
process.stdout.write('Last 5: ' + trulyMissingPrompts.slice(-5).map(p => p.name).join(', ') + '\n');
