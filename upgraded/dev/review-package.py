"""Generate the owner's review checklist alongside the delivery files."""
items={
'a':('צובעים ומרכיבים!','עדכון 24.9: איורים חדשים ומתוקנים, חיפוש חפצים, זיכרון משופר ותיקון חוברת, שמירה והדפסה.','בדקי את 19 הדפים, את ארבעת המשחקים ואת ההדפסה בטלפון ובמדפסת שלך.'),
'b':('אור הגיע אלינו','ניווט נקי, הבחנה בין תמונת הספר לקריאה בטקסט ותיקון החפיפה בכפתור הסגירה.','דפדפי בספר, נסי את שמונה הפעילויות והגיהי את התמלול והניקוד.'),
'c':('בית המצוות','הוראה לפני הבחירה בטלפון ורשימת בחירה חלופית סגורה, למניעת כפתורים כפולים במסך.','נסי את חמשת האתגרים, החידות ואיסוף האותיות.'),
'd':('מסע המצוות','הקדמה, הסבר לתור הראשון, הבחנה בין המסלול הרגיל למשימת בנייה וחזרה לתפריט.','נסי בחירת משתתפים, תור איסוף, בניית עיר והמשך משחק שמור.'),
'e':('מסע בזמן','בקרי קריאה אחידים, הסבר לשני המסלולים וחזרה מהפעילות לתחנה.','נסי חידות ואתגרים, מסע עשייה וחלופת הלחיצות.'),
'f':('מטבח השבת','תצוגת טלפון קומפקטית, הוראות לאצבע ולעכבר/מקלדת ויציאה ששומרת את השלב.','הכיני חלה, נסי גרירה ולישה, וצאי וחזרי באמצע.'),
'g':('תעלומת המתנה','הוסרה תמונת פתיחה כפולה ומונה העדויות מוצג בסדר ברור.','קראי, חפשי ארבעה רמזים, סווגי עדויות ובדקי את הפתרון.'),
'h':('כרטיס מכל הלב','גישה לתצוגה מוגדלת מתוך כלי העריכה בטלפון, מעבר ישיר לציור ואזורי מגע גדולים יותר.','בחרי ברכה, חתמי, קשטי והורידי תמונה; בדקי גם ביטול ומחיקה.'),
'i':('צעדים ראשונים','הבהרה שאפשר להשלים פרטים בהמשך, פתיחה מותאמת לאמא ובדיקת גיבוי ושחזור.','צרי מפה, סמני משימה, הוסיפי הערה ובדקי את הנוסחים והקישורים.'),
'j':('מרווח','בחירת כרטיס נוסף הועברה לאחר הכרטיס ונשמר רצף הפתיחה.','בחרי הרגשה, שמרי כרטיס, כתבי שאלת ערב והורידי מחברת.')}
for gid,copy in editorial.items():
    old=items[gid];items[gid]=(copy['title'],{'a':'עודכנו הכותרת, ההסבר ותיאור משחקי שעות הפנאי לפי הערות העריכה.','b':'עודכנו שמות הפעילויות וההוראות. כפתור הסגירה נשאר נגיש גם בגלילה.','c':'עודכנו הכותרת וההוראות; משחק המספרים מסודר בשורה מימין לשמאל.'}[gid],old[2])
