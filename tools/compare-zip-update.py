from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]
for name,reference in [('straight','IMG_3768-0.jpg'),('full-house','IMG_3770-0.jpg')]:
    sheet=Image.new('RGB',(800,895),'#101010')
    sheet.paste(Image.open(root/'reference-analysis'/reference).resize((400,870)),(0,25))
    sheet.paste(Image.open(root/'deliverables'/f'reference-{name}-initial.png'),(400,25))
    draw=ImageDraw.Draw(sheet)
    draw.text((10,7),'VIDEO REFERENCE',fill='white')
    draw.text((410,7),'PLAYABLE WITH FIGMA ZIP ASSETS',fill='white')
    sheet.save(root/'deliverables'/f'reference-{name}-comparison.png')
    if name=='straight':
        sheet.save(root/'deliverables/reference-comparison.png')
