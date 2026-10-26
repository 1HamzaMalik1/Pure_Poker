process.env.PLAYWRIGHT_BROWSERS_PATH=require('path').resolve('tools/vendor/playwright');
const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
(async()=>{
const bin=fs.readdirSync('tools/vendor/imageio_ffmpeg/binaries').find(f=>f.endsWith('.exe'));if(!bin)throw Error('Install imageio-ffmpeg into tools/vendor first');const ffmpeg=path.resolve('tools/vendor/imageio_ffmpeg/binaries',bin);
const browser=await chromium.launch({channel:'chrome',headless:true});
for(const scenario of ['straight','full-house']){
 const context=await browser.newContext({viewport:{width:540,height:960},deviceScaleFactor:1,recordVideo:{dir:'test-results/recordings',size:{width:540,height:960}}});
 await context.addInitScript(require('./audio-capture.cjs'));
 const videoStart=Date.now(),page=await context.newPage();await page.goto('http://127.0.0.1:8787/dist/pure-poker-'+scenario+'.html');await page.waitForFunction(()=>window.PurePoker);await page.waitForTimeout(1700);
 for(let i=0;!await page.evaluate(()=>PurePoker.getState().ended);i++){if(i>=18)throw Error('Hand did not finish');const action=await page.evaluate(()=>PurePoker.getState().recommendedAction||'primary');const b=await page.locator('#'+action).boundingBox();await page.mouse.move(b.x+b.width*.52,b.y+b.height*.5,{steps:12});await page.waitForTimeout(350);await page.locator('#'+action).click();await page.waitForFunction(()=>!PurePoker.getState().busy||PurePoker.getState().ended,{},{timeout:20000});if(!await page.evaluate(()=>PurePoker.getState().ended))await page.waitForTimeout(600);}
 await page.waitForFunction(()=>PurePoker.getState().ended);await page.waitForTimeout(3500);
 const audioCapture=await page.evaluate(async()=>{const c=window.__audioCapture;if(!c)throw Error('Reference audio was not initialized');c.recorder.stop();await c.done;return {startedAt:c.startedAt,bytes:c.bytes};});
 const audioFile='test-results/recordings/'+scenario+'-sound.webm';fs.writeFileSync(audioFile,Buffer.from(audioCapture.bytes));
 const audioOffset=Math.max(0,(audioCapture.startedAt-videoStart)/1000);
 const video=page.video();await context.close();const input=await video.path();const output='deliverables/pure-poker-'+scenario+'-preview.mp4';
 const sourceInfo=spawnSync(ffmpeg,['-i',input],{encoding:'utf8'}).stderr;
 const duration=sourceInfo.match(/Duration: (\d+):(\d+):([\d.]+)/);if(!duration)throw Error('Missing recording duration');
 const seconds=Number(duration[1])*3600+Number(duration[2])*60+Number(duration[3]),speed=Math.min(1,56/seconds);
 const args=['-y','-i',input,'-i',audioFile,'-filter_complex','[0:v]setpts='+speed.toFixed(6)+'*PTS,scale=1080:1920:flags=lanczos[v];[1:a]adelay='+Math.round(audioOffset*1000)+':all=1,atempo='+(1/speed).toFixed(6)+',apad[a]','-map','[v]','-map','[a]','-t',String(seconds*speed),'-r','30','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-movflags','+faststart',output];const result=spawnSync(ffmpeg,args,{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);console.log(output+' '+(fs.statSync(output).size/1024/1024).toFixed(2)+' MB');
 fs.writeFileSync('deliverables/'+scenario+'-recording.json',JSON.stringify({sourceSeconds:seconds,playbackSpeed:1/speed,audio:'Captured directly from the playable; original reference effects',audioOffsetSeconds:audioOffset,reason:speed<1?'Walkthrough time-compressed to fit within 60 seconds; HTML uses full turn timing.':'Real-time walkthrough'},null,2));
 const probe=spawnSync(ffmpeg,['-i',output],{encoding:'utf8'});fs.writeFileSync('deliverables/'+scenario+'-video-info.txt',probe.stderr);
}
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