items['b']=(editorial['b']['title'],'עדכון 25.9: 17 איורים הורחבו לכפולות מצוירות, והטקסט שולב בתוכן בספרים של מענדי וחני. ההפעלות מרוכזות בסוף, לצד ששת המשחקים.','בדקי את שילוב הטקסט באיורים, קריאה ומשחקים בטלפון ובמחשב, ובחירה בין A4 מלא לחוברת מקופלת.')
cards=[]
# 4.10.2026: the review round is over. The page is a plain list of links, with no review service, scripts or forms.
DONE_LINE='הבדיקה הסתיימה. ההערות נשמרו בטבלת ההערות.'
links=''.join(f'<a class="card" href="משחקים/{g["file"]}"><div class="card-body"><h2>{html.escape(items[g["id"]][0])}</h2><span class="open">פותחים ומשחקים ←</span></div></a>' for g in data)
body='<h1>עשרת חלקי הבאת ברכה</h1><div class="note"><b>'+DONE_LINE+'</b></div><div class="docs"><a href="התחילו-כאן.html">כל קובצי המסירה</a><a href="מסמכים/סיכום-בדיקה-סופית.html">מה תוקן ומה נבדק</a><a href="טקסטים/כל-הטקסטים.html">כל הטקסטים</a></div><div class="cards">'+links+'</div>'
(FINAL/'בדיקה-סופית.html').write_text(page('המשחקים · הבאת ברכה',body),encoding='utf-8')
report='<h1>סיכום בדיקה ותיקונים</h1><p class="lead">16.9.2026 · גרסה למעבר שלך לפני פרסום</p><div class="docs"><a href="../בדיקה-סופית.html">לרשימת הבדיקה וההערות</a></div>'
for gid,(title,change,check) in items.items():report+='<div class="entry"><h2>'+title+'</h2><p>'+change+'</p></div>'
report+='<h2>בדיקות</h2><p>פתיחה ופריסה לכל עשרת החלקים ברוחב 320, 390 ו־1440 פיקסלים; פעילויות במחשב ובתצוגת טלפון; שגיאות JavaScript, תמונות חסרות וגלילה אופקית; תפקוד ושמירה; השוואת 30 אוספי תוכן למקור; קישורים ואריזות ZIP. פירוט התוצאות בפועל מצורף בקובצי JSON.</p><h2>למעבר שלך</h2><p>הגהת הספר והניקוד, התאמת הקושי לקהל ובדיקה בטלפון פיזי. הדפסה ושיתוף לאפליקציות אחרות דורשים מעבר במכשיר שבו תשתמשי. הגרסה מיועדת לסבב בדיקה ומשוב; הגהת התוכן ובדיקה בטלפון פיזי עדיין נדרשות.</p>'
(DOCS/'סיכום-בדיקה-סופית.html').write_text(page('סיכום בדיקה סופית',report),encoding='utf-8')
for filename in ['landing-audit.json','flow-audit.json','deep-audit.json','final-audit.json','shared-review-audit.json','live-review-audit.json','editorial-audit.json']:
    src=DEV/'review-evidence'/filename
    if src.exists():shutil.copy2(src,DOCS/('review-'+filename))
p=FINAL/'התחילו-כאן.html';s=p.read_text(encoding='utf-8');s=s.replace('<main>','<main><div class="note"><b>'+DONE_LINE+'</b></div>',1);p.write_text(s,encoding='utf-8')
release=json.loads((DEV/'a-release.json').read_text(encoding='utf-8'))
(DOCS/'עדכון-מתחם-הצביעה.json').write_text(json.dumps(release,ensure_ascii=False,indent=2),encoding='utf-8')
(DOCS/'עדכון-מתחם-הצביעה.html').write_text(page('עדכון מתחם הצביעה','<h1>צובעים ומרכיבים! — עדכון 24.9.2026</h1><ul>'+''.join('<li>'+html.escape(t)+'</li>' for t in release['changes'])+'</ul><p>'+html.escape(release['limitation'])+'</p><a class="button" href="../משחקים/a-coloring/index.html">פתיחת המתחם</a>'),encoding='utf-8')
for evidence in ['a-final-audit.json','a-print-audit.json','a-print-pdf-audit.json']:
    shutil.copy2(DEV/'review-evidence'/evidence,DOCS/evidence)
book_release=json.loads((DEV/'b-release.json').read_text(encoding='utf-8'))
(DOCS/'עדכון-מתחם-הסיפור.json').write_text(json.dumps(book_release,ensure_ascii=False,indent=2),encoding='utf-8')
(DOCS/'עדכון-מתחם-הסיפור.html').write_text(page('עדכון מתחם הסיפור','<h1>קוראים ומשחקים! — עדכון 24.9.2026</h1><p>'+html.escape(book_release['storyStatus'])+'</p><ul>'+''.join('<li>'+html.escape(t)+'</li>' for t in book_release['changes'])+'</ul><p>'+html.escape(book_release['limitation'])+'</p><a class="button" href="../משחקים/b-story.html">פתיחת המתחם</a>'),encoding='utf-8')
for evidence in book_release['verification']['evidence']:
    shutil.copy2(DEV/'review-evidence'/evidence,DOCS/evidence)
manifest={str(p.relative_to(FINAL)):hashlib.sha256(p.read_bytes()).hexdigest() for p in FINAL.rglob('*') if p.is_file() and p.name!='manifest-sha256.json'}
(DOCS/'manifest-sha256.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
