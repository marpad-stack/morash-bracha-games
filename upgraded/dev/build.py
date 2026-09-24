from pathlib import Path
import zipfile,re,json,hashlib

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'upgraded'
DEV=OUT/'dev'
import runpy
runpy.run_path(str(DEV/'build-story-manuscript.py'))['compile_manuscript'](DEV)
editorial=json.loads((DEV/'editorial-feedback.json').read_text(encoding='utf-8'))
theme=(DEV/'theme.css').read_text(encoding='utf-8')
ui=(DEV/'ui.js').read_text(encoding='utf-8')

def write(name,s):
    p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s,encoding='utf-8')

def original(pattern):
    return next(ROOT.glob(pattern)).read_text(encoding='utf-8-sig')

def ziptext(pattern,ending):
    with zipfile.ZipFile(next(ROOT.glob(pattern))) as z:
        return z.read(next(n for n in z.namelist() if n.endswith(ending))).decode('utf-8-sig')

def exact(s,a,b):
    assert a in s,a
    assert b in s,b
    return s[s.index(a):s.index(b,s.index(a))]

def replace(s,old,new,count=1):
    assert s.count(old)==count,(old,s.count(old),count)
    return s.replace(old,new)

def template(name,output,content):
    s=(DEV/name).read_text(encoding='utf-8')
    s=s.replace('/* THEME */',theme).replace('/* UI */',ui).replace('/* CONTENT */',content)
    logo=re.search(r'const LOGO_SRC="([^"]+)"',ziptext('files*zip','beit-hamitzvot-shiyuch.html')).group(1)
    s=re.sub(r'<span class="brandmark">.*?</span>(?:</span>)?',lambda m:'<img src="'+logo+'" alt="מורה שמיים" style="width:145px;height:auto;max-height:58px;object-fit:contain">',s,count=1)
    write(output,s)

def upgrade(s,output,addon='',css=''):
    # Keep educational content in the source intact; additions are interface/game logic.
    s=s.replace('</head>','<style>'+theme+'\n'+css+'</style></head>',1)
    head,sep,tail=s.rpartition('</body>')
    assert sep
    s=head+'<script>'+ui+'\n'+addon+'</script></body>'+tail
    write(output,s)

c=ziptext('files*zip','beit-hamitzvot-shiyuch.html')
objects=exact(c,'const OBJECTS=[','/* build a fixed set')
template('c-escape.html','beit-hamitzvot.html',objects)

if (DEV/'g-detective.html').exists():
    blocks=json.loads((OUT/'source-review/doc-content.json').read_text(encoding='utf-8'))
    story=blocks[58]['p'].removeprefix('תעלומה קטנה:')
    rows=blocks[59]['table'][1:]
    prose=blocks[60]['p']
    intro=prose.split('משפט פתיחה: ')[1].split('  משפט כשפותרים נכון:')[0]
    win=prose.split('משפט כשפותרים נכון: ')[1].split(' רמז אם נתקעים:')[0]
    hint=prose.split('רמז אם נתקעים: ')[1].rstrip()
    content={'story':story,'witnesses':[{'name':r[1],'text':r[2],'true':r[3].strip()=='אמיתי'} for r in rows],'intro':intro,'win':win,'hint':hint}
    template('g-detective.html','g-detective.html','const CONTENT='+json.dumps(content,ensure_ascii=False)+';')
    blessings=[r[1] for r in blocks[66]['table'][1:]]
    if (DEV/'h-card-studio.html').exists():
        template('h-card-studio.html','h-card-studio.html','const BLESSINGS='+json.dumps(blessings,ensure_ascii=False)+';')

# Per-game extensions are built from originals on every run, so edits never accumulate.
for module in ['a','b','d','e','f','i','j']:
    patch=DEV/(module+'-build.py')
    if patch.exists():exec(compile(patch.read_text(encoding='utf-8'),str(patch),'exec'))

quality=DEV/'quality.py'
if quality.exists():exec(compile(quality.read_text(encoding='utf-8'),str(quality),'exec'))

review=DEV/'review.py'
if review.exists():exec(compile(review.read_text(encoding='utf-8'),str(review),'exec'))

exec(compile((DEV/'branding.py').read_text(encoding='utf-8'),str(DEV/'branding.py'),'exec'))
exec(compile((DEV/'b-edition-build.py').read_text(encoding='utf-8'),str(DEV/'b-edition-build.py'),'exec'))

print('Built:',', '.join(p.name for p in OUT.glob('*.html')))
