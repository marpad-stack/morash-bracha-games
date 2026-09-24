from pathlib import Path
import json,re,html,base64,shutil,zipfile,hashlib,xml.etree.ElementTree as E
ROOT=Path(__file__).resolve().parents[2];OUT=ROOT/'upgraded';DEV=OUT/'dev'
FINAL=ROOT/'מסירה-משחקי-הבאת-ברכה';GAMES=FINAL/'משחקים';DOCS=FINAL/'מסמכים';TEXT=FINAL/'טקסטים'
for p in [FINAL,GAMES,DOCS,TEXT]:p.mkdir(parents=True,exist_ok=True)
# Explicitly remove only the two rejected illustrations from the delivery copy.
for rejected in (9,15):
    for prefix,ext in [('page','png'),('thumb','png'),('mask','png'),('mem','png'),('color','jpg'),('colorthumb','jpg')]:
        (GAMES/'a-coloring/images'/f'{prefix}{rejected:02}.{ext}').unlink(missing_ok=True)
data=json.loads((DEV/'content-data.json').read_text(encoding='utf-8'))
checks=json.loads((DEV/'content-checks.json').read_text(encoding='utf-8'))
descriptions={
'a':('ציורים הופכים למשחקים','🎨','#d4e8dc','צביעה, זיכרון, פאזלים וחיפוש. התאמות רמה, שיאים ומדליות שנשמרות.','4+ · יצירה, זיכרון ותפיסה חזותית'),
'b':('הסיפור ממשיך בידיים','📖','#e8dff0','40 עמודי הספר, 11 איורים מתוקנים, שש פעילויות, המשך קריאה אוטומטי והדפסה מותאמת.','3+ · סיפור, משחק ודמיון'),
'c':('כל הבית הרפתקה','🔑','#f4deb0','חמישה אתגרי פעולה, החידות המקוריות, איסוף אותיות ותיבה סודית.','4+, 7+, 10+ · גילוי, זיכרון וחשיבה'),
'd':('בונים עיר של מצוות','🏗️','#dbebdc','איסוף בתנועה, לוח מסע, בחירת משימה ובניינים שנשארים בעיר גם כשחוזרים מחר.','4+ · משחק משפחתי, בחירה ובנייה'),
'e':('יום שלם של משחק','☀️','#f5dfad','12 תחנות ושני מסלולים: חידות ואתגרים או עשייה. אפשרות משחק בלחיצות ושמירת מסע.','4+ · רצף, שגרה ומוטוריקה'),
'f':('שפים קטנים במטבח','🥖','#d7cba4','לשים, מנפים, קולעים ואופים בעשרת השלבים המקוריים. קצב רגוע או אתגר זמן.','4+ בליווי · יצירה, רצף ותנועה'),
'g':('מה קרה למתנה?','🔎','#ded3b6','חדר לחיפוש, ארבע עדויות, לוח חקירה, סיווג רמזים ופענוח התעלומה.','6+ בליווי · קריאה, חקירה וחשיבה'),
'h':('מתנה שאפשר לשמור','💌','#eed9d2','18 הברכות המקוריות, צבעים, מסגרות, מדבקות, ציור חופשי וכרטיס להורדה.','4+ · יצירה והבעה אישית'),
'i':('הצעדים שלי אחרי הלידה','🌱','#d8e8df','המפה והמשימות המקוריות, עם גיבוי ושחזור מקומי והסבר מדויק על שיתוף עותק.','לאמא · סדר, תכנון ומעקב'),
'j':('רגע קטן לעצמך','🌷','#e9dfea','31 הכרטיסים המקוריים, שמירה לאורך ימים, מועדפים ומחברת לשיחת ערב.','לאמא ולהורים · התבוננות ושיחה')}
editorial=json.loads((DEV/'editorial-feedback.json').read_text(encoding='utf-8'))
for gid,copy in editorial.items():
    old=descriptions[gid];descriptions[gid]=(copy['title'],old[1],old[2],copy['description'],old[4])
for game in data:
    dest=GAMES/game['file'];dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(OUT/game['file'],dest)
for directory in ['a-coloring','i-first-steps','b-story-pages']:
    shutil.copytree(OUT/directory,GAMES/directory,dirs_exist_ok=True)
for previous in (GAMES/'b-story-pages').iterdir():
    if previous.is_file() and re.fullmatch(r'\d{2}(?:-[a-f0-9]{12})?\.(webp|jpg|png)',previous.name) and not (OUT/'b-story-pages'/previous.name).exists():
        previous.unlink()

