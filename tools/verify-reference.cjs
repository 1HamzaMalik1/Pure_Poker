const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
const origin={straight:{pot:7.5,stack:483.25,opponents:[265.5,208,316.52,304.5,665.97,221,261,42]},fullhouse:{pot:4.5,stack:141,opponents:[50,61,96,101.5,142,384.5,108,176]}};
function balance(s){const o=origin[s.scenario],opPaid=o.opponents.reduce((a,n,i)=>a+n-s.opponentStacks[i],0);assert.ok(Math.abs(s.pot-o.pot-s.invested-opPaid)<1e-6);assert.ok(Math.abs(s.stack-(o.stack-s.invested+(s.settled?s.pot:0)))<1e-6);assert.ok(s.stack>=0&&s.opponentStacks.every(n=>n>=0));}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),checks=[],results=[];
 async function pageFor(name,viewport={width:400,height:870},host=false){
  const context=await browser.newContext({viewport});
  if(host)await context.addInitScript(()=>{const listeners={};window.__host={loading:true,visible:true,opens:[],calls:[]};window.mraid={getState:()=>__host.loading?'loading':'default',addEventListener:(k,f)=>(listeners[k]||(listeners[k]=[])).push(f),isViewable:()=>{__host.calls.push('isViewable');return __host.visible;},open:u=>__host.opens.push(u)};window.hostFire=(k,v)=>{if(k==='ready')__host.loading=false;(listeners[k]||[]).forEach(f=>f(v));};});
  const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('data:'))requests.push(r.url());});
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});
  await page.goto('http://127.0.0.1:8787/dist/pure-poker-'+name+'.html');
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.evaluate(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>fn(t*10));});
  return {page,context,errors,requests};
 }
 async function advance(page){for(let i=0;await page.evaluate(()=>PurePoker.getState().busy&&!PurePoker.getState().ended);i++){assert.ok(i<35,'Reference phase must reach a player decision or ending');await page.clock.runFor(250);}}
 async function complete(page,capture=false){
  let decisions=0;
  while(!(await page.evaluate(()=>PurePoker.getState().ended))){
   let s=await page.evaluate(()=>PurePoker.getState());balance(s);
   if(s.busy){await advance(page);continue;}
   if(capture)await page.screenshot({path:'deliverables/reference-'+s.scenario+'-'+s.referencePhase+'.png',animations:'disabled'});
   await page.locator('#'+s.recommendedAction).click();await page.clock.runFor(100);
   s=await page.evaluate(()=>PurePoker.getState());balance(s);
   if(capture&&['flop-bet','turn-bet','turn-all-in'].includes(s.referencePhase))await page.screenshot({path:'deliverables/reference-'+s.scenario+'-'+s.referencePhase+'-wager.png',animations:'disabled'});
   await advance(page);assert.ok(++decisions<18);
  }
  return page.evaluate(()=>PurePoker.getState());
 }
 for(const name of ['full-house','straight']){
  const {page,context,errors,requests}=await pageFor(name);await page.waitForFunction(()=>window.PurePoker);await page.clock.runFor(400);
  assert.equal(await page.evaluate(()=>PurePoker.getState().clock),0,'No gameplay before first interaction');
  assert.equal(await page.locator('#menu,#menu-panel').count(),0,'Settings control removed');
  const avatars=await page.locator('.seat .avatar>img').evaluateAll(imgs=>imgs.map(img=>img.src));
  assert.equal(avatars.length,9);assert.equal(new Set(avatars).size,9,'Every seat uses a unique avatar');
  await page.screenshot({path:'deliverables/reference-'+name+'-initial.png'});
  const state=await complete(page,true);balance(state);const events=state.referenceEvents;
  const payments=events.filter(e=>e.kind==='pay').map(e=>[e.seat,e.amount,e.pot,e.stack]);
  if(name==='full-house'){
   assert.deepEqual(payments,[[3,3,7.5,141],[5,2.5,10,141],[8,4,14,137],[3,4,18,137],[5,4,22,137],[8,10,32,127],[3,10,42,127],[5,40,82,127],[8,127,209,0],[3,84.5,293.5,0],[5,97,390.5,0]],'Reference footage wager and stack sequence');
   assert.equal(state.pot,390.5);assert.equal(state.stack,390.5);assert.equal(state.opponentStacks[3],0);assert.equal(state.opponentStacks[5],241);
   assert.deepEqual(events.filter(e=>e.kind==='fold').map(e=>e.seat),[6,4,2,1,7]);
   assert.deepEqual(events.filter(e=>e.kind==='bank').map(e=>e.bankPot),[10,22,390.5]);
   const reveal=events.findIndex(e=>e.kind==='reveal'),river=events.findIndex(e=>e.kind==='deal'&&e.count===5),award=events.findIndex(e=>e.kind==='award');
   assert.ok(reveal<river&&river<award,'All-in calls and reveal precede river and payout');
   assert.ok(events.filter(e=>e.kind==='pay'&&e.sourceTime>=23.7&&e.sourceTime<=33.5).every(e=>e.boardCount===4),'No premature river during turn betting');
   assert.equal(events.find(e=>e.kind==='pay'&&e.pot===14).bankPot,10);assert.equal(events.find(e=>e.kind==='pay'&&e.pot===209).bankPot,22);
  }else{
   assert.deepEqual(payments,[[5,4,11.5,483.25],[8,5,16.5,478.25]]);assert.equal(state.pot,16.5);assert.equal(state.stack,494.75);
   assert.deepEqual(events.filter(e=>e.kind==='deal').map(e=>e.count),[3,4],'The straight reference ends on the turn');
   assert.equal(await page.locator('.card.rabbit').count(),1);assert.equal(await page.locator('#board .card-art').count(),4);
  }
  await page.screenshot({path:'deliverables/reference-'+name+'-corrected-end.png'});
  assert.deepEqual(errors,[]);assert.equal(requests.length,1,'Single HTML with no external assets');
  results.push({scenario:state.scenario,payments,events,finalPot:state.pot,finalStack:state.stack});checks.push({scenario:name,referenceSequence:'pass',amounts:'pass',riverAndPayout:'pass',result:'pass'});
  await page.locator('#replay').click();assert.equal(await page.evaluate(()=>PurePoker.getState().stage),0);assert.equal(await page.evaluate(()=>PurePoker.getState().scenario),state.scenario,'Replay keeps the corresponding reference hand');await page.locator('#fold').click();assert.ok(await page.locator('#end').isVisible());await context.close();
 }
 for(const viewport of [{width:320,height:480},{width:390,height:844},{width:844,height:390},{width:1024,height:768}]){
  const {page,context}=await pageFor('full-house',viewport);await page.waitForFunction(()=>window.PurePoker);
  const boxes=[];for(const id of ['fold','primary','secondary']){const b=await page.locator('#'+id).boundingBox();assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=viewport.width+1&&b.y+b.height<=viewport.height+1);boxes.push(b);}
  assert.ok(boxes[0].x<boxes[1].x&&boxes[1].x<boxes[2].x,'Fold, Call/Check, Raise/Bet order');
  const radius=await page.locator('#fold').evaluate(el=>parseFloat(getComputedStyle(el).borderRadius));assert.ok(radius<20,'Rounded rectangles rather than circular controls');
  checks.push({viewport,controls:'pass',result:'pass'});await context.close();
 }
 for(const name of ['full-house','straight']){
  const {page,context,errors}=await pageFor(name);await page.waitForFunction(()=>window.PurePoker);
  await page.locator('#secondary').click();await page.clock.runFor(100);await advance(page);
  assert.equal(await page.evaluate(()=>PurePoker.getState().gameplayMode),'varied','Alternative opening raise enters varied betting');
  const state=await complete(page);balance(state);assert.deepEqual(errors,[]);checks.push({scenario:name,alternativeBranch:'pass',result:'pass'});await context.close();
 }
 for(const phase of ['flop-bet','turn-all-in']){
  const {page,context,errors}=await pageFor('full-house');await page.waitForFunction(()=>window.PurePoker);
  for(let move=0;(await page.evaluate(()=>PurePoker.getState().referencePhase))!==phase;move++){
   assert.ok(move<6);const action=await page.evaluate(()=>PurePoker.getState().recommendedAction);await page.locator('#'+action).click();await page.clock.runFor(100);await advance(page);
  }
  await page.locator('#primary').click();await page.clock.runFor(100);await advance(page);
  assert.equal(await page.evaluate(()=>PurePoker.getState().gameplayMode),'varied');const state=await complete(page);balance(state);assert.deepEqual(errors,[]);
  checks.push({alternativeAt:phase,action:phase==='flop-bet'?'Check':'Call the raise',accounting:'pass',result:'pass'});await context.close();
 }
 {
  const {page,context}=await pageFor('full-house',undefined,true);assert.equal(await page.evaluate(()=>Boolean(window.PurePoker)),false);assert.deepEqual(await page.evaluate(()=>__host.calls),[]);
  await page.evaluate(()=>hostFire('ready'));await page.locator('#primary').click();await page.evaluate(()=>{__host.visible=false;hostFire('viewableChange',false);});
  const paused=await page.evaluate(()=>PurePoker.getState().clock);await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>PurePoker.getState().clock),paused);
  await page.evaluate(()=>{__host.visible=true;hostFire('viewableChange',true);});await page.clock.runFor(500);assert.ok(await page.evaluate(()=>PurePoker.getState().referenceEvents.length>0));assert.deepEqual(await page.evaluate(()=>__host.opens),[]);
  checks.push({mraid:'ready, hidden pause, resume, no first-tap redirect',result:'pass'});await context.close();
 }
 await browser.close();fs.writeFileSync('deliverables/reference-gameplay-qa.json',JSON.stringify({date:new Date().toISOString(),checks,footage:'WhatsApp Video 2026-10-25 at 1.15.25 PM.mp4 and IMG_3768.mp4',results},null,2));
 fs.writeFileSync('deliverables/qa-report.json',JSON.stringify({date:new Date().toISOString(),checks,pending:['Actual store URLs','AppLovin host/device validation','Pixel-identical art and motion not claimed']},null,2));console.log(JSON.stringify(checks,null,2));
})().catch(e=>{console.error(e);process.exit(1);});
