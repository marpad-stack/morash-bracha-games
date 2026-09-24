"""Render the proposed manuscript separately from the currently published story."""
from pathlib import Path
from html import escape as esc
import json
DEV=Path(__file__).resolve().parent;OUT=DEV/'review-evidence'
d=json.loads((DEV/'story-edit-proposal.json').read_text(encoding='utf-8'))
logo=(DEV/'assets/morash-logo-black.svg').read_text(encoding='utf-8')
css='''body{margin:0;background:#f6f1e7;color:#294b4e;font:18px/1.9 Arial,sans-serif}main{max-width:860px;margin:auto;padding:30px 24px}h1{font-size:38px;margin-bottom:5px}h2{font-size:25px;color:#235d61}header>p{margin:4px 0}.notice{padding:16px 20px;background:#e7eee3;border-radius:15px}.chapter{background:#fffdf7;border:1px solid #ddd9c8;border-radius:20px;padding:26px;margin:26px 0}.story{white-space:pre-line;font-size:21px;line-height:1.95}.meta{font-size:13px;color:#667569}.question{font-size:16px;background:#f2f1e7;border-radius:12px;padding:10px 16px;margin-top:22px}summary,button{cursor:pointer}button{font:inherit;border:1px solid #a7bcaf;border-radius:10px;padding:8px 18px;background:white;color:inherit}td,th{padding:10px;vertical-align:top;text-align:right;border-bottom:1px solid #d9ddd0}table{width:100%;border-collapse:collapse;font-size:15px}.brand{width:105px;margin-top:24px}.brand svg{width:100%;height:auto}@media(max-width:600px){main{padding:20px 14px}.chapter{padding:20px}.story{font-size:19px}h1{font-size:30px}table{font-size:14px}}@media print{@page{size:A4;margin:17mm 17mm 23mm}body{background:white;color:black}main{padding:0}.no-print,details{display:none!important}.chapter{break-inside:avoid;padding:0;border:0;margin:0 0 10mm}.story{font-size:13pt;line-height:1.8}h2{font-size:17pt}.brand{position:fixed;bottom:-16mm;left:0;width:25mm}.notice{background:white;border:1px solid #aaa}.question{font-size:11pt}}'''
body='<header><h1>'+esc(d['title'])+'</h1><p>'+esc(d['subtitle'])+'</p><p class="notice">'+esc(d['status'])+'</p><p>'+esc(d['readingNote'])+'</p><button class="no-print" onclick="window.print()">הדפסה / שמירה ל־PDF</button></header>'
body+='<details class="chapter"><summary>מה שיניתי ולמה — מול הערות הכותבות</summary><table><tr><th>עמודים במקור</th><th>הקושי</th><th>השינוי המוצע</th></tr>'+''.join('<tr><td>'+esc(x['pages'])+'</td><td>'+esc(x['issue'])+'</td><td>'+esc(x['change'])+'</td></tr>' for x in d['editorial'])+'</table></details>'
text=[d['title'],d['subtitle'],d['status'],'',d['readingNote']]
for x in d['scenes']:
    body+='<section class="chapter"><p class="meta">סצנה '+str(x['id'])+' · מתאימה לעמודי המקור '+', '.join(map(str,x['pages']))+'</p><h2>'+esc(x['title'])+'</h2><p class="story">'+esc(x['text'])+'</p><p class="question"><b>עצירה לשיחה — רק אם רוצים:</b> '+esc(x['pause'])+'</p></section>'
    text+=['','## '+x['title'],'',x['text'],'','לשיחה, אם רוצים: '+x['pause']]
for x in d['closingActivities']:
    body+='<section class="chapter"><h2>'+esc(x['title'])+'</h2><p class="story">'+esc(x['text'])+'</p></section>'
    text+=['','## '+x['title'],'',x['text']]
v=d['variants']['newbornGirl']
body+='<details class="chapter"><summary>התאמה לתינוקת ולגיבורה בת</summary><p>'+esc(d['variants']['readerGender'])+'</p><h2>'+esc(v['title'])+'</h2><p class="story">'+esc(v['text'])+'</p></details>'
body+='<details class="chapter"><summary>מה צריך לפני שילוב במשחק</summary><ul>'+''.join('<li>'+esc(t)+'</li>' for t in d['productionNotes'])+'</ul></details><div class="brand" aria-label="מורה שמיים">'+logo+'</div>'
css+=(DEV/'print-footer.css').read_text(encoding='utf-8')+'@media print{.brand{display:none}}'
body='<table class="morash-print-table"><tbody><tr><td>'+body+'</td></tr></tbody><tfoot><tr><td><div class="morash-print-brand">'+logo+'</div></td></tr></tfoot></table>'
(OUT/'הסיפור-נוסח-מוצע.html').write_text('<!doctype html><html dir="rtl" lang="he"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>אור הגיע אלינו — נוסח מוצע</title><style>'+css+'</style><main>'+body+'</main></html>',encoding='utf-8')
(OUT/'הסיפור-נוסח-מוצע.md').write_text('\n'.join(text),encoding='utf-8')
print('Story proposal: 11 scenes, 2 closing activities; published manuscript unchanged.')
