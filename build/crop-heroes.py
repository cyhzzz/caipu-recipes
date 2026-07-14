import os
import json
import shutil
from PIL import Image
from pathlib import Path

ROOT = Path('D:/AIproject/菜谱')
GEN = ROOT / 'assets/images/gen'
GEN_FIRST = ROOT / 'assets/images/gen_first'
OUT = ROOT / 'assets/images'
RECIPE_FILE = ROOT / 'data/recipes.json'

heroes = [
    '金牌老母鸡汤',
    '西红柿炒鸡蛋',
    '宫保鸡丁',
    '小炒黄牛肉',
    '梅菜扣肉',
    '粉蒸肉',
    '土豆牛腩',
    '口水鸡',
    '卤鸡腿',
    '鸡汁汤包',
    '砂锅酸菜鱼',
    '鸡笼香柠檬茶',
]

# Move regenerated first hero into gen folder with a name that sorts first
first_files = list(GEN_FIRST.glob('*.png'))
if first_files:
    first_file = first_files[0]
    target = GEN / '00_金牌老母鸡汤.png'
    shutil.move(str(first_file), str(target))
    print(f'Moved {first_file.name} -> {target.name}')

files = sorted(GEN.glob('*.png'), key=lambda p: p.name)
assert len(files) == len(heroes), f"Expected {len(heroes)} images, got {len(files)}: {[f.name for f in files]}"

print(f'Processing {len(files)} images in filename order...')
for f, name in zip(files, heroes):
    img = Image.open(f)
    w, h = img.size
    crop_h = 90  # remove bottom AI watermark strip
    cropped = img.crop((0, 0, w, h - crop_h))
    out_path = OUT / f'{name}.png'
    cropped.save(out_path, 'PNG', optimize=True)
    print(f'  {name}: {w}x{h} -> {w}x{h - crop_h}')

# Update recipes.json with hero image paths
with open(RECIPE_FILE, 'r', encoding='utf8') as f:
    data = json.load(f)

name_map = {name: f'assets/images/{name}.png' for name in heroes}
for r in data['recipes']:
    r['image'] = name_map.get(r['name'], None)

with open(RECIPE_FILE, 'w', encoding='utf8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('Updated recipes.json with hero image paths.')
