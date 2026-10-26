"""One-time integration of the reviewed card faces, avatar and source audio."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src/playable.html'
s=p.read_text()
s=s.replace("['spunk','ice','cat','maya','doctor','cyclops','hero','knight']","['spunk','ice','cat','maya','doctor','cyclops','farah','knight']")
s=s.replace("'spunk','maya','panda'].includes(key)","'spunk','maya','panda','farah'].includes(key)")
start=s.index(' function tone(type)')
end=s.index(' function updateSound()',start)
s=s[:start]+' __AUDIO_SCRIPT__\n'+s[end:]
s=s.replace("function start(){if(!started){started=true;firstTapAt=performance.now();ui.primary.classList.remove('nudge');}}","function start(){if(!started){started=true;firstTapAt=performance.now();ui.primary.classList.remove('nudge');firstTapAudio();}}")
s=s.replace('function reset(next){jobs.length=0;', 'function reset(next){stopSounds();jobs.length=0;')
start=s.index(" document.getElementById('menu').onclick=")
end=s.index('ui.primary.onclick=',start)
s=s[:start]+' '+s[end:]
start=s.index('ui.sound.onclick=()=>{')
end=s.index("\n document.addEventListener('visibilitychange'",start)
s=s[:start]+'ui.sound.onclick=toggleAudio;'+s[end:]
s=s.replace("start();folded=true;finish(true);", "start();tone('fold');folded=true;finish(true);")
s=s.replace("if(audio){if(!visible)audio.suspend().catch(()=>{});else if(!muted)audio.resume().catch(()=>{});}","if(audio){if(!visible)audio.suspend().catch(()=>{});else audio.resume().catch(()=>{});}")
s=s.replace("current,stage,started", "current,stage,started")
s=s.replace("clock,visible,muted,handNumber", "clock,visible,muted,audioReady:Object.keys(soundBuffers).length===6,audioContextState:audio?.state||'uninitialized',audioEvents:audioEvents.map(e=>({...e})),handNumber")
# Varied showdown also uses the same two-sided card renderer.
s=s.replace("cards.map(v=>card(v))", "cards.map(v=>card(v,'flip'))")
p.write_text(s)

p=root/'src/opponents.js';s=p.read_text()
s=s.replace("bubble(seat,'Fold');note(seat,'fold');", "bubble(seat,'Fold');note(seat,'fold');schedule(()=>tone('fold'),220);")
s=s.replace("bubble(seat,'Check');note(seat,'check');", "bubble(seat,'Check');note(seat,'check');tone('check');")
s=s.replace("}else note(8,'check');", "}else {note(8,'check');tone('check');}")
p.write_text(s)

p=root/'src/reference-hand.js';s=p.read_text()
s=s.replace("ui.stage.classList.add('winner');tone('win');", "ui.stage.classList.add('winner');schedule(()=>tone('win'),290);")
s=s.replace("clearTurn();for(const [seat,amount]", "clearTurn();tone('gather');for(const [seat,amount]")
s=s.replace("note(event.seat,'check');}", "note(event.seat,'check');tone('check');}")
s=s.replace("ui.seats.querySelector('[data-seat=\"'+seat+'\"]').appendChild(el);", "const seatEl=ui.seats.querySelector('[data-seat=\"'+seat+'\"]');seatEl.classList.add('revealed');seatEl.appendChild(el);")
s=s.replace("if(phase==='start')refRun", "if(refPrompt.action==='check')tone('check');\n if(phase==='start')refRun")
# Wager sound starts near the end of the chip flight, matching the source.
s=s.replace("chips(false,event.seat);tone('chip');", "chips(false,event.seat);schedule(()=>tone('chip'),267);")
p.write_text(s)
