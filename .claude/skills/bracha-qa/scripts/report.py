# report.py — מאחד את כל תוצרי qa/out ל-qa/דוח-בדיקות.html (דף אחד, עברית, טלפון ומחשב)
import os, json, glob, html, datetime, sys, collections
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
OUT = os.path.join(ROOT, 'qa', 'out')
NAMES = {'a':'א · מתחם הקטנטנים','b':'ב · אור הגיע אלינו','c':'ג · בית המצוות','d':'ד · מסע המצוות','e':'ה · מסע בזמן','f':'ו · מטבח השבת','g':'ז · בלש המידות','h':'ח · הכרטיס לאמא','i':'ט · צעדים ראשונים','j':'י · מרווח','L':'דף הבאת ברכה','all':'כללי','?':'לא משויך'}
def load(name):
    p = os.path.join(OUT, name)
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else None
smoke = load('smoke-results.json'); axe = load('axe-results.json'); inv = load('inventory.json'); notes = load('notes.json')
findings = []
for f in sorted(glob.glob(os.path.join(OUT, 'qa-*.json'))):
    try: j = json.load(open(f, encoding='utf-8'))
    except Exception: continue
    for x in j.get('findings', []): x['agent'] = j.get('agent', os.path.basename(f)); findings.append(x)
# ממצאים אוטומטיים מתוך smoke ו-axe
def auto(part, sev, typ, title, loc, ev, prop, owner='קוד', agent='smoke'):
    findings.append({'id': f'{agent.upper()}-{len(findings)+1:03d}', 'part': part, 'severity': sev, 'type': typ, 'title': title, 'location': loc, 'evidence': ev, 'proposal': prop, 'owner': owner, 'status': 'open', 'agent': agent})
if smoke:
    byid = collections.defaultdict(list)
    for r in smoke['results']: byid[r['id']].append(r)
    for pid, rs in byid.items():
        errs = collections.Counter(e for r in rs for e in r['errors'] if '403' not in e and 'ERR_' not in e and 'net::' not in e)
        for e, c in errs.items(): auto(pid, 'red', 'JS', 'שגיאת JavaScript', f'{c} מופעים', e[:200], 'לתקן את הקוד')
        failed = collections.Counter(f for r in rs for f in r['failed'])
        for f, c in failed.items(): auto(pid, 'red' if '404' in f else 'yellow', 'משאבים', 'משאב לא נטען', f[:150], f'{c} מופעים', 'לבדוק נתיב/קובץ')
        if any(r.get('hOverflow') for r in rs): auto(pid, 'red', 'פריסה', 'גלילה אופקית', ', '.join(str(r['width']) for r in rs if r.get('hOverflow')), '', 'לתקן רוחב אלמנט')
        r390 = next((r for r in rs if r['width'] == 390), None)
        if r390:
            if r390.get('brokenImgs'): auto(pid, 'red', 'תמונות', 'תמונות שבורות', ', '.join(r390['brokenImgs'][:5]), '', 'לבדוק קבצים')
            if r390.get('smallTargets'): auto(pid, 'yellow', 'מגע', f"{len(r390['smallTargets'])} אזורי מגע קטנים מ-40px", '; '.join(f"{t['t']} {t['w']}×{t['h']}" for t in r390['smallTargets'][:5]), '', 'להגדיל ל-44px')
            if r390.get('fatal'): auto(pid, 'red', 'טעינה', 'העמוד לא נטען', r390['fatal'][:150], '', 'לבדוק')
            if r390.get('navigations'): auto(pid, 'info', 'ניווט', 'לחיצה הובילה לניווט', ', '.join(r390['navigations'][:3]), '', 'לוודא שזה מכוון')
            if r390.get('dialogs'): auto(pid, 'info', 'דיאלוג', 'דיאלוג מקורי נפתח בלחיצה', '; '.join(r390['dialogs'][:3]), '', '')
    # גלילה אנכית (גלגלת/מגע) ו-WebKit
    for r in smoke['results']:
        sc = r.get('scroll') or {}
        if sc.get('needed') and (sc.get('wheel') is False or sc.get('touch') is False):
            auto(r['id'], 'red', 'גלילה', 'גלילה אנכית לא עובדת', f"{r['width']}px · גלגלת={sc.get('wheel')} מגע={sc.get('touch')}", f"פער {sc.get('gap')}px", 'לבדוק overflow/touch-action/preventDefault')
    wk = smoke.get('webkit') or {}
    if not wk.get('available'):
        auto('all', 'info', 'סביבה', 'WebKit לא זמין בסביבת הבדיקה — בדיקת הטלפון רצה בכרום עם אמולציית iPhone 13', 'smoke.cjs', (wk.get('reason') or '')[:150], 'להריץ במחשב עם WebKit (npx playwright install webkit) או בטלפון פיזי', 'אנושי-טלפון')
    else:
        for r in wk.get('results', []):
            if r.get('errors') or r.get('hOverflow') or r.get('fatal'):
                auto(r['id'], 'red', 'WebKit', 'תקלה ב-WebKit ברוחב טלפון', f"iPhone 13 · שגיאות={len(r.get('errors', []))} גלילה-אופקית={r.get('hOverflow')}", '; '.join(r.get('errors', [])[:2])[:200], 'לשחזר ב-Safari')