print_logo=(DEV/'assets/morash-logo-black.svg').read_text(encoding='utf-8')
def page(title,body,extra=''):
    body='<table class="morash-print-table"><tbody><tr><td>'+body+'</td></tr></tbody><tfoot><tr><td><div class="morash-print-brand" aria-hidden="true">'+print_logo+'</div></td></tr></tfoot></table>'
    extra+=(DEV/'print-footer.css').read_text(encoding='utf-8')+'@media print{@page{size:A4 portrait;margin:16mm 14mm}}'
    return '<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>'+r'''
*{box-sizing:border-box}body{margin:0;background:#fcf8ee;color:#264447;font-family:Arial,sans-serif;line-height:1.8}main{max-width:1100px;margin:auto;padding:35px 24px}h1{font-size:42px;line-height:1.2;letter-spacing:-1px}h2{color:#177a7a;margin-top:35px}h3{margin:0 0 12px}a{color:#166c70}p{max-width:85ch}header{padding:18px 26px;border-bottom:1px solid #d9e2d7;background:#fffdf6;display:flex;justify-content:space-between;align-items:center;gap:20px}header b{font-size:21px}.lead{font-size:19px;color:#5b7772}.pill{display:inline-block;padding:7px 15px;border-radius:30px;background:#deede4;color:#246259;font-size:13px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:30px 0}.card{display:flex;flex-direction:column;background:white;border:1px solid #dfe4d8;border-radius:25px;overflow:hidden;text-decoration:none;color:inherit;transition:transform .2s,box-shadow .2s}.card:hover{transform:translateY(-5px);box-shadow:0 15px 35px #28493315}.cover{height:158px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}.cover:before,.cover:after{content:'';position:absolute;border:1px solid #fff8;border-radius:50%;width:190px;height:190px;transform:rotate(15deg)}.cover:after{width:230px;height:230px}.symbol{font-size:62px;position:relative;z-index:1;filter:drop-shadow(0 9px 0 #3148310c)}.card-body{padding:22px;flex:1;display:flex;flex-direction:column}.part{font-size:12px;color:#628073;font-weight:bold}.card h2{font-size:23px;margin:5px 0 10px}.card p{font-size:14px;margin:0 0 14px;color:#58716e}.card small{font-size:12px;margin-top:auto;color:#7a725e}.open{margin-top:18px;font-weight:bold;color:#177c7e}.docs{display:flex;gap:14px;flex-wrap:wrap;margin:25px 0}.docs a,.button{display:inline-block;border:1px solid #bfcfc2;border-radius:15px;background:white;padding:12px 18px;text-decoration:none;font:inherit;cursor:pointer}.note{background:#f1ead8;padding:18px 22px;border-radius:18px;margin:25px 0}.entry{background:#fffdf8;padding:20px;border:1px solid #e0e2d7;border-radius:18px;margin:14px 0;break-inside:avoid}.text-row{display:grid;grid-template-columns:130px 1fr;gap:15px;border-top:1px solid #eee8db;padding:9px 0}.text-row:first-child{border:0}.label{font-size:12px;color:#7d8a7b}.value{white-space:pre-wrap;overflow-wrap:anywhere}summary{cursor:pointer;font-size:19px;font-weight:bold;padding:15px;background:#e5eee4;border-radius:15px}details{margin:20px 0}table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid #d7ddd0;padding:9px;text-align:right}th{background:#e6eedf}img.book-page{max-width:100%;max-height:950px;display:block;margin:15px auto}input.search{width:100%;padding:15px;border:1px solid #b5cbbd;border-radius:15px;font:inherit;background:white}.book-gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.book-gallery figure{margin:0;background:white;padding:15px;border-radius:18px}.book-gallery img{width:100%;display:block}.book-gallery figcaption{font-size:13px;color:#7a8775}.footer{color:#7f8e7c;font-size:12px;margin-top:40px}.hidden{display:none}@media(max-width:760px){main{padding:24px 17px}h1{font-size:34px}.cards{grid-template-columns:1fr}.text-row{grid-template-columns:1fr;gap:3px}.book-gallery{grid-template-columns:1fr}.cover{height:145px}}@media print{header,.docs,.search,.button{display:none}.entry{box-shadow:none}main{max-width:none;padding:0}details{display:block}summary{break-after:avoid}.book-gallery{display:block}.book-gallery figure{break-after:page}.hidden{display:block}}
''' + extra+'</style><body><header><b>הבאת ברכה ✦</b><span>מסירת משחקים · 16.09.2026</span></header><main>'+body+'</main></body></html>'

