"""Repack the delivery ZIPs from the current files in משחקים/ without rebuilding.

Usage (from the repo root): python upgraded/dev/repack.py
Writes אריזות/<id>-<name>.zip for each part, corrected-games.zip and מסמכים/manifest-sha256.json.
Fails if any archive carries live-game.js, the review service or the ?review=1 layer.
"""
import hashlib, json, re, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FINAL = ROOT / 'מסירה-משחקי-הבאת-ברכה'
GAMES, PACKAGES, DOCS = FINAL / 'משחקים', FINAL / 'אריזות', FINAL / 'מסמכים'
data = json.loads((ROOT / 'upgraded/dev/content-data.json').read_text(encoding='utf-8'))
FORBIDDEN = re.compile(rb'live-game\.js|chatgpt\.site|bracha-autodraft|bracha-point-review|review=1')
STAMP = (2026, 10, 4, 0, 0, 0)  # fixed timestamp so unchanged files give identical archives


def write_zip(target, files, base):
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(files):
            if not f.is_file():
                continue
            raw = f.read_bytes()
            if f.suffix in ('.html', '.js', '.json') and FORBIDDEN.search(raw):
                sys.exit(f'שארית סקירה ב-{f.relative_to(ROOT)} — האריזה נעצרה')
            if f.name == 'live-game.js':
                sys.exit(f'live-game.js ב-{f.relative_to(ROOT)} — האריזה נעצרה')
            info = zipfile.ZipInfo(f.relative_to(base).as_posix(), STAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, raw)


for g in data:
    src = GAMES / g['file']
    if g['id'] in ('a', 'i'):
        base, files, name = src.parent, list(src.parent.rglob('*')), f"{g['id']}-{src.parent.name}.zip"
    else:
        base, files, name = GAMES, [src], f"{g['id']}-{src.stem}.zip"
        if g['id'] == 'b':
            files += list((GAMES / 'b-story-pages').glob('*')) + list((GAMES / 'b-story-art').glob('*'))
    write_zip(PACKAGES / name, files, base)
    print('נארז:', name, len([f for f in files if f.is_file()]), 'קבצים')

write_zip(FINAL / 'corrected-games.zip', list(GAMES.rglob('*')), GAMES)
print('נארז: corrected-games.zip')

for z in [*PACKAGES.glob('*.zip'), FINAL / 'corrected-games.zip']:
    with zipfile.ZipFile(z) as zz:
        bad = [n for n in zz.namelist() if n.endswith('live-game.js')]
        if bad:
            sys.exit(f'live-game.js נמצא ב-{z.name}')

manifest = {str(p.relative_to(FINAL)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(FINAL.rglob('*')) if p.is_file() and p.name != 'manifest-sha256.json'}
(DOCS / 'manifest-sha256.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print('manifest-sha256.json:', len(manifest), 'קבצים')
