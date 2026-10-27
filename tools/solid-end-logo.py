from pathlib import Path
root=Path(__file__).resolve().parents[1]
for name in ['logo_mark','logo_word']:
    source=(root/'assets/optimized'/f'{name}.svg').read_text()
    (root/'assets/optimized'/f'{name}_solid.svg').write_text(source.replace('fill-opacity="0.25"','fill-opacity="1"'))
p=root/'src/playable.html';s=p.read_text()
s=s.replace('<div class="end-logo"><img src="@@logo_mark@@" alt=""><img src="@@logo_word@@"', '<div class="end-logo"><img src="@@logo_mark_solid@@" alt=""><img src="@@logo_word_solid@@"')
p.write_text(s)