cards=[]
for game in data:
    title,symbol,color,desc,ages=descriptions[game['id']]
    cards.append(f'<a class="card" href="משחקים/{game["file"]}"><div class="cover" style="background:{color}"><span class="symbol">{symbol}</span></div><div class="card-body"><span class="part">{game["title"]}</span><h2>{title}</h2><p>{desc}</p><small>{ages}</small><span class="open">פותחים ומשחקים ←</span></div></a>')
catalog='<span class="pill">כל החלקים, במקום אחד</span><h1>עולם קטן של<br>משחק, יצירה וברכה.</h1><p class="lead">עשרה חלקים לעבור עליהם בנחת. כל כרטיס פותח את המשחק העצמאי שלו.</p><div class="docs"><a href="מסמכים/מה-בוצע.html">מה השתנה בכל חלק</a><a href="טקסטים/כל-הטקסטים.html">כל הטקסטים לפי חלקים</a><a href="מסמכים/הערות-תוכן.html">הערות תוכן לעיונך</a><a href="מסמכים/הוראות-חיבור.html">הוראות חיבור לאתר</a></div><div class="cards">'+''.join(cards)+'</div><div class="note">הגילים הם הצעת התאמה למשחק. ילדים שעדיין אינם קוראים יכולים לשחק עם אח גדול או מבוגר. בחירת הרמה משנה את האתגר; התוכן המקורי נשמר.</div><p class="footer">דף זה נועד לסקירת המסירה. כל משחק יכול לעמוד בפני עצמו באתר שלך.</p>'
(FINAL/'התחילו-כאן.html').write_text(page('המשחקים · הבאת ברכה',catalog),encoding='utf-8')

labels={'p':'ללא ניקוד','n':'עם ניקוד','t':'טקסט / כותרת','tf':'לשון נקבה','nf':'לשון נקבה עם ניקוד','name':'שם','riddle':'חידה','hint':'רמז','where':'מיקום','letter':'אות','instr':'הוראה','say':'משפט סיום','home':'משימה בבית','note':'הערה','q':'שאלה','d':'תיאור','i':'מחשבה','m':'צעד מעשי','w':'מועד','title':'כותרת','text':'טקסט','intro':'פתיחה','story':'סיפור','win':'סיום','how':'איך משחקים','l':'כותרת','s':'תיאור','label':'תווית','href':'קישור'}
collections={'PAGES':'דפי התוכן','CATS':'קטגוריות ומשימות','CATNAME':'שמות הקטגוריות','GAMES':'משחקים מתוך הסיפור','OBJECTS':'החפצים והחידות','DECOYS':'חפצים נוספים לבחירה','UI':'טקסטי ממשק מקוריים','CHEERS':'משפטי עידוד','MITZVOT':'משימות המצוות','SIT':'מצבים בבית','QUIZ':'שאלות','CHAL':'אתגרים','SURPRISE':'הפתעות','EVENTS':'תחנות בסדר היום','MINI':'פעולות בתחנות','STR':'הוראות ומשוב מקוריים','G':'טקסטי המשחק המקוריים','SCENES':'שלבי הכנת החלות','CONTENT':'התעלומה והעדויות','BLESSINGS':'משפטי הברכה','HMO':'קופות החולים','DAYMSG':'מסרים לאורך הימים','CAT':'קטגוריות','CARDS':'הכרטיסים','MOODS':'בחירת מצב רוח','QS':'שאלות הערב','WEEKS':'שבועות'}
def walk(v,path=()):
    if isinstance(v,str):
        if re.search('[א-ת]',v) and not v.startswith('data:'):yield path,v
    elif isinstance(v,list):
        for i,x in enumerate(v):yield from walk(x,path+(str(i+1),))
    elif isinstance(v,dict):
        for k,x in v.items():yield from walk(x,path+(labels.get(k,k),))
