# notes-verification-overlay.py — מחיל את תוצאות האימות בהרצה על qa/out/notes.json ומחולל מחדש qa/טבלת-הערות.md. להריץ אחרי notes-table.py.
import json, datetime, collections, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
today = datetime.date.today().isoformat()
V = {
 'a-repair-art': ('תוקן — אומת חלקית', 'מסגרת "תעודה" בציור "שמיכה חמה לאח הקטן" נראית בגלריה (a-final-gallery-1440 בסנדבוקס); פנים תינוק/מזוזה/הפרדת ידי ההורים לא נבדקו בגודל מלא'),
 'a-remove-stroller': ('תוקן — אומת', 'אין "בבית הכנסת עם העגלה" ברשימת 19 הכותרות (כל-הטקסטים.txt); verify-a-final: rejected pages removed'),
 'a-expand-art': ('תוקן — אומת', 'הגלריה: 19 כרטיסים; ששת הציורים (14–19) ברשימה; verify-a-final: מילוי צבע לפי מספר ב-10 ציורים חדשים/ערוכים'),
 'a-games': ('תוקן — אומת', 'verify-a-final: זיכרון 4/6/12, מציאת חפץ 6/8/10 ללא שעון כברירת מחדל, טיימר אופציונלי'),
 'a-presentation': ('תוקן — אומת', 'Grep: "בלחיצה על ＋ הציור שלכם יתווסף לחוברת. את החוברת תוכלו להדפיס לאחר מכן." ב-a-coloring/index.html; גלריה 320/390/1440 ללא גלישה; בחירת "צבעים חיים" קיימת'),
 'b-presentation': ('תוקן — אומת', 'דפדוף 28 עמודים, סימנייה נשמרת ברענון, תוכן עניינים נסגר, הדפסת חוברת 28 עמודי A4 (func-b-*)'),
 'b-art': ('תוקן — אומת חלקית', 'שולחן שבת: שני פמוטים גדולים+שניים קטנים, גביע ללא רגל, בקבוק יין, חלה (art-*-shabbat.png). התיקונים בעמודים 2, 8, 36 לא אומתו בנפרד — מספור העמודים השתנה למהדורת 28/17 כפולות'),
 'b-memory': ('תוקן — אומת', 'רמות 1–3 נפתחות (6/12/16 קלפים); verify-b-variants: זיכרון חני מושלם בשמונה זוגות'),
 'b-retired': ('תוקן — אומת', 'תפריט המשחקים: 6 פעילויות; "משחק השקט" ו"פרצופים" לא מופיעים'),
 'b-dress': ('תוקן — אומת', 'הרצה: 4 פריטים הונחו → "לבשתם 4 מתוך 4" ו"התינוק לבוש ומוכן!"; אזורי הלבשה עם role=button/aria-label'),
 'b-lights': ('תוקן — אומת', 'הרצה עם "רמז לצעד הבא" → "כל האורות כבויים. לילה טוב!" (func-b-quiet-after.png)'),
 'b-needs': ('תוקן — אומת', 'הרצה: שלושת החפצים, תגובה שונה לכל אחד, "גיליתם את כל החפצים!"'),
 'b-story-manuscript': ('תוקן — אומת', 'verify-painted-book/verify-b-variants: שני הספרים, "every word once"; זהות אותיות מנוקד/רגיל (11 קטעי book)'),
 'b-image-files': ('תוקן — אומת חלקית (מיושן: 40 עמודים; בפועל 28)', 'תמונות נטענות מקבצים; גיבוי טקסט כשהאיור חסר (verify-b-variants) — אך ההחלטה מציינת 40 עמודים והמהדורה הנוכחית 28'),
 'brit-clothing': ('תוקן — אומת חלקית', 'כפולת הברית בספר (art-mendy-brit.png, art-chani-brit.png): אב בטלית מעל סרטוק, שאר הגברים בחליפות וכובעים; "דף צביעה 17" לא נבדק'),
 'b-grandmother-storybook': ('תוקן — אומת', 'כפולה 2: סבתא עם שיער שחור (פאה); כפולה 10: ספר סיפורים מאויר פתוח'),
}
n = json.load(open(f'{ROOT}/qa/out/notes.json', encoding='utf-8'))
chg = []
for r in n['rows']:
    if r['source'] == 'final-review-decisions.json' and r['text'].startswith('['):
        did = r['text'][1:r['text'].index(']')]
        if did in V:
            old = r['status']; r['status'], ev = V[did]
            r['proof'] = f'אומת בהרצה {today}: {ev}'
            chg.append((r['id'], did, old, r['status']))
n['verified_overlay'] = {'by': 'qa-notes', 'date': today, 'note': 'סטטוס "תוקן" נקבע רק אחרי הרצה/בדיקה חזותית עם הוכחה; ר׳ qa/out/notes-verification.json'}
json.dump(n, open(f'{ROOT}/qa/out/notes.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump({'date': today, 'verification': {k: {'status': v[0], 'evidence': v[1]} for k, v in V.items()}}, open(f'{ROOT}/qa/out/notes-verification.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
# regenerate md exactly like notes-table.py
rows = n['rows']
order = ['all', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', '?']
rows.sort(key=lambda r: (order.index(r['part']) if r['part'] in order else 99))
md = ['# טבלת ההערות האחת — הבאת ברכה', f'עודכן: {today} · {len(rows)} שורות · כולל אימות בהרצה לפי qa/out/notes-verification.json', '', '| מזהה | חלק | ההערה | מקור | מצב | מכריע | הוכחה |', '|---|---|---|---|---|---|---|']
for r in rows: md.append(f"| {r['id']} | {r['part']} | {r['text'].replace('|','/')} | {r['source']} | {r['status']} | {r['owner']} | {r['proof'].replace('|','/')} |")
open(f'{ROOT}/qa/טבלת-הערות.md', 'w', encoding='utf-8').write('\n'.join(md))
for c in chg: print(c)
cnt = collections.Counter(r['status'].split(' —')[0] for r in rows)
print(cnt)
by = collections.defaultdict(collections.Counter)
for r in rows:
    if r['status'].startswith(('פתוח', 'הצעה', 'חסר')): by[r['owner']][r['status'].split(' —')[0]] += 1
for o, c in sorted(by.items(), key=lambda x: -sum(x[1].values())): print(o, sum(c.values()), dict(c))
