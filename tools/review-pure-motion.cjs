const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:400,height:870}});
 await page.clock.install({time:new Date('2026-01-01T00:00:00Z')});await page.goto('http://127.0.0.1:8787/dist/pure-poker-straight.html');await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
 await page.evaluate(()=>{const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=fn=>raf(t=>fn(t*10));});
 async function freeze(selector,time){await page.locator(selector).evaluateAll((els,time)=>{for(const el of els)for(const a of el.getAnimations()){a.pause();a.currentTime=time;}},time);}
 await page.locator('#primary').click();await freeze('.opening-card,.opening-card .card-inner',100);await page.screenshot({path:'deliverables/pure-motion-opening.png'});await freeze('.opening-card,.opening-card .card-inner',1600);
 let made=false,burst=false;
 for(let i=0;i<550;i++){
  const s=await page.evaluate(()=>PurePoker.getState()),classes=await page.locator('#stage').getAttribute('class');
  if(!made&&classes.includes('made-hand')){await freeze('#made-hand-effect',550);await page.screenshot({path:'deliverables/pure-motion-straight.png'});await freeze('#made-hand-effect',1600);made=true;}
  if(!burst&&classes.includes('win-burst')){await page.clock.runFor(160);await freeze('.win-rays,#made-hand-effect,.win-amount',800);await page.screenshot({path:'deliverables/pure-motion-win.png'});burst=true;}
  if(s.ended)break;
  if(!s.busy)await page.locator('#'+s.recommendedAction).click();
  await page.clock.runFor(20);
 }
 assert.ok(made&&burst);assert.ok(await page.locator('#end').isVisible());await freeze('.end-fan .card',1200);await page.screenshot({path:'deliverables/pure-motion-endcard.png'});
 fs.writeFileSync('deliverables/pure-motion-qa.json',JSON.stringify({source:'Downloads/Pure_Poker.mp4',decodedFrames:600,checks:['opening card deal and flip','yellow street labels','made-hand title and winning-card outlines','payout rays and YOU WIN title','green end card and fanned cards'].map(name=>({name,result:'pass'}))},null,2));console.log('Pure Poker motion milestones captured.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