if axe:
    merged = {}
    for r in axe['results']:
        for v in r['violations']:
            key = (r['id'], v['id'])
            m = merged.setdefault(key, {'v': v, 'widths': [], 'nodes': 0})
            m['widths'].append(str(r['width'])); m['nodes'] = max(m['nodes'], v['nodes'])
    for (pid, vid), m in merged.items():
        v = m['v']
        sev = 'red' if v['impact'] in ('critical', 'serious') else 'yellow'
        if v['id'] in ('region', 'landmark-one-main'): sev = 'info'
        auto(pid, sev, 'נגישות', f"{v['id']} — {v['help']}", f"{'/'.join(m['widths'])}px · {', '.join(v.get('samples', [])[:2])}", f"{m['nodes']} אלמנטים · {v['impact']}", 'ראו checklist-a11y.md', 'קוד', 'axe')
# רמזור לכל חלק
parts = ['a','b','c','d','e','f','g','h','i','j','L']
def light(pid):
    fs = [f for f in findings if f.get('part') == pid]
    if any(f['severity'] == 'red' for f in fs): return 'red'
    if any(f['severity'] == 'yellow' for f in fs): return 'yellow'
    return 'green'
sev_he = {'red': 'אדום', 'yellow': 'צהוב', 'green': 'ירוק', 'info': 'לידיעה'}
e = html.escape
def row(f):
    return f"<tr class='sev-{f.get('severity','info')} part-{e(str(f.get('part','?')))}'><td>{e(str(f.get('id','')))}</td><td>{e(NAMES.get(f.get('part'), str(f.get('part'))))}</td><td><span class='dot {f.get('severity','info')}'></span>{sev_he.get(f.get('severity'),'')}</td><td>{e(str(f.get('type','')))}</td><td><b>{e(str(f.get('title','')))}</b><div class='sub'>{e(str(f.get('location','')))}</div><div class='ev'>{e(str(f.get('evidence',''))[:220])}</div></td><td>{e(str(f.get('proposal','')))}</td><td>{e(str(f.get('owner','')))}</td><td>{e(str(f.get('agent','')))}</td></tr>"
sev_order = {'red': 0, 'yellow': 1, 'info': 2, 'green': 3}
findings.sort(key=lambda f: (sev_order.get(f.get('severity'), 9), str(f.get('part'))))
counts = collections.Counter(f.get('severity') for f in findings)
humans = [f for f in findings if f.get('owner') not in ('קוד', '') and f.get('severity') in ('red', 'yellow')]
env = smoke.get('base', '') if smoke else ''
weights = {r['id']: r['bytesKB'] for r in axe['results'] if r['width'] == 390} if axe else {}
lights = ''.join(f"<div class='card'><span class='dot {light(p)}'></span><div><b>{e(NAMES[p])}</b><div class='sub'>{('%d KB בטעינה' % weights[p]) if p in weights else ''}</div></div></div>" for p in parts if any(f.get('part') == p for f in findings) or p in weights)
notes_rows = ''
if notes:
    for r in notes['rows']:
        notes_rows += f"<tr><td>{e(r['id'])}</td><td>{e(NAMES.get(r['part'], r['part']))}</td><td>{e(r['text'])}</td><td>{e(r['source'])}</td><td>{e(r['status'])}</td><td>{e(r['owner'])}</td><td class='sub'>{e(r['proof'])}</td></tr>"
