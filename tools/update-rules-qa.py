from pathlib import Path
p=Path(__file__).resolve().parents[1]/'tools/verify-reference.cjs'
s=p.read_text();a=s.index('function balance(s)');b=s.index('\n(async()=>',a)
s=s[:a]+'''function balance(s){
 const o=origin[s.scenario],initial=s.scenario==='straight'?{0:1,2:.5,5:1,8:5}:{5:.5,7:1,8:3};
 const contributed=Object.values(s.contributions).reduce((a,n)=>a+n,0);assert.ok(Math.abs(contributed-s.pot)<1e-6,'Pot equals all contributions');
 const awards=s.settlement?.awards||{};assert.ok(Math.abs(s.stack-(o.stack-s.invested+(awards[8]||0)))<1e-6,'Hero credit matches evaluated pot awards');
 o.opponents.forEach((n,i)=>assert.ok(Math.abs(s.opponentStacks[i]-(n-(s.contributions[i]||0)+(initial[i]||0)+(awards[i]||0)))<1e-6,'Opponent account balances'));
 assert.ok(s.stack>=0&&s.opponentStacks.every(n=>n>=0));
}
'''+s[b:]
s=s.replace("await page.locator('#fold').click();assert.ok(await page.locator('#end').isVisible());", "await page.locator('#primary').click();await page.clock.runFor(100);await advance(page);await page.locator('#fold').click();assert.ok(await page.locator('#end').isVisible());")
s=s.replace("await page.locator('#secondary').click();await page.clock.runFor(100);await advance(page);\n  assert.equal", "await page.locator('#primary').click();await page.clock.runFor(100);await advance(page);await page.locator(name==='straight'?'#secondary':'#primary').click();await page.clock.runFor(100);await advance(page);\n  assert.equal")
s=s.replace('Alternative opening raise enters varied betting','Alternative legal decision enters varied betting')
p.write_text(s)
