const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..');const items=JSON.parse(fs.readFileSync(path.join(root,'reference-analysis/figma/context-assets.json'),'utf8'));
fs.mkdirSync(path.join(root,'assets/figma'),{recursive:true});
for(const item of items){if(item.url.includes('550e8400-e29b-41d4-a716-446655440000'))continue;const ext=path.extname(new URL(item.url).pathname);const file=path.join(root,'assets/figma',item.name+ext);if(!fs.existsSync(file)){const result=spawnSync('curl.exe',['-f','-L','--retry','2','-o',file,item.url],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);}console.log(path.basename(file),fs.statSync(file).size);}
