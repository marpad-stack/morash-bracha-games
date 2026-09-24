"""Local owner report from live notes. Private note text stays outside the public package."""
from pathlib import Path
from html import escape as esc
from collections import Counter
import json

DEV=Path(__file__).resolve().parent
OUT=DEV/'review-evidence'
source=json.loads((OUT/'current-notes-audit.json').read_text(encoding='utf-8'))
inventory={n['id']:n for n in json.loads((OUT/'review-inventory-2026-09-24.json').read_text(encoding='utf-8'))['notes']}
decisions=json.loads((DEV/'final-review-decisions.json').read_text(encoding='utf-8'))
lookup={nid:d for part in decisions['parts'].values() for d in part['decisions'] for nid in d.get('notes',[])}
names=dict(zip('abcdefghij',['צובעים ומרכיבים!','תינוק חדש בבית? קוראים ומשחקים!','הרפתקה בבית!','מסע המצוות','מסע בזמן','מטבח השבת','תעלומת המתנה','כרטיס מכל הלב','צעדים ראשונים','מרווח']))
labels={'implemented':'בוצע — למעבר שלך','partial':'בוצע בחלקו','proposed':'הצעה שטרם בוצעה','informational':'משוב כללי','awaiting_user_manuscript':'ממתין לנוסח החדש','awaiting_joint_review':'פתוח למעבר משותף','technical_pending':'תיקון טכני קיים — לבדיקה חוזרת'}
next_steps={
'c':'להתאים את חמשת המשחקים לשלוש רמות גיל; לתקן אייקונים ורמז; לגוון צורות; לשפר את האתגר; לבדוק התחלה מחדש ולהסתיר פתרונות מהמסך.',
'd':'להבהיר בנייה והתקדמות, להחליט על שחקן יחיד, להציג את כל המבנים, להרחיב אביזרים ולבוש, לתקן ניסוחים וניקוד ולהכריע בשאלה ההלכתית שסומנה.',
'e':'לאמת גלילה במחשב ובטלפון; להבהיר קימה מול נטילת ידיים, להתאים ניסוחים לגיל, לשנות אייקונים ולהמחיש פעולות; להוסיף חזרה לתפריט בסיום.',
'f':'לשנות ל״המטבח היהודי״; לשפר את הלישה, הקליעה, החלה והשומשום; לעצב מטבח מואר, להוסיף קולות וגרירת דלת תנור, ולהבהיר הוראות.',
'g':'להבהיר פתיחה והוראות; לתאם סיפור חינוכי ושמות אחידים; להחביא רמזים טוב יותר, להציג סיווג עדויות מבחוץ ולהסיר קונפטי בפתיחת עדות.',
'h':'להוסיף ברכה אישית, מדבקות ומסגרות; לבדוק גודל, סיבוב וסידור; להבהיר ציור וצבעים ולהבליט בחירת ניקוד.',
'i':'לתקן ניסוחים בפנייה לאם, מועד קריאת שם, ביגוד, כפתורים וקישורים ישירים; להשלים בדיקת תוכן וקישורים; לאמת כתיבת רשימות בשורות.',
'j':'לשנות כותרות וניסוח; להפריד בין שיחה זוגית לבין טיפים תחת ״מחזקת את עצמי״.'}
rows=[]
for number,n in enumerate(source['notes'],1):
    prior=inventory.get(n['id'],{})
    game=prior.get('game','general')
    decision=lookup.get(n['id'])
    if decision:
        state=decision['status'];result=decision['proposal']
    else:
        state='technical_pending' if prior.get('codeChangeFound') else 'awaiting_joint_review'
        result=('בתיעוד הסקירה נמצא תיקון טכני קודם. הוא אינו אישור סופי שהבקשה מולאה; נדרשת בדיקה בפועל מול ההערה.' if state=='technical_pending' else 'ההערה נשמרה. טרם נסגרה בסבב התיקונים הנוכחי.')
    if number==16:
        state='partial';result='נבנה חיפוש חפץ בין שלוש תמונות, עם שעון שאפשר להפעיל ולכבות. מנגינת המתח לא נוספה; יש לבדוק יחד אם נדרשת גם בחירה ידנית במשך השעון.'
    if number==68:state='informational';result='משוב חיובי על רמת האתגר; אינו תיקון לביצוע.'
    rows.append(dict(number=number,game=game,note=n,state=state,result=result))

