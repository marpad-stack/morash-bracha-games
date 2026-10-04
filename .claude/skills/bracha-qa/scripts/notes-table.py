# notes-table.py — בונה את טבלת ההערות האחת מכל המקורות. פלט: qa/טבלת-הערות.md + qa/out/notes.json
import re, os, json, sys, html, glob, datetime
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
D = os.path.join(ROOT, 'מסירה-משחקי-הבאת-ברכה')
OUT = os.path.join(ROOT, 'qa', 'out'); os.makedirs(OUT, exist_ok=True)
IN = os.path.join(ROOT, 'qa', 'in')
rows = []
def add(part, text, source, status, owner, proof=''):
    rows.append({'id': f'N-{len(rows)+1:03d}', 'part': part, 'text': text.strip()[:300], 'source': source, 'status': status, 'owner': owner, 'proof': proof[:400]})
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
# 2. final-review-decisions.json (+ אימות בהרצה מ-qa/out/notes-verification.json, אם קיים)
VERIFIED, VERIFIED_DATE = {}, ''
pv = os.path.join(OUT, 'notes-verification.json')
if os.path.exists(pv):
    jv = json.load(open(pv, encoding='utf-8'))
    VERIFIED, VERIFIED_DATE = jv.get('verification', {}), jv.get('date', '')
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
            proof = f"אושר {dec.get('approvedOn') or '—'} · אומת {dec.get('verifiedOn') or '—'} · {len(dec.get('notes', []))} הערות"
            # אימות בהרצה (qa/out/notes-verification.json): "תוקן" רק עם הוכחה מהרצה/בדיקה חזותית
            if dec['id'] in VERIFIED:
                status, ev = VERIFIED[dec['id']]['status'], VERIFIED[dec['id']]['evidence']
                proof = f"אומת בהרצה {VERIFIED_DATE}: {ev}"
            add(part, f"[{dec['id']}] {dec.get('proposal','')}", 'final-review-decisions.json', status, 'מרפד' if st == 'proposed' else 'קוד', proof)
        for c in v.get('clarifications', []): add(part, 'הבהרה: ' + c, 'final-review-decisions.json', 'כלל תוכן', 'איור/תוכן')
    for g in d.get('globalArtGuidelines', []): add('all', 'כלל איור: ' + g, 'final-review-decisions.json', 'כלל תוכן', 'איור')
# 3. הערות הבודקות (qa/in/): מסמך הגיבוי מדף הבדיקה (86 הערות, 4.10.2026) + פתרונות מ-qa/out/notes86/<חלק>.json
TITLE_PART = [('מתחם הקטנטנים', 'a'), ('צובעים ומרכיבים', 'a'), ('אור הגיע אלינו', 'b'), ('תינוק חדש בבית', 'b'), ('בית המצוות', 'c'), ('הרפתקה בבית', 'c'),
              ('מסע המצוות', 'd'), ('מסע בזמן', 'e'), ('מטבח השבת', 'f'), ('בלש המידות', 'g'), ('תעלומת המתנה', 'g'), ('הכרטיס לאמא', 'h'), ('כרטיס מכל הלב', 'h'),
              ('צעדים ראשונים', 'i'), ('מרווח', 'j')]
RES = {}  # מספר הערה (גם "80.1") -> פתרון
for f in sorted(glob.glob(os.path.join(OUT, 'notes86', '*.json'))):
    try: j = json.load(open(f, encoding='utf-8'))
    except Exception as e: print('אזהרה: לא נקרא', f, e); continue
    for x in j.get('notes', []):
        x = dict(x); x.setdefault('part', j.get('part')); RES[str(x.get('n'))] = x
def parse_backup(raw):
    notes = []
    for art in re.findall(r'<article>(.*?)</article>', raw, re.S):
        art = re.sub(r'<figure>.*?</figure>', '', art, flags=re.S)
        h2 = html.unescape(re.sub(r'<[^>]+>', '', (re.search(r'<h2>(.*?)</h2>', art, re.S) or [None, ''])[1])).strip()
        m = re.match(r'(\d+)\.\s*(.*)', h2)
        if not m: continue
        body = strip(re.sub(r'<h2>.*?</h2>', '', art, flags=re.S))
        lines = [l.strip() for l in body.split('\n') if l.strip()]
        text = lines[0] if lines else ''
        reviewer = next((l.split(':', 1)[1].strip() for l in lines if l.startswith('בודקת:')), '')
        reply = ''
        if 'חני אשכנזי:' in lines:
            k = lines.index('חני אשכנזי:'); reply = ' '.join(l for l in lines[k + 1:] if not l.startswith('מזהה הפריט'))[:200]
        if reviewer == 'חני אשכנזי':  # הערה כללית ארוכה של חני: כל השורות עד שורת "מצב"
            k = next((i for i, l in enumerate(lines) if l.startswith('מצב:')), len(lines)); text = ' / '.join(lines[:k])
        part = next((v for k2, v in TITLE_PART if k2 in m.group(2)), '?')
        notes.append({'n': m.group(1), 'title': m.group(2), 'part': part, 'text': text, 'reviewer': reviewer, 'reply': reply})
    return notes
