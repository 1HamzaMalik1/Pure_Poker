from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
frames=[Image.open(p).convert('RGB').quantize(colors=256) for p in sorted((root/'test-results/win-frames').glob('win-*.png'))]
assert len(frames)>30,'Real-time victory frames missing'
frames[0].save(root/'deliverables/full-house-winning-animation.gif',save_all=True,append_images=frames[1:],duration=83,loop=0,optimize=True)
print(f'Animated victory preview: {len(frames)} frames.')
