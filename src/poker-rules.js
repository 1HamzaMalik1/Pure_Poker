// Best five of seven and independent pots. Amounts use integer hundredths
// internally so ties and refunds cannot create or destroy displayed chips.
const PokerRules=(()=>{
 const names=['High Card','One Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush'];
 const value=c=>'23456789TJQKA'.indexOf(c[0])+2;
 function compare(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d;}return 0;}
 function five(cards){
  const ranks=cards.map(value).sort((a,b)=>b-a),counts=new Map();ranks.forEach(v=>counts.set(v,(counts.get(v)||0)+1));
  const groups=[...counts].sort((a,b)=>b[1]-a[1]||b[0]-a[0]),flush=cards.every(c=>c[1]===cards[0][1]);
  const unique=[...new Set(ranks)];if(unique[0]===14)unique.push(1);
  let straight=0;for(let i=0;i<=unique.length-5;i++)if(unique[i]-unique[i+4]===4){straight=unique[i];break;}
  if(flush&&straight)return [8,straight];
  if(groups[0][1]===4)return [7,groups[0][0],groups[1][0]];
  if(groups[0][1]===3&&groups[1][1]===2)return [6,groups[0][0],groups[1][0]];
  if(flush)return [5,...ranks];if(straight)return [4,straight];
  if(groups[0][1]===3)return [3,groups[0][0],...groups.slice(1).map(g=>g[0])];
  if(groups[0][1]===2&&groups[1][1]===2)return [2,...groups.slice(0,2).map(g=>g[0]).sort((a,b)=>b-a),groups[2][0]];
  if(groups[0][1]===2)return [1,groups[0][0],...groups.slice(1).map(g=>g[0])];
  return [0,...ranks];
 }
 function evaluate(cards){
  if(cards.length<5||cards.length>7||new Set(cards).size!==cards.length||cards.some(c=>!/^[2-9TJQKA][schd]$/.test(c)))throw Error('Invalid Hold’em cards');
  let score=null,best=[];
  for(let a=0;a<cards.length-4;a++)for(let b=a+1;b<cards.length-3;b++)for(let c=b+1;c<cards.length-2;c++)for(let d=c+1;d<cards.length-1;d++)for(let e=d+1;e<cards.length;e++){
   const hand=[cards[a],cards[b],cards[c],cards[d],cards[e]],candidate=five(hand);if(!score||compare(candidate,score)>0){score=candidate;best=hand;}
  }
  return {score,best,name:score[0]===8&&score[1]===14?'Royal Flush':names[score[0]]};
 }
 function settle(contributions,live,hands,board,oddOrder=live){
  if(live.length>1&&new Set([...board,...live.flatMap(s=>hands[s])]).size!==board.length+live.length*2)throw Error('Duplicate cards across players');
  const paid=Object.fromEntries(Object.entries(contributions).map(([s,n])=>[s,Math.round(n*100)])),levels=[...new Set(Object.values(paid).filter(n=>n>0))].sort((a,b)=>a-b);
  const awards={},refunds={},pots=[],ranks={};let previous=0;
  if(live.length>1){if(board.length!==5)throw Error('Showdown needs a complete board');for(const s of live)ranks[s]=evaluate([...hands[s],...board]);}
  for(const level of levels){
   const contributors=Object.keys(paid).filter(s=>paid[s]>=level),units=(level-previous)*contributors.length;previous=level;
   if(contributors.length===1){const s=contributors[0];refunds[s]=(refunds[s]||0)+units;awards[s]=(awards[s]||0)+units;continue;}
   const eligible=live.filter(s=>(paid[s]||0)>=level);if(!eligible.length)throw Error('Pot has no eligible player');
   let winners=eligible.slice();if(eligible.length>1){let best=ranks[eligible[0]].score;for(const s of eligible)if(compare(ranks[s].score,best)>0)best=ranks[s].score;winners=eligible.filter(s=>compare(ranks[s].score,best)===0);}
   const share=Math.floor(units/winners.length),remainder=units%winners.length,ordered=oddOrder.filter(s=>winners.includes(s));
   for(const s of winners)awards[s]=(awards[s]||0)+share;
   for(let i=0;i<remainder;i++)awards[ordered[i]]++;
   const prior=pots[pots.length-1];if(prior&&prior.eligible.join(',')===eligible.join(',')&&prior.winners.join(',')===winners.join(','))prior.amount=Math.round((prior.amount+units/100)*100)/100;
   else pots.push({amount:units/100,eligible,winners});
  }
  return {awards:Object.fromEntries(Object.entries(awards).map(([s,n])=>[s,n/100])),refunds:Object.fromEntries(Object.entries(refunds).map(([s,n])=>[s,n/100])),pots,ranks};
 }
 function raiseAllowed(target,lastFullRaise,actedAt){return actedAt===undefined||target-actedAt>=lastFullRaise-1e-7;}
 return {evaluate,compare,settle,raiseAllowed};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=PokerRules;