style='''body{margin:0;background:#f6f3eb;color:#24494a;font:17px/1.8 Arial,sans-serif}main{max-width:1120px;margin:auto;padding:28px}h1{font-size:36px;line-height:1.25}h2{margin-top:32px}p{max-width:85ch}a{color:#116e70}button,select,input{font:inherit;padding:10px 14px;border:1px solid #b7c6ba;border-radius:10px;background:white;color:inherit}button{cursor:pointer}nav{display:flex;flex-wrap:wrap;gap:10px;position:sticky;top:0;background:#f6f3eb;padding:12px 0;z-index:2}nav input{flex:1;min-width:180px}article,.intro{background:#fffdf7;border:1px solid #dedfce;border-radius:16px;padding:20px;margin:16px 0}article h3{font-size:20px;line-height:1.4;margin:5px 0}blockquote{margin:16px 0;padding:12px 18px;border-right:4px solid #c9af76;white-space:pre-wrap;background:#f7f4ec}.status{font-weight:bold}.meta{font-size:13px;color:#5f736d}.implemented .status{color:#1c7061}.partial .status,.technical_pending .status{color:#866019}.result{white-space:pre-wrap}.next{background:#edf1e8;padding:14px 18px;border-radius:12px}table{border-collapse:collapse;width:100%}td,th{padding:12px;border-bottom:1px solid #ddd;text-align:right;vertical-align:top}th{background:#e7ede1}[hidden]{display:none!important}@media(max-width:600px){main{padding:16px}h1{font-size:28px}article{padding:15px}nav{position:static}td,th{padding:8px;font-size:14px}}@media print{body{background:white;font-size:11pt}main{padding:0}nav,.no-print{display:none!important}article{break-inside:avoid;box-shadow:none}a{color:inherit;text-decoration:none}h2{break-after:avoid}}'''
body=['<h1>מה ביקשו הכותבות ומה בוצע</h1><p>צילום מצב ל־24.9.2026 · 86 הערות ו־4 תגובות שנקראו מאתר ההערות המשותף.</p>',
'<section class="intro"><p><b>הערות הכותבות נשמרו במלואן.</b> המצב המופיע כאן הוא מצב הביצוע בפרויקט, ולא סימון של הכותבות שהן אישרו את הגרסה הסופית. כל 86 ההערות עדיין מסומנות כפתוחות במערכת המשותפת; לא שיניתי אותן.</p><p>במתחמים א׳ וב׳ בוצעו שינויים ונשמרו בדיקות. המשחקים ג׳–י׳ עדיין מחכים למעבר משותף: בחלקם קיימים תיקונים טכניים קודמים, אך אין להסיק מכך שכל בקשות הכותבות הושלמו.</p><p>נוסח הסיפור הישן נשאר באתר. הוכנה <a href="הסיפור-נוסח-מוצע.html">טיוטת סיפור מלאה לעיונך</a>, עם יותר מקום לרגשות הילד ולתמיכה של ההורים. לא נבנתה עדיין גרסת בת. מוזיקת רקע ומחולל צביעה מתמונה אישית לא נוספו.</p></section>',
'<nav aria-label="סינון ההערות"><label>מתחם <select id="game"><option value="">הכול</option>'+''.join('<option value="'+k+'">'+esc(v)+'</option>' for k,v in names.items())+'</select></label><label>מצב <select id="state"><option value="">הכול</option>'+''.join('<option value="'+k+'">'+esc(v)+'</option>' for k,v in labels.items())+'</select></label><input id="search" aria-label="חיפוש בהערות" placeholder="חיפוש במילים שלך"><button onclick="window.print()">הדפסה / שמירה ל־PDF</button></nav><p id="count" role="status"></p>',
'<section class="intro"><h2>הבקשות האחרונות שלך</h2><p>הסבתא עודכנה לפאה שחורה עם מראה מבוגר בעמודים 4, 6, 12, 14 ו־28. בעמוד 36 הספר שבידי האם והילד הוחלף לספר סיפורים מאויר, והדפים פונים לכיוון הקריאה של האם והילד. נוסף לוגו שחור קטן בצד בכל עמוד ספר ובתוצרי ההדפסה. התיקונים האלה הם תוספות שלך לסבב הכותבות.</p><p>איורים חסרים: בבדיקה לפני העדכון ארבע תמונות (14, 22, 24, 25) הוחלפו ברשת בתמונות זעירות וריקות. כל 40 התמונות תקינות מקומית ובחבילת ההורדה. הדוח של האתר החי קובע כמה עדיין חסרות לאחר העדכון; טיפול בבעיה אינו סגור כל עוד האיורים אינם נראים.</p></section>']
plain=['מה ביקשו הכותבות ומה בוצע — 24.9.2026','המצבים הם מעקב ביצוע, ולא אישור סופי של הכותבות.']
for game,title in names.items():
    body.append('<section class="game-section" data-section="'+game+'"><h2>'+esc(title)+'</h2>')
    if game in next_steps:body.append('<p class="next">'+esc(next_steps[game])+'</p>')
    plain+=['',title]
    for r in rows:
        if r['game']!=game:continue
        n=r['note'];label=labels[r['state']]
        body.append('<article class="'+r['state']+'" data-game="'+game+'" data-state="'+r['state']+'"><div class="meta">הערה '+str(r['number'])+' · '+esc(n['reviewer'])+'</div><h3>'+esc((n.get('target') or 'הערה כללית')[:110])+'</h3><p class="status">'+esc(label)+'</p><blockquote>'+esc(n['comment'])+'</blockquote>'+''.join('<p>תגובה: '+esc(x['comment'])+'</p>' for x in n.get('replies',[]))+'<p class="result"><b>המצב בפרויקט:</b> '+esc(r['result'])+'</p><div class="meta">מזהה הערה: '+esc(n['id'])+'</div></article>')
        plain+=['',str(r['number'])+'. '+n['comment'],*['תגובה: '+x['comment'] for x in n.get('replies',[])],label+': '+r['result']]
    body.append('</section>')