text_sections=[];plain=['הבאת ברכה — כל הטקסטים לפי חלקים','הנוסחים הועתקו מן המקורות. טקסטי הספר שבתמונות מצורפים במלואם בקובץ HTML ובעמודים המקוריים.','']
for game in data:
    body=[];plain.append('\n'+game['title']+'\n'+'='*45)
    for key,val in game['data'].items():
        if game['id']=='b' and key=='PAGES':
            folder=TEXT/'עמודי-הספר';folder.mkdir(exist_ok=True);figs=[]
            for i,src in enumerate(val):
                mime,encoded=src.split(',',1);ext='png' if 'png' in mime else 'jpg';fname=f'{i+1:02}.{ext}';(folder/fname).write_bytes(base64.b64decode(encoded));figs.append(f'<figure><figcaption>עמוד {i+1}</figcaption><img class="book-page" loading="lazy" src="עמודי-הספר/{fname}" alt="עמוד {i+1} מתוך אור הגיע אלינו"></figure>')
            body.append('<h3>הספר המקורי · '+str(len(val))+' עמודים</h3><p>המלל בספר מוטמע בתוך תמונות. הנוסח הקיים נשמר עד לקבלת העריכה החדשה. 11 איורים תוקנו לפי ההערות, והנוסח שבתוכם נשמר.</p><div class="book-gallery">'+''.join(figs)+'</div>')
            plain.append('אור הגיע אלינו: '+str(len(val))+' עמודים מאוירים. כל העמודים נמצאים בקובץ כל-הטקסטים.html ובתיקיית עמודי-הספר; הם אינם מלל ניתן להעתקה.');continue
        pairs=list(walk(val))
        if not pairs:continue
        plain.append('\n'+collections.get(key,key));rows=[]
        for keys,txt in pairs:
            label=' / '.join(keys) or 'טקסט';rows.append('<div class="text-row"><span class="label">'+html.escape(label)+'</span><div class="value">'+html.escape(txt)+'</div></div>');plain.extend([label,txt,''])
        body.append('<div class="entry"><h3>'+collections.get(key,key)+'</h3>'+''.join(rows)+'</div>')
    text_sections.append('<details class="text-section" id="part-'+game['id']+'"><summary>'+game['title']+'</summary>'+''.join(body)+'</details>')

# Full source document, including the writer's notes, is kept separate from the playable content.
blocks=json.loads((OUT/'source-review/doc-content.json').read_text(encoding='utf-8'));doc=[]
for block in blocks:
    if 'p' in block:
        t=block['p'];doc.append('<p>'+html.escape(t)+'</p>');plain.append(t)
    else:
        table=block['table'];doc.append('<table>'+''.join('<tr>'+''.join('<td>'+html.escape(c)+'</td>' for c in row)+'</tr>' for row in table)+'</table>');plain.extend([' | '.join(r) for r in table])
text_sections.append('<details class="text-section"><summary>נספח · מסמך התוכן המקורי במלואו</summary><p class="note">כולל הנחיות לכותבת, טבלאות ומקומות שנותרו ריקים במקור. זהו תיעוד המקור; ההנחיות שבו אינן שינויים שבוצעו במשחקים.</p>'+''.join(doc)+'</details>')

# Supplement: the remaining Hebrew literals and static HTML from the actual game files.
from html.parser import HTMLParser
class TextParser(HTMLParser):
    def __init__(self):super().__init__();self.skip=0;self.lines=[]
    def handle_starttag(self,tag,attrs):
        if tag in ['script','style']:self.skip+=1
    def handle_endtag(self,tag):
        if tag in ['script','style']:self.skip=max(0,self.skip-1)
    def handle_data(self,text):
        if not self.skip and re.search('[א-ת]',text):self.lines.append(text.strip())
literal_pattern=re.compile(r'''"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`''')
supp=[]
for game in data:
    src=(GAMES/game['file']).read_text(encoding='utf-8').replace((DEV/'point-review.js').read_text(encoding='utf-8'),'').replace((DEV/'draft-backup.js').read_text(encoding='utf-8'),'');parser=TextParser();parser.feed(src);strings=parser.lines[:]
    for scr in re.findall(r'<script\b[^>]*>([\s\S]*?)</script>',src):
        for m in literal_pattern.finditer(scr):
            v=m.group(0)[1:-1]
            if not re.search('[א-ת]',v) or len(v)>12000:continue
            v=re.sub(r'\\([\x22\x27/\\])',r'\1',v).replace('\\n','\n');v=re.sub(r'<[^>]+>',' ',v);v=re.sub(r'\$\{[^}]*\}',' [ערך משתנה] ',v)
            if re.search('[א-ת]',v):strings.append(html.unescape(v).strip())
    seen=set();strings=[s for s in strings if s and not(s in seen or seen.add(s))]
    supp.append('<details><summary>'+game['title']+' · מלל מסכים ופעולות</summary>'+''.join('<div class="entry value">'+html.escape(s)+'</div>' for s in strings)+'</details>')
    plain.extend(['\n'+game['title']+' — נספח מלל מסכים ופעולות']+strings)