DOD = ['אפס שגיאות JavaScript ואפס משאבים חסרים בכל חלק, בשלושה רוחבים', 'סקריפט הסקירה החיצוני וקוד ההערות הוסרו מקובצי הפרודקשן', 'אין קישורי # — כל יעד קיים', 'ממצאי נגישות critical/serious סגורים; חסימת זום הוסרה', 'שם אחד לכל חלק: כרטיס = title = h1', 'כל הערות הבודקות (a–j) הוכרעו ותועדו בטבלה; "תוקן" רק אחרי אימות', 'תוכן: הגהת ספר וניקוד אושרה ע"י עורכת הלשון; שאלות יהדות הוכרעו ע"י הכותבת/רב; מידע ט׳ אושר מקצועית', 'בדיקה בטלפון פיזי (iPhone + Android) לפי צ\'קליסט הטלפון, כולל הדפסה ושיתוף', 'שילוב באתר החי אומת: שער ליולדות, אותו דומיין, iframe/מסך מלא, חזרה לאתר', 'החלטה על הריפו הציבורי / GitHub Pages אחרי ההעלאה']
dod = ''.join(f"<li>{e(x)}</li>" for x in DOD)
page = f"""<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>דוח בדיקות · הבאת ברכה</title>
<style>
:root{{--bg:#fbf7ef;--ink:#23383a;--muted:#5f7375;--line:#e4dccb;--teal:#0e8599;--coral:#e0705b;--gold:#e5b83a;--card:#fff;--red:#c94a3d;--yellow:#d9a520;--green:#3f9a6b;--info:#7a8fa0;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}
@media (prefers-color-scheme:dark){{:root:not([data-theme=light]){{--bg:#151b1c;--ink:#ecebe4;--muted:#a9b6b6;--line:#2c3739;--card:#1d2526}}}}
:root[data-theme=dark]{{--bg:#151b1c;--ink:#ecebe4;--muted:#a9b6b6;--line:#2c3739;--card:#1d2526}}
html{{scroll-padding-top:env(safe-area-inset-top,0px)}}body{{margin:0;background:var(--bg);color:var(--ink);font-family:Heebo,Assistant,Arial,sans-serif;line-height:1.55}}
main{{max-width:1100px;margin:0 auto;padding:18px 14px 60px}}h1{{font-size:1.6rem;margin:.2rem 0}}h2{{font-size:1.15rem;margin:1.6rem 0 .5rem;border-bottom:2px solid var(--line);padding-bottom:4px}}
.meta{{color:var(--muted);font-size:.9rem}}.cards{{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px;margin-top:10px}}.card{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px;display:flex;gap:10px;align-items:center}}
.dot{{display:inline-block;width:12px;height:12px;border-radius:50%;margin-inline-end:6px;vertical-align:middle;flex:none}}.dot.red{{background:var(--red)}}.dot.yellow{{background:var(--yellow)}}.dot.green{{background:var(--green)}}.dot.info{{background:var(--info)}}
.sum{{display:flex;gap:14px;flex-wrap:wrap;margin:10px 0}}.sum span{{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px 12px}}
.wrap{{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--card)}}table{{border-collapse:collapse;width:100%;min-width:760px;font-size:.88rem}}th,td{{padding:8px 9px;border-bottom:1px solid var(--line);vertical-align:top;text-align:right}}th{{background:var(--bg);position:sticky;top:0}}
.sub{{color:var(--muted);font-size:.8rem}}.ev{{color:var(--muted);font-size:.78rem;font-family:ui-monospace,Menlo,monospace;direction:ltr;text-align:left;word-break:break-all}}
.filters{{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}}.filters button{{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:5px 12px;font:inherit;cursor:pointer}}.filters button.on{{background:var(--teal);color:#fff;border-color:var(--teal)}}
ul.dod li{{margin:4px 0}}.note{{background:var(--card);border:1px solid var(--line);border-inline-start:4px solid var(--gold);border-radius:10px;padding:10px 12px;margin:10px 0}}
</style></head><body><main>
<h1>דוח בדיקות · הבאת ברכה</h1>
<div class="meta">הופק {datetime.datetime.now().strftime('%d.%m.%Y %H:%M')} · סביבה: {e(env) or 'לא ידוע'} · {len(findings)} ממצאים</div>
<div class="sum"><span><span class="dot red"></span>אדום {counts.get('red',0)}</span><span><span class="dot yellow"></span>צהוב {counts.get('yellow',0)}</span><span><span class="dot info"></span>לידיעה {counts.get('info',0)}</span></div>
<div class="cards">{lights}</div>
<div class="note">חסימות סביבה (Google Fonts, chatgpt.site, morash.co.il ב-403) אינן ממצאים; הן מסוננות מהטבלה. בדיקת קישורים חיצוניים נדרשת בסביבה עם אינטרנט.</div>
<h2>ממצאים</h2>
<div class="filters" id="f"><button class="on" data-s="all">הכול</button><button data-s="red">אדום</button><button data-s="yellow">צהוב</button><button data-s="info">לידיעה</button>{''.join(f'<button data-p="{p}">{e(NAMES[p].split(" · ")[0])}</button>' for p in parts if any(f.get("part")==p for f in findings))}</div>
<div class="wrap"><table id="t"><thead><tr><th>מזהה</th><th>חלק</th><th>חומרה</th><th>סוג</th><th>ממצא</th><th>הצעה</th><th>מכריע</th><th>סוכן</th></tr></thead><tbody>{''.join(row(f) for f in findings)}</tbody></table></div>
<h2>מה נשאר לאדם</h2>
<div class="wrap"><table><thead><tr><th>מכריע</th><th>ממצא</th><th>חלק</th></tr></thead><tbody>{''.join(f"<tr><td><b>{e(str(f.get('owner')))}</b></td><td>{e(str(f.get('title')))}<div class='sub'>{e(str(f.get('proposal','')))}</div></td><td>{e(NAMES.get(f.get('part'),str(f.get('part'))))}</td></tr>" for f in humans) or '<tr><td colspan=3>—</td></tr>'}</tbody></table></div>
<h2>טבלת ההערות האחת ({len(notes['rows']) if notes else 0})</h2>
<div class="wrap"><table><thead><tr><th>מזהה</th><th>חלק</th><th>ההערה</th><th>מקור</th><th>מצב</th><th>מכריע</th><th>הוכחה</th></tr></thead><tbody>{notes_rows or '<tr><td colspan=7>הריצו notes-table.py</td></tr>'}</tbody></table></div>
<h2>הגדרת "גמור" לפרסום</h2><ul class="dod">{dod}</ul>
<div class="meta">קבצי המקור: qa/out/*.json · צילומי מסך: qa/out/&lt;חלק&gt;-390.png, -1440.png</div>
</main><script>
(function(){{var s='all',p='';var bs=document.querySelectorAll('#f button');bs.forEach(function(b){{b.onclick=function(){{if(b.dataset.s){{s=b.dataset.s;bs.forEach(function(x){{if(x.dataset.s)x.classList.toggle('on',x===b)}})}}else{{p=(p===b.dataset.p)?'':b.dataset.p;bs.forEach(function(x){{if(x.dataset.p)x.classList.toggle('on',x.dataset.p===p)}})}}
document.querySelectorAll('#t tbody tr').forEach(function(r){{var ok=(s==='all'||r.classList.contains('sev-'+s))&&(!p||r.classList.contains('part-'+p));r.style.display=ok?'':'none'}})}}}})}})();
</script></body></html>"""
open(os.path.join(ROOT, 'qa', 'דוח-בדיקות.html'), 'w', encoding='utf-8').write(page)
print(f"נשמר: qa/דוח-בדיקות.html · {len(findings)} ממצאים · אדום {counts.get('red',0)} · צהוב {counts.get('yellow',0)}")
