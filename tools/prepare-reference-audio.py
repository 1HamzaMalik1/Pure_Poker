"""Inspect the supplied recording and extract its game audio locally."""
from pathlib import Path
import subprocess, wave, json
import numpy as np
from PIL import Image

root=Path(__file__).resolve().parents[1]
out=root/'reference-analysis/audio'
out.mkdir(parents=True,exist_ok=True)
ffmpeg=next((root/'tools/vendor/imageio_ffmpeg/binaries').glob('*.exe'))
source=Path('C:/Users/Ayesha Munir/Downloads/WhatsApp Video 2026-10-25 at 1.15.25 PM.mp4')
subprocess.run([str(ffmpeg),'-y','-i',str(source),'-vn','-ac','1','-ar','44100',str(out/'full-house-source.wav')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
with wave.open(str(out/'full-house-source.wav'),'rb') as f:
    sr=f.getframerate(); samples=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').astype(float)/32768
block=441
rms=np.sqrt(np.mean(samples[:len(samples)//block*block].reshape(-1,block)**2,axis=1))
active=np.where(rms>10**(-48/20))[0]
regions=[]
for frame in active:
    t=frame/100
    if not regions or t-regions[-1][1]>.16: regions.append([t,t+.01])
    else: regions[-1][1]=t+.01
(out/'source-audio-regions.json').write_text(json.dumps({'source':str(source),'duration':len(samples)/sr,'peak':float(np.max(np.abs(samples))),'activeRegions':regions},indent=2))
for name,start,duration in [('opening-listen',0,12),('ending-listen',33,10)]:
    with wave.open(str(out/(name+'.wav')),'wb') as f:
        f.setnchannels(1);f.setsampwidth(2);f.setframerate(sr);f.writeframes((samples[int(start*sr):int((start+duration)*sr)]*32767).astype('<i2').tobytes())
assets=root/'assets/audio'
assets.mkdir(exist_ok=True)
clips={'fold':[1.51,1.85],'chip':[7.72,8.13],'gather':[11.61,12.13],'card':[20.37,20.63],'check':[13.64,14.22],'win':[37.24,39.32]}
for name,(start,end) in clips.items():
    subprocess.run([str(ffmpeg),'-y','-ss',str(start),'-i',str(source),'-t',str(end-start),'-vn','-ac','1','-ar','22050','-c:a','libmp3lame','-b:a','64k',str(assets/(name+'.mp3'))],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
(assets/'provenance.json').write_text(json.dumps({'source':source.name,'clips':{k:{'start':v[0],'end':v[1]} for k,v in clips.items()},'music':'No continuous background music was detected: the recording is silent between discrete game effects.','integration':'Effects are triggered by gameplay events, not a continuously running video soundtrack.'},indent=2))
# Add the original, unique avatar from the user's ZIP without another export.
avatar=Image.open(root/'reference-analysis/zip-assets/0/Farah 3.png').convert('RGBA')
avatar.save(root/'assets/figma/zip-export/avatar_farah.png')
avatar.resize((320,round(avatar.height*320/avatar.width)),Image.Resampling.LANCZOS).save(root/'assets/optimized/avatar_farah.webp','WEBP',quality=95,method=6)
manifest_path=root/'assets/figma/zip-export/provenance.json'
manifest=json.loads(manifest_path.read_text())
manifest=[m for m in manifest if m['asset']!='avatar_farah']
manifest.append({'asset':'avatar_farah','source':'Pure GamePlay Ad.zip/Farah 3.png','crop':[0,0,avatar.width,avatar.height],'size':list(avatar.size)})
manifest_path.write_text(json.dumps(manifest,indent=2))
print(json.dumps({'duration':len(samples)/sr,'activeRegions':regions}))
