// Visual review and DOM inspection of the shared chip animation.
const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),report=[];
 for(const [name,viewport] of [['straight',{width:400,height:870}],['full-house',{width:400,height:870}],['straight',{width:844,height:390}]]){
  const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8787/dist/pure-poker-'+name+'.html');await page.waitForFunction(()=>window.PurePoker);
  await page.evaluate(()=>{
   window.chipReview=[];
   new MutationObserver(records=>{for(const r of records)for(const node of r.addedNodes)if(node.nodeType===1&&node.matches('.chip[data-transfer="wager"]')){
    chipReview.push({seat:Number(node.dataset.seat),x:parseFloat(node.style.left),y:parseFloat(node.style.top),dx:parseFloat(node.style.getPropertyValue('--to-x')),dy:parseFloat(node.style.getPropertyValue('--to-y'))});
   }}).observe(document.getElementById('effects'),{childList:true});
  });
  await page.locator('#secondary').click();
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('.chip[data-transfer="wager"]')).some(n=>n.dataset.seat!=='8'));
  await page.waitForTimeout(160);
  await page.screenshot({path:'deliverables/'+name+'-opponent-chips-'+viewport.width+'.png'});
  await page.waitForFunction(()=>!PurePoker.getState().busy,{},{timeout:20000});
  const data=await page.evaluate(()=>({state:PurePoker.getState(),chips:chipReview}));
  const payments=data.state.history.filter(a=>a.amount>0&&a.action!=='uncalled return');
  await page.waitForTimeout(1200);
  report.push({scenario:name,viewport,payments:payments.length,animatedSeats:[...new Set(data.chips.map(c=>c.seat))],chipSprites:data.chips.length,potDestinations:data.chips.every(c=>Math.abs(c.x+8.5+c.dx-200)<=5.1),remainingSprites:await page.locator('.chip').count(),errors});await page.close();
 }
 await browser.close();fs.writeFileSync('deliverables/chip-animation-review.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exit(1);});