text_sections.append('<details class="text-section"><summary>נספח · מלל המסכים, הפעולות והמשוב</summary><p>הנוסחים שנאספו מהקבצים הסופיים. מקומות שהמשחק ממלא לפי שם, ניקוד או שלב מסומנים כערך משתנה. אוספי התוכן המדויקים מופיעים למעלה.</p>'+''.join(supp)+'</details>')
texts_body='<h1>כל הטקסטים, לפי חלקים</h1><p class="lead">אוספי התוכן המקוריים, נוסחים עם ובלי ניקוד, מסמך המקור ומלל המשחקים.</p><div class="docs"><a href="../התחילו-כאן.html">חזרה למשחקים</a><a href="כל-הטקסטים.txt" download>הורדת גרסת טקסט</a><button class="button" onclick="document.querySelectorAll(\'details\').forEach(x=>x.open=true)">פתיחת כל החלקים</button></div><input class="search" id="search" placeholder="חיפוש בטקסטים..." aria-label="חיפוש בטקסטים">'+''.join(text_sections)+'''<script>document.getElementById('search').oninput=e=>{const q=e.target.value.trim();document.querySelectorAll('.text-section').forEach(s=>{const hit=!q||s.textContent.includes(q);s.classList.toggle('hidden',!hit);if(q&&hit)s.open=true})}</script>'''
(TEXT/'כל-הטקסטים.html').write_text(page('כל הטקסטים · הבאת ברכה',texts_body),encoding='utf-8');(TEXT/'כל-הטקסטים.txt').write_text('\ufeff'+'\n'.join(plain),encoding='utf-8')
(TEXT/'אוספי-התוכן-לעריכה.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')

