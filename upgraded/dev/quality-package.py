"""Complete the second edition's review and website presentation kit."""
import csv,io
kit=FINAL/'ערכת-תצוגה-לאתר';kit.mkdir(exist_ok=True)
marketing=json.loads((DEV/'marketing.json').read_text(encoding='utf-8'))
editions=json.loads((DEV/'story-editions-content.json').read_text(encoding='utf-8'))
book=[{'page':3+i*2,'n':x['n']} for i,x in enumerate(editions['mendy']['scenes'])]
(TEXT/'סיפורים-מאושרים.json').write_text(json.dumps(editions,ensure_ascii=False,indent=2),encoding='utf-8')
extra=json.loads((DEV/'nikud-new.json').read_text(encoding='utf-8'))
strip=lambda s:re.sub('[\u0591-\u05bd\u05bf-\u05c2\u05c4-\u05c7]','',s)
games_by_id={g['id']:g for g in data};kit_cards=[];kit_txt=['הבאת ברכה — תמונות ותיאורים לשילוב באתר','התיאורים הם מלל תצוגה חדש. התוכן בתוך המשחקים נשמר.','']
for m in marketing:
    gid=m['id'];g=games_by_id[gid]
    for ext in ['png','webp']:
        src=DEV/'assets'/f'{gid}-cover.{ext}';assert src.exists(),src
        shutil.copy2(src,kit/src.name)
    m['game_path']='../משחקים/'+g['file'];m['image_webp']=f'{gid}-cover.webp';m['image_png']=f'{gid}-cover.png';m['image_width']=1536;m['image_height']=1024
    kit_cards.append('<article class="card"><img class="kit-image" src="'+m['image_webp']+'" width="1536" height="1024" loading="lazy" alt="'+html.escape(m['alt'])+'"><div class="card-body"><span class="part">'+g['title']+'</span><h2>'+m['title']+'</h2><p>'+m['description']+'</p><small>'+m['audience']+'</small><div class="docs"><a download href="'+m['image_png']+'">PNG</a><a download href="'+m['image_webp']+'">WebP</a><a href="'+m['game_path']+'">פתיחת המשחק</a></div></div></article>')
    kit_txt.extend([g['title'],m['title'],m['description'],m['audience'],'תיאור חלופי לתמונה: '+m['alt'],'קובץ: '+m['image_webp'],'יעד: '+m['game_path'],''])
