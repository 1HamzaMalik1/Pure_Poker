const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),config=JSON.parse(fs.readFileSync(path.join(root,'creative.config.json'),'utf8'));
if(config.deliveryPlatform!=='ios'||!config.iosStoreUrl)throw Error('The client iOS App Store destination is required');
const source=path.join(root,'dist/pure-poker-full-house.html'),html=fs.readFileSync(source);
if(html.length>5000000)throw Error('AppLovin size limit exceeded');
const folder=path.join(root,'deliverables/client');fs.mkdirSync(folder,{recursive:true});
const file=path.join(folder,'Pure_Poker_AppLovin_iOS.html');fs.writeFileSync(file,html);
const manifest={file,bytes:html.length,sha256:crypto.createHash('sha256').update(html).digest('hex'),platform:'ios',storeUrl:config.iosStoreUrl,createdAt:new Date().toISOString(),specification:'https://support.applovin.com/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines',validation:'Run verify-applovin-delivery.cjs against this exact file'};
fs.writeFileSync(path.join(root,'deliverables/applovin-delivery-manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest,null,2));
