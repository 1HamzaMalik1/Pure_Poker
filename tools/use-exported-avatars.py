from pathlib import Path
import re, json
root=Path(__file__).resolve().parents[1]
p=root/'src/playable.html'
s=p.read_text(encoding='utf8')
for before,after in [('deer:"@@avatar_deer@@"','panda:"@@avatar_panda@@"'),('socal:"@@avatar_socal@@"','spunk:"@@avatar_spunk@@"'),('girl:"@@avatar_girl@@"','maya:"@@avatar_maya@@"')]:
    s=s.replace(before,after)
s=s.replace("'deer','fish'","'panda','fish'").replace("['socal','ice','cat','girl'","['spunk','ice','cat','maya'")
s=s.replace("(['socal','girl'].includes(key)?'ref-crop':(['shark','ape','cat','cyclops','knight'].includes(key)?'half':''))", "(['shark','ape','cat','cyclops','knight','spunk','maya','panda'].includes(key)?'half':'')")
p.write_text(s,encoding='utf8')
p=root/'src/reference.css'
s=p.read_text(encoding='utf8')
s=re.sub(r'[^{}]*ref-crop[^{}]*\{[^{}]*\}','',s)
p.write_text(s,encoding='utf8')
p=root/'deliverables/fidelity-status.json'
d=json.loads(p.read_text(encoding='utf8'))
d['remainingVideoAvatarCrops']=[]
d['avatarReplacements']=[
 {'seat':'socal8god','art':'Spunk','source':'Pure GamePlay Ad.zip/Spunk Table 2.png'},
 {'seat':'xotiicpoker','art':'Maya','source':'Pure GamePlay Ad.zip/maya_top.png'},
 {'seat':'Brinley','art':'Xio robot panda','source':'Pure GamePlay Ad.zip/xio_top.png','replaces':'Black-and-white lower-left avatar'}
]
d['figmaExportLimitation']='All displayed avatars now use original exported artwork. Spunk, Maya and Xio are selected ZIP replacements rather than the exact characters in the reference footage.'
d['originalFigmaAssets']=[a if a!='deer' else 'Xio robot panda' for a in d['originalFigmaAssets']]+['Spunk','Maya']
d['zipAssetsIntegrated']+=['Spunk avatar','Maya avatar','Xio robot panda avatar']
p.write_text(json.dumps(d,indent=2),encoding='utf8')
p=root/'README.md'
s=p.read_text(encoding='utf8')
s=s.replace('Two human character slots (socal8god and xotiicpoker) still use video crops: their matching originals are absent from both archives.', 'All displayed avatars now use original exported artwork. At the user’s request, Spunk and Maya from the ZIP replace the two video-cropped characters (socal8god and xotiicpoker), and Xio the robot panda replaces the black-and-white avatar in Brinley’s lower-left seat. These three selected replacements differ from the reference footage.')
s=s.replace('4. Replace the two remaining human video crops with their exact Figma source art and complete visual comparison before claiming 100% fidelity.', '4. Complete visual comparison before claiming exact video fidelity; the three requested ZIP avatar replacements intentionally differ from the footage.')
p.write_text(s,encoding='utf8')
print('Switched three seats to exported ZIP artwork; removed video-crop styling.')
