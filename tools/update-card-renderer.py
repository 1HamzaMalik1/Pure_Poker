from pathlib import Path
root = Path(__file__).resolve().parents[1]
p = root/'src/playable.html'
s = p.read_text(encoding='utf8')
start = s.index('c.innerHTML=',s.index('function card('))
end = s.index(';return c;',start)
s = s[:start] + '''c.innerHTML='<img class="card-art" src="'+CARD_ASSETS[value]+'" alt="">' '''.strip() + s[end:]
s = s.replace("['man','socal','girl']", "['socal','girl']")
p.write_text(s,encoding='utf8')
p = root/'src/reference.css'
s = p.read_text(encoding='utf8')
s += '''
/* Original card faces and blue backs from the user-provided Figma exports. */
.card,.card.red,.card.blue,.card.green{background:transparent}
.card-art{display:block;width:100%;height:100%;object-fit:fill}
.backs i{background:url('@@card_back@@') center/100% 100% no-repeat;border:0;box-shadow:none}
.backs i:after{display:none}
'''
p.write_text(s,encoding='utf8')
p = root/'tools/prepare-originals.cjs'
s = p.read_text(encoding='utf8').replace("['avatar_man','IMG_3768-0.jpg',974,750,215,215],",'')
s = s.replace('These three characters','These two characters').replace('three video-matched human crops','two video-matched human crops')
s = s.replace("console.log('Prepared", "// Run tools/prepare-zip-art.py afterwards to restore ZIP card and Takashi exports.\nconsole.log('Prepared")
p.write_text(s,encoding='utf8')
print('Updated original asset rendering.')