BACKUP_NOTES = []
for f in glob.glob(os.path.join(IN, '*')):
    if f.endswith('.txt'): continue  # notes-extracted.txt הוא עותק טקסט לעבודת הסוכנים
    try: raw = open(f, encoding='utf-8-sig').read()
    except Exception: continue
    if f.endswith('.json'):
        try:
            j = json.load(open(f, encoding='utf-8'))
            items = j if isinstance(j, list) else j.get('notes') or j.get('items') or []
            for it in items:
                if isinstance(it, dict):
                    add(str(it.get('game') or it.get('part') or '?'), str(it.get('text') or it.get('note') or it)[:300], os.path.basename(f), 'פתוח (מייצוא הבודקות)', 'כותבת/קוד')
        except Exception: pass
    elif '<article>' in raw:
        BACKUP_NOTES = parse_backup(raw); src = os.path.basename(f)
        for nt in BACKUP_NOTES:
            subs = sorted([k for k in RES if k.split('.')[0] == nt['n'] and '.' in k], key=lambda k: [int(x) for x in k.split('.')])
            keys = [nt['n']] if nt['n'] in RES else []
            keys += subs
            base = f"#{nt['n']} ({nt['reviewer']}) {nt['text']}" + (f" ‖ חני: {nt['reply']}" if nt['reply'] and nt['reviewer'] != 'חני אשכנזי' else '')
            if not keys:
                add(nt['part'], base, src, 'פתוח — לא טופל בסבב', 'קוד/כותבת'); continue
            for k in keys:
                x = RES[k]
                label = base if k == nt['n'] else f"#{k} {x.get('summary', '')}"
                owner = {'ממתין לאישור': 'מרפד/כותבת', 'שלב הבא': 'מרפד (שלב הבא)'}.get(x.get('status'), 'קוד')
                proof = (x.get('proof') or '') + (' · שינוי: ' + x['change'] if x.get('change') else '')
                add(x.get('part') or nt['part'], label, src, x.get('status', 'פתוח'), owner, proof)
if not glob.glob(os.path.join(IN, '*')):
    add('all', 'לא נמצא ייצוא של הערות הבודקות (qa/in ריק).', 'מערכת', 'חסר קלט', 'מרפד')
# 4. ממצאי הסוכנים מהריצה הנוכחית
for f in glob.glob(os.path.join(OUT, 'qa-*.json')):
    if f.endswith('qa-notes.json'): continue
    try: j = json.load(open(f, encoding='utf-8'))
    except Exception: continue
    for x in j.get('findings', []):
        if x.get('severity') in ('red', 'yellow'):
            st = x.get('status', 'open')
            done = str(st).startswith(('תוקן', 'fixed'))
            add(x.get('part', '?'), f"[{x.get('id')}] {x.get('title')} — {x.get('location','')}", j.get('agent', os.path.basename(f)), st if done else 'פתוח', x.get('owner', 'קוד'), str((x.get('verified') if done else x.get('evidence')) or '')[:120])
out = {'agent': 'qa-notes', 'run': datetime.datetime.now().isoformat(timespec='seconds'), 'rows': rows}
if VERIFIED: out['verified_overlay'] = {'by': 'qa-notes', 'date': VERIFIED_DATE, 'note': 'סטטוס "תוקן" נקבע רק אחרי הרצה/בדיקה חזותית עם הוכחה; ר׳ qa/out/notes-verification.json'}
json.dump(out, open(os.path.join(OUT, 'notes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
order = ['all', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', '?']
rows.sort(key=lambda r: (order.index(r['part']) if r['part'] in order else 99))
md = ['# טבלת ההערות האחת — הבאת ברכה', f'עודכן: {datetime.date.today().isoformat()} · {len(rows)} שורות' + (' · כולל אימות בהרצה לפי qa/out/notes-verification.json' if VERIFIED else ''), '', '| מזהה | חלק | ההערה | מקור | מצב | מכריע | הוכחה |', '|---|---|---|---|---|---|---|']
for r in rows: md.append(f"| {r['id']} | {r['part']} | {r['text'].replace('|','/')} | {r['source']} | {r['status']} | {r['owner']} | {r['proof'].replace('|','/')} |")
open(os.path.join(ROOT, 'qa', 'טבלת-הערות.md'), 'w', encoding='utf-8').write('\n'.join(md))
import collections
print(f"{len(rows)} שורות · לפי מצב: {dict(collections.Counter(r['status'].split(' —')[0] for r in rows))}")
bk = [r for r in rows if r['source'].startswith('גיבוי-הערות')]
if bk: print(f"הערות הבודקות: {len(BACKUP_NOTES)} הערות → {len(bk)} שורות · {dict(collections.Counter(r['status'] for r in bk))}")
print('נשמר: qa/טבלת-הערות.md, qa/out/notes.json')
