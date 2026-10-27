const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),checks=[];
 for(const name of ['full-house','straight'])for(let seed=1;seed<=8;seed++){
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(seed=>{let x=seed;Math.random=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};},seed);
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.goto('http://127.0.0.1:8787/dist/pure-poker-'+name+'.html');await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.evaluate(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>fn(t*10));});
  assert.equal(await page.locator('#secondary').isEnabled(),false,'Cannot raise own opening bet');await page.locator('#primary').click();
  let changed=false,moves=0;
  for(let i=0;i<1500;i++){
   const s=await page.evaluate(()=>PurePoker.getState());assert.deepEqual(errors,[]);assert.ok(s.stack>=0&&s.opponentStacks.every(n=>n>=0));
   assert.ok(Math.abs(Object.values(s.contributions).reduce((a,b)=>a+b,0)-s.pot)<1e-6);
   if(s.ended){assert.ok(s.settlement);assert.ok(Math.abs(Object.values(s.settlement.awards).reduce((a,b)=>a+b,0)-s.pot)<1e-6);break;}
   if(!s.busy){
    const raise=await page.locator('#secondary').isEnabled();
    if(s.legalActions.call>0)assert.equal(await page.locator('#primary').textContent(),'Call');else assert.ok(['Play','Check'].includes(await page.locator('#primary').textContent()));
    let id;if(!changed){id=name==='straight'?'secondary':'primary';changed=true;}else id=raise&&((seed+moves)%3===0)?'secondary':'primary';
    await page.locator('#'+id).click();moves++;
   }
   await page.clock.runFor(40);assert.ok(i<1499,'Branch terminates');
  }
  const s=await page.evaluate(()=>PurePoker.getState());assert.equal(s.gameplayMode,'varied');checks.push({scenario:name,seed,heroDecisions:moves,pot:s.pot,heroAward:s.settlement.heroAward,result:'pass'});await page.close();
 }
 await browser.close();fs.writeFileSync('deliverables/rule-branch-qa.json',JSON.stringify({checks},null,2));console.log(checks.length+' deterministic legal-action branches passed.');
})().catch(e=>{console.error(e);process.exit(1)});
