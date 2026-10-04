# inventory.py — מלאי סטטי של עשרת חלקי המסירה: תלויות חיצוניות, אחסון, שאריות פיתוח, מטא, שמות.
# פלט: qa/out/inventory.json (+ ממצאים אוטומטיים בפורמט האחיד ב-qa/out/qa-inventory.json)
import re, os, json, sys, csv, datetime
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
G = os.path.join(ROOT, 'מסירה-משחקי-הבאת-ברכה', 'משחקים')
KIT = os.path.join(ROOT, 'מסירה-משחקי-הבאת-ברכה', 'ערכת-תצוגה-לאתר', 'כרטיסי-משחק.json')
OUT = os.path.join(ROOT, 'qa', 'out'); os.makedirs(OUT, exist_ok=True)
games = {'a':'a-coloring/index.html','b':'b-story.html','c':'beit-hamitzvot.html','d':'d-mitzvot.html','e':'e-time.html','f':'f-kitchen.html','g':'g-detective.html','h':'h-card-studio.html','i':'i-first-steps/index.html','j':'j-meravach.html'}
kit = {}
if os.path.exists(KIT):
    for k in json.load(open(KIT, encoding='utf-8')): kit[k['id']] = k
rows = []; findings = []
def F(part, sev, typ, title, location, evidence, proposal, owner='קוד'):
    findings.append({'id': f'INV-{len(findings)+1:03d}', 'part': part, 'severity': sev, 'type': typ, 'title': title, 'location': location, 'evidence': evidence, 'proposal': proposal, 'owner': owner, 'status': 'open'})
