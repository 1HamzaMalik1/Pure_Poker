const fs=require('fs');let s=fs.readFileSync('src/playable.html','utf8');
s=s.replace("foldedAtStart=current==='straight'?[1,3,6,7]:[0]","foldedAtStart=current==='straight'?[1,3,7]:[0]");
s=s.replace('function sync(){ui.pot.textContent=',`function sync(){const initialBets=current==='straight'?[['bet0','1'],['bet1','0.5'],['bet2','1'],['hero-bet','5']]:[['bet2','0.5'],['hero-bet','3']];document.getElementById('bets').innerHTML=stage===0?initialBets.map(([cls,amount])=>'<div class="table-bet '+cls+'"><img src="'+CHIP+'" alt="">'+amount+'</div>').join(''):'';ui.pot.textContent=`);
s=s.replace('>$0.50/$1<','>$0.5/$1<');fs.writeFileSync('src/playable.html',s);
