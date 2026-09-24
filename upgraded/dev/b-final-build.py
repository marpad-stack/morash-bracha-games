"""Approved illustration/game review; the story transcript remains unchanged."""
import base64
final_b=json.loads((DEV/'b-final-content.json').read_text(encoding='utf-8'))
m=re.search(r'const PAGES\s*=\s*(\[[\s\S]*?\]);',s)
assert m
pages=json.loads(m[1])
for number in final_b['editedPages']:
    pages[number-1]='data:image/jpeg;base64,'+base64.b64encode((DEV/'assets/b-final'/f'page{number:02}.jpg').read_bytes()).decode()
s=s[:m.start(1)]+json.dumps(pages)+s[m.end(1):]
for gid,changes in final_b['activities'].items():
    pattern=r"(\{id:'"+gid+r"',icon:'[^']+',t:)(?:\"[^\"]*\"|'[^']*')(,how:)(?:\"[^\"]*\"|'[^']*')"
    title=editorial['b']['activities'].get(gid,{}).get('t')
    if not title:
        title={'memory':'נראה מי זוכר?','dress':'מתלבשים נכון!','table':'עורכים שולחן שבת!','quiet':'שומרים על השקט!','needs':'מה נביא לתינוק?'}[gid]
    s,n=re.subn(pattern,lambda m:m[1]+json.dumps(title,ensure_ascii=False)+m[2]+json.dumps(changes['how'],ensure_ascii=False),s)
    assert n==1,gid
# Closing before the first animation frame must not initialize a detached canvas.
s=replace(s,'  const r=cv.getBoundingClientRect();cv.width=', '  if(!cv.isConnected)return;const r=cv.getBoundingClientRect();cv.width=')
addon=addon.replace("if(id==='face'||id==='needs')", "if(id==='face')")
addon+='\nconst B_REVIEW='+json.dumps(final_b,ensure_ascii=False)+';\n'+(DEV/'b-final.js').read_text(encoding='utf-8')+'\n'+(DEV/'b-print.js').read_text(encoding='utf-8')
