from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
p=root/'deliverables/fidelity-status.json';d=json.loads(p.read_text())
d['rulesAudit']={'report':'deliverables/poker-rules-and-motion-audit.md','evaluator':'Best five of seven; no guaranteed hero award','mainAndSidePots':[305.5,85],'mainHandAward':390.5,'refundsAndTies':'Implemented','minimumRaisesAndShortAllIn':'Validated','initialSnapshot':'Only Play enabled until a legal decision','exhaustiveFiveCardHands':2598960,'unitChecks':16,'variedPlayThroughs':16,'scope':'Curated single-hand No-Limit Holdem playable'}
d['motionReference']={'source':'Downloads/Pure_Poker.mp4','frames':600,'durationSeconds':20.03,'implemented':['opening hole-card deal/flip','yellow street titles','made-hand glow and title','folded-seat fade','YOU WIN payout rays','green fanned-card end card'],'proof':'deliverables/pure-motion-qa.json'}
d['opponentBehavior']='Reference timing and actions remain transcribed. Alternative choices use simulated decisions with validated raises, evaluated hand ranks, separate pot eligibility, ties and refunds.'
d['cardFlip']='Opening hole cards, community deals and opponent showdowns use separate back/front faces.'
p.write_text(json.dumps(d,indent=2))
p=root/'deliverables/reference-frame-audit.md';s=p.read_text()
if '## Rules and newer motion audit' not in s:s+='\n## Rules and newer motion audit\n\nSee `poker-rules-and-motion-audit.md` for the 27 October rules corrections and motion changes based on the newer `Pure_Poker.mp4`. The original reference wager sequence above remains intact. The newer ad supplies presentation effects rather than replacing the original hand amounts.\n'
p.write_text(s)
