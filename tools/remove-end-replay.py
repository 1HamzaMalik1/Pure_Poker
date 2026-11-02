from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src/playable.html';s=p.read_text()
s=s.replace('<button class="replay" id="replay">Play another hand</button>','')
s=s.replace("ui.replay.textContent=isFold?'Try this hand again':'Play again';",'')
s=s.replace("replay:document.getElementById('replay'),",'')
s=s.replace('ui.replay.onclick=()=>{handNumber++;reset(current);};','')
p.write_text(s)
p=root/'tools/verify-reference.cjs';s=p.read_text()
a=s.index("  await page.locator('#replay').click();");b=s.index('\n }',a)
s=s[:a]+"  assert.equal(await page.locator('#replay').count(),0,'No replay control on the client end card');await context.close();"+s[b:]
p.write_text(s)
p=root/'tools/verify-applovin-delivery.cjs';s=p.read_text().replace("['install','replay']","['install']")
s=s.replace("assert.equal(await page.locator('#install').isVisible(),true);", "assert.equal(await page.locator('#install').isVisible(),true);assert.equal(await page.locator('#replay').count(),0);")
p.write_text(s)
