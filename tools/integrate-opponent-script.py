from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src/playable.html'
s=p.read_text(encoding='utf8')
for name in ['setActions','contribute','opponentPay','act']:
    start=s.index(' function '+name+'(')
    end=s.index('\n',start)
    s=s[:start]+s[end:]
s=s.replace(' function showdown(){',' __OPPONENT_SCRIPT__\n function showdown(){settled=true;')
s=s.replace("if(current==='fullhouse'){for(const [seat,cards] of", "if(current==='fullhouse'){for(const [seat,cards] of")
s=s.replace("const el=document.createElement('div');el.className='opponent-hole';", "if(!active.includes(seat))continue;const el=document.createElement('div');el.className='opponent-hole';")
s=s.replace("invested=0;ui.end.classList.add", "invested=0;chooseProfile();ui.end.classList.add")
s=s.replace("fmt(stage>0?(current==='straight'?11.5:stage===1?10:22):pot)", "fmt(pot)")
s=s.replace("isFold?'HAND FOLDED · TRY AGAIN':hand.win+' · '", "isFold?'HAND FOLDED · TRY AGAIN':(active.length?hand.win:'YOU WIN')+' · '")
s=s.replace('handNumber,netResult:stack-hand.stack', 'handNumber,profile:profile.name,active:active.slice(),facing,target,roundPaid:{...roundPaid},opponentStacks:hand.stacks.slice(),history:history.map(a=>({...a})),settled,netResult:stack-hand.stack')
p.write_text(s,encoding='utf8')
print('Integrated varied opponent rounds and accounting state.')
