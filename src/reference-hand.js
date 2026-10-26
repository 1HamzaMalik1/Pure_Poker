// Recorded actions transcribed from the supplied video, with interactive
// pauses at the hero's decisions. Alternative choices enter the varied engine.
const variedChooseProfile=chooseProfile,variedAct=act;
let refActive=true,refPrompt=null,bankPot=0,referenceEvents=[],referencePhase='start';
const FULL_OPEN=[
 {time:1.283,kind:'fold',seat:6,hold:3500},{time:2.817,kind:'fold',seat:4,hold:2800},
 {time:4.333,kind:'fold',seat:2,hold:3600},{time:5.883,kind:'fold',seat:1,hold:5200},
 {time:7.833,kind:'pay',seat:3,amount:3,label:'Call',hold:4500},
 {time:9.8,kind:'pay',seat:5,amount:2.5,label:'Call',hold:2600},
 {time:11.367,kind:'fold',seat:7,hold:2300},
 {time:11.6,kind:'gather'},{time:12.033,kind:'bank'},
 {time:12.1,kind:'deal',count:3},{time:13.583,kind:'check',seat:5,hold:6000},
 {time:15.25,kind:'prompt',phase:'flop-bet',action:'bet',amount:4}
];
const FULL_FLOP=[
 {time:15.55,kind:'pay',seat:8,amount:4,label:'Bet'},
 {time:17.5,kind:'pay',seat:3,amount:4,label:'Call',hold:3000},
 {time:19.483,kind:'pay',seat:5,amount:4,label:'Call',hold:1100},
 {time:19.717,kind:'gather'},{time:20.167,kind:'bank'},
 {time:20.433,kind:'deal',count:4},{time:21.717,kind:'check',seat:5,hold:6000},
 {time:23.383,kind:'prompt',phase:'turn-bet',action:'bet',amount:10}
];
const FULL_TURN=[
 {time:23.7,kind:'pay',seat:8,amount:10,label:'Bet'},
 {time:25.65,kind:'pay',seat:3,amount:10,label:'Call',hold:6000},
 {time:27.617,kind:'pay',seat:5,amount:40,label:'Raise',hold:6500},
 {time:29.25,kind:'prompt',phase:'turn-all-in',action:'allin',amount:127}
];
const FULL_ALL_IN=[
 {time:29.583,kind:'pay',seat:8,amount:127,label:'All in'},
 {time:31.517,kind:'pay',seat:3,amount:84.5,label:'Call',hold:2400},
 {time:33.5,kind:'pay',seat:5,amount:97,label:'Call',hold:650},
 {time:33.983,kind:'gather'},{time:34.417,kind:'bank'},
 {time:34.85,kind:'reveal'},{time:35.6,kind:'deal',count:5},
 {time:36.95,kind:'winner'},{time:37.533,kind:'highlight'},{time:37.95,kind:'hide-pots'},
 {time:38.467,kind:'award-flight'},{time:38.767,kind:'award-label'},
 {time:39.067,kind:'award'},{time:41.1,kind:'finish'}
];
// Straight-hand timings are kept in their own plan; the new WhatsApp video
// corresponds to FULL_* above, rather than this alternate reference hand.
const STRAIGHT_OPEN=[
 {time:.017,kind:'fold',seat:6,hold:2500},{time:1.433,kind:'fold',seat:4,hold:3600},
 {time:2.95,kind:'fold',seat:2,hold:3600},{time:4.483,kind:'fold',seat:0,hold:3300},
 {time:6.467,kind:'pay',seat:5,amount:4,label:'Call',hold:1600},
 {time:6.7,kind:'gather'},{time:7.15,kind:'bank'},
 {time:7.25,kind:'deal',count:3},{time:8.75,kind:'check',seat:5,hold:2000},
 {time:9.967,kind:'prompt',phase:'flop-check',action:'check',amount:2.5}
];
const STRAIGHT_FLOP=[
 {time:10.433,kind:'deal',count:4},{time:11.733,kind:'check',seat:5,hold:3800},
 {time:13.417,kind:'prompt',phase:'turn-bet',action:'bet',amount:5}
];
const STRAIGHT_TURN=[
 {time:13.733,kind:'pay',seat:8,amount:5,label:'Bet'},
 {time:15.283,kind:'fold',seat:5,hold:1500},
 {time:15.767,kind:'gather'},{time:15.8,kind:'rabbit'},
 {time:16.183,kind:'bank'},{time:16.467,kind:'hide-pots'},
 {time:16.867,kind:'award-flight'},{time:17.217,kind:'award-label'},
 {time:17.55,kind:'award'},{time:19.5,kind:'finish'}
];
const STRAIGHT_RIVER=STRAIGHT_TURN;
function refLog(event){referenceEvents.push({kind:event.kind,seat:event.seat,amount:event.amount,count:event.count,sourceTime:event.time,at:clock,pot,bankPot,stack,opponents:hand.stacks.slice(),boardCount:ui.board.querySelectorAll('.card:not(.empty):not(.rabbit)').length});}
function clearBubbles(){ui.seats.querySelectorAll('.bubble').forEach(el=>el.remove());}
function showRecordedTurn(seat){showTurn(seat);turns.push({street:stage,seat,at:clock,target});ui.instruction.textContent=seat===8?'Your turn':hand.names[seat]+"’s turn";}
function gatherStreet(){
 clearTurn();tone('gather');for(const [seat,amount] of Object.entries(roundPaid))if(amount>0)chips(false,Number(seat),'gather');
}
function referenceWinner(){
 clearTurn();
 ui.handName.className='hand-name win';ui.handName.textContent=hand.win;
 document.getElementById('hero-hand-label').textContent='Three of a Kind';
 ui.stage.classList.add('winner');schedule(()=>tone('win'),290);
}
function highlightRecordedHand(){
 hand.best.forEach(i=>ui.board.children[i].classList.add('best'));
 Array.from(ui.board.children).forEach((c,i)=>{if(!hand.best.includes(i))c.classList.add('dim');});
 Array.from(ui.hole.children).forEach(c=>c.classList.add('best'));
 ui.stage.classList.add('highlighted');document.getElementById('hero-hand-label').textContent='Full House';
}
function revealRecordedCards(){
 clearBubbles();clearTurn();ui.stage.classList.add('showdown');
 if(current==='fullhouse')for(const [seat,cards] of [[3,['7d','6d']],[5,['4h','4c']]]){
  if(!active.includes(seat))continue;
  const el=document.createElement('div');el.className='opponent-hole';el.append(...cards.map(v=>card(v,'flip')));
  const seatEl=ui.seats.querySelector('[data-seat="'+seat+'"]');seatEl.classList.add('revealed');seatEl.appendChild(el);
 }
}
function refApply(event){
 if(!refActive||ended)return;
 if(event.kind==='fold'){seatFold(event.seat);bubble(event.seat,'Fold',event.hold);}
 if(event.kind==='pay'){
  if(event.label==='Bet'||event.label==='Raise'||event.label==='All in')target=(roundPaid[event.seat]||0)+event.amount;
  if(event.label==='Raise')raises=1;
  pay(event.seat,event.amount,event.label,false);
  if(event.seat!==8)bubble(event.seat,hand.stacks[event.seat]===0?'All in':event.label,event.hold||3000);
 }
 if(event.kind==='check'){bubble(event.seat,'Check',event.hold||3000);note(event.seat,'check');tone('check');}
 if(event.kind==='gather')gatherStreet();
 if(event.kind==='bank'){bankPot=pot;roundPaid={8:0};target=0;facing=0;raises=0;clearBubbles();sync();}
 if(event.kind==='deal'){
  stage=event.count===3?1:event.count===4?2:3;opening=false;
  renderBoard(event.count);ui.handName.textContent=current==='straight'?(stage===1?'High Card':'Straight'):'Three of a Kind';tone('card');
 }
 if(event.kind==='prompt'){
  referencePhase=event.phase;refPrompt=event;
  facing=event.action==='allin'?Math.max(0,target-(roundPaid[8]||0)):0;
  pending=current==='fullhouse'?[3]:[];showRecordedTurn(8);setActions();
 }
 if(event.kind==='reveal')revealRecordedCards();
 if(event.kind==='rabbit'){const last=ui.board.children[4];last.className='card rabbit';last.setAttribute('aria-label','River not dealt · rabbit card');}
 if(event.kind==='winner')referenceWinner();
 if(event.kind==='highlight')highlightRecordedHand();
 if(event.kind==='hide-pots')ui.stage.classList.add('paying-out');
 if(event.kind==='award-flight'){clearTurn();chips(true);}
 if(event.kind==='award-label'){
  const el=document.createElement('div');el.className='win-amount';el.textContent='+'+fmt(pot);ui.effects.appendChild(el);
 }
 if(event.kind==='award'){
  settled=true;stack+=pot;sync();ui.stage.classList.add('settled');
  if(current==='straight'){active=[];ui.handName.className='hand-name';ui.handName.textContent='Straight';}
 }
 if(event.kind==='finish')finish(false);
 refLog(event);
}
function refRun(events,sourceOrigin=0){
 lock();refPrompt=null;const base=clock;
 for(const event of events){
  const wait=(event.time-sourceOrigin)*1000;
  if(['fold','pay','check'].includes(event.kind)&&event.seat!==8){
   schedule(()=>{if(refActive)showRecordedTurn(event.seat);},Math.max(0,wait-650));
  }
  if(event.kind==='pay')schedule(()=>{
   if(!refActive)return;
   if(event.seat===8)showTurn(8);
   else bubble(event.seat,event.label,event.hold||3000);
   chips(false,event.seat);schedule(()=>tone('chip'),267);
  },Math.max(0,wait-317));
  schedule(()=>refApply(event),Math.max(0,wait));
 }
}
chooseProfile=function(){
 variedChooseProfile();refActive=CONFIG.gameplayMode!=='varied';bankPot=0;referenceEvents=[];referencePhase='start';
 refPrompt=refActive?{phase:'start',action:'start',time:0}:null;
 ui.stage.classList.remove('showdown','winner','highlighted','paying-out','settled');
 ui.stage.classList.toggle('reference-mode',refActive);
 document.getElementById('hero-hand-label').textContent='';
};
function enterAlternative(secondary){
 refActive=false;refPrompt=null;referencePhase='alternative';jobs.length=0;
 ui.stage.classList.remove('reference-mode');
 ui.effects.querySelectorAll('.chip').forEach(el=>el.remove());clearBubbles();
 // The varied engine uses its original boolean mapping for full-house bets.
 const mapped=current==='fullhouse'&&stage>0&&facing===0?!secondary:secondary;
 variedAct(mapped);
}
act=function(secondary){
 if(busy||ended||!visible)return;
 if(!refActive){enterAlternative(secondary);return;}
 if(!refPrompt)return;
 const expected=refPrompt.action==='bet'||refPrompt.action==='allin';
 if(secondary!==expected){enterAlternative(secondary);return;}
 start();clearTurn();const phase=refPrompt.phase;note(8,phase==='start'?'play':refPrompt.action,0);
 if(refPrompt.action==='check')tone('check');
 if(phase==='start')refRun(current==='fullhouse'?FULL_OPEN:STRAIGHT_OPEN);
 else if(current==='fullhouse')refRun(phase==='flop-bet'?FULL_FLOP:phase==='turn-bet'?FULL_TURN:FULL_ALL_IN,refPrompt.time);
 else refRun(phase==='flop-check'?STRAIGHT_FLOP:STRAIGHT_TURN,refPrompt.time);
};
setActions=function(){
 showTurn(8);busy=false;ui.fold.disabled=ui.primary.disabled=ui.secondary.disabled=false;
 ui.fold.textContent='Fold';ui.primary.classList.remove('recommended');ui.secondary.classList.remove('recommended');
 if(stage===0&&history.length===0){
  ui.primary.textContent='Play';ui.secondary.textContent='Raise';if(refActive)ui.primary.classList.add('recommended');ui.instruction.textContent='Your hand is ready';
 }else if(facing>0){
  const raised=refActive&&refPrompt?.action==='allin'?(roundPaid[8]||0)+stack:raiseTarget();
  ui.primary.textContent='Call';ui.secondary.textContent=refActive&&refPrompt?.action==='allin'?'All in':'Raise';
  ui.instruction.textContent=(refActive?'Facing ':'Call ')+fmt(Math.min(stack,facing))+' · '+(ui.secondary.textContent==='All in'?'All in '+fmt(stack):'Raise to '+fmt(raised));
  ui.secondary.disabled=raised<=target||(!refActive&&raises>=2);
  if(refActive)ui.secondary.classList.add('recommended');
 }else{
  const amount=refActive&&refPrompt?refPrompt.amount:effectiveTarget(betSize());
  ui.primary.textContent='Check';ui.secondary.textContent=amount>=stack?'All in':'Bet';
  ui.secondary.disabled=!(amount>0);
  const handHint=current==='fullhouse'?'Three of a Kind':stage===1?'High Card':'Straight';
  ui.instruction.textContent=handHint+' · '+(refActive?(refPrompt?.action==='check'?'Check':'Bet '+fmt(amount)):(amount>0?'Bet '+fmt(amount)+' or check':'Check'));
  if(refActive)(refPrompt?.action==='check'?ui.primary:ui.secondary).classList.add('recommended');
 }
 sync();
};