for k, p in games.items():
    fp = os.path.join(G, p)
    if not os.path.exists(fp):
        F(k, 'red', 'קבצים', 'קובץ החלק חסר', p, 'לא נמצא', 'לבדוק את המסירה'); continue
    s = open(fp, encoding='utf-8', errors='replace').read()
    nodata = re.sub(r'data:[a-zA-Z0-9/+.-]+;base64,[A-Za-z0-9+/=]+', 'DATA', s)
    ext = sorted(set(u for u in re.findall(r'https?://[^"\'\s)<>\\]+', nodata) if 'w3.org' not in u))
    ext_scripts = re.findall(r'<script[^>]*src="(https?://[^"]+)"', s)
    title = (re.search(r'<title>([^<]*)</title>', s) or [None, ''])[1]
    h1s = [re.sub(r'<[^>]+>', ' ', x).strip() for x in re.findall(r'<h1[^>]*>(.*?)</h1>', s, flags=re.S)]
    h1s = [re.sub(r'\s+', ' ', x) for x in h1s if 'תיקונים למשחקי' not in x]
    vps = re.findall(r'<meta name="viewport"[^>]*content="([^"]*)"', s)
    r = {'part': k, 'file': p, 'kb': round(len(s.encode('utf-8')) / 1024), 'title': title, 'h1': h1s[:2], 'kit_title': kit.get(k, {}).get('title'), 'kit_audience': kit.get(k, {}).get('audience'),
         'external_urls': ext, 'external_scripts': ext_scripts, 'google_fonts': [u for u in ext if 'fonts.googleapis.com/css' in u],
         'review_overlay': bool(re.search(r'review=1|point-review|תיקונים למשחקי הבאת ברכה', s)), 'chatgpt_site': 'chatgpt.site' in s,
         'localStorage': len(re.findall(r'localStorage', s)), 'serviceWorker': 'serviceWorker' in s, 'manifest': 'rel="manifest"' in s,
         'audio': bool(re.search(r'<audio|new Audio\(|AudioContext', s)), 'canvas': 'getContext(' in s, 'share': 'navigator.share' in s, 'clipboard': 'navigator.clipboard' in s,
         'print': 'window.print(' in s, 'download': len(re.findall(r'\.download\s*=|download=', s)), 'alert_confirm': len(re.findall(r'\b(?:alert|confirm|prompt)\(', s)),
         'hash_links': len(re.findall(r'href="#"', s)), 'zoom_locked': any(re.search(r'maximum-scale\s*=\s*1(\.0)?\b|user-scalable\s*=\s*no', v) for v in vps[:1]),
         'lang_dir_ok': bool(re.search(r'<html[^>]*lang="he"[^>]*dir="rtl"', s)), 'meta_description': 'name="description"' in s, 'favicon': bool(re.search(r'rel="(?:shortcut )?icon"', s)),
         'imgs': len(re.findall(r'<img', s)), 'img_no_alt': len(re.findall(r'<img(?![^>]*alt=)[^>]*>', s)), 'reduced_motion': 'prefers-reduced-motion' in s,
         'nikud_ktiv_male': sorted(set(w for w in re.findall(r'(?<![\u05d0-\u05ea\u05b0-\u05c7])[\u05d0-\u05ea\u05b0-\u05c7]*יִי[\u05d0-\u05ea\u05b0-\u05c7]*', s) if not re.match(r'^(הָיִי|וְהָיִי|שֶׁהָיִי|כְּשֶׁהָיִי)', w)))[:20]}
    rows.append(r)
    if ext_scripts: F(k, 'red', 'שחרור', 'סקריפט חיצוני נטען מדומיין זר', p, '; '.join(ext_scripts), 'להסיר לפני העלאה לאתר (קוד סקירה של קודקס)', 'קוד')
    if r['review_overlay']: F(k, 'yellow', 'שחרור', 'ממשק הערות (?review=1) מוטמע בקובץ הפרודקשן', p, 'h1 "תיקונים למשחקי הבאת ברכה" / point-review', 'לבנות גרסת פרסום נקייה או להשאיר בכוונה מתועדת', 'מרפד')
    if r['hash_links']: F(k, 'red', 'קישורים', f"{r['hash_links']} קישורי href=\"#\"", p, 'קישורי הרשמה/יצירת קשר לא הושלמו', 'להשלים יעדים באתר', 'קוד')
    if r['zoom_locked']: F(k, 'yellow', 'נגישות', 'חסימת זום במטא viewport', p, vps[0] if vps else '', 'להסיר maximum-scale/user-scalable=no (תקן 5568)', 'קוד')
    if r['img_no_alt']: F(k, 'yellow', 'נגישות', f"{r['img_no_alt']} תמונות ללא alt", p, '', 'להוסיף alt (או alt="" לקישוט)', 'קוד')
    if r['kit_title'] and r['kit_title'] not in (title or '') and r['kit_title'] not in ' '.join(h1s):
        F(k, 'yellow', 'עקביות', 'שם החלק בכרטיס האתר שונה מכותרת העמוד', p, f"כרטיס: {r['kit_title']} | title: {title} | h1: {h1s[:1]}", 'להחליט על שם אחד לכל חלק ולהחיל בכרטיס, ב-title וב-h1', 'מרפד')
    if not r['lang_dir_ok']: F(k, 'yellow', 'RTL', 'חסר lang="he" dir="rtl"', p, '', 'להוסיף', 'קוד')
    if r['alert_confirm']: F(k, 'info', 'חוויה', f"{r['alert_confirm']} דיאלוגים מקוריים (alert/confirm)", p, '', 'להחליף בדיאלוג מעוצב (לא חובה)', 'קוד')
    if r['nikud_ktiv_male']: F(k, 'yellow', 'ניקוד', 'מילים מנוקדות בכתיב מלא (יו"ד/וי"ו כפולות)', p, ', '.join(r['nikud_ktiv_male'][:8]), 'ניקוד = כתיב חסר; לבדוק מול עורכת הלשון', 'עורכת לשון')
json.dump({'run': datetime.datetime.now().isoformat(timespec='seconds'), 'parts': rows}, open(os.path.join(OUT, 'inventory.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump({'agent': 'qa-inventory', 'run': datetime.datetime.now().isoformat(timespec='seconds'), 'findings': findings}, open(os.path.join(OUT, 'qa-inventory.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f"נבדקו {len(rows)} חלקים · {len(findings)} ממצאים אוטומטיים · qa/out/inventory.json, qa/out/qa-inventory.json")
for f in findings: print(f"  [{f['severity']}] {f['part']} · {f['title']}")
