from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src/playable.html'
s=p.read_text(encoding='utf8')
s=s.replace("row.classList.toggle('visible',stage>0);row.querySelector('span').textContent=fmt(pot)","row.classList.toggle('visible',refActive?bankPot>0:stage>0);row.querySelector('span').textContent=fmt(refActive?bankPot:pot)")
s=s.replace('profile:profile.name,currentActor,',"profile:profile.name,gameplayMode:refActive?'reference':'varied',referencePhase,bankPot,referenceEvents:referenceEvents.map(e=>({...e})),recommendedAction:refActive&&(refPrompt?.action==='bet'||refPrompt?.action==='allin')?'secondary':'primary',currentActor,")
p.write_text(s,encoding='utf8')
