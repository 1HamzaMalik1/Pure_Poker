// Capture the real rendered ad using Playwright's bundled recorder/VP8 tools.
process.env.PLAYWRIGHT_BROWSERS_PATH=require('path').resolve('tools/vendor/playwright');
const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:400,height:870},recordVideo:{dir:'test-results/win-recordings',size:{width:400,height:870}}});
 const start=Date.now(),page=await context.newPage();
 await page.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{const stage=document.getElementById('stage');new MutationObserver(()=>{if(!window.__winAt&&stage.classList.contains('victory'))window.__winAt=performance.timeOrigin+performance.now();}).observe(stage,{attributes:true,attributeFilter:['class']});}));
 await page.goto('http://127.0.0.1:8787/dist/pure-poker-full-house.html');await page.waitForFunction(()=>window.PurePoker);
 for(let i=0;i<6&&!await page.evaluate(()=>PurePoker.getState().ended);i++){
  const action=await page.evaluate(()=>PurePoker.getState().recommendedAction);await page.locator('#'+action).click();
  await page.waitForFunction(()=>!PurePoker.getState().busy||PurePoker.getState().ended,{},{timeout:22000});
 }
 await page.waitForFunction(()=>PurePoker.getState().ended);await page.waitForTimeout(1000);
 const winAt=await page.evaluate(()=>window.__winAt),video=page.video();await context.close();await browser.close();
 const input=await video.path(),ffmpeg=path.resolve('tools/vendor/playwright/ffmpeg-1011/ffmpeg-win64.exe'),at=Math.max(0,(winAt-start)/1000-.7);
 fs.mkdirSync('test-results/win-frames',{recursive:true});
 const output='deliverables/full-house-winning-animation.webm';
 let r=spawnSync(ffmpeg,['-y','-ss',String(at),'-i',input,'-t','4.2','-c:v','libvpx','-b:v','900k','-an',output],{encoding:'utf8'});if(r.status)throw Error(r.stderr);
 r=spawnSync(ffmpeg,['-y','-ss',String(at),'-i',input,'-t','4.2','-vf','scale=320:696','-r','12','-c:v','png','test-results/win-frames/win-%03d.png'],{encoding:'utf8'});if(r.status)throw Error(r.stderr);
 fs.writeFileSync('deliverables/winning-preview-capture.json',JSON.stringify({source:'Actual real-time browser rendering',scenario:'full-house',winAtSeconds:(winAt-start)/1000,previewDuration:4.2,audio:'Animated visual preview; sound remains enabled after Play in the HTML ad',output},null,2));
 console.log('Real-time victory captured without external encoder permissions.');
})().catch(e=>{console.error(e);process.exit(1)});
