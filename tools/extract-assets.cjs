const fs=require('fs');
const sharp=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
fs.mkdirSync('assets',{recursive:true});
const source='reference-analysis/IMG_3768-0.jpg';
const regions=[['ice',.22,.181],['skull',.78,.181],['dragon',.12,.322],['man',.875,.322],['shark',.11,.53],['ape',.88,.53],['deer',.18,.665],['fish',.81,.665],['hero',.5,.744]];
for(const [name,x,y] of regions){const size=180;await sharp(source).extract({left:Math.round(x*1206-size/2),top:Math.round(y*2622-size/2),width:size,height:size}).resize(120,120).jpeg({quality:82}).toFile(`assets/${name}.jpg`);}
console.log('Extracted nine reference portraits.');
})();
