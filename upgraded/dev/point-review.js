/* Optional review layer. Game visitors only see this with ?review=1. */
(()=>{
  const portal=Boolean(document.getElementById('reviewerName'));
  if(!portal&&new URLSearchParams(location.search).get('review')!=='1')return;
  const API='https://bracha-games-review.marpad990579.chatgpt.site';
  const KEY='bracha-point-review-draft-v2',PROFILE='morash-owner-review-2026-09-16';
  const backup=window.BrachaBackup;
  let notes=[];try{notes=JSON.parse(localStorage.getItem('bracha-notes-cache'))||[]}catch{}
  let identity=backup.identity;
  if(!/^[a-f0-9]{64}$/.test(identity||'')){identity=[...crypto.getRandomValues(new Uint8Array(32))].map(n=>n.toString(16).padStart(2,'0')).join('');try{localStorage.setItem('bracha-review-identity',identity)}catch{}}
  async function api(path,method='GET',data){const response=await fetch(API+path,{method,headers:{'Authorization':'Bearer '+identity,...(data?{'Content-Type':'application/json'}:{})},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(20000)});const value=await response.json();if(!response.ok)throw new Error(value.error||'השמירה לא הושלמה. נסי שוב.');return value}
  async function sync(){const value=await api('/api/notes');notes=value.notes;try{localStorage.setItem('bracha-notes-cache',JSON.stringify(notes))}catch{}refresh();return notes}
  function keepDraft(){if(!draft)return;draft.comment=$('#comment').value;draft.reviewer=$('#name').value;const record=backup.put(draft.id,'note',draft);$('#draftStatus').textContent=backup.status(record)}
  document.addEventListener('bracha-backup-status',event=>{if(draft?.id===event.detail.id)$('#draftStatus').textContent=event.detail.text});
  function errorMessage(error){return error.name==='TimeoutError'?'השרת לא השיב בזמן. הטיוטה נשמרת כאן; נסי שוב.':error.message==='Failed to fetch'?'אין חיבור לשירות. הטיוטה נשמרת כאן; נסי שוב.':error.message}

  const host=document.createElement('div');host.id='bracha-review-layer';
  host.style.cssText='position:fixed;inset:0;z-index:2147483000;pointer-events:none';
  document.body.append(host);const root=host.attachShadow({mode:'open'});
  root.innerHTML=`<style>
    :host{font:16px/1.5 Arial,sans-serif;direction:rtl;color:#173f40}
    *{box-sizing:border-box}button,input,textarea,select{font:inherit}select{min-height:44px;max-width:100%;padding:8px;border:1px solid #9ab9b0;border-radius:8px;background:white;color:#173f40}button{cursor:pointer;min-height:44px;border:1px solid #aec9c1;border-radius:12px;background:white;color:#173f40;padding:9px 14px}button:focus-visible,input:focus-visible,textarea:focus-visible,a:focus-visible{outline:3px solid #e2a635;outline-offset:3px}
    .bar{position:fixed;bottom:max(12px,env(safe-area-inset-bottom));left:12px;display:flex;gap:6px;align-items:center;padding:6px;background:#173f40;box-shadow:0 3px 15px #0003;border-radius:16px;pointer-events:auto;max-width:calc(100vw - 24px)}
    .bar button{font-size:14px;font-weight:bold}.bar button.primary{background:#ffdfa3}.hint{position:fixed;top:12px;left:12px;right:12px;margin:auto;width:fit-content;max-width:calc(100vw - 24px);padding:12px 18px;background:#173f40;color:white;border-radius:14px;pointer-events:none}
    [hidden]{display:none!important}.pin{position:fixed;width:28px;height:28px;min-height:28px;padding:0;border:2px solid white;border-radius:50%;background:#bc3e32;color:white;box-shadow:0 1px 6px #0008;pointer-events:auto;font-size:13px;font-weight:bold}.outline{position:fixed;border:3px solid #bc3e32;pointer-events:none;border-radius:5px}
    dialog{direction:rtl;color:#173f40;pointer-events:auto;border:0;border-radius:20px;padding:24px;width:min(540px,calc(100vw - 24px));max-height:85dvh;overflow:auto;box-shadow:0 15px 70px #0005}dialog::backdrop{background:#102b2dc2}h2{font-size:24px;margin:0 0 12px}p{margin:10px 0}label{display:block;margin:14px 0 5px;font-weight:bold}input,textarea{width:100%;border:1px solid #9ab9b0;border-radius:10px;padding:10px;background:white;color:#173f40}textarea{resize:vertical;min-height:110px}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.primary{background:#176d69;color:white}small{display:block;font-size:13px}.preview{position:relative;max-width:100%;margin:12px 0}.preview img{display:block;max-width:100%;max-height:200px;object-fit:contain}.target{background:#edf2eb;padding:12px;border-radius:10px;overflow-wrap:anywhere}.entry{padding:12px 0;border-top:1px solid #cad7ce;white-space:pre-wrap;overflow-wrap:anywhere}.entry button{margin:6px 4px}.notice{font-size:14px}.status{position:fixed;bottom:80px;left:12px;max-width:min(420px,calc(100vw - 24px));background:#fff7de;border:1px solid #cbbb83;padding:12px;border-radius:12px;pointer-events:auto}
    @media(max-width:480px){dialog{padding:18px}.bar button{padding:8px 11px}}
  </style>
  <div class="pins"></div><div class="hint" hidden>געי בפריט שעליו תרצי להעיר. לביטול לחצי שוב על הכפתור או Esc.</div>
  <div class="bar"><button class="primary" id="pick">＋ הוספת הערה</button><button id="all">הערות משותפות</button></div>
  <div class="status" role="status" hidden></div>
  <dialog id="editor" aria-labelledby="edit-title"><h2 id="edit-title">הערה על הפריט שסימנת</h2><div class="target"></div><div class="preview"></div><label for="name">שם הבודקת</label><input id="name" maxlength="100" autocomplete="name"><label for="comment">מה כדאי לתקן כאן?</label><textarea id="comment" maxlength="5000" placeholder="למשל: הכפתור קטן מדי בטלפון, או לא ברור מה צריך לעשות"></textarea><small>הטיוטה נשמרת אוטומטית. לחצי על ״פרסום לכולן״ כשתסיימי. רק אחרי אישור השמירה ההערה תופיע לאחרות.</small><p id="draftStatus" role="status"></p><div class="actions"><button class="primary" id="save">פרסום לכולן</button><button id="cancel">סגירה ושמירת טיוטה</button><button id="draftExport">הורדת גיבוי כתוב</button></div></dialog>
  <dialog id="list" aria-labelledby="list-title"><h2 id="list-title">ההערות של כולן</h2><p class="notice">כל ההערות שמורות במשותף. אפשר להגיב ולעדכן מצב טיפול. השם המוצג הוא השם שהבודקת הזינה.</p><div class="filters"><label for="gameFilter">משחק</label><select id="gameFilter"><option value="">כל המשחקים</option></select><label for="statusFilter">מצב</label><select id="statusFilter"><option value="">כל המצבים</option><option value="open">פתוח</option><option value="progress">בטיפול</option><option value="resolved">טופל</option></select></div><div class="pending-drafts"></div><div class="entries"></div><div class="actions"><button class="primary" id="download">הורדת דוח עם סימונים</button><button id="share" hidden>שיתוף הדוח</button><button id="close">חזרה למשחק</button></div></dialog>`;
  const $=selector=>root.querySelector(selector),editor=$('#editor'),list=$('#list');
  let picking=false,draft=null,previousFocus=null,suppressUntil=0,noticeTimer;
  const pageKey=location.pathname;
  function profile(){try{return JSON.parse(localStorage.getItem(PROFILE))||{}}catch{return {}}}
  function notify(text){const el=$('.status');el.textContent=text;el.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.hidden=true,9000)}
  function selectorFor(el){const parts=[];while(el&&el!==document.body){if(el.id){parts.unshift('#'+CSS.escape(el.id));break}const tag=el.localName;if(!tag)break;const siblings=[...el.parentElement.children].filter(x=>x.localName===tag);parts.unshift(tag+':nth-of-type('+(siblings.indexOf(el)+1)+')');el=el.parentElement}return parts.join(' > ')||'body'}
  function description(el){return (el.getAttribute('aria-label')||el.getAttribute('alt')||el.getAttribute('title')||el.innerText||el.value||el.localName||'אזור במסך').trim().slice(0,350)}
  function capture(el){
    const media=el.matches('img,canvas')?el:null;
    if(!media)return '';
    try{const w=media.naturalWidth||media.width,h=media.naturalHeight||media.height;if(!w||!h)return '';const scale=Math.min(1,900/w,700/h),canvas=document.createElement('canvas');canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(media,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.7)}catch{return ''}
  }
  function setPicking(value){picking=value;$('.pins').hidden=value;$('.hint').hidden=!value;$('#pick').textContent=value?'ביטול הסימון':'＋ הוספת הערה';document.documentElement.style.cursor=value?'crosshair':'';if(value)notify('בחרי פריט בעכבר או במגע. אפשר גם לעבור עם Tab ולבחור עם Enter.');else $('.status').hidden=true}
  function selectTarget(target,x,y){
    if(!(target instanceof Element)||host.contains(target))return;
    const el=target.closest('img,canvas,button,a,input,textarea,select,[role="button"]')||target;
    const rect=el.getBoundingClientRect();if(!rect.width||!rect.height)return;
    const frame=[...document.querySelectorAll('h1,h2,[role="dialog"] h3')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).map(e=>e.textContent.trim()).filter(Boolean).slice(-4).join(' / ');
    draft={id:crypto.randomUUID(),page:pageKey,url:location.href,title:document.title,frame,selector:selectorFor(el),target:description(el),x:Math.max(0,Math.min(1,(x-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(y-rect.top)/rect.height)),image:capture(el),viewport:innerWidth+' × '+innerHeight,device:matchMedia('(pointer:coarse)').matches?'מגע':'עכבר / מקלדת',time:new Date().toISOString()};
    setPicking(false);openEditor();
  }
  function openEditor(){if(!draft.reviewState)draft.reviewState=window.BrachaReviewState?.();previousFocus=document.activeElement;$('#saveError')?.remove();$('.target').textContent=draft.title+' — '+draft.target;$('.preview').replaceChildren();if(draft.image){const img=document.createElement('img');img.src=draft.image;img.alt='הפריט שסומן';$('.preview').append(img)}$('#name').value=draft.reviewer||profile().reviewerName||'';$('#comment').value=draft.comment||'';editor.showModal();keepDraft();$('#comment').focus()}
  function closeEditor(){editor.close();draft=null;previousFocus?.focus()}
  $('#pick').onclick=()=>setPicking(!picking);
  $('#cancel').onclick=()=>{keepDraft();closeEditor()};editor.addEventListener('cancel',event=>{if($('#save').disabled){event.preventDefault();return}keepDraft();draft=null});
  $('#save').onclick=async()=>{
    const comment=$('#comment').value.trim(),reviewer=$('#name').value.trim();
    if(!comment||!reviewer){const field=!reviewer?$('#name'):$('#comment');field.setCustomValidity(!reviewer?'כתבי את שמך.':'כתבי מה כדאי לתקן.');field.reportValidity();return}
    keepDraft();const snapshot=structuredClone(draft),button=$('#save');for(const id of ['save','cancel','comment','name'])$('#'+id).disabled=true;button.textContent='מפרסמת…';
    try{try{await backup.flush(snapshot.id)}catch{}await api('/api/notes'+(snapshot.canEdit?'/'+snapshot.id:''),snapshot.canEdit?'PUT':'POST',snapshot);await backup.complete(snapshot.id);try{const p=profile();p.reviewerName=reviewer;localStorage.setItem(PROFILE,JSON.stringify(p));localStorage.removeItem(KEY)}catch{}document.dispatchEvent(new CustomEvent('bracha-note-saved',{detail:{selector:snapshot.selector}}));closeEditor();notify('ההערה נשמרה באתר וגלויה לכולן. נשמר גם עותק גיבוי במכשיר.');try{await sync()}catch{}}
    catch(error){let el=$('#saveError');if(!el){el=document.createElement('p');el.id='saveError';el.setAttribute('role','alert');editor.append(el)}el.textContent=errorMessage(error)+' הטיוטה לא נסגרה.'}
    finally{for(const id of ['save','cancel','comment','name'])$('#'+id).disabled=false;button.textContent='פרסום לכולן'}
  };
  for(const id of ['comment','name'])$('#'+id).oninput=()=>{$('#'+id).setCustomValidity('');keepDraft()};
  const ownEvent=event=>event.composedPath().includes(host);
  for(const type of ['pointerdown','pointerup','click'])document.addEventListener(type,event=>{
    if(ownEvent(event))return;
    if(!picking){if(type==='click'&&performance.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation()}return}
    event.preventDefault();event.stopImmediatePropagation();
    if(type==='pointerup'){suppressUntil=performance.now()+600;selectTarget(event.target,event.clientX,event.clientY)}
  },true);
  document.addEventListener('keydown',event=>{if(!picking)return;if(event.key==='Escape'){event.preventDefault();setPicking(false)}else if(event.key==='Enter'&&!ownEvent(event)){event.preventDefault();event.stopImmediatePropagation();const el=document.activeElement,r=el.getBoundingClientRect();selectTarget(el,r.left+r.width/2,r.top+r.height/2)}},true);
  function renderPins(){
    const layer=$('.pins');layer.replaceChildren();
    notes.forEach((n,index)=>{if(n.page!==pageKey)return;let el;try{el=document.querySelector(n.selector)}catch{return}if(!el||description(el)!==n.target)return;const r=el.getBoundingClientRect();if(!r.width||!r.height||r.bottom<0||r.top>innerHeight)return;const pin=document.createElement('button');pin.className='pin';pin.textContent=index+1;pin.title=n.comment;pin.setAttribute('aria-label','עריכת הערה '+(index+1)+': '+n.comment);pin.style.left=Math.max(0,Math.min(innerWidth-28,r.left+r.width*n.x-14))+'px';pin.style.top=Math.max(0,Math.min(innerHeight-28,r.top+r.height*n.y-14))+'px';pin.onclick=()=>showList(n.id);layer.append(pin)});
  }
  function refresh(){ $('#all').textContent='הערות של כולן ('+notes.length+')';renderPins();const count=document.getElementById('pointCount');if(count)count.textContent=notes.length+' הערות שמורות ברשימה המשותפת'; }
  let selectedNote=null;
  function renderList(){
    const pending=$('.pending-drafts');pending.replaceChildren();
    for(const record of backup.list().filter(r=>r.type==='note')){const button=document.createElement('button');button.textContent='המשך טיוטה: '+(record.data.title||'הערה');button.onclick=()=>{list.close();draft=structuredClone(record.data);openEditor()};pending.append(button)}
    const entries=$('.entries');entries.replaceChildren();const filter=$('#gameFilter'),previous=filter.value;filter.replaceChildren(new Option('כל המשחקים',''));for(const title of [...new Set(notes.map(n=>n.title))])filter.append(new Option(title,title));filter.value=previous;$('.filters').hidden=!!selectedNote;const visible=selectedNote?notes.filter(n=>n.id===selectedNote):notes.filter(n=>(!filter.value||n.title===filter.value)&&(!$('#statusFilter').value||n.status===$('#statusFilter').value));
    if(selectedNote){const all=document.createElement('button');all.textContent='לכל ההערות';all.onclick=()=>{selectedNote=null;renderList()};entries.append(all)}
    if(!visible.length){const p=document.createElement('p');p.textContent='עוד אין הערות. פתחי משחק וסמני פריט שעליו תרצי להעיר.';entries.append(p)}
    for(const n of visible){
      const entry=document.createElement('div');entry.className='entry';const heading=document.createElement('h3');heading.textContent=n.title;
      const text=document.createElement('p');text.textContent=n.reviewer+' · '+new Date(n.created).toLocaleString('he-IL')+'\n'+n.target+'\n'+n.comment;
      entry.append(heading,text);
      if(n.image){const img=document.createElement('img');img.src=n.image;img.alt='הפריט שסומן';img.style.cssText='max-width:100%;max-height:180px';entry.append(img)}
      const status=document.createElement('select');status.setAttribute('aria-label','מצב ההערה');for(const [value,title] of Object.entries({open:'פתוח',progress:'בטיפול',resolved:'טופל'})){const option=document.createElement('option');option.value=value;option.textContent=title;status.append(option)}status.value=n.status;
      status.onchange=async()=>{const reviewer=profile().reviewerName||replyName.value.trim();if(!reviewer){status.value=n.status;replyName.reportValidity();return}status.disabled=true;try{await api('/api/notes/'+n.id,'PATCH',{status:status.value,reviewer});await sync();renderList()}catch(e){error.textContent=errorMessage(e);status.value=n.status}finally{status.disabled=false}};
      entry.append(status);
      if(n.canEdit){const edit=document.createElement('button');edit.textContent='עריכת ההערה שלי';edit.onclick=()=>{list.close();draft={...n};openEditor()};entry.append(edit)}
      for(const r of n.replies||[]){const text=document.createElement('p');text.className='target';text.textContent=r.reviewer+' · '+new Date(r.created).toLocaleString('he-IL')+'\n'+r.comment;entry.append(text)}
      const replyDraft=backup.list().find(r=>r.type==='reply'&&r.data.noteId===n.id);
      const replyName=document.createElement('input');replyName.placeholder='השם שלך';replyName.setAttribute('aria-label','שם לתגובה');replyName.required=true;replyName.maxLength=100;replyName.value=replyDraft?.data.reviewer||profile().reviewerName||'';
      const reply=document.createElement('textarea');reply.placeholder='תגובה להערה הזו';reply.setAttribute('aria-label','תגובה להערה');reply.maxLength=5000;reply.required=true;reply.value=replyDraft?.data.comment||'';
      const error=document.createElement('p');error.setAttribute('role','alert');const send=document.createElement('button');send.textContent='הוספת תגובה';let replyId=replyDraft?.id||crypto.randomUUID();
      const replyStatus=document.createElement('small');replyStatus.setAttribute('role','status');
      const saveReplyDraft=()=>{const record=backup.put(replyId,'reply',{noteId:n.id,title:n.title,reviewer:replyName.value,comment:reply.value});replyStatus.textContent=backup.status(record)};
      replyName.oninput=saveReplyDraft;reply.oninput=saveReplyDraft;
      document.addEventListener('bracha-backup-status',event=>{if(event.detail.id===replyId&&replyStatus.isConnected)replyStatus.textContent=event.detail.text});

      send.onclick=async()=>{if(!replyName.reportValidity()||!reply.reportValidity())return;send.disabled=true;reply.disabled=true;replyName.disabled=true;saveReplyDraft();try{try{await backup.flush(replyId)}catch{}await api('/api/notes/'+n.id+'/replies','POST',{reviewer:replyName.value,comment:reply.value,replyId});await backup.complete(replyId);try{const p=profile();p.reviewerName=replyName.value;localStorage.setItem(PROFILE,JSON.stringify(p))}catch{}await sync();renderList()}catch(e){error.textContent=errorMessage(e)}finally{send.disabled=false;reply.disabled=false;replyName.disabled=false}};
      entry.append(replyName,reply,replyStatus,send,error);entries.append(entry);
    }
  }
  async function showList(id=null){if(typeof id==='string'&&window.parent!==window&&new URLSearchParams(location.search).get('writerFrame')==='1'){window.parent.postMessage({type:'bracha-writer-note',id},'https://bracha-games-review.marpad990579.chatgpt.site');return}setPicking(false);selectedNote=typeof id==='string'?id:null;$('.entries').textContent='טוענת את ההערות המשותפות…';if(!list.open)list.showModal();try{await sync();renderList()}catch(error){renderList();const warning=document.createElement('p');warning.textContent=errorMessage(error)+' מוצג העותק האחרון מהמכשיר.';$('.entries').prepend(warning);const retry=document.createElement('button');retry.textContent='ניסיון נוסף';retry.onclick=()=>showList(selectedNote);$('.entries').append(retry)}}
  $('#gameFilter').onchange=renderList;$('#statusFilter').onchange=renderList;
  $('#all').onclick=showList;$('#close').onclick=()=>list.close();
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function report(exportNotes=notes){
    const p=profile();let general='';for(const record of backup.all().filter(r=>!r.completed||(r.type==='note'&&!exportNotes.some(n=>n.id===r.id))||(r.type==='reply'&&!exportNotes.some(n=>(n.replies||[]).some(x=>x.id===r.id))))){general+='<article><h2>'+(record.completed?'עותק מקומי של הערה שנשלחה — ':'טיוטה שלא פורסמה — ')+escape(record.data.title||'תגובה')+'</h2><p>'+escape(record.data.reviewer||'')+'</p><p>'+escape(record.data.comment||'')+'</p><p>'+escape(record.data.target||'')+'</p></article>'}for(const [id,value] of Object.entries(p)){if(value&&typeof value==='object'&&value.note){const title=document.querySelector('#note-'+id)?.closest('article')?.querySelector('h2')?.textContent||'חלק '+id;general+='<article><h2>'+escape(title)+'</h2><p>'+escape(value.note)+'</p></article>'}}
    return '<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>דוח תיקונים — הבאת ברכה</title><style>body{font:17px/1.7 Arial,sans-serif;background:#f7f6ef;color:#173f40;max-width:900px;margin:30px auto;padding:20px}article{border:1px solid #c2d1c6;background:white;border-radius:16px;padding:20px;margin:20px 0;break-inside:avoid}p{white-space:pre-wrap;overflow-wrap:anywhere}figure{position:relative;width:fit-content;max-width:100%;margin:12px 0}img{display:block;max-width:100%;height:auto}.dot{position:absolute;transform:translate(-50%,-50%);background:#bd3b30;color:white;border:2px solid white;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px}small{color:#576e66}a{overflow-wrap:anywhere}</style><h1>תיקונים למשחקי הבאת ברכה</h1><p>בודקת: '+escape(p.reviewerName||notes[0]?.reviewer||'לא צוין')+'\n'+escape(new Date().toLocaleString('he-IL'))+'\nמכשיר: '+escape(p.reviewDevice||'מופיע בכל סימון')+'</p><p>'+escape(p.generalNotes||'')+'</p>'+general+exportNotes.map((n,index)=>'<article><h2>'+ (index+1)+'. '+escape(n.title)+'</h2><p><b>'+escape(n.comment)+'</b></p><p>מצב: '+escape(({open:'פתוח',progress:'בטיפול',resolved:'טופל'})[n.status]||'פתוח')+'</p><p>הפריט שסומן: '+escape(n.target)+'\nהמסך: '+escape(n.frame)+'\nבודקת: '+escape(n.reviewer)+'\nתצוגה: '+escape(n.viewport)+' · '+escape(n.device)+'\nמיקום בפריט: '+Math.round(n.x*100)+'% משמאל, '+Math.round(n.y*100)+'% מלמעלה</p>'+(n.image&&(/^data:image\/jpeg;base64,[a-zA-Z0-9+/=]+$/.test(n.image)||n.image.startsWith(API+'/api/images/'))?'<figure><img alt="הפריט שסומן בזמן הבדיקה" src="'+escape(n.image)+'"><span class="dot" style="left:'+Number(n.x)*100+'%;top:'+Number(n.y)*100+'%">'+(index+1)+'</span></figure>':'')+(n.replies||[]).map(r=>'<p><b>'+escape(r.reviewer)+':</b> '+escape(r.comment)+'</p>').join('')+'<small>מזהה הפריט: '+escape(n.selector)+'</small><p><a href="'+escape(/^https?:/.test(n.url)?n.url:'#')+'">פתיחת המשחק</a> — ייתכן שצריך להתקדם שוב למסך המתואר.</p></article>').join('')+'</html>';
  }
  async function reportFile(){
    if(draft)keepDraft();try{await sync()}catch{}
    const exportNotes=structuredClone(notes);await Promise.all(exportNotes.map(async note=>{if(!note.image?.startsWith(API+'/api/images/'))return;try{const response=await fetch(note.image,{signal:AbortSignal.timeout(8000)});if(!response.ok)return;const blob=await response.blob();note.image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)})}catch{}}));
    const name=(profile().reviewerName||draft?.reviewer||'בדיקה').replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,60);return new File(['\ufeff'+report(exportNotes)],'גיבוי-הערות-'+name+'.html',{type:'text/html;charset=utf-8'});
  }
  async function download(){const buttons=[$('#download'),$('#draftExport'),document.getElementById('downloadPointNotes')].filter(Boolean);buttons.forEach(b=>b.disabled=true);try{const file=await reportFile(),url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);notify('מסמך הגיבוי הוכן להורדה, כולל ההערות, התגובות והטיוטות. אפשר לפתוח, להדפיס ל־PDF או לשלוח אותו.')}catch{notify('הורדת הגיבוי נכשלה. נסי שוב לפני סגירת הדף.')}finally{buttons.forEach(b=>b.disabled=false)}}
  $('#download').onclick=download;$('#draftExport').onclick=download;
  if(navigator.canShare){$('#share').hidden=false;$('#share').onclick=async()=>{const file=await reportFile();if(!navigator.canShare({files:[file]})){download();return}try{await navigator.share({files:[file],title:'גיבוי הערות למשחקים'})}catch(e){if(e.name!=='AbortError')notify('השיתוף לא הושלם. הורידי את המסמך ושלחי אותו כקובץ.')}}}
  let pending=false;const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;renderPins()})};
  window.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','hidden']});
  window.addEventListener('focus',()=>sync().catch(()=>{}));
  setInterval(()=>{if(!document.hidden&&!editor.open&&!list.open)sync().catch(()=>{})},30000);
  document.addEventListener('bracha-general-note',event=>{draft={id:event.detail.id||crypto.randomUUID(),page:location.pathname,url:location.href,title:event.detail.title,frame:'דף הבדיקה המרכזי',selector:event.detail.selector,target:'הערה כללית',x:.5,y:.5,viewport:innerWidth+' × '+innerHeight,device:matchMedia('(pointer:coarse)').matches?'מגע':'מחשב',time:new Date().toISOString(),comment:event.detail.comment||''};openEditor()});
  if(portal){$('.bar').hidden=true;document.getElementById('downloadPointNotes')?.addEventListener('click',download);document.getElementById('viewPointNotes')?.addEventListener('click',showList)}
  refresh();sync().catch(error=>notify(errorMessage(error)));
  let restored=false;function restore(){if(restored||editor.open)return;const saved=backup.list().filter(r=>r.type==='note'&&r.data.page===pageKey).sort((a,b)=>b.stamp-a.stamp)[0];if(saved){restored=true;draft=structuredClone(saved.data);openEditor()}}
  document.addEventListener('bracha-drafts-recovered',restore);restore();
  try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved){backup.put(saved.id,'note',saved);localStorage.removeItem(KEY);restore()}}catch{}

  // Contextual writer workspace: game remains playable in its own frame.
  const writerOrigin='https://bracha-games-review.marpad990579.chatgpt.site';
  if(!portal){
    if(window.parent!==window&&new URLSearchParams(location.search).get('writerFrame')==='1')$('#all').hidden=true;
    const workspace=document.createElement('button');workspace.textContent='החלטות הכותבת';
    workspace.onclick=()=>{if(window.parent!==window)window.parent.postMessage({type:'bracha-writer-note',id:notes.find(n=>n.page===pageKey)?.id},writerOrigin);else location.href=writerOrigin+'/workspace?game='+document.body.dataset.morashPart};
    $('.bar').append(workspace);
  }
  document.addEventListener('bracha-note-saved',()=>{if(window.parent!==window)window.parent.postMessage({type:'bracha-note-saved'},writerOrigin)});
  window.addEventListener('message',event=>{
    if(event.origin!==writerOrigin||event.source!==window.parent||window.parent===window)return;
    if(event.data?.type==='bracha-writer-pick'){
      const reviewer=String(event.data.reviewer||'').slice(0,100);if(reviewer){const p=profile();p.reviewerName=reviewer;try{localStorage.setItem(PROFILE,JSON.stringify(p))}catch{}}
      if(list.open)list.close();setPicking(true);
    }
    if(event.data?.type==='bracha-writer-target'){
      let el;try{el=document.querySelector(String(event.data.selector).slice(0,1500))}catch{}
      const found=!!el&&!!el.getBoundingClientRect().width&&!!el.getBoundingClientRect().height&&description(el)===event.data.target;
      if(found){el.scrollIntoView({block:'center',behavior:'smooth'});const previous=el.style.outline;el.style.outline='4px solid #dc8b16';setTimeout(()=>el.style.outline=previous,6000)}
      window.parent.postMessage({type:'bracha-writer-target-result',found},writerOrigin);
    }
  });
})();
