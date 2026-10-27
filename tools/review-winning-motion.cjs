const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict'),fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),checks=[];
 for(const scenario of ['full-house','straight']){
  const page=await browser.newPage({viewport:{width:400,height:870}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.goto('http://127.0.0.1:8787/dist/pure-poker-'+scenario+'.html');await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.evaluate(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>fn(t*10));});
  let victory=false;
  for(let i=0;i<600;i++){
   const s=await page.evaluate(()=>PurePoker.getState());if(s.ended)break;
   if((await page.locator('#stage').getAttribute('class')).includes('victory')){victory=true;break;}
   if(!s.busy)await page.locator('#'+s.recommendedAction).click();await page.clock.runFor(20);
  }
  assert.ok(victory);await page.clock.runFor(160);
  await page.locator('.opening-card,.opening-card .card-inner,.win-rays,#made-hand-effect,.win-amount').evaluateAll(els=>{for(const el of els)for(const a of el.getAnimations()){a.pause();a.currentTime=1000;}});
  assert.equal(await page.locator('#street-title').textContent(),'YOU WIN!');assert.equal(await page.locator('#made-hand-effect').textContent(),scenario==='full-house'?'FULL HOUSE':'STRAIGHT');
  assert.equal(await page.locator('.win-amount').textContent(),scenario==='full-house'?'+390.5':'+16.5');assert.equal(await page.locator('.actions').isVisible(),false);assert.equal(await page.locator('.card.best').count(),5);
  const state=await page.evaluate(()=>PurePoker.getState());assert.equal(state.stack,scenario==='full-house'?390.5:494.75);assert.deepEqual(errors,[]);
  await page.screenshot({path:'deliverables/'+scenario+'-winning-animation.png'});
  checks.push({scenario,banner:'YOU WIN!',hand:await page.locator('#made-hand-effect').textContent(),award:state.settlement.heroAward,winningCards:5,result:'pass'});await page.close();
 }
 await browser.close();fs.writeFileSync('deliverables/winning-animation-qa.json',JSON.stringify({checks},null,2));console.log('Both winning animations and exact payouts verified.');
})().catch(e=>{console.error(e);process.exit(1)});
