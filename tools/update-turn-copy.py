from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
p=root/'src/playable.html'
s=p.read_text(encoding='utf8')
s=s.replace("text==='All in'?'allin':''", "text==='All in'?'allin':text==='Fold'?'fold':text==='Raise'?'raise':text==='Bet'?'bet':''")
p.write_text(s,encoding='utf8')
p=root/'README.md'
s=p.read_text(encoding='utf8')
s=s.replace('The cards and opening stacks follow the reference videos.', 'Each live opponent now takes an individual turn in clockwise seat order, with a highlighted seat, a visible thinking delay, and a check/call/bet/raise/fold bubble. The straight opening has five live opponents; the full-house opening has seven. Seats already folded in the reference opening remain out. Postflop action begins left of the dealer and pauses at the hero, then continues around the table. Raises reopen action for every live player who must respond; no opponents are silently paid together. The cards and opening stacks follow the reference videos.')
p.write_text(s,encoding='utf8')
p=root/'deliverables/fidelity-status.json'
d=json.loads(p.read_text(encoding='utf8'))
d['opponentBehavior']='Every live seat acts individually in clockwise order with a visible thinking delay and action bubble. Postflop action starts left of the dealer and pauses at the hero. Raises reopen the response queue. Checks, calls, folds and raises vary; pots and stacks differ from the video.'
d['openingLiveOpponents']={'straight':5,'fullhouse':7}
p.write_text(json.dumps(d,indent=2),encoding='utf8')