changes='<h1>מה בוצע</h1><p class="lead">גרסה ראשונה מלאה לסבב הבדיקה והתיקונים שלך.</p><p>הקבצים המקוריים בתיקייה הראשית נשארו במקומם. כל קובצי המסירה מרוכזים כאן. השינויים הם במנגנון המשחק, העיצוב והפעולות התפעוליות; סיפורים, חידות, ברכות, משימות וכרטיסים נלקחו מהמקורות.</p>'
details={
'a':['שלוש ברירות פתיחה לפי רמה; נוספה אפשרות זיכרון של 4 זוגות לצעירים.','שיאים לפי משחק ורמה, מסך מדליות ושמירה מקומית.','חידוש צבעים וכרטיסי המשחק; הוספת הפעלה במקלדת לחלקי הפאזל.','19 דפי צביעה פעילים: נוספו שישה, תוקנו ארבעה והוסרו שתי הרשומות של הציור שנדחה.'],
'b':['נשמרו 40 העמודים ונוסח הסיפור הנוכחי. תוקנו איורים בעמודים 2, 8, 21 ו־36; נוסח חדש יוחלף לאחר קבלתו מהמשתמשת.','זיכרון מתמונות הסיפור בשלוש רמות, הלבשה בגרירה ובלחיצה, חידת אורות ברשתות 2×2, 3×3 ו־4×4, ושדרוג שולחן שבת וחפצי התינוק.','שש פעילויות פעילות; הוסרו ההמתנה בלחיצה והפרצופים. נשמרו כוכבים, המשך קריאה וציור להורדה.','מניעת ספירה כפולה בהתאמות ותיקון פעולות שממשיכות לאחר סגירת משחק.'],
'c':['נבנה מסך בית מאויר חדש וחמישה אתגרים: תפיסת כוכבים, זיכרון, רצף צבעים, פאזל הזזה וחיפוש סימן.','לאחר האתגר נפתחת החידה המקורית. שלוש רמות משנות את הקושי ומספר האפשרויות.','אוספים את האותיות ג־א־ו־ל־ה ופותחים תיבה. ההתקדמות והנקודות נשמרות.','הגרסה הנוכחית מבוססת על חמש החידות המקוריות. תכני המשימות שנוספו בגרסה הראשונה לא נכללו במסירה.'],
'd':['נשמרו לוח המשחק, 20 משימות המצוות, המצבים, השאלות והאתגרים המקוריים.','נוספה בחירה בין בניינים ומשימות, וגם גישה ישירה לבחירת בניין.','נוספו שלושה קצבים לאיסוף, שמירת העיר וחזרה למשחק קודם.','נוספו הדגשת התקדמות ומראה מעודכן למסך הבחירה.'],
'e':['12 התחנות המקוריות נשמרו יחד עם כל השאלות, התיאורים והפעולות.','נוסף מסע של עשייה לצד המסלול המקורי של חידות ואתגרים.','נוספה דרך חלופית של לחיצות קצרות, בהתאם לרמה, ושמירה בין תחנות.'],
'f':['נשמרו עשרת שלבי הכנת החלות וכל הטקסטים המקוריים.','נוספו קצב ללא שעון, אתגר של 8 דקות ואתגר של 4 דקות.','נוספו המשך משלב שנשמר, עצירת ספירת הזמן כשהמסמך מוסתר וביטול טיימרים ישנים במעבר בין שלבים.','נשמרה אווירת מטבח כהה וחמה, עם תיקוני ניגודיות, פריסה וכפתורים.'],
'g':['החלק נבנה מתוך מסמך התוכן: חדר מאויר לחיפוש, ארבעה סימנים וארבע עדויות.','לוח עדויות מאפשר לקרוא, לסווג ולשנות בחירה. יש שני מסלולים ורמז מקורי.','נוספו נקודות, פענוח ושמירת מצב החקירה. שמות ונוסחים סותרים במקור נשמרו ומסומנים במסמך ההערות.'],
'h':['החלק נבנה מתוך 18 הברכות שבמסמך.','שש פלטות צבע, שלוש מסגרות, מדבקות שאפשר לגרור/לסובב/לשנות גודל, חתימה וציור חופשי.','היסטוריית צעדים לאחור, שמירה במכשיר, הורדת PNG בגודל 1000×1250 והדפסה.'],
'i':['מערכת המפה והמשימות המקורית נשמרה.','נוספו גיבוי לקובץ JSON ושחזור עם בדיקת מבנה הקובץ.','נוסף הסבר לפני שיתוף שהקישור מכיל עותק ואינו מסנכרן מכשירים.','עודכן ה־Service Worker כך שינהל רק את מטמון המשחק שלו ולא ימחק מטמונים אחרים באתר.'],
'j':['נשמרו 31 הכרטיסים, מצבי הרוח ושאלות הערב.','הוחלף קידום יום מדומה במעקב לפי תאריך מקומי; נשמרים כרטיסים ומועדפים לאחר רענון.','נוספה מחברת זוגית מקומית, שיתוף אמיתי של השאלה בלבד והורדת המחברת כטקסט.','הודעות המערכת על שליחה וסנכרון הותאמו לפעולה שבאמת מבוצעת.']}
for g in data:changes+='<div class="entry"><h2 style="margin-top:0">'+g['title']+'</h2><ul>'+''.join('<li>'+x+'</li>' for x in details[g['id']])+'</ul></div>'
changes+='<h2>בדיקות</h2><p>בדיקות תחביר לכל עשרת החלקים. השוואה אוטומטית של '+str(len(checks))+' אוספי תוכן למקורות, כולל תמונות עמודי הספר; 25 אוספים נשמרו ללא שינוי וחמישה אוספים עודכנו לפי התיקונים שאושרו. העדויות והברכות נבדקו מול טבלאות מסמך המקור. נבדקה פתיחה בדפדפן וגלילה אופקית ברוחב טלפון בכל החלקים.</p><p>בדיקות משחק מעשיות: השלמת זיכרון וצבירת שיא, פתרון אתגר אורות, איסוף ופתרון חידה עם שמירת אות, פענוח חקירה מלאה, בניית בניין וחזרה לעיר, שמירת כרטיס ומחברת. תמונת כרטיס לאמא הורדה ונפתחה לבדיקה. נבדקו גם מסלול העשייה, המטבח והמפה האישית.</p><p>אלה בדיקות מקומיות בדפדפן Codex. טרם נעשתה בדיקה במכשירי iPhone/Android פיזיים או בתוך האתר החי שלך. שמירות הן במכשיר ובדפדפן שבו משחקים; הן אינן שירות סנכרון.</p><div class="docs"><a href="../התחילו-כאן.html">פתיחת המשחקים</a><a href="הערות-תוכן.html">הערות תוכן</a></div>'
(DOCS/'מה-בוצע.html').write_text(page('מה בוצע · הבאת ברכה',changes),encoding='utf-8')
notes='''<h1>הערות תוכן לעיונך</h1><p class="lead">הנושאים הבאים נמצאו במקורות. הם לא תוקנו בתוך התוכן.</p><div class="entry"><h2>חלק ז׳ · שמות בתעלומה</h2><p>שם האח מתחלף בין דוד ולוי בתוך הסיפור, העדויות, הפתיחה, הרמז והפתרון. בעדות השכן מופיע גם החיבור „דודצועק”. הנוסחים נשמרו כפי שנכתבו. סיווג העדויות במשחק תואם לטבלת המקור.</p></div><div class="entry"><h2>חלק ט׳ · מידע וקישורים</h2><p>המקור כולל מידע על דמי לידה, תקופת חופשה, עצמאיות, אשפוז ומעקב בריאות. נדרשת בדיקת תוכן מקצועית לפני פרסום, במיוחד ההבחנה בין חופשה לתקופה בתשלום והקביעה על הגשת תביעה לעצמאיות. שום נוסח לא שונה.</p><p>קישורי הרשמה ויצירת קשר של שפרה ופועה מופיעים בחלקם כ־#; יש להשלים את היעדים בחיבור לאתר. גם מועדי המשימות מחושבים לפי ההגדרות המקוריות, שלא שונו.</p><p>מקורות לבדיקת העורכת: <a href="https://www.btl.gov.il/benefits/maternity/Childbirth_Allowance/Pages/default.aspx">ביטוח לאומי · דמי לידה</a> ו־<a href="https://me.health.gov.il/parenting/raising-children/after-childbirth/at-hospital/initial-care-for-newborn/">משרד הבריאות · הטיפול הראשוני בתינוק</a>.</p></div><div class="entry"><h2>חלק א׳ · תיאור מספר המשחקים</h2><p>במקור מופיע תיאור „שלושה משחקים” לצד ארבע אפשרויות. ברמות הזיכרון נוספה אפשרות לצעירים; באוסף המעודכן 19 דפים; הוסרו שתי הרשומות של ציור בית הכנסת שנדחה, ונוספו שישה איורים מאושרים. שתי כפילויות מקוריות נוספות אינן מופיעות יחד בחבילת הזיכרון.</p></div><div class="entry"><h2>חלק ב׳ · מלל מוטמע בתמונות</h2><p>הספר הגיע כ־40 תמונות. כל העמודים נכללו בשלמותם בקובץ הטקסטים ובתיקיית עמודי־הספר. טקסט הספר אינו ניתן לעריכה כטקסט רגיל בקובץ המקור; לא בוצע תמלול משוער שעלול לשנות ניקוד או נוסח.</p></div><div class="entry"><h2>התאמת קהל</h2><p>בחלק מהברכות והמסמכים מופיעה פנייה לאמא כמורה. היא נשמרה בהתאם להנחיה לא לשנות תוכן. תגיות גיל ומסלול הן הצעות תפעוליות, ולא חלק מהתוכן המקורי.</p></div>'''
(DOCS/'הערות-תוכן.html').write_text(page('הערות תוכן',notes),encoding='utf-8')
integration='''<h1>חיבור המשחקים לאתר</h1><p>כל משחק עובד בנפרד. אין צורך להעלות את דף הסקירה או את מסמכי המסירה.</p><ol><li>להעלות את הקבצים מתוך תיקיית „משחקים” לשרת האתר.</li><li>חלק א׳ וחלק ט׳ הם תיקיות: להעלות את התיקייה כולה, כולל התמונות, regions.js, האייקונים והקבצים הנלווים.</li><li>חלק ב׳ כולל את b-story.html ואת תיקיית b-story-pages שלצדו. יש להעלות או לחלץ את שניהם יחד, כדי שכל 40 איורי הספר יהיו זמינים.</li><li>יתר החלקים הם קובצי HTML עצמאיים. הקוד והאיורים שלהם משולבים בקובץ.</li><li>לקשר מהאתר לכתובת המשחק, או להטמיע ב־iframe בגובה מתאים. מומלץ להתחיל בקישור למסך מלא.</li><li>לבדוק כתובות, הדפסה, הורדות ושמירה באותו אופן שבו המשחק יוצג למשתמשים באתר בפועל.</li></ol><div class="note">חלק ט׳ מכיל טופס היכרות אישי השייך לכלי עצמו. הוא אינו משנה את טופס הלידה באתר החי. שיתוף המפה הוא העברת עותק; אין שרת משותף או סנכרון בין מכשירים.</div><h2>שמירה ופונטים</h2><p>המשחקים משתמשים בשמירה מקומית בדפדפן. בדפדפן פרטי או אם האחסון חסום ייתכנו מגבלות. יש בחלק מהקבצים פונטים של Google Fonts; קיים גופן חלופי אם אין חיבור. להפעלת שמירה ו־PWA עדיף לפתוח דרך HTTP/HTTPS ולא כקובץ file מקומי.</p><h2>אריזות נפרדות</h2><p>בתיקיית „אריזות” יש ZIP לכל חלק בנפרד. אפשר למסור רק את החלק שרוצים להעלות. שמות הקבצים הטכניים נשמרו קצרים, ללא תלות בדף הסקירה.</p><h2>קוד העבודה</h2><p>הקבצים בתוך upgraded/dev משמשים לבנייה ולתחזוקה של הגרסאות. תיקיית המסירה כוללת את התוצרים המוכנים; היא אינה תלויה בסקריפט בנייה.</p>'''
(DOCS/'הוראות-חיבור.html').write_text(page('הוראות חיבור',integration),encoding='utf-8')
shutil.copy2(DEV/'content-checks.json',DOCS/'בדיקת-זהות-תוכן.json')
(FINAL/'קראו-אותי.txt').write_text('\ufeff'+'הבאת ברכה — מסירת משחקים\n\nפתחי את התחילו-כאן.html כדי לעבור על כל החלקים.\n\nמשחקים — כל הקבצים הסופיים.\nמסמכים/מה-בוצע.html — פירוט השינויים.\nטקסטים/כל-הטקסטים.html — כל התוכן מסודר, כולל עמודי הספר כתמונות מקור.\nטקסטים/כל-הטקסטים.txt — גרסת טקסט של החלקים הזמינים כמלל.\nמסמכים/הערות-תוכן.html — נקודות במקור שלא שונו.\nמסמכים/הוראות-חיבור.html — הוראות העלאה ושילוב.\nאריזות — ZIP נפרד לכל חלק.\n\nהתיקייה הראשית והקבצים המקוריים נשארו ללא שינוי.\n',encoding='utf-8')
book_file=GAMES/'b-story.html'
book_source=book_file.read_text(encoding='utf-8')
book_paths=json.loads(re.search(r'const PAGES\s*=\s*(\[[\s\S]*?\]);',book_source)[1])
book_sources=next(g for g in data if g['id']=='b')['data']['PAGES']
offline_map=dict(zip([Path(p).name for p in book_paths],book_sources))
offline_book=book_source.replace('<head>','<head><script>window.MORASH_OFFLINE_BOOK_DATA='+json.dumps(offline_map)+';</script>',1)
def archive_file(z,f,base):
    if f==book_file:z.writestr(f.relative_to(base).as_posix(),offline_book)
    else:z.write(f,f.relative_to(base))