(kit/'תיאורים-לאתר.txt').write_text('\ufeff'+'\n'.join(kit_txt),encoding='utf-8')
(kit/'כרטיסי-משחק.json').write_text(json.dumps(marketing,ensure_ascii=False,indent=2),encoding='utf-8')
with (kit/'כרטיסי-משחק.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(marketing[0]));w.writeheader();w.writerows(marketing)
kit_css='<style>.kit-image{width:100%;height:auto;aspect-ratio:3/2;object-fit:cover}.card .docs{gap:6px;margin:15px 0 0}.card .docs a{font-size:12px;padding:6px 10px}.cards{grid-template-columns:repeat(2,1fr)}@media(max-width:650px){.cards{grid-template-columns:1fr}}</style>'
(kit/'תמונות-ותיאורים.html').write_text(page('תמונות ותיאורים לאתר','<h1>עשרה עולמות, מוכנים לאתר.</h1><p class="lead">תמונה, תיאור וקישור לכל משחק או כלי. את התמונה מעלים לכרטיס ההטבה באתר ואת הכפתור מקשרים למשחק המתאים.</p><div class="docs"><a href="../התחילו-כאן.html">חזרה למסירה</a><a download href="תיאורים-לאתר.txt">כל התיאורים</a><a download href="כרטיסי-משחק.csv">טבלת CSV</a><a download href="כרטיסי-משחק.json">נתונים ב־JSON</a></div><p>התמונות בגודל 1536×1024 וביחס 3:2. WebP מתאים לאתר; PNG הוא עותק באיכות מלאה. אין כותרת מוטמעת בתמונה, כדי שהטקסט יישאר חד, נגיש ונוח לעריכה.</p><div class="cards">'+''.join(kit_cards)+'</div>')+kit_css,encoding='utf-8')
# Replace the first edition's symbol tiles with the actual cover art.
p=FINAL/'התחילו-כאן.html';s=p.read_text(encoding='utf-8')
for g in data:
    gid=g['id'];m=next(x for x in marketing if x['id']==gid);title,symbol,color,desc,ages=descriptions[gid]
    old=f'<div class="cover" style="background:{color}"><span class="symbol">{symbol}</span></div>'
    new='<div class="cover art-cover"><img width="1536" height="1024" loading="lazy" src="ערכת-תצוגה-לאתר/'+gid+'-cover.webp" alt="'+html.escape(m['alt'])+'"></div>'
    assert old in s;s=s.replace(old,new).replace(desc,m['description'])
s=s.replace('<div class="docs">','<div class="docs"><a href="ערכת-תצוגה-לאתר/תמונות-ותיאורים.html">תמונות ותיאורים לשילוב באתר</a>',1)
s+='<style>.art-cover{height:auto;aspect-ratio:3/2;background:#eee4d4}.art-cover img{width:100%;height:100%;object-fit:cover;transition:transform .35s}.art-cover:before,.art-cover:after{display:none}.card:hover .art-cover img{transform:scale(1.035)}.cards{gap:24px}.card h2{font-size:25px}.card p{line-height:1.8}</style>'
p.write_text(s,encoding='utf-8')
# All added reading variants, separately from the untouched source collections.
added={'book': [{'page':p['page'],'p':strip(p['n']),'n':p['n']} for p in book], 'g':extra['g'],'h':extra['h'],'ui':[{'p':strip(n),'n':n} for n in extra['ui']]}
(TEXT/'נוסחי-קריאה-נוספים.json').write_text(json.dumps(added,ensure_ascii=False,indent=2),encoding='utf-8')
reading_html=[];reading_txt=['\nגרסאות קריאה נוספות — עם ובלי ניקוד\n']
for part,obj in [('הספר החדש — מענדי',editions['mendy']['scenes']),('הספר החדש — חני',editions['chani']['scenes']),('תעלומת המתנה',added['g']),('ברכות לאמא',added['h']),('הוראות, ניווט ומשוב',added['ui'])]:
    rows=[];reading_txt.append('\n'+part)
    for key,txt in walk(obj):
        label=' / '.join(key);rows.append('<div class="text-row"><span class="label">'+html.escape(label)+'</span><div class="value">'+html.escape(txt)+'</div></div>');reading_txt.extend([label,txt,''])
    reading_html.append('<details class="text-section"><summary>'+part+'</summary><div class="entry">'+''.join(rows)+'</div></details>')
p=TEXT/'כל-הטקסטים.html';s=p.read_text(encoding='utf-8')
s=s.replace('הנוסח הקיים נשמר עד לקבלת העריכה החדשה. 11 איורים תוקנו לפי ההערות, והנוסח שבתוכם נשמר.','11 איורים תוקנו; נוסח הסיפור הנוכחי נשמר. בהמשך מצורפת תצוגת קריאה מתומללת, עם ניקוד ובלעדיו.')
s=s.replace('</main>','<h2>תוספת לסבב השדרוג — קריאה נגישה</h2><p>הנוסח החדש שאושר מופיע להלן עם ניקוד ובלעדיו, בגרסאות מענדי וחני. כל גרסה מעוצבת בספר בן 28 עמודים, עם 11 רגעי שיחה לבחירה. התמונות המקוריות שלמעלה הן ארכיון בלבד.</p>'+''.join(reading_html)+'</main>')
p.write_text(s,encoding='utf-8')
p=TEXT/'כל-הטקסטים.txt';s=p.read_text(encoding='utf-8').replace('הם אינם מלל ניתן להעתקה.','תמלול להעתקה וגרסה מנוקדת נוספו בנספח הקריאה בסוף הקובץ.');p.write_text(s+'\n'+'\n'.join(reading_txt),encoding='utf-8')
shutil.copy2(DEV/'nikud-checks.json',DOCS/'בדיקת-ניקוד-נוסף.json')
# Correct the previous report's now-outdated statements.
p=DOCS/'מה-בוצע.html';s=p.read_text(encoding='utf-8').replace('גרסה ראשונה מלאה לסבב הבדיקה והתיקונים שלך.','סבב שדרוג שני — עיצוב, קריאה, משחקיות וערכת הצגה לאתר.')
new_report='''<h2>מה נוסף בסבב הזה</h2><div class="entry"><h3>קו עיצוב משותף ועולמות שונים</h3><p>טורקיז, קורל, שמנת וגוונים חמים מחברים בין החלקים. לכל משחק תמונת שער ועולם חזותי משלו: נייר ויצירה, ספר חלומי, בית תלת ממדי, עיר בנייה, מסלול יום, מטבח, שולחן בלשים וסטודיו לברכות. לשני הכלים לאמא נשמר מראה בוגר ורגוע. עשרת איורי השער הופקו בכלי יצירת התמונות. ל„מרווח” נבנתה תחילה סקיצה וקטורית מקורית, ששימשה בסיס להמחשה המציאותית הסופית.</p></div><div class="entry"><h3>ניקוד לפי צורך</h3><p>בחלקים א–ח נוספו בקרי קריאה עקביים, שינוי עם/בלי ניקוד והגדלת טקסט. שולבו נוסחי הניקוד הקיימים ונוקדו גם הוראות נפוצות. הספר נבנה מחדש, נערך שוב לשפה פשוטה לפי הבקשה, ומשלב גרסאות מענדי וחני וניקוד לבחירה. בחקירה ובברכות נוסף ניקוד לכל התוכן. בכרטיס לאמא הניקוד מופיע גם בתמונה המיוצאת. חלקים ט–י מיועדים למבוגרים ונשארו ללא בורר ניקוד.</p><p>הנוסח המנוקד נבדק מול הטקסט המעודכן, עם התאמות כתיב מלא ללא ניקוד. אפשר להמשיך בהגהה חזותית ובלשונית שתי הגרסאות.</p></div><div class="entry"><h3>רצף משחק ברור יותר</h3><p>תוקנו פעולות מושהות אחרי סגירת משחקי הקטנטנים, רישום שיאים לפי הרמה שבה התחיל הסיבוב, ודפדוף ברקע כשמשחק מתוך הספר פתוח. בבית המצוות נוסף מונה אתגרים ורצף לתרגול; פתרון חוזר מציג משוב נכון ולא מבטיח פרס שכבר נאסף. במסע בזמן הוזז כפתור המשחק בלחיצות כך שלא יכסה את אזור הפעולה. במטבח נוספה הפעלה במקלדת לפריטים נגררים, לישה, הברשה ופעולות הקשה.</p></div><div class="entry"><h3>התאמת איורים לקהל</h3><p>בתמונות השער אין אנשים או בעלי חיים. ספר המקור ודפי הצביעה נסקרו חזותית; הדמויות לבושות בצניעות. בדמויות הווקטוריות הובלטו הציציות. סמל מנורת שמן שאינו מתאים הוחלף בתצוגה בנר ניטרלי; דגלי משחק הוחלפו בסימון ניטרלי. לא הוכנסו דגלים לאומיים או סמלים דתיים זרים.</p></div><div class="entry"><h3>תמונות ותיאורים לשילוב באתר</h3><p>ערכת התצוגה כוללת תמונת PNG ותמונת WebP לכל אחד מעשרת החלקים, תיאור קצר, קהל יעד, טקסט חלופי לתמונה וקישור לקובץ המשחק. הכל זמין בדף חזותי, בטקסט, ב־CSV וב־JSON.</p><a href="../ערכת-תצוגה-לאתר/תמונות-ותיאורים.html">לפתיחת ערכת התצוגה</a></div>'''
s=s.replace('<h2>בדיקות</h2>',new_report+'<h2>בדיקות</h2>');p.write_text(s,encoding='utf-8')
p=DOCS/'הערות-תוכן.html';s=p.read_text(encoding='utf-8').replace('במקור מופיע תיאור „שלושה משחקים” לצד ארבע אפשרויות.','במקור הופיע תיאור „שלושה משחקים” לצד ארבע אפשרויות. תווית הממשק עודכנה ל„ארבעה משחקים”.').replace('טקסט הספר אינו ניתן לעריכה כטקסט רגיל בקובץ המקור; לא בוצע תמלול משוער שעלול לשנות ניקוד או נוסח.','נוספה לצד התמונות תצוגת קריאה מתומללת ומנוקדת. היא זמינה גם בקובץ הטקסטים. התמלול נבדק מול התמונות, אך מומלצת הגהת עורך לפני פרסום. המקור החזותי נשאר הסמכות במקרה של הבדל.');p.write_text(s,encoding='utf-8')
p=DOCS/'הוראות-חיבור.html';s=p.read_text(encoding='utf-8').replace('</main>','<h2>כרטיסי ההטבות באתר</h2><p>מתיקיית „ערכת-תצוגה-לאתר” בוחרים את תמונת ה־WebP של המשחק, מעתיקים את הכותרת והתיאור מקובץ „תיאורים-לאתר.txt” ומקשרים לקובץ המשחק. נתיבי game_path שב־JSON וב־CSV הם נתיבים יחסיים למסירה; יש להחליפם בכתובת ההעלאה באתר שלך. הקבצים אינם מחוברים לשירות חדש או לחשבון חדש.</p><p>היחס המומלץ לתמונות הוא 3:2. אם כרטיסי האתר משתמשים ביחס אחר, אפשר להציג את התמונה בשלמותה באמצעות object-fit:contain או לבדוק ידנית את החיתוך.</p></main>');p.write_text(s,encoding='utf-8')
with (FINAL/'קראו-אותי.txt').open('a',encoding='utf-8') as f:f.write('\nחדש בסבב 2: ערכת-תצוגה-לאתר/תמונות-ותיאורים.html — תמונה ותיאור לכל חלק.\nטקסטים/נוסחי-קריאה-נוספים.json — הניקוד החדש ותמלול הספר.\n')
with zipfile.ZipFile(packages/'ערכת-תצוגה-לאתר.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in kit.iterdir():
        if p.is_file():z.write(p,p.name)
# This manifest is always calculated last.
shutil.copy2(DEV/'assets/art-direction.md',DOCS/'מפרט-איורים.md')
if (DEV/'browser-checks.json').exists():shutil.copy2(DEV/'browser-checks.json',DOCS/'בדיקות-דפדפן.json')
if (DEV/'package-checks.json').exists():shutil.copy2(DEV/'package-checks.json',DOCS/'בדיקות-אריזה.json')
manifest={str(p.relative_to(FINAL)):hashlib.sha256(p.read_bytes()).hexdigest() for p in FINAL.rglob('*') if p.is_file() and p.name!='manifest-sha256.json'}
(DOCS/'manifest-sha256.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Second edition:',len(marketing),'website cards;',len(book),'reading pages;',len(manifest),'files')
