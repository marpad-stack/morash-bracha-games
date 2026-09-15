"""Second-pass presentation, reading and cultural-fit enhancements.

This runs after the original builders. All source content arrays stay intact.
"""
from pathlib import Path
import re,json,base64,hashlib
ROOT=Path(__file__).resolve().parents[2];DEV=ROOT/'upgraded/dev';OUT=ROOT/'upgraded'
data=json.loads((DEV/'content-data.json').read_text(encoding='utf-8'))
extra=json.loads((DEV/'nikud-new.json').read_text(encoding='utf-8'))
strip=lambda s:re.sub('[\u0591-\u05bd\u05bf-\u05c2\u05c4-\u05c7]','',s)
reports=[]

def pairs_in(v):
    if isinstance(v,dict):
        if isinstance(v.get('p'),str) and isinstance(v.get('t'),str) and strip(v['t'])!=v['t']:yield v['p'],v['t']
        if isinstance(v.get('n'),str):
            for k in ('p','t','q'):
                if isinstance(v.get(k),str):yield v[k],v['n'];break
        if isinstance(v.get('nf'),str) and isinstance(v.get('tf'),str):yield v['tf'],v['nf']
        for val in v.values():yield from pairs_in(val)
    elif isinstance(v,list):
        if len(v)==2 and all(isinstance(x,str) for x in v) and strip(v[1])!=v[1]:yield v[0],v[1]
        else:
            for val in v:yield from pairs_in(val)

def align(p,n,key):
    if isinstance(n,str):
        assert strip(n)==p,('Nikud changes original letters',key,p,strip(n))
        reports.append({'key':key,'letters_identical':True,'original_sha256':hashlib.sha256(p.encode()).hexdigest()})
        yield p,n
    elif isinstance(n,dict):
        for k,v in n.items():yield from align(p[k],v,key+'.'+k)
    elif isinstance(n,list):
        assert len(n)==len(p),(key,len(p),len(n))
        for i,v in enumerate(n):yield from align(p[i],v,key+'.'+str(i))

common=[(strip(n),n) for n in extra['ui']]
book=json.loads((DEV/'book-reading.json').read_text(encoding='utf-8'))['pages']
assert [p['page'] for p in book]==list(range(1,41))
hosts={'a':'.topbar','b':'#app','c':'main','d':'header','e':'body','f':'body','g':'main','h':'main'}
legacy={'c':['#nikud'],'d':['#nikBtn'],'e':['#nikBtn','#nikudBtn'],'f':['#nikudBtn1','#nikudBtn2']}
native={'a':'setNikud(e.detail);','c':'state.nikud=e.detail;save();','d':'G.nikud=e.detail;dSave();','e':'nikud=e.detail;document.body.classList.toggle("nikud",nikud);','f':'NIKUD=e.detail;if(gameActive)fSave();','h':'render();'}
art_hosts={'a':'.hero','d':'#setup','e':'.sbox','f':'.opening','g':'.folder-art','i':'#intro','j':'#s-mood'}
reading=(DEV/'reading.js').read_text(encoding='utf-8');css=(DEV/'quality.css').read_text(encoding='utf-8')
for game in data:
    gid=game['id'];path=OUT/game['file'];s=path.read_text(encoding='utf-8')
    pairs=list(pairs_in(game['data']))+common
    if gid=='b':pairs += [(strip(p['n']),p['n']) for p in book if p['n']]
    if gid=='g':pairs+=list(align(game['data']['CONTENT'],extra['g'],'g'))
    if gid=='h':pairs+=list(align(game['data']['BLESSINGS'],extra['h'],'h'))
    # Keep long-vowel source spelling as delivered, including doubled letters.
    pairs=list(dict(pairs).items())
    asset=DEV/'assets'/f'{gid}-cover.webp'
    art='data:image/webp;base64,'+base64.b64encode(asset.read_bytes()).decode() if asset.exists() else ''
    localcss=css+(':root{--game-art:url("'+art+'")} ' if art else '')
    s=re.sub(r'<body\b([^>]*)>',lambda m:'<style>'+localcss+'</style><body'+m[1]+' data-morash-part="'+gid+'">',s,count=1)
    js=''
    if art and gid in art_hosts:
        sel=art_hosts[gid]
        js+='(()=>{const host=document.querySelector('+json.dumps(sel)+');if(!host)return;const wrap=document.createElement("div");wrap.className='+json.dumps('quality-art' if gid=='a' else 'intro-art' if gid=='j' else 'game-banner')+';const img=document.createElement("img");img.className="game-cover";img.alt="";img.width=1536;img.height=1024;img.src='+json.dumps(art)+';wrap.append(img);host.prepend(wrap)})();\n'
    if gid in hosts:
        if gid in native:js+='window.addEventListener("morash-reading-change",e=>{'+native[gid]+'});\n'
        js+='window.PLAY_READING_DATA='+json.dumps({'id':gid,'pairs':pairs,'host':hosts[gid],'legacy':legacy.get(gid,[])},ensure_ascii=False)+';\n'+reading
    if gid=='b':js+='\nconst BOOK_READING='+json.dumps(book,ensure_ascii=False)+';\n'+(DEV/'book-reader.js').read_text(encoding='utf-8')
    if gid=='h':
        s=s.replace('wrap(BLESSINGS[data.blessing],700,font)','wrap(window.PlayReading?PlayReading.text(BLESSINGS[data.blessing]):BLESSINGS[data.blessing],700,font)')
        s=s.replace("ctx.fillText('מכל הלב',500,320)","ctx.fillText(window.PlayReading?PlayReading.text('מכל הלב'):'מכל הלב',500,320)")
    before,sep,after=s.rpartition('</body>');assert sep
    s=before+'<script>'+js+'</script></body>'+after
    path.write_text(s,encoding='utf-8')
    print('Quality:',gid,len(pairs),'reading pairs',asset.exists(),'art')
(DEV/'nikud-checks.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2),encoding='utf-8')
