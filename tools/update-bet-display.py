from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src/playable.html'
s=p.read_text(encoding='utf8')
start=s.index("document.getElementById('bets').innerHTML=",s.index(' function sync('))
end=s.index(';ui.pot.textContent',start)
s=s[:start]+'''const bets=history.length===0?initialBets:settled?[]:Object.entries(roundPaid).filter(([,n])=>n>0).map(([seat,n])=>[seat==='8'?'hero-bet':'bet-seat'+seat,fmt(n)]);document.getElementById('bets').innerHTML=bets.map(([cls,amount])=>'<div class="table-bet '+cls+'"><img src="'+CHIP+'" alt="">'+amount+'</div>').join('')'''+s[end:]
s=s.replace("stack+=pot;ui.stack.textContent=fmt(stack);schedule(()=>finish(false)","stack+=pot;sync();schedule(()=>finish(false)")
p.write_text(s,encoding='utf8')
p=root/'src/reference.css'
s=p.read_text(encoding='utf8')+'''\n.table-bet.bet-seat3{left:274px;top:314px}.table-bet.bet-seat5{left:274px;top:489px}\n'''
p.write_text(s,encoding='utf8')
