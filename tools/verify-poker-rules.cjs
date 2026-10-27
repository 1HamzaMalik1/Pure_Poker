const assert=require('assert/strict'),fs=require('fs'),r=require('../src/poker-rules.js');
const checks=[];function check(name,fn){fn();checks.push({name,result:'pass'});}
check('Best five of seven; royal flush',()=>assert.deepEqual(r.evaluate(['As','Ks','Qs','Js','Ts','2d','2c']).score,[8,14]));
check('Ace-low straight',()=>assert.deepEqual(r.evaluate(['As','2h','3d','4c','5s','Kd','Qh']).score,[4,5]));
check('Highest straight from six consecutive ranks',()=>assert.deepEqual(r.evaluate(['4s','5h','6d','7c','8s','9d','Ah']).score,[4,9]));
check('Two trips form the higher full house',()=>assert.deepEqual(r.evaluate(['As','Ah','Ad','Ks','Kh','Kd','2c']).score,[6,14,13]));
check('Flush uses five highest suited cards',()=>assert.deepEqual(r.evaluate(['As','Js','9s','8s','6s','2s','Ad']).score,[5,14,11,9,8,6]));
check('Quad kicker matters',()=>assert.ok(r.compare(r.evaluate(['9s','9h','9d','9c','As','2d','3c']).score,r.evaluate(['9s','9h','9d','9c','Ks','2d','3c']).score)>0));
check('Duplicate card rejected',()=>assert.throws(()=>r.evaluate(['As','As','2d','3c','4h'])));
check('Separate main and side-pot winners',()=>{const s=r.settle({0:50,1:100,8:100},[0,1,8],{0:['As','5s'],1:['Kc','Kd'],8:['Qs','Qh']},['2s','3h','4d','9c','Kh']);assert.deepEqual(s.awards,{'0':150,'1':100});assert.deepEqual(s.pots.map(p=>p.amount),[150,100]);});
check('Folded contributors cannot win',()=>{const s=r.settle({0:10,1:20,8:50},[8],{},[]);assert.deepEqual(s.awards,{'8':80});assert.deepEqual(s.refunds,{'8':30});});
check('Board plays; exact split and odd chip clockwise',()=>{const s=r.settle({0:1,1:1,8:1.01},[0,1],{0:['2c','3c'],1:['4c','5c']},['As','Kd','Qh','Jc','Ts'],[1,0]);assert.deepEqual(s.awards,{'0':1.5,'1':1.5,'8':.01});});
check('Odd cent in contested pot goes left of dealer',()=>{const s=r.settle({0:1,1:1,8:.01},[0,1],{0:['2c','3c'],1:['4c','5c']},['As','Kd','Qh','Jc','Ts'],[1,0]);assert.equal(s.awards[0],1);assert.equal(s.awards[1],1.01);});
check('Short all-in does not reopen prior actor',()=>assert.equal(r.raiseAllowed(125,100,100),false));
check('Cumulative short all-ins can reopen',()=>assert.equal(r.raiseAllowed(200,100,100),true));
check('Unacted player retains raising rights',()=>assert.equal(r.raiseAllowed(125,100,undefined),true));
check('Recorded full-house pots total 390.5',()=>{const s=r.settle({8:144,3:101.5,5:144,7:1},[8,3,5],{8:['Ks','Kd'],3:['7d','6d'],5:['4h','4c']},['Kh','4s','8c','5d','8h']);assert.deepEqual(s.pots.map(p=>p.amount),[305.5,85]);assert.equal(s.awards[8],390.5);assert.equal(s.ranks[8].name,'Full House');assert.equal(s.ranks[3].name,'Straight');assert.equal(s.ranks[5].name,'Full House');});
check('Recorded straight includes uncalled five refund',()=>{const s=r.settle({8:10,5:5,0:1,2:.5},[8],{},[]);assert.equal(s.awards[8],16.5);assert.equal(s.refunds[8],5);assert.equal(s.pots.reduce((a,p)=>a+p.amount,0),11.5);});
fs.writeFileSync('deliverables/poker-rules-unit-qa.json',JSON.stringify({date:new Date().toISOString(),checks},null,2));console.log(checks.length+' poker rule checks passed.');
