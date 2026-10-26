const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
const initial={straight:{pot:7.5,stack:483.25,opponents:[265.5,208,316.52,304.5,665.97,221,261,42]},fullhouse:{pot:4.5,stack:141,opponents:[50,61,96,101.5,142,384.5,108,176]}};
function accounting(s){
 const f=initial[s.scenario],paid=f.opponents.reduce((sum,n,i)=>sum+n-s.opponentStacks[i],0);
 assert.ok(s.stack>=0&&s.opponentStacks.every(n=>n>=0),'No negative stacks');
 assert.ok(Math.abs(s.pot-f.pot-s.invested-paid)<1e-6,'Pot equals contributions');
 assert.ok(Math.abs(s.stack-(f.stack-s.invested+(s.settled?s.pot:0)))<1e-6,'Hero balance includes uncalled returns');
 const folded=new Set();for(const a of s.history){if(a.action==='fold')folded.add(a.seat);else if(a.amount>0)assert.ok(!folded.has(a.seat),'Folded players cannot pay');}
}
function tableTurns(s){
 const expected=s.scenario==='straight'?[6,4,2,0,5]:[6,4,2,1,3,5,7];
 const first=s.turns.filter(t=>t.street===0&&t.seat!==8).slice(0,expected.length).map(t=>t.seat);
 assert.deepEqual(first,expected,'Every initially live opponent takes an opening turn in clockwise order');
 for(let i=0;i<s.turns.length;i++){
  const t=s.turns[i];if(t.seat===8)continue;
  const next=s.turns[i+1];
  const action=s.history.find(a=>a.street===t.street&&a.seat===t.seat&&a.at>=t.at&&(!next||a.at<next.at));
  assert.ok(action,'Each opponent turn produces its own decision before the next seat');
  assert.ok(action.at-t.at>=449,'Thinking delay is visible before the decision');
 }
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),checks=[],branches=[];
 async function create(scenario='straight',seed=92818,viewport={width:400,height:800},host=false){
  const context=await browser.newContext({viewport});
  await context.addInitScript(seed=>{let v=seed>>>0;Math.random=()=>{v^=v<<13;v^=v>>>17;v^=v<<5;return(v>>>0)/4294967296;};},seed);
  // Advance the capped gameplay clock by 100 ms per virtual frame. This
  // exercises every callback while keeping repeated branch tests practical.
  await context.addInitScript(()=>{let tick=100;const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(()=>fn(tick+=100));});
  if(host)await context.addInitScript(()=>{const listeners={};window.__mraid={state:'loading',visible:true,opens:[],calls:[]};window.mraid={getState:()=>__mraid.state,addEventListener:(k,fn)=>(listeners[k]||(listeners[k]=[])).push(fn),isViewable:()=>{__mraid.calls.push('isViewable');return __mraid.visible;},open:url=>__mraid.opens.push(url)};window.__fire=(k,v)=>{if(k==='ready')__mraid.state='default';(listeners[k]||[]).forEach(f=>f(v));};});
  const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('data:'))requests.push(r.url());});
  await page.clock.install();await page.goto('http://127.0.0.1:8787/dist/pure-poker-'+scenario+'.html');
  await page.evaluate(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>fn(t*10));});
  return {page,context,errors,requests};
 }
 async function play(page,secondary=false){
  let moves=0;
  while(!(await page.evaluate(()=>PurePoker.getState().ended))){
   const s=await page.evaluate(()=>PurePoker.getState());accounting(s);
   if(s.facing>0){assert.match(await page.locator('#primary').innerText(),/Call/);assert.doesNotMatch(await page.locator('.buttons').innerText(),/Check/);}
   const id=secondary&&await page.locator('#secondary').isEnabled()?'secondary':'primary';
   const taps=await page.evaluate(id=>{document.getElementById(id).click();const before=PurePoker.getState().history.length;document.getElementById('primary').dispatchEvent(new MouseEvent('click',{bubbles:true}));return [before,PurePoker.getState().history.length];},id);
   assert.equal(taps[1],taps[0],'Synchronous duplicate taps cannot place a second wager');
   await page.clock.runFor(1500);
   for(let wait=0;await page.evaluate(()=>PurePoker.getState().busy&&!PurePoker.getState().ended);wait++){assert.ok(wait<8,'Opponent response must finish');await page.clock.runFor(1000);}
   accounting(await page.evaluate(()=>PurePoker.getState()));assert.ok(++moves<18,'Bounded hand length');
  }
  return page.evaluate(()=>PurePoker.getState());
 }
 for(const scenario of ['straight','full-house']){
  const {page,context,errors,requests}=await create(scenario);await page.waitForFunction(()=>window.PurePoker);await page.clock.runFor(400);
  assert.equal(await page.evaluate(()=>PurePoker.getState().clock),0);assert.equal(await page.locator('#hole .card-art').count(),2);await page.screenshot({path:'deliverables/'+scenario+'-portrait.png'});
  const state=await play(page);tableTurns(state);assert.ok(state.settled&&state.netResult>0);await page.screenshot({path:'deliverables/'+scenario+'-endcard.png'});
  await page.locator('#install').click();assert.ok(await page.locator('#toast').isVisible());await page.locator('#replay').click();await page.locator('#fold').click();assert.match(await page.locator('#end-result').innerText(),/FOLDED/);
  assert.deepEqual(errors,[]);assert.equal(requests.length,1,'No external requests');checks.push({scenario,pot:state.pot,netChips:state.netResult,result:'pass'});await context.close();
 }
 for(const viewport of [{width:320,height:480},{width:390,height:844},{width:844,height:390},{width:1024,height:768}]){
  const {page,context}=await create('straight',92818,viewport);await page.waitForFunction(()=>window.PurePoker);
  for(const id of ['primary','secondary','fold','sound']){const b=await page.locator('#'+id).boundingBox();assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=viewport.width+1&&b.y+b.height<=viewport.height+1);}
  await page.locator('#primary').click();await page.clock.runFor(3000);if(viewport.width===844)await page.screenshot({path:'deliverables/landscape.png'});checks.push({viewport,result:'pass'});await context.close();
 }
 {
  const {page,context,errors}=await create('straight',92818,undefined,true);assert.equal(await page.evaluate(()=>Boolean(window.PurePoker)),false);assert.deepEqual(await page.evaluate(()=>__mraid.calls),[]);
  await page.evaluate(()=>__fire('ready'));await page.locator('#primary').click();await page.evaluate(()=>{__mraid.visible=false;__fire('viewableChange',false);});
  const before=await page.evaluate(()=>PurePoker.getState());await page.clock.runFor(2000);const after=await page.evaluate(()=>PurePoker.getState());assert.equal(after.clock,before.clock);assert.deepEqual(after.history,before.history);assert.deepEqual(await page.evaluate(()=>__mraid.opens),[]);
  await page.evaluate(()=>{__mraid.visible=true;__fire('viewableChange',true);});await page.clock.runFor(3000);assert.equal(await page.evaluate(()=>PurePoker.getState().busy),false);assert.deepEqual(errors,[]);checks.push({mraid:'ready gate, first-tap protection, pause/resume',result:'pass'});await context.close();
 }
 for(const platform of ['ios','android']){
  const {page,context}=await create('straight',92818,undefined,true);
  await context.route('**/dist/pure-poker-straight.html',async route=>{const body=fs.readFileSync('dist/pure-poker-straight.html','utf8').replace('"iosStoreUrl":""','"iosStoreUrl":"https://apps.apple.com/app/id123456789"').replace('"androidStoreUrl":""','"androidStoreUrl":"https://play.google.com/store/apps/details?id=com.example.qa"');await route.fulfill({contentType:'text/html',body});});
  await page.addInitScript(p=>Object.defineProperty(navigator,'userAgent',{get:()=>p==='ios'?'iPhone':'Android'}),platform);await page.reload();await page.evaluate(()=>__fire('ready'));await play(page,true);await page.locator('#install').click();const opens=await page.evaluate(()=>__mraid.opens);assert.equal(opens.length,1);assert.match(opens[0],platform==='ios'?/apps\.apple\.com/:/play\.google\.com/);checks.push({platform,cta:'QA-only fixture store URL routing',result:'pass'});await context.close();
 }
 // Seeds are injected only in test browser contexts; production uses Math.random.
 for(const scenario of ['straight','full-house'])for(const secondary of [false,true]){
  const signatures=new Set();
  for(let run=0;run<8;run++){
   const seed=Math.imul(run+1,0x9e3779b1)>>>0,{page,context,errors}=await create(scenario,seed);await page.waitForFunction(()=>window.PurePoker);
   const state=await play(page,secondary);tableTurns(state);signatures.add(JSON.stringify(state.history.filter(a=>a.seat!==8).map(({street,seat,action,amount})=>({street,seat,action,amount}))));assert.deepEqual(errors,[]);
   await page.locator('#menu').click();await page.locator('#menu-replay').click();assert.notEqual(await page.evaluate(()=>PurePoker.getState().profile),state.profile,'Restart changes temperament');accounting(await page.evaluate(()=>PurePoker.getState()));
   branches.push({scenario,secondary,seed,...state,result:'pass'});await context.close();
  }
  assert.ok(signatures.size>=3,'Repeated choices generate varied opponent reactions');checks.push({scenario,choices:secondary?'secondary':'primary',runs:8,distinctReactions:signatures.size,result:'pass'});console.log(scenario,secondary?'secondary':'primary',signatures.size,'distinct reaction sequences');
 }
 await browser.close();fs.writeFileSync('deliverables/qa-report.json',JSON.stringify({date:new Date().toISOString(),checks,pending:['Actual store URLs','AppLovin host/device validation']},null,2));fs.writeFileSync('deliverables/branch-qa.json',JSON.stringify(branches,null,2));console.log(JSON.stringify(checks,null,2));
})().catch(e=>{console.error(e);process.exit(1);});
