with zipfile.ZipFile(next(ROOT.glob('shifra-tzeadim*zip'))) as z:
    for n in z.namelist():
        if n.endswith('/') or n.startswith('__MACOSX/'):continue
        # This PWA bundle is flat. Copy its known icons/manifest; HTML is built below.
        rel=Path(n)
        if rel.name=='index.html':continue
        if rel.suffix in ['.png','.json','.js']:
            dest=OUT/'i-first-steps'/rel.name;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(z.read(n))
s=original('indexחלק*html')
addon=r'''
const iTools=document.createElement('div');iTools.className='controlbar';iTools.innerHTML='<span class="label-small">המפה נשמרת בדפדפן במכשיר הזה</span><button class="btn" id="iExport">הורדת גיבוי</button><button class="btn" id="iImport">שחזור מגיבוי</button><input type="file" id="iFile" accept="application/json,.json" hidden>';document.getElementById('editBtn').parentElement.after(iTools);
document.getElementById('iExport').onclick=()=>{const blob=new Blob([JSON.stringify({format:'morash-first-steps',version:1,exportedAt:new Date().toISOString(),data},null,2)],{type:'application/json'});PlayUI.download('הצעדים-שלי-גיבוי.json',blob);toast('קובץ הגיבוי מוכן להורדה')};
document.getElementById('iImport').onclick=()=>document.getElementById('iFile').click();
function iSafe(v,depth=0){if(depth>15)throw Error('עומק קובץ לא תקין');if(v&&typeof v==='object'){for(const k of Object.keys(v)){if(['__proto__','constructor','prototype'].includes(k))throw Error('שדה לא תקין');iSafe(v[k],depth+1)}}}
document.getElementById('iFile').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>25*1024*1024)throw Error('הקובץ גדול מדי');const pack=JSON.parse(await file.text());iSafe(pack);if(pack.format!=='morash-first-steps'||pack.version!==1||!pack.data)throw Error('זה לא קובץ גיבוי של הצעדים שלי');const v=pack.data;for(const k of ['checked','notes','snooze'])if(!v[k]||typeof v[k]!=='object'||Array.isArray(v[k]))throw Error('מבנה קובץ לא תקין');for(const k of ['custom','moments'])if(!Array.isArray(v[k]))throw Error('מבנה קובץ לא תקין');if(v.profile!==null&&(typeof v.profile!=='object'||Array.isArray(v.profile)))throw Error('פרטי מפה לא תקינים');if(!confirm('לשחזר את המפה מהגיבוי? המפה הנוכחית במכשיר תוחלף. אפשר לבטל ולהוריד קודם גיבוי שלה.'))return;const old=data;data={profile:v.profile,checked:v.checked,notes:v.notes,custom:v.custom,snooze:v.snooze,moments:v.moments,night:!!v.night};if(save())location.reload();else data=old}catch(error){toast(error.message||'לא ניתן לקרוא את הגיבוי')}};
document.getElementById('shareBtn').addEventListener('click',e=>{if(!confirm('הקישור ישתף עותק של פרטי המפה, המשימות והסימונים עם מי שיקבל אותו. העותק אינו מתעדכן אוטומטית בין המכשירים. להמשיך לבחירת יעד השיתוף?')){e.preventDefault();e.stopImmediatePropagation()}},true);
'''
css=r'''.controlbar{justify-content:flex-start;font-size:13px}.controlbar .btn{font-size:13px;padding:8px 14px;border-radius:12px}.label-small{color:#6d776f}.task-card,.task{box-shadow:0 5px 23px #25493d05}.hero{display:block!important}.modal{z-index:500}.btn{box-shadow:none}
'''
upgrade(s,'i-first-steps/index.html',addon,css)
# Restrict cache management to this module. Never remove caches belonging to the host site.
write('i-first-steps/sw.js',r'''
const CACHE='morash-first-steps-v3';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(ASSETS.map(url=>cache.add(url)))));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('morash-first-steps-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||!event.request.url.startsWith(self.registration.scope))return;event.respondWith(fetch(event.request).then(response=>{if(response.ok){const clone=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,clone))}return response}).catch(()=>caches.match(event.request).then(hit=>hit||Promise.reject(Error('offline')))))});
''')
