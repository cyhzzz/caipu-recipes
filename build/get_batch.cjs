const fs = require('fs');
const data = fs.readFileSync('D:/AIproject/菜谱/build/chunks/truly_missing.txt', 'utf8');
const entries = data.split('\n\n');
const batchNum = parseInt(process.argv[2] || '0');
const batchSize = 5;
const start = batchNum * batchSize;
const end = Math.min(start + batchSize, entries.length);

for (let i = start; i < end; i++) {
  const parts = entries[i].split('|||');
  process.stdout.write('===RECIPE_' + (i - start) + '===\n');
  process.stdout.write('NAME:' + parts[0] + '\n');
  process.stdout.write('CAT:' + parts[1] + '\n');
  process.stdout.write('PROMPT:' + parts[2] + '\n');
  process.stdout.write('===END===\n');
}
process.stdout.write('\nBATCH_INFO: batch=' + batchNum + ' start=' + start + ' end=' + end + ' total=' + entries.length + '\n');
