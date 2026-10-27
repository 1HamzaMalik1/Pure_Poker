// Motion presentation inspected in Downloads/Pure_Poker.mp4 (600 frames).
function showStreetTitle(){
 const el=document.getElementById('street-title');el.textContent=['PRE-FLOP','FLOP','TURN','RIVER'][stage];
 el.classList.remove('street-enter');void el.offsetWidth;el.classList.add('street-enter');
}
function animateOpeningCards(){
 ui.stage.classList.remove('pre-deal');
 Array.from(ui.hole.children).forEach((el,i)=>{el.classList.add('opening-card');el.style.setProperty('--opening-delay',(i*.12)+'s');});
 showStreetTitle();
}
function showMadeHand(){
 if(ended)return;const evaluation=heroEvaluation();if(!evaluation||evaluation.score[0]<4)return;
 markBestCards(evaluation);ui.stage.classList.add('made-hand');
 ui.handName.classList.add('strong');
 const el=document.getElementById('made-hand-effect');el.textContent=evaluation.name.toUpperCase()+'!';
 el.classList.remove('made-enter');void el.offsetWidth;el.classList.add('made-enter');
 schedule(()=>ui.stage.classList.remove('made-hand'),1500);
}
function showWinEffect(amount){
 if(folded)return;
 const evaluation=heroEvaluation();if(evaluation)markBestCards(evaluation);
 const title=document.getElementById('made-hand-effect');title.classList.remove('made-enter');title.textContent=evaluation?evaluation.name.toUpperCase():'POT WON';
 ui.stage.classList.add('win-burst','victory');document.getElementById('street-title').textContent=ruleOutcome?.split?'SPLIT POT!':'YOU WIN!';
 schedule(()=>ui.stage.classList.remove('win-burst'),2300);
}
function resetMotion(){
 ui.stage.classList.add('pre-deal');ui.stage.classList.remove('made-hand','win-burst','victory');
 document.getElementById('street-title').textContent='';document.getElementById('made-hand-effect').classList.remove('made-enter');
}
