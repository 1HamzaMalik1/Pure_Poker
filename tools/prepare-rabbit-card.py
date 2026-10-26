from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parents[1]
image=Image.open(root/'reference-analysis/IMG_3768-10.jpg').crop((825,1096,961,1270)).convert('RGBA')
mask=Image.new('L',image.size);ImageDraw.Draw(mask).rounded_rectangle((0,0,image.width-1,image.height-1),radius=17,fill=255);image.putalpha(mask)
out=root/'assets/reference';out.mkdir(parents=True,exist_ok=True)
image.save(out/'rabbit-card.png');image.save(root/'assets/optimized/rabbit_card.webp','WEBP',lossless=True)
(out/'rabbit-card-source.json').write_text(json.dumps({'source':'IMG_3768.mp4','extractedFrame':'reference-analysis/IMG_3768-10.jpg','crop':[825,1096,136,174],'purpose':'Unrevealed rabbit card after the opponent folds on the turn; not a dealt river card'},indent=2))
