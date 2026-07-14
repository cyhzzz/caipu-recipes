const fs = require('fs');
const data = fs.readFileSync('D:/AIproject/菜谱/build/chunks/truly_missing.txt', 'utf8');
const entries = data.split('\n\n');

// Skip first 25 (already generated), split remaining 72 into 4 groups of 18
const remaining = entries.slice(25);
const groupSize = 18;

for (let g = 0; g < 4; g++) {
  const start = g * groupSize;
  const end = Math.min(start + groupSize, remaining.length);
  const group = remaining.slice(start, end);
  
  const recipes = group.map((entry, i) => {
    const parts = entry.split('|||');
    return { name: parts[0], cat: parts[1], prompt: parts[2], index: i };
  });
  
  const outPath = `D:/AIproject/菜谱/build/chunks/batch_group_${g}.json`;
  fs.writeFileSync(outPath, JSON.stringify(recipes, null, 2), 'utf8');
  
  process.stdout.write(`Group ${g}: ${recipes.length} recipes (${start+25}-${end+25-1} of ${entries.length})\n`);
  process.stdout.write(`  Names: ${recipes.map(r => r.name).join(', ')}\n\n`);
}

process.stdout.write(`Total remaining: ${remaining.length}\n`);
