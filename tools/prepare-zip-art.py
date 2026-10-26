"""Separate user-provided Figma section exports using saved Figma node bounds."""
from pathlib import Path
import json, xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
imports = root/'reference-analysis/zip-assets'
originals = root/'assets/figma/zip-export'
optimized = root/'assets/optimized'
originals.mkdir(parents=True, exist_ok=True)
manifest = []

def save(im, name, source, bounds, radius=0):
    im = im.convert('RGBA')
    if radius:
        # Section exports flatten the section fill into rounded frame corners.
        # Restore transparency at the original frame's 27 px corner radius.
        mask = Image.new('L', (im.width*4,im.height*4))
        ImageDraw.Draw(mask).rounded_rectangle((0,0,im.width*4-1,im.height*4-1),radius=radius*4,fill=255)
        im.putalpha(mask.resize(im.size, Image.Resampling.LANCZOS))
    im.save(originals/(name+'.png'))
    if name.startswith('card_'):
        im.save(optimized/(name+'.webp'), 'WEBP', lossless=True)
    else:
        im.resize((320,round(im.height*320/im.width)), Image.Resampling.LANCZOS).save(optimized/(name+'.webp'),'WEBP',quality=95,method=6)
    manifest.append(dict(asset=name, source=source, crop=bounds, size=im.size))

metadata = ET.parse(root/'reference-analysis/figma/poker-metadata.xml').getroot()
section = next(n for n in metadata.iter('section') if n.get('id') == '26:3015')
atlas = Image.open(imports/'1/Poker in game cards.png')
suits = {'spade':'s','clover':'c','heart':'h','diamond':'d'}
for frame in section.findall('frame'):
    rank = frame.find('text').get('name').replace('10','T')
    suit = suits[frame.get('name').lower()]
    x,y,w,h = [round(float(frame.get(k))) for k in ['x','y','width','height']]
    save(atlas.crop((x,y,x+w,y+h)), 'card_'+rank+suit, 'Pure GamePlay Ad (1).zip/Poker in game cards.png', [x,y,w,h], 27)

atlas = Image.open(imports/'1/Inner table asset.png')
save(atlas.crop((1457,61,1665,347)), 'card_back', 'Pure GamePlay Ad (1).zip/Inner table asset.png', [1457,61,208,286],27)
# Group 40 contains Takashi plus a presentation border/name label. These are the
# original inner avatar image bounds from node 27:3578, excluding that wrapper.
atlas = Image.open(imports/'0/Group 40.png')
save(atlas.crop((54,93,1466,1975)), 'avatar_man', 'Pure GamePlay Ad.zip/Group 40.png', [54,93,1412,1882])
for name, filename in [('avatar_spunk','Spunk Table 2.png'),('avatar_maya','maya_top.png'),('avatar_panda','xio_top.png')]:
    image = Image.open(imports/'0'/filename)
    save(image, name, 'Pure GamePlay Ad.zip/'+filename, [0,0,image.width,image.height])
(originals/'provenance.json').write_text(json.dumps(manifest,indent=2))
print(f'Prepared {len(manifest)} original Figma assets.')
