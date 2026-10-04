# notes-table.py — בונה את טבלת ההערות האחת מכל המקורות. פלט: qa/טבלת-הערות.md + qa/out/notes.json
import re, os, json, sys, html, glob, datetime
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
D = os.path.join(ROOT, 'מסירה-משחקי-הבאת-ברכה')
OUT = os.path.join(ROOT, 'qa', 'out'); os.makedirs(OUT, exist_ok=True)
IN = os.path.join(ROOT, 'qa', 'in')
rows = []
def add(part, text, source, status, owner, proof=''):
    rows.append({'id': f'N-{len(rows)+1:03d}', 'part': part, 'text': text.strip()[:300], 'source': source, 'status': status, 'owner': owner, 'proof': proof})
def strip(h):
    h = re.sub(r'<(style|script)[^>]*>.*?</\1>', '', h, flags=re.S)
    h = re.sub(r'<(br|/p|/li|/h[1-6]|/tr|/div|/td)[^>]*>', '\n', h)
    return html.unescape(re.sub(r'<[^>]+>', '', h))
PART_LETTERS = {'א': 'a', 'ב': 'b', 'ג': 'c', 'ד': 'd', 'ה': 'e', 'ו': 'f', 'ז': 'g', 'ח': 'h', 'ט': 'i', 'י': 'j'}
# 1. הערות-תוכן.html — נקודות שלא שונו
p = os.path.join(D, 'מסמכים', 'הערות-תוכן.html')
if os.path.exists(p):
    txt = strip(open(p, encoding='utf-8').read())
    cur = '?'
    for line in [l.strip() for l in txt.split('\n') if l.strip()]:
        m = re.match(r'^חלק ([א-י])[׳\']', line)
        if m: cur = PART_LETTERS.get(m.group(1), '?'); continue
        if line.startswith('התאמת קהל'): cur = 'all'; continue
        if len(line) > 25 and cur != '?':
            owner = 'בדיקה מקצועית' if re.search(r'דמי לידה|ביטוח לאומי|בריאות|מקצועית', line) else ('קוד' if '#' in line or 'קישור' in line else 'כותבת')
            add(cur, line, 'הערות-תוכן.html', 'פתוח', owner)
# 2. final-review-decisions.json
p = os.path.join(ROOT, 'upgraded', 'dev', 'final-review-decisions.json')
if os.path.exists(p):
    d = json.load(open(p, encoding='utf-8'))
    for part, v in d.get('parts', {}).items():
        decs = v.get('decisions', [])
        if not decs:
            add(part, f"מצב החלק: {v.get('status')} — הערות הבודקות על חלק זה טרם הוכרעו (מקור: {d.get('source', {}).get('notes')} הערות בסבב 24.9)", 'final-review-decisions.json', 'פתוח — ממתין להכרעה משותפת', 'מרפד + כותבת')
        for dec in decs:
            st = dec.get('status')
            status = {'implemented': 'תוקן — ' + ('אומת' if dec.get('verifiedOn') else 'לא אומת'), 'proposed': 'הצעה — לא אושרה', 'informational': 'לידיעה'}.get(st, st)
            add(part, f"[{dec['id']}] {dec.get('proposal','')}", 'final-review-decisions.json', status, 'מרפד' if st == 'proposed' else 'קוד', f"אושר {dec.get('approvedOn') or '—'} · אומת {dec.get('verifiedOn') or '—'} · {len(dec.get('notes', []))} הערות")
        for c in v.get('clarifications', []): add(part, 'הבהרה: ' + c, 'final-review-decisions.json', 'כלל תוכן', 'איור/תוכן')
    for g in d.get('globalArtGuidelines', []): add('all', 'כלל איור: ' + g, 'final-review-decisions.json', 'כלל תוכן', 'איור')
# 3. ייצוא הערות מדף הבדיקה (qa/in/*.html|*.json) — טקסט גולמי, ממופה לפי חלק כשמזוהה
for f in glob.glob(os.path.join(IN, '*')):
    try:
        raw = open(f, encoding='utf-8').read()
    except Exception: continue
    if f.endswith('.json'):
        try:
            j = json.load(open(f, encoding='utf-8'))
            items = j if isinstance(j, list) else j.get('notes') or j.get('items') or []
            for it in items:
                if isinstance(it, dict):
                    add(str(it.get('game') or it.get('part') or '?'), str(it.get('text') or it.get('note') or it)[:300], os.path.basename(f), 'פתוח (מייצוא הבודקות)', 'כותבת/קוד')
        except Exception: pass
    else:
        for line in [l.strip() for l in strip(raw).split('\n') if len(l.strip()) > 30][:400]:
            add('?', line, os.path.basename(f), 'פתוח (מייצוא הבודקות)', 'כותבת/קוד')
if not glob.glob(os.path.join(IN, '*')):
    add('all', 'לא נמצא ייצוא של הערות הבודקות (qa/in ריק). ההערות על חלקים c–j נמצאות רק בשירות הסקירה — יש להוריד "מסמך גיבוי" מדף בדיקה-סופית ולשמור ב-qa/in/', 'מערכת', 'חסר קלט', 'מרפד')
# 4. ממצאי הסוכנים מהריצה הנוכחית
for f in glob.glob(os.path.join(OUT, 'qa-*.json')):
    if f.endswith('qa-notes.json'): continue
    try: j = json.load(open(f, encoding='utf-8'))
    except Exception: continue
    for x in j.get('findings', []):
        if x.get('severity') in ('red', 'yellow'):
            add(x.get('part', '?'), f"[{x.get('id')}] {x.get('title')} — {x.get('location','')}", j.get('agent', os.path.basename(f)), 'פתוח', x.get('owner', 'קוד'), x.get('evidence', '')[:120])
json.dump({'agent': 'qa-notes', 'run': datetime.datetime.now().isoformat(timespec='seconds'), 'rows': rows}, open(os.path.join(OUT, 'notes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
order = ['all', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', '?']
rows.sort(key=lambda r: (order.index(r['part']) if r['part'] in order else 99))
md = ['# טבלת ההערות האחת — הבאת ברכה', f'עודכן: {datetime.date.today().isoformat()} · {len(rows)} שורות', '', '| מזהה | חלק | ההערה | מקור | מצב | מכריע | הוכחה |', '|---|---|---|---|---|---|---|']
for r in rows: md.append(f"| {r['id']} | {r['part']} | {r['text'].replace('|','/')} | {r['source']} | {r['status']} | {r['owner']} | {r['proof'].replace('|','/')} |")
open(os.path.join(ROOT, 'qa', 'טבלת-הערות.md'), 'w', encoding='utf-8').write('\n'.join(md))
import collections
print(f"{len(rows)} שורות · לפי מצב: {dict(collections.Counter(r['status'].split(' —')[0] for r in rows))}")
print('נשמר: qa/טבלת-הערות.md, qa/out/notes.json')
