/* Immediate local drafts, serialized cloud backup, retry and recovery. */
(()=>{
 if(!document.getElementById('reviewerName')&&new URLSearchParams(location.search).get('review')!=='1')return;
 const API='https://bracha-games-review.marpad990579.chatgpt.site',PREFIX='bracha-autodraft-v1:';
 let identity;try{identity=localStorage.getItem('bracha-review-identity')}catch{}
 if(!/^[a-f0-9]{64}$/.test(identity||'')){identity=[...crypto.getRandomValues(new Uint8Array(32))].map(n=>n.toString(16).padStart(2,'0')).join('');try{localStorage.setItem('bracha-review-identity',identity)}catch{}}
 const records=new Map(),timers=new Map(),running=new Map();
 try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith(PREFIX)){try{const item=JSON.parse(localStorage.getItem(key));if(item?.id)records.set(item.id,item)}catch{}}}}catch{}
 const emit=(id,text)=>document.dispatchEvent(new CustomEvent('bracha-backup-status',{detail:{id,text}}));
 async function request(path,method='GET',data){const response=await fetch(API+path,{method,headers:{Authorization:'Bearer '+identity,...(data?{'Content-Type':'application/json'}:{})},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(15000)});const value=await response.json();if(!response.ok)throw new Error(value.error||'הגיבוי בענן לא הושלם');return value}
 function persist(record){try{localStorage.setItem(PREFIX+record.id,JSON.stringify(record));record.local=true;return true}catch{try{const small={...record,data:{...record.data,image:record.data.image?.startsWith('data:')?'':record.data.image},local:true};localStorage.setItem(PREFIX+record.id,JSON.stringify(small));record.local=true;return true}catch{record.local=false;return false}}}
 function status(record){return record.acked===record.stamp?'הטיוטה גובתה בענן'+(record.local?' ובמכשיר':'')+'. היא עדיין לא פורסמה לכולן.':record.local?'הטיוטה נשמרה במכשיר; ממתינה לגיבוי בענן.':'הגיבוי המקומי חסום. השאירי את הדף פתוח והורידי גיבוי עד לאישור מהענן.'}
 function schedule(id,delay=1000){clearTimeout(timers.get(id));timers.set(id,setTimeout(()=>flush(id).catch(()=>{}),delay))}
 function put(id,type,data){const old=records.get(id);if(old&&!old.completed&&JSON.stringify(old.data)===JSON.stringify(data))return old;const record={id,type,data:structuredClone(data),stamp:Math.max(Date.now(),(old?.stamp||0)+1),acked:0,completed:false};records.set(id,record);persist(record);emit(id,status(record));schedule(id);return record}
 async function flush(id){
  if(running.has(id)){await running.get(id);const latest=records.get(id);if(latest&&!latest.completed&&latest.acked!==latest.stamp)return flush(id);return}
  const record=records.get(id);if(!record||record.completed||record.acked===record.stamp)return;
  const snapshot=structuredClone(record);
  const job=(async()=>{try{await request('/api/drafts/'+id,'PUT',snapshot);const latest=records.get(id);if(latest&&latest.stamp===snapshot.stamp){latest.acked=snapshot.stamp;persist(latest);emit(id,status(latest))}}catch(error){const latest=records.get(id);if(latest&&!latest.completed){emit(id,(latest.local?'הטיוטה נשמרה במכשיר. ':'הגיבוי המקומי חסום. ')+'החיבור לענן לא הושלם; ננסה שוב אוטומטית.');schedule(id,12000)}throw error}finally{running.delete(id);const latest=records.get(id);if(latest&&!latest.completed&&latest.stamp!==snapshot.stamp)schedule(id,200)}})();
  running.set(id,job);return job;
 }
 async function complete(id){clearTimeout(timers.get(id));try{await running.get(id)}catch{}const record=records.get(id);if(record){record.completed=true;persist(record)}try{await request('/api/drafts/'+id,'DELETE')}catch{/* Retain completed marker so recovery does not resurrect a published draft. */}}
 async function recover(){try{const value=await request('/api/drafts');for(const remote of value.drafts){const local=records.get(remote.id);if(local?.completed){request('/api/drafts/'+remote.id,'DELETE').catch(()=>{});continue}if(!local||remote.stamp>local.stamp){remote.acked=remote.stamp;records.set(remote.id,remote);persist(remote)}}document.dispatchEvent(new Event('bracha-drafts-recovered'))}catch{}for(const record of records.values())if(!record.completed&&record.acked!==record.stamp)schedule(record.id,200)}
 window.BrachaBackup={identity,put,flush,complete,all:()=>[...records.values()],list:()=>[...records.values()].filter(r=>!r.completed),get:id=>records.get(id),status,recover};
 window.addEventListener('online',recover);window.addEventListener('focus',recover);
 setInterval(()=>{for(const r of records.values())if(!r.completed&&r.acked!==r.stamp)schedule(r.id,100)},20000);
 recover();
})();
