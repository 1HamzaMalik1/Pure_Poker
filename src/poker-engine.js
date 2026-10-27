// Legal betting and settlement for the ad's curated Hold'em hands.
// The reference director controls timing; both paths share these accounts.
const originalChooseProfile=chooseProfile,originalPay=pay,originalNote=note;
let contributions={},lastFullRaise=1,actedAt={},playerCards={},ruleOutcome=null,bettingEvents=[];
const DEALER={straight:4,fullhouse:3};
function initializeCards(){
 playerCards={8:hand.hole.slice()};
 const fixed=current==='fullhouse'?{3:['7d','6d'],5:['4h','4c'],6:['8d','8s']}:{5:['7c','6c'],6:['Ad','Kc']};
 Object.assign(playerCards,fixed);const used=new Set([...hand.board,...Object.values(playerCards).flat()]);
 const deck='23456789TJQKA'.split('').flatMap(r=>'schd'.split('').map(s=>r+s)).filter(c=>!used.has(c));
 for(let s=0;s<8;s++)if(!playerCards[s])playerCards[s]=deck.splice(0,2);
}
chooseProfile=function(){originalChooseProfile();contributions={...roundPaid};lastFullRaise=Math.max(1,target-1);actedAt={8:target};ruleOutcome=null;bettingEvents=[];initializeCards();};
note=function(seat,action,amount=0){originalNote(seat,action,amount);if(action!=='play')actedAt[seat]=target;};
pay=function(seat,amount,label='Call',animate=true){const n=originalPay(seat,amount,label,animate);contributions[seat]=(contributions[seat]||0)+n;return n;};
function wagerTarget(total,seat=8){
 const increase=total-target,maximum=(roundPaid[seat]||0)+chipsLeft(seat),full=increase>=lastFullRaise-1e-7;
 if(total<=target||total>maximum+1e-7||(!full&&Math.abs(total-maximum)>1e-7)||!canRaiseSeat(seat))throw Error('Illegal wager');
 bettingEvents.push({seat,street:stage,at:clock,from:target,to:total,minimumRaise:lastFullRaise,shortAllIn:!full});
 if(full)lastFullRaise=increase;target=total;
}
function beginBettingStreet(){roundPaid={8:0};target=0;facing=0;raises=0;lastFullRaise=1;actedAt={};}
function canRaiseSeat(seat){return chipsLeft(seat)+(roundPaid[seat]||0)>target&&PokerRules.raiseAllowed(target,lastFullRaise,actedAt[seat])&&[8,...active].some(s=>s!==seat&&liveSeat(s)&&chipsLeft(s)>0);}
effectiveTarget=function(requested){return Math.min(requested,(roundPaid[8]||0)+stack);};
raiseTarget=function(){return effectiveTarget(target+lastFullRaise);};
function legalHeroActions(){const due=Math.max(0,target-(roundPaid[8]||0));return {check:due===0,call:Math.min(stack,due),raise:canRaiseSeat(8),minimumRaiseTo:target+lastFullRaise,allInTo:(roundPaid[8]||0)+stack};}
function refundStreet(){
 const entries=Object.entries(roundPaid).sort((a,b)=>b[1]-a[1]);if(!entries.length)return;
 const [seat,n]=entries[0],extra=n-(entries[1]?.[1]||0);if(extra<=0)return;
 const s=Number(seat);roundPaid[s]-=extra;contributions[s]-=extra;pot-=extra;
 if(s===8){stack+=extra;invested-=extra;}else hand.stacks[s]+=extra;
 originalNote(s,'uncalled return',extra);sync();
}
function resolveRulePots(){
 if(ruleOutcome)return ruleOutcome;
 const live=[8,...active].filter(s=>liveSeat(s));
 const result=PokerRules.settle(contributions,live,playerCards,hand.board.slice(0,ui.board.querySelectorAll('.card:not(.empty):not(.rabbit)').length),afterSeat(DEALER[current]).concat(DEALER[current]));
 result.heroAward=result.awards[8]||0;result.heroWins=result.pots.some(p=>p.winners.includes(8));result.split=result.pots.some(p=>p.winners.includes(8)&&p.winners.length>1);
 stack+=result.heroAward;
 for(let s=0;s<8;s++){hand.stacks[s]+=result.awards[s]||0;const label=ui.seats.querySelector('[data-seat="'+s+'"] .plate span');if(label)label.textContent=fmt(hand.stacks[s]);}
 settled=true;ruleOutcome=result;sync();return result;
}
function heroEvaluation(){const count=ui.board.querySelectorAll('.card:not(.empty):not(.rabbit)').length;return count>=3?PokerRules.evaluate([...hand.hole,...hand.board.slice(0,count)]):null;}
function markBestCards(evaluation){
 Array.from(ui.board.children).forEach((c,i)=>{c.classList.toggle('best',evaluation.best.includes(hand.board[i]));c.classList.toggle('dim',!evaluation.best.includes(hand.board[i]));});
 Array.from(ui.hole.children).forEach((c,i)=>c.classList.toggle('best',evaluation.best.includes(hand.hole[i])));
}
function revealLiveHands(){
 ui.stage.classList.add('showdown');
 for(const s of active){const seat=ui.seats.querySelector('[data-seat="'+s+'"]');if(seat.querySelector('.opponent-hole'))continue;seat.classList.add('revealed');const row=document.createElement('div');row.className='opponent-hole';row.append(...playerCards[s].map(v=>card(v,'flip')));seat.appendChild(row);}
}
function presentResult(){
 const result=resolveRulePots();clearTurn();
 ui.handName.className='hand-name win';ui.handName.textContent=result.heroWins?(result.split?'SPLIT POT':heroEvaluation()?.name||'YOU WIN'):'HAND COMPLETE';
 if(result.heroWins){if(heroEvaluation())markBestCards(heroEvaluation());chips(true);tone('win');showWinEffect(result.heroAward);}
 const label=document.createElement('div');label.className='win-amount';label.textContent=(result.heroAward?'+':'')+fmt(result.heroAward);ui.effects.appendChild(label);
 schedule(()=>finish(false),2400);
}
winByFold=function(){clearTurn();presentResult();};
showdown=function(){clearTurn();revealLiveHands();schedule(presentResult,550);};
nextStreet=function(){
 clearTurn();if(!active.length){winByFold();return;}
 refundStreet();
 const funded=[8,...active].filter(s=>liveSeat(s)&&chipsLeft(s)>0);
 if(stage===3||funded.length<2){runout();return;}
 gatherStreet();bankPot=pot;stage++;beginBettingStreet();opening=false;
 renderBoard(stage===1?3:stage===2?4:5);showStreetTitle();const ev=heroEvaluation();ui.handName.textContent=ev?.name||'';tone('card');lock();
 pending=afterSeat(DEALER[current]).concat(DEALER[current]).filter(i=>liveSeat(i)&&chipsLeft(i)>0);schedule(takeTurn,650);
};
runout=function(){
 busy=true;clearTurn();revealLiveHands();let delay=400;const count=ui.board.querySelectorAll('.card:not(.empty):not(.rabbit)').length;
 for(let n=Math.max(3,count+1);n<=5;n++){delay+=650;const reveal=n;schedule(()=>{stage=reveal===3?1:reveal===4?2:3;renderBoard(reveal);showStreetTitle();tone('card');},delay);}
 schedule(showdown,delay+750);
};
takeTurn=function(){
 if(ended||settled)return;if(!active.length){winByFold();return;}
 const funded=[8,...active].filter(i=>liveSeat(i)&&chipsLeft(i)>0);
 pending=pending.filter(i=>liveSeat(i)&&chipsLeft(i)>0&&(funded.length>1||target>(roundPaid[i]||0)));
 if(!pending.length){nextStreet();return;}
 const seat=pending.shift();showTurn(seat);turns.push({street:stage,seat,at:clock,target});
 if(seat===8){facing=Math.max(0,target-(roundPaid[8]||0));setActions();return;}
 lock();ui.instruction.textContent=hand.names[seat]+' is thinking…';
 schedule(()=>{
  const due=Math.max(0,target-(roundPaid[seat]||0)),roll=Math.random(),canRaise=canRaiseSeat(seat);
  if(due>0&&roll<Math.min(.6,profile.fold+due/Math.max(1,hand.stacks[seat])*.15)){seatFold(seat);}
  else if(canRaise&&roll<(due>0?profile.raise:profile.bet)){
   const maximum=(roundPaid[seat]||0)+hand.stacks[seat],wanted=target>0?target+lastFullRaise:Math.max(1,betSize());
   const total=Math.min(maximum,wanted);wagerTarget(total,seat);raises++;pay(seat,total-(roundPaid[seat]||0),due>0?'Raise':'Bet');pending=queueAfter(seat);
  }else if(due>0)pay(seat,due,'Call');
  else {bubble(seat,'Check');note(seat,'check');tone('check');}
  schedule(takeTurn,500);
 },600+Math.floor(Math.random()*220));
};
act=function(secondary){
 if(busy||ended||!visible)return;start();
 const first=stage===0&&history.length===0;if(first){note(8,'play');pending=queueAfter(8);lock();schedule(takeTurn,300);return;}
 const legal=legalHeroActions();if(secondary&&!legal.raise){setActions();return;}
 lock();clearTurn();
 if(secondary){const total=target>0?raiseTarget():effectiveTarget(Math.max(1,betSize()));wagerTarget(total);raises++;pay(8,total-(roundPaid[8]||0),facing>0?'Raise':'Bet');pending=queueAfter(8);}
 else if(legal.call>0)pay(8,legal.call,'Call');
 else {note(8,'check');tone('check');}
 facing=0;schedule(takeTurn,450);
};
