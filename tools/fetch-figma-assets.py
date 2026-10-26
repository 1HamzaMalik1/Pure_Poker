"""Download only original image URLs observed in the user-provided Figma file."""
import concurrent.futures, io, json, pathlib, urllib.request, sys
from PIL import Image, ImageDraw
root = pathlib.Path(__file__).resolve().parents[1]
folder = root / 'reference-analysis' / 'figma'
manifest_name = sys.argv[1] if len(sys.argv)>1 else 'observed-avatar-assets.json'
manifest = json.loads((folder / manifest_name).read_text())
prefix = 'human-' if 'human' in manifest_name else ''
def fetch(item):
    target = folder / (item['name'] + '.png')
    try:
        if not target.exists():
            data = urllib.request.urlopen(item['url'], timeout=40).read()
            image = Image.open(io.BytesIO(data)).convert('RGBA')
            image.save(target)
        with Image.open(target) as im:
            return {'id': item['id'], 'file': target.name, 'width': im.width, 'height': im.height}
    except Exception as error:
        return {'id': item['id'], 'error': str(error)}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    result = list(executor.map(fetch, manifest))
(folder / (prefix+'downloaded.json')).write_text(json.dumps(result, indent=2))
good = [r for r in result if 'file' in r]
for start in range(0, len(good), 50):
    subset = good[start:start+50]
    sheet = Image.new('RGB', (1000, ((len(subset)+9)//10)*130), '#29352f')
    draw = ImageDraw.Draw(sheet)
    for i, item in enumerate(subset):
        with Image.open(folder / item['file']) as im:
            im = im.convert('RGBA'); im.thumbnail((94, 105))
            x, y = (i%10)*100, (i//10)*130
            sheet.paste(im, (x+(100-im.width)//2,y), im)
            draw.text((x+3,y+107), str(start+i)+' '+item['file'][:7],fill='#ffffff')
    sheet.save(folder / (prefix+'contact-'+str(start//50)+'.jpg'))
print(json.dumps({'downloaded':len(good),'failed':len(result)-len(good)}))
