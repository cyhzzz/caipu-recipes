const fs = require('fs');

// Read recipes.js and extract the JSON data
const raw = fs.readFileSync('D:/AIproject/菜谱/data/recipes.js', 'utf8');
// Remove the "window.RECIPES = " prefix and trailing semicolon
const jsonStr = raw.replace(/^window\.RECIPES\s*=\s*/, '').replace(/;\s*$/, '');
const data = JSON.parse(jsonStr);

// Read the missing list
const missing = JSON.parse(fs.readFileSync('D:/AIproject/菜谱/build/chunks/missing.json', 'utf8'));

// Get all image files in assets/images
const imgDir = 'D:/AIproject/菜谱/assets/images';
const imageFiles = fs.readdirSync(imgDir);

// Build a lookup: normalized name -> actual filename (with extension)
const imageLookup = {};
for (const f of imageFiles) {
  const base = f.replace(/\.(png|jpg|jpeg)$/i, '');
  const norm = base.replace(/[\s／\/]/g, '');
  // If both PNG and JPG exist, prefer PNG (original/higher quality)
  if (!imageLookup[norm] || f.endsWith('.png')) {
    imageLookup[norm] = f;
  }
}

// Update each recipe with image path
let updatedCount = 0;
const stillMissing = [];

for (const recipe of data.recipes) {
  const norm = recipe.name.replace(/[\s／\/]/g, '');
  const imageFile = imageLookup[norm];
  
  if (imageFile) {
    const imagePath = 'assets/images/' + imageFile;
    if (recipe.image !== imagePath) {
      recipe.image = imagePath;
      updatedCount++;
    }
  } else {
    // Check if this recipe was in the missing list
    if (missing.includes(recipe.name)) {
      stillMissing.push(recipe.name);
    }
  }
}

// Write the updated recipes.js
const output = 'window.RECIPES = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync('D:/AIproject/菜谱/data/recipes.js', output, 'utf8');

// Also update recipes.json
fs.writeFileSync('D:/AIproject/菜谱/data/recipes.json', JSON.stringify(data, null, 2), 'utf8');

process.stdout.write('Updated ' + updatedCount + ' recipes with image paths\n');
process.stdout.write('Still missing images: ' + stillMissing.length + '\n');
if (stillMissing.length > 0) {
  process.stdout.write('Missing: ' + stillMissing.join(', ') + '\n');
}

// Count total recipes with/without images
const withImage = data.recipes.filter(r => r.image).length;
const withoutImage = data.recipes.filter(r => !r.image).length;
process.stdout.write('\nTotal recipes: ' + data.recipes.length + '\n');
process.stdout.write('With image: ' + withImage + '\n');
process.stdout.write('Without image: ' + withoutImage + '\n');
