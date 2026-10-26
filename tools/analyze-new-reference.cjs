const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const sharp=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
 const bin=fs.readdirSync('tools/vendor/imageio_ffmpeg/binaries').find(f=>f.endsWith('.exe'));
 const ffmpeg=path.resolve('tools/vendor/imageio_ffmpeg/binaries',bin),out=path.resolve(process.env.REFERENCE_OUT||'reference-analysis/whatsapp');fs.mkdirSync(out,{recursive:true});
 const input=process.env.REFERENCE_FILE||'C:/Users/Ayesha Munir/Downloads/WhatsApp Video 2026-10-25 at 1.15.25 PM.mp4';
 const info=spawnSync(ffmpeg,['-i',input],{encoding:'utf8'}).stderr;fs.writeFileSync(path.join(out,'video-info.txt'),info);console.log(info);
 let result=spawnSync(ffmpeg,['-y','-i',input,'-map','0:v:0','-vf','scale=400:-2','-vsync','0','-q:v','3',path.join(out,'frame-%06d.jpg')],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);
 const files=fs.readdirSync(out).filter(f=>/^frame-\d+\.jpg$/.test(f)).sort();
 const duration=info.match(/Duration: (\d+):(\d+):([\d.]+)/),seconds=+duration[1]*3600+ +duration[2]*60+ +duration[3];
 const metadata=await sharp(path.join(out,files[0])).metadata();
 // Every decoded frame is retained. Coarse contact sheet locates hand changes;
 // the subsequent frame-difference pass selects transitions for close review.
 const samples=Array.from({length:Math.ceil(seconds)},(_,i)=>({file:files[Math.min(files.length-1,Math.floor(i*files.length/seconds))],time:i}));
 for(let start=0;start<samples.length;start+=20){
  const batch=samples.slice(start,start+20),layers=[];
  for(let i=0;i<batch.length;i++){
   const b=batch[i],left=i%5*200,top=Math.floor(i/5)*460;
   layers.push({input:await sharp(path.join(out,b.file)).resize(200,436,{fit:'contain',background:'#202020'}).toBuffer(),left,top:top+24});
   layers.push({input:Buffer.from(`<svg width="200" height="24"><text x="5" y="17" fill="white" font-size="16">${b.time.toFixed(1)} s</text></svg>`),left,top});
  }
  await sharp({create:{width:1000,height:Math.ceil(batch.length/5)*460,channels:3,background:'#202020'}}).composite(layers).jpeg({quality:90}).toFile(path.join(out,`contact-${start/20}.jpg`));
 }
 fs.writeFileSync(path.join(out,'metadata.json'),JSON.stringify({seconds,frames:files.length,estimatedFps:files.length/seconds,width:metadata.width,height:metadata.height},null,2));
 console.log('Decoded every frame:',files.length,metadata.width,metadata.height,seconds+' seconds');
})().catch(e=>{console.error(e);process.exit(1);});
