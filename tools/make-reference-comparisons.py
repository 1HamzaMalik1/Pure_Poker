from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
pairs=[
 ('bet4',945,'reference-fullhouse-flop-bet-wager.png','Flop: bank 10 / total pot 14 / hero 137'),
 ('raise40',1669,'reference-fullhouse-turn-all-in.png','Turn raise: bank 22 / total pot 82 / hero 127'),
 ('all-in',1787,'reference-fullhouse-turn-all-in-wager.png','All in: four board cards / total pot 209 / hero 0'),
 ('result',2401,'reference-full-house-corrected-end.png','Full house: final stack 390.5')
]
for name,frame,shot,caption in pairs:
    reference=Image.open(root/'reference-analysis/whatsapp'/f'frame-{frame:06d}.jpg').convert('RGB')
    playable=Image.open(root/'deliverables'/shot).convert('RGB')
    sheet=Image.new('RGB',(800,910),'#111');draw=ImageDraw.Draw(sheet)
    sheet.paste(reference,(0,40));sheet.paste(playable,(400,40))
    draw.text((8,5),'SUPPLIED VIDEO',fill='white');draw.text((408,5),'CORRECTED PLAYABLE',fill='white');draw.text((8,23),caption,fill='#edd59a')
    sheet.save(root/'deliverables'/f'reference-{name}-comparison.png')
