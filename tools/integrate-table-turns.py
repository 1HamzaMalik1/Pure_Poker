from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src/playable.html'
s=p.read_text(encoding='utf8').replace("const foldedAtStart=current==='straight'?[1,3,7]:[0]",'const foldedAtStart=INITIAL_FOLDED[current]')
start=s.index(' function opponentFold(')
end=s.index('\n',start)
s=s[:start]+s[end:]
s=s.replace("function sync(){const initialBets=current==='straight'?[['bet0','1'],['bet1','0.5'],['bet2','1'],['hero-bet','5']]:[['bet2','0.5'],['hero-bet','3']];const bets=history.length===0?initialBets:settled?[]:","function sync(){const bets=settled?[]:")
s=s.replace('function showdown(){settled=true;', 'function showdown(){clearTurn();settled=true;')
s=s.replace('function finish(isFold){', 'function finish(isFold){clearTurn();')
s=s.replace('profile:profile.name,active:', 'profile:profile.name,currentActor,pending:pending.slice(),turns:turns.map(t=>({...t})),active:')
p.write_text(s,encoding='utf8')
p=root/'src/reference.css'
s=p.read_text(encoding='utf8')+'''
/* One seat is highlighted while its decision is visible. */
.seat.acting .plate-art{filter:drop-shadow(0 0 4px #f7d77fa6)}
.seat.acting .level{border-color:#f4d778;background:#584923}
.seat.acting .avatar:after{content:'•••';position:absolute;right:0;bottom:0;z-index:6;background:#5c5128e6;border:1px solid #e1c77b;border-radius:8px;padding:0 5px;color:#fff0ba;font-size:11px;line-height:16px;letter-spacing:1px}
.hero-seat.acting .avatar:after{display:none}
.seat.all-in .fold-status{display:block;color:#ffc85d}
.bubble{top:28px}
.table-bet.bet-seat0{left:124px;top:232px}.table-bet.bet-seat1{left:246px;top:232px}
.table-bet.bet-seat2{left:95px;top:314px}.table-bet.bet-seat4{left:95px;top:489px}
.table-bet.bet-seat6{left:106px;top:588px}.table-bet.bet-seat7{left:264px;top:588px}
'''
p.write_text(s,encoding='utf8')
print('Integrated table-wide turns, actor state and all seat bet positions.')
