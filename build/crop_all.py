import os, glob
from PIL import Image

TARGET_H = 1126  # 与已完成的 12 张招牌菜一致（832x1216 裁底部 90px 水印）
FOLDER = r'D:\AIproject\菜谱\assets\images'

count = 0
for p in sorted(glob.glob(os.path.join(FOLDER, '*.png'))):
    im = Image.open(p)
    w, h = im.size
    if h > TARGET_H:
        im = im.crop((0, 0, w, TARGET_H))
        im.save(p)
        count += 1
        print(f'cropped {os.path.basename(p)}: {h} -> {TARGET_H}')
print(f'done. cropped {count} image(s) to height {TARGET_H}')
