from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
root=Path(__file__).resolve().parents[1]
destination=root/'deliverables'/'Pure-Poker-AppLovin-Review.zip'
files=[root/name for name in ['README.md','index.html','preview.html','creative.config.json','package.json','.gitignore']]
for folder in ['src','dist','assets']:
    files.extend(p for p in (root/folder).rglob('*') if p.is_file())
files.extend(root/'tools'/name for name in ['build.cjs','serve.cjs','verify-reference.cjs','verify-flips-audio.cjs','audio-capture.cjs','record.cjs','finalize.cjs','capture-reference-milestones.cjs','make-reference-comparisons.py','package.py'])
review_names=[
    'reference-frame-audit.md','reference-gameplay-qa.json','qa-report.json','fidelity-status.json','flips-audio-qa.json','audio-preview-validation.json','card-flip-sequence.png',
    'pure-poker-full-house-preview.mp4','pure-poker-straight-preview.mp4',
    'full-house-recording.json','straight-recording.json',
    'corrected-reference-live-proof.png','creative-review.png',
    'reference-bet4-comparison.png','reference-raise40-comparison.png',
    'reference-all-in-comparison.png','reference-result-comparison.png',
    'reference-full-house-initial.png','reference-full-house-corrected-end.png',
    'reference-straight-initial.png','reference-straight-corrected-end.png',
    'full-house-endcard-1080x1920.png','straight-endcard-1080x1920.png',
]
files.extend(root/'deliverables'/name for name in review_names)
with ZipFile(destination,'w',ZIP_DEFLATED) as archive:
    for file in files:
        archive.write(file,'Pure-Poker-AppLovin-Review/'+file.relative_to(root).as_posix())
with ZipFile(destination) as archive:
    assert archive.testzip() is None
qa=json.loads((root/'deliverables'/'qa-report.json').read_text())
assert all(c['result']=='pass' for c in qa['checks'])
print(f'Package verified: {destination.stat().st_size:,} bytes, {len(files)} files; {len(qa["checks"])} QA checks passed.')
