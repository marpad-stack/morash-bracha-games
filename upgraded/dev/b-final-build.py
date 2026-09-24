"""Approved illustration/game review; the story transcript remains unchanged."""
import base64,io,hashlib
from PIL import Image
final_b=json.loads((DEV/'b-final-content.json').read_text(encoding='utf-8'))
m=re.search(r'const PAGES\s*=\s*(\[[\s\S]*?\]);',s)
assert m
pages=json.loads(m[1])
for number in final_b['editedPages']:
    pages[number-1]='data:image/jpeg;base64,'+base64.b64encode((DEV/'assets/b-final'/f'page{number:02}.jpg').read_bytes()).decode()
# Use real, correctly typed image files on the website and in the offline ZIP.
# Preserve source bytes exactly; no new artwork or story changes are involved.
book_assets=OUT/'b-story-pages'
book_assets.mkdir(exist_ok=True)
book_paths=[]
for number,source in enumerate(pages,1):
    payload=base64.b64decode(source.split(',',1)[1])
    with Image.open(io.BytesIO(payload)) as picture:
        assert picture.width>=640 and picture.height>=640,number
        extension={'JPEG':'jpg','WEBP':'webp','PNG':'png'}[picture.format]
    revision='-'+hashlib.sha256(payload).hexdigest()[:12] if number in final_b.get('versionedPages',[]) else ''
    filename=f'{number:02}{revision}.{extension}'
    (book_assets/filename).write_bytes(payload)
    book_paths.append('b-story-pages/'+filename)
# Prune only generated book images superseded by an approved edit.
for previous in book_assets.iterdir():
    if previous.is_file() and re.fullmatch(r'\d{2}(?:-[a-f0-9]{12})?\.(webp|jpg|png)',previous.name) and 'b-story-pages/'+previous.name not in book_paths:
        previous.unlink()
s=s[:m.start(1)]+json.dumps(book_paths)+s[m.end(1):]
for gid,changes in final_b['activities'].items():
    pattern=r"(\{id:'"+gid+r"',icon:'[^']+',t:)(?:\"[^\"]*\"|'[^']*')(,how:)(?:\"[^\"]*\"|'[^']*')"
    title=editorial['b']['activities'].get(gid,{}).get('t')
    if not title:
        title={'memory':'נראה מי זוכר?','dress':'מתלבשים נכון!','table':'עורכים שולחן שבת!','quiet':'שומרים על השקט!','needs':'מה נביא לתינוק?'}[gid]
    s,n=re.subn(pattern,lambda m:m[1]+json.dumps(title,ensure_ascii=False)+m[2]+json.dumps(changes['how'],ensure_ascii=False),s)
    assert n==1,gid
# Closing before the first animation frame must not initialize a detached canvas.
s=replace(s,'  const r=cv.getBoundingClientRect();cv.width=', '  if(!cv.isConnected)return;const r=cv.getBoundingClientRect();cv.width=')
addon=addon.replace("if(id==='face'||id==='needs')", "if(id==='face')")
addon+='\nconst B_REVIEW='+json.dumps(final_b,ensure_ascii=False)+';\n'+(DEV/'b-final.js').read_text(encoding='utf-8')+'\n'+(DEV/'b-print.js').read_text(encoding='utf-8')
