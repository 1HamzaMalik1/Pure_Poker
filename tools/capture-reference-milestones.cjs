const {chromium}=require('C:/Users/Ayesha Munir/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:400,height:870}});
 await page.goto('http://127.0.0.1:8787/dist/pure-poker-full-house.html');await page.waitForFunction(()=>window.PurePoker);
 await page.screenshot({path:'deliverables/reference-full-house-initial.png'});
 await page.locator('#primary').click();await page.waitForFunction(()=>!PurePoker.getState().busy,{},{timeout:20000});
 await page.screenshot({path:'deliverables/reference-fullhouse-flop-bet.png'});
 await page.locator('#secondary').click();await page.waitForFunction(()=>PurePoker.getState().pot===14);await page.waitForTimeout(250);
 await page.screenshot({path:'deliverables/reference-fullhouse-flop-bet-wager.png'});
 await page.waitForFunction(()=>!PurePoker.getState().busy,{},{timeout:15000});
 await page.locator('#secondary').click();await page.waitForFunction(()=>!PurePoker.getState().busy,{},{timeout:12000});
 await page.screenshot({path:'deliverables/reference-fullhouse-turn-all-in.png'});
 await page.locator('#secondary').click();await page.waitForFunction(()=>PurePoker.getState().pot===209);await page.waitForTimeout(250);
 await page.screenshot({path:'deliverables/reference-fullhouse-turn-all-in-wager.png'});
 await page.waitForFunction(()=>PurePoker.getState().ended,{},{timeout:15000});
 await page.screenshot({path:'deliverables/reference-full-house-corrected-end.png'});
 await browser.close();console.log('Captured real-time reference milestones without accelerated clocks.');
})().catch(e=>{console.error(e);process.exit(1);});
