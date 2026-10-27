const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'creative.config.json'),'utf8'));
for(const key of ['iosStoreUrl','androidStoreUrl'])if(config[key]&&!/^https:\/\/(apps\.apple\.com|play\.google\.com)\//.test(config[key]))throw Error('Use a direct App Store / Google Play URL for '+key);
let source=fs.readFileSync(path.join(root,'src/playable.html'),'utf8');
source=source.replace('__RULES_SCRIPT__',fs.readFileSync(path.join(root,'src/poker-rules.js'),'utf8'));
source=source.replace('__OPPONENT_SCRIPT__',fs.readFileSync(path.join(root,'src/opponents.js'),'utf8'));
source=source.replace('__ENGINE_SCRIPT__',fs.readFileSync(path.join(root,'src/poker-engine.js'),'utf8'));
source=source.replace('__MOTION_SCRIPT__',fs.readFileSync(path.join(root,'src/pure-motion.js'),'utf8'));
source=source.replace('__REFERENCE_SCRIPT__',fs.readFileSync(path.join(root,'src/reference-hand.js'),'utf8'));
const cardAssets=Object.fromEntries('23456789TJQKA'.split('').flatMap(rank=>'schd'.split('').map(suit=>[rank+suit,'@@card_'+rank+suit+'@@'])));
source=source.replace('__CARD_ASSETS__',JSON.stringify(cardAssets));
const soundAssets=Object.fromEntries(['fold','chip','gather','card','check','win'].map(name=>[name,'data:audio/mpeg;base64,'+fs.readFileSync(path.join(root,'assets/audio',name+'.mp3')).toString('base64')]));
source=source.replace('__SOUND_ASSETS__',JSON.stringify(soundAssets));
source=source.replace('__AUDIO_SCRIPT__',fs.readFileSync(path.join(root,'src/reference-audio.js'),'utf8'));
source=source.replace('__REFERENCE_CSS__',fs.readFileSync(path.join(root,'src/reference.css'),'utf8'));
source=source.replace(/@@(\w+)@@/g,(_,name)=>{const optimized=path.join(root,'assets/optimized');const ext=['webp','svg'].find(ext=>fs.existsSync(path.join(optimized,name+'.'+ext)));const file=ext?path.join(optimized,name+'.'+ext):path.join(root,'assets',name+'.jpg');return 'data:image/'+(ext==='svg'?'svg+xml':ext||'jpeg')+';base64,'+fs.readFileSync(file).toString('base64');});
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
const files=[];
for(const [file,scenario] of [['index.html',config.scenario||'fullhouse'],['pure-poker-straight.html','straight'],['pure-poker-full-house.html','fullhouse']]){
const html=source.replace('__CONFIG__',JSON.stringify({...config,scenario}).replace(/</g,'\\u003c'));const bytes=Buffer.byteLength(html);if(bytes>5000000)throw Error('AppLovin 5 MB limit exceeded');if(/@@\w+@@|__CONFIG__/.test(html))throw Error('Unresolved build placeholder');fs.writeFileSync(path.join(root,'dist',file),html);files.push({file,bytes,scenario});console.log(file+': '+(bytes/1024).toFixed(1)+' KB');}
const report={builtAt:new Date().toISOString(),files,externalAssets:0,storeLinksConfigured:Boolean(config.iosStoreUrl&&config.androidStoreUrl),specification:'https://support.applovin.com/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines',releaseStatus:config.iosStoreUrl&&config.androidStoreUrl?'Awaiting AppLovin device preview':'Store links required before campaign upload'};
fs.writeFileSync(path.join(root,'dist/build-report.json'),JSON.stringify(report,null,2));
// All entry points open the ad itself, without a website shell or iframe.
const standalone=fs.readFileSync(path.join(root,'dist/index.html'));
for(const entry of ['index.html','preview.html'])fs.writeFileSync(path.join(root,entry),standalone);
