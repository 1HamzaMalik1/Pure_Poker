from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src/playable.html';s=p.read_text()
s=s.replace('<section class="end hidden" id="end" aria-label="Hand complete">','<section class="end hidden" id="end" aria-label="Hand complete"><div class="end-fan" aria-hidden="true"></div><div class="end-logo"><img src="@@logo_mark@@" alt=""><img src="@@logo_word@@" alt="Pure Poker"></div>')
s=s.replace('id="install">Play Pure Poker','id="install">PLAY NOW')
s=s.replace("firstTapAudio();}}", "firstTapAudio();animateOpeningCards();schedule(()=>tone('card'),350);}}")
s=s.replace("ui.hole.replaceChildren(...hand.hole.map(v=>card(v)));setActions();", "ui.hole.replaceChildren(...hand.hole.map(v=>card(v)));document.querySelector('.end-fan').replaceChildren(...['Ts','Jh','Qc','Kh','As'].map((v,i)=>{const c=card(v);c.style.setProperty('--fan',i-2);return c;}));resetMotion();setActions();")
s=s.replace("ui.endCopy.innerHTML=isFold?'Knowing when to fold is part of the game.<br>Your next hand is waiting.':'Read the table. Make your move.<br>Find your next great hand.';", "ui.endCopy.textContent='Play poker with friends.';")
s=s.replace("(active.length?hand.win:'YOU WIN')+' · '+fmt(pot)+' CHIP POT'", "(ruleOutcome?(ruleOutcome.heroWins?(ruleOutcome.split?'SPLIT POT':'YOU WIN'):'HAND COMPLETE'):hand.win)+' · '+fmt(pot)+' CHIP POT'")
s=s.replace("currentActor,pending:", "contributions:{...contributions},lastFullRaise,legalActions:legalHeroActions(),settlement:ruleOutcome?JSON.parse(JSON.stringify(ruleOutcome)):null,currentActor,pending:")
p.write_text(s)
