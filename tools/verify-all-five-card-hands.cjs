const r=require('../src/poker-rules.js'),assert=require('assert/strict'),fs=require('fs');
const deck='23456789TJQKA'.split('').flatMap(rank=>'schd'.split('').map(suit=>rank+suit)),counts=Array(9).fill(0);
for(let a=0;a<48;a++)for(let b=a+1;b<49;b++)for(let c=b+1;c<50;c++)for(let d=c+1;d<51;d++)for(let e=d+1;e<52;e++)counts[r.evaluate([deck[a],deck[b],deck[c],deck[d],deck[e]]).score[0]]++;
const expected=[1302540,1098240,123552,54912,10200,5108,3744,624,40];
assert.deepEqual(counts,expected,'All 2,598,960 five-card combinations match the standard category counts');
fs.writeFileSync('deliverables/exhaustive-hand-qa.json',JSON.stringify({date:new Date().toISOString(),hands:counts.reduce((a,b)=>a+b,0),categories:counts,result:'pass'},null,2));console.log('All 2,598,960 five-card hands classified correctly.');
