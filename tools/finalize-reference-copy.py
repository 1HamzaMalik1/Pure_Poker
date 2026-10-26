from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'src/playable.html'
s=p.read_text(encoding='utf8').replace("'Play another hand'","'Play again'")
s=s.replace("reset(folded?current:current==='straight'?'fullhouse':'straight')",'reset(current)')
p.write_text(s,encoding='utf8')
p=root/'tools/verify.cjs';p.write_text("require('./verify-reference.cjs');\n",encoding='utf8')
