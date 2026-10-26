const { chromium } = require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const http = require('http');
const path = require('path');
const sharp = require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
 fs.mkdirSync('reference-analysis',{recursive:true});
 const server=http.createServer((req,res)=>{let p='C:/Users/Ayesha Munir/Downloads/'+req.url.slice(1);let stat=fs.statSync(p);let range=req.headers.range;if(range){let [a,b]=range.replace(/bytes=/,'').split('-');a=+a;b=b?+b:stat.size-1;res.writeHead(206,{'Content-Type':'video/mp4','Content-Range':`bytes ${a}-${b}/${stat.size}`,'Accept-Ranges':'bytes','Content-Length':b-a+1});fs.createReadStream(p,{start:a,end:b}).pipe(res);}else{res.writeHead(200,{'Content-Type':'video/mp4','Content-Length':stat.size});fs.createReadStream(p).pipe(res);}}).listen(8788,'127.0.0.1');
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage();
 for(const name of ['IMG_3768','IMG_3770']){
  await page.goto('http://127.0.0.1:8788/'+name+'.mp4');
  const meta=await page.evaluate(async()=>{const v=document.querySelector('video');await new Promise(r=>{if(v.readyState>=2)r();else v.onloadeddata=r;});return {duration:v.duration,width:v.videoWidth,height:v.videoHeight};});
  console.log(name,meta);const frames=[];
  for(let i=0;i<12;i++){const time=i*meta.duration/12;const data=await page.evaluate(async(t)=>{const v=document.querySelector('video');v.currentTime=t;await new Promise(r=>v.onseeked=r);const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);return c.toDataURL('image/jpeg',.85).split(',')[1];},time);const b=Buffer.from(data,'base64');fs.writeFileSync(`reference-analysis/${name}-${i}.jpg`,b);frames.push({input:await sharp(b).resize(225,400,{fit:'contain',background:'#202020'}).jpeg().toBuffer(),left:(i%4)*225,top:Math.floor(i/4)*400});}
  await sharp({create:{width:900,height:1200,channels:3,background:'#202020'}}).composite(frames).jpeg({quality:90}).toFile(`reference-analysis/${name}-contact.jpg`);
  fs.writeFileSync(`reference-analysis/${name}.json`,JSON.stringify(meta,null,2));
 }
 await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
