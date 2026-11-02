const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{pathToFileURL}=require('url');
const file=path.resolve('deliverables/client/Pure_Poker_AppLovin_iOS.html'),html=fs.readFileSync(file,'utf8'),store='https://apps.apple.com/us/app/pure-poker-mahjong/id6741335064',checks=[];
const url=pathToFileURL(file).href;
function pass(name,details){checks.push({name,result:'pass',...(details?{details}: {})});}
(async()=>{
 assert.ok(Buffer.byteLength(html)<=5000000);assert.ok(!/<(?:script|link)\b[^>]*(?:src|href)\s*=/i.test(html));assert.ok(!/<iframe\b/i.test(html));assert.ok(!/@@\w+@@|__[A-Z]+_SCRIPT__|__CONFIG__/.test(html));
 pass('Single HTML below 5 MB, inline styles/scripts/assets, no iframe',{bytes:Buffer.byteLength(html)});
 const browser=await chromium.launch({channel:'chrome',headless:true});
 async function open(viewport={width:390,height:844},options={}){
  const context=await browser.newContext({viewport,offline:true,...options}),page=await context.newPage(),errors=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/i.test(r.url()))external.push(r.url());});
  await page.addInitScript(()=>{
   const listeners={};window.__host={state:'loading',viewable:false,opens:[],calls:[],preReadyDom:[]};
   window.mraid={getState:()=>{__host.calls.push('getState');return __host.state;},isViewable:()=>{if(__host.state==='loading')throw Error('isViewable before ready');__host.calls.push('isViewable');return __host.viewable;},addEventListener:(k,f)=>(listeners[k]||=[]).push(f),open:u=>__host.opens.push(u)};
   window.hostFire=(k,v)=>{if(k==='ready')__host.state='default';if(k==='stateChange')__host.state=v;if(k==='viewableChange')__host.viewable=v;(listeners[k]||[]).forEach(f=>f(v));};
   for(const method of ['getElementById','querySelector','querySelectorAll']){const original=document[method].bind(document);document[method]=(...args)=>{if(__host.state==='loading')__host.preReadyDom.push(method);return original(...args);};}
  });
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.goto(url);await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  return {context,page,errors,external};
 }
 async function ready(page){await page.evaluate(()=>hostFire('ready'));await page.evaluate(()=>hostFire('viewableChange',true));}
 async function advance(page){for(let i=0;(await page.evaluate(()=>PurePoker.getState().busy&&!PurePoker.getState().ended));i++){assert.ok(i<80,'Hand phase must terminate');await page.clock.runFor(250);}}
 {
  const {context,page,errors,external}=await open();
  assert.equal(await page.evaluate(()=>Boolean(window.PurePoker)),false);assert.deepEqual(await page.evaluate(()=>__host.preReadyDom),[]);assert.deepEqual(await page.evaluate(()=>__host.calls),['getState']);
  pass('No JavaScript DOM/layout or unsafe MRAID calls before ready');
  await page.evaluate(()=>hostFire('ready'));assert.equal(await page.evaluate(()=>PurePoker.getState().visible),false);
  await page.locator('#primary').click();assert.equal(await page.evaluate(()=>PurePoker.getState().started),false);assert.equal(await page.evaluate(()=>PurePoker.getState().audioContextState),'uninitialized');
  await page.evaluate(()=>hostFire('viewableChange',true));await page.clock.runFor(500);assert.equal(await page.evaluate(()=>PurePoker.getState().clock),0);assert.equal(await page.evaluate(()=>PurePoker.getState().muted),true);
  pass('No gameplay/audio before visible and first interaction');
  await page.locator('#primary').click();assert.deepEqual(await page.evaluate(()=>__host.opens),[]);await page.waitForFunction(()=>PurePoker.getState().audioReady);
  await page.evaluate(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>fn(t*10));});await page.clock.runFor(500);
  await page.evaluate(()=>hostFire('viewableChange',false));const stopped=await page.evaluate(()=>PurePoker.getState().clock);await page.clock.runFor(1000);assert.equal(await page.evaluate(()=>PurePoker.getState().clock),stopped);
  await page.waitForFunction(()=>PurePoker.getState().audioContextState==='suspended');
  await page.evaluate(()=>hostFire('stateChange','hidden'));await page.evaluate(()=>hostFire('viewableChange',true));assert.equal(await page.evaluate(()=>PurePoker.getState().visible),false);assert.equal(await page.evaluate(()=>PurePoker.getState().audioContextState),'suspended');
  await page.evaluate(()=>hostFire('stateChange','default'));await page.waitForFunction(()=>PurePoker.getState().audioContextState==='running');
  pass('Hidden/closed ad pauses game and sound; late viewable event cannot reopen audio');
  for(let i=0;!(await page.evaluate(()=>PurePoker.getState().ended));i++){
   assert.ok(i<15);await advance(page);const s=await page.evaluate(()=>PurePoker.getState());if(s.ended)break;await page.locator('#'+s.recommendedAction).click();await page.clock.runFor(100);
  }
  assert.equal(await page.evaluate(()=>PurePoker.getState().stack),390.5);assert.deepEqual(await page.evaluate(()=>__host.opens),[]);
  assert.equal(await page.locator('#install').isVisible(),true);assert.equal(await page.locator('#replay').count(),0);await page.screenshot({path:'deliverables/applovin-client-endcard.png',animations:'disabled'});
  await page.locator('#install').click();assert.deepEqual(await page.evaluate(()=>__host.opens),[store]);
  pass('Complete hand with exact payout and one deliberate mraid.open to client App Store URL');
  await page.evaluate(()=>hostFire('stateChange','hidden'));await page.locator('#install').click();assert.equal(await page.evaluate(()=>__host.opens.length),1);
  pass('Install cannot fire while closed');assert.deepEqual(external,[]);assert.deepEqual(errors,[]);pass('Offline run: zero HTTP requests and zero JavaScript errors');await context.close();
 }
 for(const viewport of [{width:320,height:480},{width:390,height:844},{width:768,height:1024},{width:844,height:390},{width:1024,height:768}]){
  const {context,page,errors,external}=await open(viewport);await ready(page);const start=Date.now();
  for(const id of ['fold','primary','secondary','sound']){const b=await page.locator('#'+id).boundingBox();assert.ok(b.x>=-1&&b.y>=-1&&b.x+b.width<=viewport.width+1&&b.y+b.height<=viewport.height+1);}
  const imgs=await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0));assert.ok(imgs);
  await page.locator('#primary').click();await page.evaluate(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>fn(t*10));});await advance(page);await page.locator('#fold').click();
  for(const id of ['install']){const b=await page.locator('#'+id).boundingBox();assert.ok(b.x>=-1&&b.y>=-1&&b.x+b.width<=viewport.width+1&&b.y+b.height<=viewport.height+1);}
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);pass('Controls and end-card CTA fit '+viewport.width+'x'+viewport.height,{imagesDecoded:true,elapsedMs:Date.now()-start});await context.close();
 }
 {
  const {context,page}=await open({width:390,height:844},{userAgent:'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15',hasTouch:true});await ready(page);await page.locator('#primary').click();await page.evaluate(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>fn(t*10));});await advance(page);await page.locator('#fold').click();await page.locator('#install').click();assert.deepEqual(await page.evaluate(()=>__host.opens),[store]);pass('iPad desktop-style user agent opens the configured Apple App Store');await context.close();
 }
 {
  const context=await browser.newContext({offline:true}),page=await context.newPage();await page.goto(url);await page.waitForFunction(()=>window.PurePoker);assert.equal(await page.locator('#primary').isEnabled(),true);assert.equal(await page.evaluate(()=>PurePoker.getState().started),false);pass('Standalone file opens without a server or network');await context.close();
 }
 const androidUa='Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
 {
  const {context,page}=await open({width:412,height:915},{userAgent:androidUa,isMobile:true,hasTouch:true});await ready(page);await page.locator('#primary').click();await page.evaluate(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>fn(t*10));});await advance(page);await page.locator('#fold').click();assert.equal(await page.locator('#end button').count(),1);await page.locator('#install').click();assert.deepEqual(await page.evaluate(()=>__host.opens),[store]);pass('Android MRAID host uses the same supplied App Store URL and has one CTA');await context.close();
 }
 {
  const context=await browser.newContext({offline:true,userAgent:androidUa,isMobile:true,hasTouch:true,viewport:{width:412,height:915}}),page=await context.newPage(),destinations=[];
  await context.route('https://apps.apple.com/**',route=>{destinations.push(route.request().url());return route.fulfill({status:200,contentType:'text/html',body:'<title>App Store destination intercepted for local QA</title>'});});
  await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.goto(url);await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));assert.deepEqual(destinations,[]);
  await page.locator('#primary').click();assert.deepEqual(destinations,[]);await page.evaluate(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>fn(t*10));});await advance(page);await page.locator('#fold').click();assert.equal(await page.locator('#replay').count(),0);
  await page.screenshot({path:'deliverables/android-client-endcard.png',animations:'disabled'});await page.locator('#install').click();await page.waitForURL(store);assert.deepEqual(destinations,[store]);pass('Android standalone browser navigates to the App Store only after PLAY NOW');await context.close();
 }
 await browser.close();
 const report={validatedAt:new Date().toISOString(),file,bytes:Buffer.byteLength(html),sha256:crypto.createHash('sha256').update(html).digest('hex'),platform:'ios',storeUrl:store,specification:'https://support.applovin.com/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines',checks,actualAppLovinDevicePreview:'Not performed; local SDK simulations are not AppLovin approval'};
 fs.writeFileSync('deliverables/applovin-delivery-validation.json',JSON.stringify(report,null,2));console.log(checks.length+' delivery checks passed; '+report.bytes+' bytes.');
})().catch(e=>{console.error(e);process.exit(1)});