packages=FINAL/'אריזות';packages.mkdir(exist_ok=True)
for g in data:
    src=GAMES/g['file'];base=src.parent if g['id'] in ['a','i'] else GAMES
    files=list(src.parent.rglob('*')) if g['id'] in ['a','i'] else [src]
    if g['id']=='b':files+=list((GAMES/'b-story-pages').glob('*'))
    with zipfile.ZipFile(packages/(g['id']+'-'+src.parent.name+'.zip' if g['id'] in ['a','i'] else g['id']+'-'+src.stem+'.zip'),'w',zipfile.ZIP_DEFLATED) as z:
        for f in files:
            if f.is_file():archive_file(z,f,base)
# One current download target is shared by GitHub Pages and the Sites portal.
with zipfile.ZipFile(FINAL/'corrected-games.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in GAMES.rglob('*'):
        if f.is_file():archive_file(z,f,GAMES)
manifest={str(p.relative_to(FINAL)):hashlib.sha256(p.read_bytes()).hexdigest() for p in FINAL.rglob('*') if p.is_file() and p.name!='manifest-sha256.json'}
(DOCS/'manifest-sha256.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Packaged:',FINAL)
print('Files:',len(manifest),'Content comparisons:',len(checks))
exec((DEV/'quality-package.py').read_text(encoding='utf-8'))
exec((DEV/'review-package.py').read_text(encoding='utf-8'))
