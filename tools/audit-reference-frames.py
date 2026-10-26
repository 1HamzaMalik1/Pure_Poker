from pathlib import Path
from PIL import Image, ImageChops, ImageStat, ImageDraw
import json, csv, sys
root=Path(__file__).resolve().parents[1]
folder=root/(sys.argv[1] if len(sys.argv)>1 else 'reference-analysis/whatsapp')
frames=sorted(folder.glob('frame-*.jpg'))
regions={'pot':(177,329,224,347),'hero':(175,718,226,741),'girl':(325,340,382,360),'asian':(325,525,382,545),'board':(80,362,320,422),'reveal':(150,548,247,615),'fold6':(20,558,100,613),'fold4':(6,434,88,494),'fold2':(8,250,88,311),'fold0':(46,128,130,191),'fold1':(273,128,355,191),'fold7':(299,560,382,618)}
previous=None;rows=[];events={k:[] for k in regions}
for i,p in enumerate(frames):
    im=Image.open(p).convert('L');values={}
    for name,bounds in regions.items():
        crop=im.crop(bounds)
        value=0 if previous is None else ImageStat.Stat(ImageChops.difference(crop,previous[name])).mean[0]
        values[name]=round(value,3)
        if value>2.0:events[name].append(i)
    rows.append({'frame':i,'time':round(i/60,4),**values})
    previous={name:im.crop(bounds) for name,bounds in regions.items()}
with (folder/'every-frame-audit.csv').open('w',newline='') as f:
    writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
groups={}
for name,indices in events.items():
    runs=[]
    for i in indices:
        if not runs or i-runs[-1][-1]>12:runs.append([i])
        else:runs[-1].append(i)
    groups[name]=[{'startFrame':g[0],'endFrame':g[-1],'start':round(g[0]/60,3),'end':round(g[-1]/60,3),'reviewFrame':min(len(frames)-1,g[-1]+12)} for g in runs]
(folder/'transitions.json').write_text(json.dumps(groups,indent=2))
selected=sorted(set(e['reviewFrame'] for key in ['pot','hero','girl','asian'] for e in groups[key]))
for start in range(0,len(selected),12):
    batch=selected[start:start+12];sheet=Image.new('RGB',(1200,math_height:=((len(batch)+2)//3)*620),'#171717');draw=ImageDraw.Draw(sheet)
    for j,index in enumerate(batch):
        im=Image.open(frames[index]);im=im.crop((0,120,400,715)).resize((400,595))
        x,y=j%3*400,j//3*620;sheet.paste(im,(x,y+25));draw.text((x+6,y+6),f'frame {index} / {index/60:.3f}s',fill='white')
    sheet.save(folder/f'events-{start//12}.jpg',quality=92)
print(json.dumps({k:v for k,v in groups.items() if k in ['pot','hero','girl','asian']},indent=2))
print('Audited frames:',len(rows),'event review images:',len(selected))
