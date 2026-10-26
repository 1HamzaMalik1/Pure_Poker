from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
p=root/'deliverables/fidelity-status.json';data=json.loads(p.read_text())
for key in ['originalFigmaAssets','zipAssetsIntegrated']:
    if 'Farah' not in data[key]: data[key].append('Farah')
data['avatarReplacements']=[v for v in data['avatarReplacements'] if v['seat']!='tinyhiny']
data['avatarReplacements'].append({'seat':'tinyhiny','art':'Farah','source':'Pure GamePlay Ad.zip/Farah 3.png','replaces':'Duplicate of the hero hooded avatar'})
data['uniqueAvatarsPerHand']=9
data['cardFlip']='Two-sided back-to-face card animation for every community deal and opponent showdown reveal.'
data['audio']={'source':'WhatsApp Video 2026-10-25 at 1.15.25 PM.mp4','effects':['fold','chip','gather','card','check','win'],'provenance':'assets/audio/provenance.json','backgroundMusic':'No continuous music detected; source game effects retained.','start':'After first play interaction','muteAndHostPause':'Verified'}
data['settingsButton']='Removed from markup and handlers'
data['motionAndSoundValidation']='deliverables/flips-audio-qa.json'
data['figmaExportLimitation']='All displayed avatars use original exported artwork. Spunk, Maya, Xio and Farah are selected ZIP replacements.'
p.write_text(json.dumps(data,indent=2))
p=root/'deliverables/reference-frame-audit.md';s=p.read_text()
s=s.replace('Previously requested Spunk, Maya and Xio avatar substitutions remain.', 'Previously requested Spunk, Maya and Xio avatar substitutions remain. Farah replaces the duplicate hero avatar so all nine seats have unique characters.')
s+='\n## Card motion and audio update\n\nCommunity cards and showdown cards now show the original back before turning face-up. The top-left settings button is removed. Six effects extracted from the supplied full-house recording follow folds, checks, chip wagers/collection, card deals and the win. There is no continuous music between these effects in the source. Audio unlocks on the first play tap, respects mute, and pauses with host visibility. `flips-audio-qa.json` verifies the back/face animation, decoded sound output, mute, pause/resume and nine unique avatars.\n'
p.write_text(s)
