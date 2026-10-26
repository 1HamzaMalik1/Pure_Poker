const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
 const bin=fs.readdirSync('tools/vendor/imageio_ffmpeg/binaries').find(f=>f.endsWith('.exe'));const ffmpeg=path.resolve('tools/vendor/imageio_ffmpeg/binaries',bin);
 const audioChecks=[];
 for(const name of ['straight','full-house']){
  const input=`deliverables/pure-poker-${name}-preview.mp4`;const info=spawnSync(ffmpeg,['-i',input],{encoding:'utf8'}).stderr;const duration=info.match(/Duration: ([\d:.]+)/)?.[1];if(!info.includes('1080x1920')||!info.includes('30 fps')||!info.includes('h264'))throw Error('Invalid video format');console.log(name,duration,'1080x1920 H.264 30 fps');
  const parts=duration.split(':').map(Number),seconds=parts[0]*3600+parts[1]*60+parts[2];if(seconds>60)throw Error('Preview exceeds 60 seconds');
  if(!info.includes('Audio: aac'))throw Error('Preview is missing captured game sound');
  const levels=spawnSync(ffmpeg,['-i',input,'-vn','-af','volumedetect','-f','null','-'],{encoding:'utf8'}).stderr;
  const peak=Number(levels.match(/max_volume: ([-\d.]+) dB/)?.[1]);if(!Number.isFinite(peak)||peak<-40)throw Error('Preview audio is silent');
  audioChecks.push({scenario:name,codec:'AAC',maxVolumeDb:peak,result:'pass'});
  for(const [label,time] of [['video-check',9],['late-hand',seconds*.7],['endcard-1080x1920',-1]]){const output=`deliverables/${name}-${label}.png`;const r=spawnSync(ffmpeg,['-y',time<0?'-sseof':'-ss',String(time),'-i',input,'-frames:v','1',output],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);}
 }
 fs.writeFileSync('deliverables/audio-preview-validation.json',JSON.stringify({checks:audioChecks},null,2));
 const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto('http://127.0.0.1:8787');await page.waitForTimeout(900);await page.screenshot({path:'deliverables/creative-review.png'});
 await browser.close();
 const layers=await Promise.all(['straight','full-house'].map(async(name,i)=>({input:await sharp(`deliverables/${name}-video-check.png`).resize(270,480).toBuffer(),left:i*270,top:0})));await sharp({create:{width:540,height:480,channels:3,background:'#111'}}).composite(layers).png().toFile('deliverables/video-quality-check.png');
})().catch(e=>{console.error(e);process.exit(1)});
