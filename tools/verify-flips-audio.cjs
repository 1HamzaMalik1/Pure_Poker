const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
const sharp=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:400,height:870}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(require('./audio-capture.cjs'));
 await page.addInitScript(()=>{const handlers={};window.mraid={getState:()=> 'default',isViewable:()=>true,open:()=>{},addEventListener:(n,f)=>(handlers[n]||=[]).push(f)};window.__hostFire=(n,v)=>(handlers[n]||[]).forEach(f=>f(v));});
 await page.clock.install();await page.goto('http://127.0.0.1:8787/dist/pure-poker-full-house.html');await page.waitForFunction(()=>window.PurePoker);
 await page.clock.pauseAt(new Date());
 assert.equal(await page.evaluate(()=>PurePoker.getState().audioContextState),'uninitialized');
 await page.locator('#primary').click();await page.waitForFunction(()=>PurePoker.getState().audioReady);
 assert.equal(await page.evaluate(()=>PurePoker.getState().muted),false);
 await page.evaluate(()=>{const native=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>native(t=>fn(t*10));});
 while(!(await page.evaluate(()=>PurePoker.getState().audioEvents.some(e=>e.type==='fold'))))await page.clock.runFor(30);
 let peak=0;for(let i=0;i<20;i++){const rms=await page.evaluate(()=>{const a=__audioCapture.analyser,x=new Float32Array(a.fftSize);a.getFloatTimeDomainData(x);return Math.sqrt(x.reduce((s,n)=>s+n*n,0)/x.length);});peak=Math.max(peak,rms);await new Promise(r=>setTimeout(r,20));}
 assert.ok(peak>.001,'Decoded reference effect reaches the audio output');
 await page.locator('#sound').click();assert.equal(await page.evaluate(()=>PurePoker.getState().muted),true);
 await page.evaluate(()=>__hostFire('viewableChange',false));await new Promise(r=>setTimeout(r,50));assert.equal(await page.evaluate(()=>PurePoker.getState().audioContextState),'suspended');
 const paused=await page.evaluate(()=>PurePoker.getState().clock);await page.clock.runFor(500);assert.equal(await page.evaluate(()=>PurePoker.getState().clock),paused);
 await page.evaluate(()=>__hostFire('viewableChange',true));await page.locator('#sound').click();await new Promise(r=>setTimeout(r,30));assert.equal(await page.evaluate(()=>PurePoker.getState().audioContextState),'running');
 while((await page.evaluate(()=>PurePoker.getState().stage))<1)await page.clock.runFor(20);
 assert.equal(await page.locator('#board .card-inner').count(),3);assert.equal(await page.locator('#board .card-back-art').count(),3);
 const transforms=[];
 for(const [label,ms] of [['back',0],['turning',220],['face',620]]){
  await page.evaluate(time=>{for(const el of document.querySelectorAll('#board .deal,#board .card-inner'))for(const a of el.getAnimations()){a.pause();a.currentTime=time;}},ms);
  transforms.push(await page.locator('#board .card-inner').first().evaluate(el=>getComputedStyle(el).transform));
  await page.screenshot({path:'deliverables/card-flip-'+label+'.png'});
 }
 assert.equal(Number(transforms[0].match(/matrix3d\(([^,]+)/)[1]),-1,'Starts on the card back');
 assert.ok(transforms[2]==='matrix(1, 0, 0, 1, 0, 0)'||transforms[2]==='matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');
 const columns=await Promise.all(['back','turning','face'].map(async(label,i)=>({input:await sharp('deliverables/card-flip-'+label+'.png').extract({left:60,top:340,width:280,height:110}).png().toBuffer(),left:i*280,top:0})));
 await sharp({create:{width:840,height:110,channels:3,background:'#111'}}).composite(columns).png().toFile('deliverables/card-flip-sequence.png');
 const report={date:new Date().toISOString(),cardFlip:{startsWithBack:true,twoSided:true,endsFaceUp:true,transforms},audio:{source:'Supplied reference recording',decodedEffects:6,measuredOutputRms:peak,muting:'pass',hiddenPauseResume:'pass',startsAfterInteraction:'pass'},settingsRemoved:await page.locator('#menu,#menu-panel').count()===0,uniqueAvatars:await page.locator('.seat .avatar>img').evaluateAll(imgs=>new Set(imgs.map(i=>i.src)).size),errors};
 assert.deepEqual(errors,[]);fs.writeFileSync('deliverables/flips-audio-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
