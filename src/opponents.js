// Small, bounded betting rounds for a short scripted playable.
// Cards remain curated; opponent decisions and bet sizes vary on every run.
const profiles=[
 {name:'cautious',fold:.32,raise:.09,bet:.24},
 {name:'balanced',fold:.17,raise:.22,bet:.43},
 {name:'aggressive',fold:.08,raise:.36,bet:.68}
];
const previousProfiles={};
const SEAT_ORDER=[8,6,4,2,0,1,3,5,7];
const INITIAL_FOLDED={straight:[1,3,7],fullhouse:[0]};
let profile,active=[],roundPaid={},target=0,facing=0,raises=0,history=[],settled=false,opening=true;
let pending=[],currentActor=null,turns=[];
function afterSeat(seat){const index=SEAT_ORDER.indexOf(seat);return SEAT_ORDER.slice(index+1).concat(SEAT_ORDER.slice(0,index));}
function liveSeat(seat){return seat===8?!folded:active.includes(seat);}
function chipsLeft(seat){return seat===8?stack:hand.stacks[seat];}
function queueAfter(seat){return afterSeat(seat).filter(i=>liveSeat(i)&&chipsLeft(i)>0);}
function showTurn(seat){
 currentActor=seat;
 document.querySelectorAll('.seat.acting').forEach(el=>el.classList.remove('acting'));
 const el=seat===8?document.querySelector('.hero-seat'):ui.seats.querySelector('[data-seat="'+seat+'"]');
 if(el)el.classList.add('acting');
}
function clearTurn(){currentActor=null;document.querySelectorAll('.seat.acting').forEach(el=>el.classList.remove('acting'));}
function chooseProfile(){
 let index=Math.floor(Math.random()*profiles.length);
 if(index===previousProfiles[current])index=(index+1+Math.floor(Math.random()*2))%profiles.length;
 previousProfiles[current]=index;profile=profiles[index];
 active=SEAT_ORDER.filter(i=>i!==8&&!INITIAL_FOLDED[current].includes(i));
 roundPaid=current==='straight'?{0:1,2:.5,5:1,8:5}:{5:.5,7:1,8:3};
 target=roundPaid[8];facing=0;raises=0;history=[];settled=false;opening=true;
 pending=[];currentActor=null;turns=[];
}
function note(seat,action,amount=0){history.push({street:stage,seat,action,amount,at:clock});}
function seatFold(seat){
 active=active.filter(i=>i!==seat);
 ui.seats.querySelector('[data-seat="'+seat+'"]').classList.add('folded');
 bubble(seat,'Fold');note(seat,'fold');schedule(()=>tone('fold'),220);
}
function pay(seat,amount,label='Call',animate=true){
 const available=seat===8?stack:hand.stacks[seat];
 const paid=Math.max(0,Math.min(available,amount));
 if(seat===8){stack-=paid;invested+=paid;}else{
  hand.stacks[seat]-=paid;
  ui.seats.querySelector('[data-seat="'+seat+'"] .plate span').textContent=fmt(hand.stacks[seat]);
  if(hand.stacks[seat]===0){const el=ui.seats.querySelector('[data-seat="'+seat+'"]');el.classList.add('all-in');el.querySelector('.fold-status').textContent='All in';}
 }
 pot+=paid;roundPaid[seat]=(roundPaid[seat]||0)+paid;
 if(seat!==8)bubble(seat,hand.stacks[seat]===0?'All in':label);
 note(seat,label.toLowerCase(),paid);sync();
 if(paid>0&&animate){chips(false,seat);tone('chip');}
 return paid;
}
function effectiveTarget(requested){
 const opponentMaximum=Math.max(0,...active.map(i=>(roundPaid[i]||0)+hand.stacks[i]));
 return Math.min(requested,(roundPaid[8]||0)+stack,opponentMaximum);
}
function betSize(){return stage===0?(current==='straight'?8:6):stage===1?4:stage===2?10:current==='straight'?5:stack;}
function raiseTarget(){
 const increment=Math.max(1,target||betSize());
 return effectiveTarget(target+increment);
}
function nextStreet(){
 clearTurn();
 if(!active.length){winByFold();return;}
 if(stage===3||stack===0||active.every(i=>hand.stacks[i]===0)){runout();return;}
 stage++;roundPaid={8:0};target=0;facing=0;raises=0;opening=false;
 renderBoard(stage===1?3:stage===2?4:5);
 ui.handName.textContent=current==='straight'?(stage===1?'High Card':'Straight'):(stage===3?'Full House':'Three of a Kind');
 tone('card');lock();
 // Postflop action starts left of the dealer and pauses when it reaches you.
 const dealer=current==='straight'?4:3;
 pending=afterSeat(dealer).concat(dealer).filter(i=>liveSeat(i)&&chipsLeft(i)>0);
 schedule(takeTurn,400);
}
function runout(){
 busy=true;clearTurn();
 const count=ui.board.querySelectorAll('.card:not(.empty)').length;
 let delay=0;
 for(let n=Math.max(3,count+1);n<=5;n++){
  delay+=500;const reveal=n;
  schedule(()=>{renderBoard(reveal);tone('card');},delay);
 }
 schedule(()=>{stage=3;facing=0;showdown();},delay+350);
}
function winByFold(){
 clearTurn();
 // Return the uncalled part of the hero's last wager before awarding the pot.
 const matched=Math.max(0,...Object.entries(roundPaid).filter(([seat])=>seat!=='8').map(([,amount])=>amount));
 const refund=Math.max(0,(roundPaid[8]||0)-matched);
 if(refund){stack+=refund;invested-=refund;pot-=refund;roundPaid[8]-=refund;note(8,'uncalled return',refund);}
 settled=true;stack+=pot;sync();ui.handName.className='hand-name win';ui.handName.textContent='YOU WIN';
 ui.instruction.textContent='The table folds';chips(true);tone('win');
 const label=document.createElement('div');label.className='win-amount';label.textContent='+'+fmt(pot);ui.effects.appendChild(label);
 schedule(()=>finish(false),1400);
}
function takeTurn(){
 if(ended||settled)return;
 if(!active.length){winByFold();return;}
 pending=pending.filter(i=>liveSeat(i)&&chipsLeft(i)>0);
 if(!pending.length){nextStreet();return;}
 const seat=pending.shift();showTurn(seat);
 turns.push({street:stage,seat,at:clock,target});
 if(seat===8){facing=Math.max(0,target-(roundPaid[8]||0));setActions();return;}
 busy=true;ui.fold.disabled=ui.primary.disabled=ui.secondary.disabled=true;
 ui.instruction.textContent=hand.names[seat]+' is thinking…';
 schedule(()=>{
  const due=Math.max(0,target-(roundPaid[seat]||0));
  const roll=Math.random();
  let label='Check';
  // A short ad still has a featured showdown caller, but every live seat gets
  // its own timed decision. Non-featured seats can fold on their opening turn.
  const featured=current==='straight'?seat===5:seat===3||seat===5;
  const canWager=stack>0;
  if(due>0){
   const pressure=due/Math.max(1,hand.stacks[seat]);
   if(!(opening&&featured)&&roll<Math.min(.65,profile.fold+pressure*.25+(opening?.1:0))){seatFold(seat);label='Fold';}
   else if(raises<1&&roll>1-profile.raise&&stack>due&&hand.stacks[seat]>due+1){
    const increase=Math.max(target,[2,4,6][Math.floor(Math.random()*3)]*(stage>=2?2:1));
    const raised=Math.min(target+increase,(roundPaid[8]||0)+stack,(roundPaid[seat]||0)+hand.stacks[seat]);
    if(raised>target){target=raised;raises++;pay(seat,target-(roundPaid[seat]||0),'Raise');pending=queueAfter(seat);label='Raise to '+fmt(target);}
    else {pay(seat,due);label='Call';}
   }else {pay(seat,due);label=hand.stacks[seat]===0?'All in':'Call';}
  }else if(canWager&&raises<1&&roll<profile.bet){
   const amount=[2.5,4,6][Math.floor(Math.random()*3)]*(stage>=2?2:1);
   target=Math.min((roundPaid[seat]||0)+amount,(roundPaid[8]||0)+stack,(roundPaid[seat]||0)+hand.stacks[seat]);
   if(target>(roundPaid[seat]||0)){raises++;pay(seat,target-(roundPaid[seat]||0),'Bet');pending=queueAfter(seat);label='Bet '+fmt(target);}
   else {bubble(seat,'Check');note(seat,'check');tone('check');}
  }else {bubble(seat,'Check');note(seat,'check');tone('check');}
  ui.instruction.textContent=hand.names[seat]+' · '+label;
  schedule(takeTurn,350);
 },450+Math.floor(Math.random()*200));
}
function setActions(){
 showTurn(8);
 busy=false;ui.fold.disabled=ui.primary.disabled=ui.secondary.disabled=false;
 ui.fold.textContent='Fold';
 if(facing>0){
  ui.instruction.textContent='Facing '+fmt(Math.min(stack,facing))+' chips · Your turn';
  ui.primary.innerHTML='Call<small>'+fmt(Math.min(stack,facing))+' chips</small>';
  const raised=raiseTarget();
  ui.secondary.innerHTML='Raise<small>to '+fmt(raised)+'</small>';
  ui.secondary.disabled=raised<=target||raises>=2;
 }else if(stage===0&&history.length===0){
  ui.instruction.textContent='Tap to play your hand';
  ui.primary.innerHTML='Play hand<small>▶</small>';
  ui.secondary.innerHTML='Raise<small>to '+fmt(raiseTarget())+'</small>';
 }else{
  ui.instruction.textContent=(current==='straight'?(stage===1?'High Card':'Straight'):(stage===3?'Full House':'Three of a Kind'))+' · Your turn';
  const amount=effectiveTarget(betSize());
  const bet=amount>=stack?'All in<small>'+fmt(stack)+' chips</small>':'Bet<small>'+fmt(amount)+' chips</small>';
  if(current==='straight'){ui.primary.innerHTML='Check<small>See action</small>';ui.secondary.innerHTML=bet;ui.secondary.disabled=amount<=0;}
  else{ui.primary.innerHTML=bet;ui.secondary.innerHTML='Check<small>See action</small>';ui.primary.disabled=amount<=0;}
 }
 sync();
}
function act(secondary){
 if(busy||ended||!visible)return;start();lock();
 clearTurn();
 const first=stage===0&&history.length===0;
 if(first){turns.push({street:stage,seat:8,at:clock,target});pending=queueAfter(8);}
 let heroBet=false;
 if(facing>0){
  if(secondary){const raised=raiseTarget();if(raised<=target||raises>=2){setActions();return;}target=raised;raises++;heroBet=true;pay(8,target-(roundPaid[8]||0),'Raise');}
  else{
   pay(8,facing,'Call');facing=0;
   schedule(takeTurn,350);return;
  }
  facing=0;
 }else if(first){
  if(secondary){target=raiseTarget();heroBet=true;pay(8,target-(roundPaid[8]||0),'Raise');}
  else note(8,'play');
 }else if((current==='straight'&&secondary)||(current==='fullhouse'&&!secondary)){
  target=effectiveTarget(betSize());heroBet=true;pay(8,target-(roundPaid[8]||0),target>=stack+(roundPaid[8]||0)?'All in':'Bet');
 }else {note(8,'check');tone('check');}
 if(heroBet)pending=queueAfter(8);
 schedule(takeTurn,300);
}
