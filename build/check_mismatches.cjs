const fs = require('fs');
const crypto = require('crypto');

// Load data
const raw = fs.readFileSync('D:/AIproject/菜谱/data/recipes.js', 'utf8');
const jsonStr = raw.replace(/^window\.RECIPES\s*=\s*/, '').replace(/;\s*$/, '');
const data = JSON.parse(jsonStr);

const imgDir = 'D:/AIproject/菜谱/assets/images';
const imageFiles = fs.readdirSync(imgDir).filter(f => /\.(png|jpg|jpeg)$/i.test(f));

// 1. Check for duplicate image files (same content, different names)
const fileHashes = {};
const duplicates = [];
for (const f of imageFiles) {
  const buf = fs.readFileSync(imgDir + '/' + f);
  const hash = crypto.createHash('md5').update(buf).digest('hex');
  if (fileHashes[hash]) {
    duplicates.push({ file1: fileHashes[hash], file2: f, hash });
  } else {
    fileHashes[hash] = f;
  }
}

process.stdout.write('=== DUPLICATE IMAGE FILES ===\n');
process.stdout.write('Total image files: ' + imageFiles.length + '\n');
process.stdout.write('Duplicates found: ' + duplicates.length + '\n');
for (const d of duplicates) {
  process.stdout.write('  "' + d.file1 + '" == "' + d.file2 + '"\n');
}

// 2. Check for recipes without images
const withoutImage = data.recipes.filter(r => !r.image);
process.stdout.write('\n=== RECIPES WITHOUT IMAGES ===\n');
process.stdout.write('Count: ' + withoutImage.length + '\n');
for (const r of withoutImage) {
  process.stdout.write('  ' + r.name + ' (cat: ' + r.cat + ')\n');
}

// 3. Check for recipes whose image file doesn't exist on disk
const missingOnDisk = [];
for (const r of data.recipes) {
  if (r.image) {
    const filePath = 'D:/AIproject/菜谱/' + r.image;
    if (!fs.existsSync(filePath)) {
      missingOnDisk.push({ name: r.name, image: r.image });
    }
  }
}
process.stdout.write('\n=== RECIPES WITH MISSING IMAGE FILES ON DISK ===\n');
process.stdout.write('Count: ' + missingOnDisk.length + '\n');
for (const m of missingOnDisk) {
  process.stdout.write('  ' + m.name + ' -> ' + m.image + '\n');
}

// 4. Check for image files not referenced by any recipe
const referencedFiles = new Set();
for (const r of data.recipes) {
  if (r.image) {
    referencedFiles.add(r.image.replace('assets/images/', ''));
  }
}
const unreferenced = imageFiles.filter(f => !referencedFiles.has(f));
process.stdout.write('\n=== UNREFERENCED IMAGE FILES ===\n');
process.stdout.write('Count: ' + unreferenced.length + '\n');
for (const f of unreferenced) {
  process.stdout.write('  ' + f + '\n');
}

// 5. Check for naming inconsistencies (same normalized name, different files)
const normToFiles = {};
for (const f of imageFiles) {
  const base = f.replace(/\.(png|jpg|jpeg)$/i, '');
  const norm = base.replace(/[\s／\/]/g, '');
  if (!normToFiles[norm]) normToFiles[norm] = [];
  normToFiles[norm].push(f);
}
const nameConflicts = Object.entries(normToFiles).filter(([k, v]) => v.length > 1);
process.stdout.write('\n=== NAMING CONFLICTS (same dish, multiple files) ===\n');
process.stdout.write('Count: ' + nameConflicts.length + '\n');
for (const [norm, files] of nameConflicts) {
  process.stdout.write('  ' + norm + ': ' + files.join(', ') + '\n');
}

// 6. Check for mixed extensions (PNG and JPG for same dish)
process.stdout.write('\n=== EXTENSION SUMMARY ===\n');
const pngCount = imageFiles.filter(f => f.endsWith('.png')).length;
const jpgCount = imageFiles.filter(f => f.endsWith('.jpg')).length;
process.stdout.write('PNG files: ' + pngCount + '\n');
process.stdout.write('JPG files: ' + jpgCount + '\n');
