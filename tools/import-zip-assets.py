from pathlib import Path
import zipfile, json
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1]
out = root / 'reference-analysis' / 'zip-assets'
out.mkdir(parents=True, exist_ok=True)
inventory = []
for number, name in enumerate(['Pure GamePlay Ad.zip', 'Pure GamePlay Ad (1).zip']):
    with zipfile.ZipFile(Path.home() / 'Downloads' / name) as archive:
        for entry in archive.infolist():
            relative = Path(entry.filename)
            if relative.is_absolute() or '..' in relative.parts:
                raise ValueError('Unsafe archive path')
            if entry.is_dir() or relative.suffix.lower() != '.png':
                continue
            target = out / str(number) / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(archive.read(entry))
            with Image.open(target) as im:
                inventory.append(dict(archive=name, file=str(target.relative_to(root)), size=im.size))
for number in range(2):
    items = [item for item in inventory if item['archive'] == ['Pure GamePlay Ad.zip', 'Pure GamePlay Ad (1).zip'][number]]
    cols, width, height = 5 if number == 0 else 3, 230, 260
    sheet = Image.new('RGB', (cols*width, ((len(items)+cols-1)//cols)*height), '#343746')
    draw = ImageDraw.Draw(sheet)
    for index,item in enumerate(items):
        im = Image.open(root/item['file']).convert('RGBA')
        im.thumbnail((width-12,height-40))
        x,y = index%cols*width,index//cols*height
        sheet.paste(im,(x+(width-im.width)//2,y),im)
        draw.text((x+5,y+height-36),Path(item['file']).name,fill='white')
        draw.text((x+5,y+height-20),str(item['size']),fill='white')
    sheet.save(out/f'contact-{number}.jpg',quality=92)
(out/'inventory.json').write_text(json.dumps(inventory,indent=2))
print(json.dumps(inventory,indent=2))