assert len(rows)==sum(1 for r in rows if r['game'] in names)==86
script='''const game=document.getElementById('game'),state=document.getElementById('state'),search=document.getElementById('search');function filter(){let count=0;document.querySelectorAll('article').forEach(a=>{a.hidden=!!((game.value&&a.dataset.game!==game.value)||(state.value&&a.dataset.state!==state.value)||(search.value&&!a.textContent.includes(search.value)));if(!a.hidden)count++});document.querySelectorAll('.game-section').forEach(s=>s.hidden=![...s.querySelectorAll('article')].some(a=>!a.hidden));document.getElementById('count').textContent='מוצגות '+count+' מתוך 86 הערות'}[game,state,search].forEach(e=>e.addEventListener('input',filter));filter();'''
style+=(DEV/'print-footer.css').read_text(encoding='utf-8')+'@media print{@page{size:A4;margin:15mm}}'
logo=(DEV/'assets/morash-logo-black.svg').read_text(encoding='utf-8')
body=['<table class="morash-print-table"><tbody><tr><td>']+body+['</td></tr></tbody><tfoot><tr><td><div class="morash-print-brand">'+logo+'</div></td></tr></tfoot></table>']
(OUT/'סיכום-הערות-הכותבות.html').write_text('<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>הערות הכותבות — מצב ביצוע</title><style>'+style+'</style><main>'+''.join(body)+'</main><script>'+script+'</script></html>',encoding='utf-8')
(OUT/'סיכום-הערות-הכותבות.txt').write_text('\n'.join(plain),encoding='utf-8-sig')
print(json.dumps({'notes':len(rows),'states':dict(Counter(r['state'] for r in rows))},ensure_ascii=False))
