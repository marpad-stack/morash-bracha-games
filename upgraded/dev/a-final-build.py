"""Approved part A review, applied reproducibly after the original game builder."""
import shutil
art=json.loads((DEV/'a-final-content.json').read_text(encoding='utf-8'))
def array_literal(name):
    match=re.search(r'const '+name+r'\s*=\s*([\s\S]*?);',s)
    assert match,name
    return match
# Source records have simple literals; preserve every retained record verbatim.
m=array_literal('PAGES')
records=re.findall(r'\{id:\s*(\d+),[^}]+\}',m[1])
kept=[record for record in re.findall(r'\{id:\s*\d+,[^}]+\}',m[1]) if int(re.search(r'id:\s*(\d+)',record)[1]) not in art['removedIds']]
new_pages='const PAGES=[\n'+',\n'.join(kept+[json.dumps(p,ensure_ascii=False) for p in art['addedPages']])+'\n];'
s=s[:m.start()]+new_pages+s[m.end():]
for name,value in [('CATS',art['categories']),('CATNAME',art['categoryNames'])]:
    m=array_literal(name);s=s[:m.start()]+'const '+name+'='+json.dumps(value,ensure_ascii=False)+';'+s[m.end():]
s=s.replace("const CATCOLOR={", "const CATCOLOR={brit:'#8B4CB7',")
s=replace(s,"if(!Array.isArray(picked)) picked=[];","if(!Array.isArray(picked)) picked=[];picked=[...new Set(picked)].filter(id=>PAGES.some(p=>p.id===id));")
s=replace(s,"const DUP=[[4,13],[5,14],[9,15]];","const DUP=[[4,13],[5,14]];")
s=replace(s,"const p=pageById(id);return\n", "const p=pageById(id);return ")
s=s.replace('<h3>פאזל הזזה</h3>','<h3>מרכיבים פאזל</h3>').replace('מזיזים משבצות למקום הריק עד שהציור מסתדר.','בוחרים שני חלקים ומחליפים ביניהם. אפשר גם לנסות פאזל הזזה.')
s=s.replace('<h3>מצא את הציור</h3>','<h3>בלשי החפצים</h3>').replace('מציגים ציור צבוע — ומחפשים אותו בין דפי הצביעה.','מסתכלים על חפץ קטן ומגלים באיזה ציור הוא מסתתר.')
s=s.replace('אוספים כאן דפי צביעה שאהבתם — בגלריה יש כפתור <b>＋</b> על כל דף.','בלחיצה על <b>＋</b> הציור שלכם יתווסף לחוברת. את החוברת תוכלו להדפיס לאחר מכן.')
s=s.replace('הדפים נשמרים ברשימה גם אם סוגרים את האתר.','הדפים שבחרתם נשמרים בדפדפן הזה גם כשסוגרים את האתר.')
s=s.replace('שלוש רמות קושי.','בוחרים כמה זוגות למצוא ומשחקים בקצב שלכם.')
for prefix,ext in [('page','png'),('thumb','png'),('mask','png'),('color','jpg'),('colorthumb','jpg')]:
    old="'images/"+prefix+"'+String(n).padStart(2,'0')+'."+ext+"'"
    new="'images/"+prefix+"'+String(n).padStart(2,'0')+'."+ext+"?v=20260924-a3'"
    s=replace(s,old,new)
# A rapid image switch must not let an older load overwrite the new canvas.
s=replace(s,'function openStudio(id){','function openStudio(id){const token=window.aStudioToken=(window.aStudioToken||0)+1;')
start=s.index('function openStudio(id){');end=s.index('function pt(e)',start)
section=s[start:end].replace('im.onload=()=>{','im.onload=()=>{if(window.aStudioToken!==token)return;').replace('loadMask(id,m=>{maskData=m});','loadMask(id,m=>{if(window.aStudioToken===token)maskData=m});')
s=s[:start]+section+s[end:]
# The local W/H declarations put the opening size calculation in the TDZ.
start=s.index('function composite(cb){');end=s.index("$('#stSave').onclick",start)
section=s[start:end].replace('const W=OW,H=OH;','const imageW=OW,imageH=OH;').replace('W/2,H+56','imageW/2,imageH+56').replace('W/2,H+100','imageW/2,imageH+100')
s=s[:start]+section+s[end:]
for tool,caption in [('fill','דלי צבע'),('brush','מכחול'),('eraser','מחק')]:
    s=re.sub(r'(<button class="tool" data-tool="'+tool+r'"[^>]*>)([^<]+)(</button>)',lambda m:m[1]+m[2]+' <span>'+caption+'</span>'+m[3],s)
for bid,caption in [('tUndo','ביטול צעד'),('tClear','דף נקי')]:
    s=re.sub(r'(<button class="tool" id="'+bid+r'"[^>]*>)([^<]+)(</button>)',lambda m:m[1]+m[2]+' <span>'+caption+'</span>'+m[3],s)
s=s.replace('aria-label="סגירה">✕</button>','aria-label="סגירה וחזרה">✕ <span>סגירה</span></button>')
addon+='\n'+(DEV/'a-final.js').read_text(encoding='utf-8')
addon+='\n'+(DEV/'a-print.js').read_text(encoding='utf-8')
css+='\n'+(DEV/'a-final.css').read_text(encoding='utf-8')
source=DEV/'assets/a-final/runtime'
assert source.is_dir(),'Build final coloring assets first'
shutil.copytree(source,OUT/'a-coloring',dirs_exist_ok=True)
# Omit both source copies of the rejected illustration from deliverables.
for page_id in art['removedIds']:
    for prefix,ext in [('page','png'),('thumb','png'),('mask','png'),('mem','png'),('color','jpg'),('colorthumb','jpg')]:
        target=OUT/'a-coloring/images'/f'{prefix}{page_id:02}.{ext}'
        target.unlink(missing_ok=True)
