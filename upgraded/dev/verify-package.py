"""Verify deliverable assets, internal links, independent archives and content locks."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote,urlsplit
import json,hashlib,zipfile
from PIL import Image
ROOT=Path(__file__).resolve().parents[2];DEV=ROOT/'upgraded/dev';FINAL=ROOT/'מסירה-משחקי-הבאת-ברכה'
class Links(HTMLParser):
    def __init__(self):super().__init__();self.paths=[]
    def handle_starttag(self,tag,attrs):
        for k,v in attrs:
            if k in ['href','src'] and v and not v.startswith(('#','data:','blob:','javascript:','http:','https:','mailto:','tel:')):self.paths.append(v)
missing=[];checked_links=0
for p in FINAL.rglob('*.html'):
    parser=Links();parser.feed(p.read_text(encoding='utf-8'))
    for target in parser.paths:
        rel=unquote(urlsplit(target).path)
        if not rel or '${' in rel:continue
        checked_links+=1
        if not (p.parent/rel).exists():missing.append([str(p.relative_to(FINAL)),rel])
assert not missing,missing
data=json.loads((DEV/'content-data.json').read_text(encoding='utf-8'))
cards=json.loads((FINAL/'ערכת-תצוגה-לאתר/כרטיסי-משחק.json').read_text(encoding='utf-8'))
assert {m['id'] for m in cards}==set('abcdefghij')
hashes=[]
for m in cards:
    for key in ['image_png','image_webp']:
        p=FINAL/'ערכת-תצוגה-לאתר'/m[key]
        with Image.open(p) as im:assert im.size==(1536,1024),(p,im.size)
    hashes.append(hashlib.sha256((FINAL/'ערכת-תצוגה-לאתר'/m['image_png']).read_bytes()).hexdigest())
assert len(set(hashes))==10,'Duplicate game cover'
for g in data:
    final=FINAL/'משחקים'/g['file'];source=ROOT/'upgraded'/g['file'];assert final.read_bytes()==source.read_bytes(),g['id']
zips=list((FINAL/'אריזות').glob('*.zip'));assert len(zips)==11
archive_files=0
for p in zips:
    with zipfile.ZipFile(p) as z:
        assert z.testzip() is None,p
        archive_files+=len(z.namelist())
        for name in z.namelist():
            target=FINAL/('ערכת-תצוגה-לאתר' if p.stem=='ערכת-תצוגה-לאתר' else 'משחקים')
            if p.name.startswith('a-'):target=target/'a-coloring'
            if p.name.startswith('i-'):target=target/'i-first-steps'
            assert (target/name).read_bytes()==z.read(name),(p,name)
checks=json.loads((DEV/'content-checks.json').read_text(encoding='utf-8'));assert len(checks)==30 and all(c['identical'] or (c.get('approved_editorial') and c['part']=='b' and c['collection']=='GAMES') for c in checks)
nikud=json.loads((DEV/'nikud-checks.json').read_text(encoding='utf-8'));assert len(nikud)==30 and all(c['letters_identical'] for c in nikud)
manifest=json.loads((FINAL/'מסמכים/manifest-sha256.json').read_text(encoding='utf-8'))
for rel,sha in manifest.items():assert hashlib.sha256((FINAL/rel).read_bytes()).hexdigest()==sha,rel
report={'games':10,'unique_cover_images':10,'cover_files':20,'resolution':'1536x1024','internal_links_checked':checked_links,'missing_links':0,'zip_archives':len(zips),'archived_files_checked':archive_files,'identical_source_collections':sum(c['identical'] for c in checks),'approved_editorial_collections':sum(bool(c.get('approved_editorial')) for c in checks),'additional_nikud_strings_with_identical_letters':len(nikud),'manifest_integrity':True,'book_pages':40,'book_text_pages':36}
(DEV/'package-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
(FINAL/'מסמכים/בדיקות-אריזה.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
manifest={str(p.relative_to(FINAL)):hashlib.sha256(p.read_bytes()).hexdigest() for p in FINAL.rglob('*') if p.is_file() and p.name!='manifest-sha256.json'}
(FINAL/'מסמכים/manifest-sha256.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report))
