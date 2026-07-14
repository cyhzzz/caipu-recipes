import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'D:/AIproject/菜谱/cooklikehoc-src';
const OUT = 'D:/AIproject/菜谱/data/recipes.json';

const CATEGORY_FOLDERS = [
  '炒菜', '炖菜', '蒸菜', '凉拌', '卤菜', '主食', '早餐',
  '炸品', '烤类', '烫菜', '煮锅', '砂锅菜', '汤', '饮品', '配料',
];

// heading normalization
function normHeading(line) {
  return line.replace(/^#+\s*/, '').replace(/[：:]\s*$/, '').trim();
}

function slugify(name) {
  return name.trim();
}

const recipes = [];
const categoryCounts = {};

for (const cat of CATEGORY_FOLDERS) {
  const dir = path.join(ROOT, cat);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md');
  categoryCounts[cat] = files.length;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const lines = raw.split(/\r?\n/);
    let name = '';
    let imagePath = null;
    let section = null;
    const ingredients = [];
    const steps = [];

    for (const line of lines) {
      const imgMatch = line.match(/!\[[^\]]*\]\(([^)]+)\)/);
      if (imgMatch && !imagePath) {
        imagePath = imgMatch[1].replace(/^\.\.\//, '').trim();
      }
      const hMatch = line.match(/^#+\s+(.*)$/);
      if (hMatch) {
        const h = normHeading(hMatch[1]);
        if (h && !name) { name = h; continue; }
        if (['原料', '配料', '食材'].includes(h)) { section = 'ingredients'; continue; }
        if (['步骤', '做法', '制作'].includes(h)) { section = 'steps'; continue; }
        section = null;
        continue;
      }
      const liMatch = line.match(/^\s*[-*]\s+(.*)$/);
      if (liMatch && section) {
        let item = liMatch[1].trim();
        if (section === 'steps') {
          item = item.replace(/^\d+[\.、]\s*/, '').trim();
        }
        if (!item) continue;
        if (section === 'ingredients') ingredients.push(item);
        else if (section === 'steps') steps.push(item);
      }
    }

    if (!name) name = file.replace(/\.md$/, '');
    recipes.push({
      id: slugify(name),
      name,
      category: cat,
      imagePath,
      ingredientCount: ingredients.length,
      stepCount: steps.length,
      ingredients,
      steps,
    });
  }
}

// dedupe by id (keep first), but keep category
const seen = new Set();
const deduped = [];
for (const r of recipes) {
  const key = r.id + '|' + r.category;
  if (seen.has(key)) continue;
  seen.add(key);
  deduped.push(r);
}

const categories = CATEGORY_FOLDERS
  .filter(c => categoryCounts[c] > 0)
  .map(c => ({ key: c, name: c, count: categoryCounts[c] }));

const out = {
  meta: {
    source: 'CookLikeHOC (Gar-b-age/CookLikeHOC) — 基于《老乡鸡菜品溯源报告》',
    sourceUrl: 'https://github.com/Gar-b-age/CookLikeHOC',
    totalRecipes: deduped.length,
    generatedAt: new Date().toISOString(),
  },
  categories,
  recipes: deduped,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
console.log('Total recipes:', deduped.length);
console.log('Categories:', categories.map(c => `${c.name}:${c.count}`).join(', '));
console.log('Sample:', JSON.stringify(deduped[0], null, 2).slice(0, 400));
