/* Final review A: reusable artwork, gentle challenge and explicit touch controls. */
let aGameCleanup=()=>{};
const aShuffle=values=>{const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const aBaseOpen=openGame;
openGame=function(kind){aGameCleanup();aGameCleanup=()=>{};aBaseOpen(kind);$('#gpanel').scrollTop=0;};
new MutationObserver(()=>{if(!$('#gpanel').classList.contains('on')){aEpoch++;aGameCleanup();aGameCleanup=()=>{}}}).observe($('#gpanel'),{attributes:true,attributeFilter:['class']});
const aEsc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function aUniquePages(){const ids=[];for(const p of aShuffle(PAGES)){if(!dupOf(p.id).some(id=>ids.includes(id)))ids.push(p.id)}return ids}
function aLive(text){const el=$('#aFeedback');if(el)el.textContent=text;}

memory=function(pairs){
 aGameCleanup();aEpoch++;const epoch=aEpoch;aRoundLevel=pairs<=4?1:pairs<=8?2:3;
 const ids=aUniquePages().slice(0,pairs),deck=aShuffle([...ids,...ids]);pairs=ids.length;
 $('#gTitle').textContent='נראה מי זוכר?';
 $('#gBody').innerHTML='<p class="howto">הופכים שני קלפים ומחפשים זוג זהה.<br>לא מצאתם? מנסים שוב בנחת — אין הגבלת זמן.</p>'+
 '<div class="a-settings"><span>כמה זוגות?</span>'+[4,6,8,12].map(n=>'<button class="btn '+(pairs===n?'btn-b':'btn-s')+'" data-mem="'+n+'" aria-pressed="'+(pairs===n)+'">'+n+'</button>').join('')+'</div>'+
 '<div class="a-game-status"><span>זוגות <b id="pr">0</b> / '+pairs+'</span><span>מהלכים <b id="mv">0</b></span><button class="btn btn-s" id="aPeek">הצצה אחת</button></div>'+
 '<div class="mem-board" id="board" style="grid-template-columns:repeat('+ (pairs>8?6:4) +',1fr)">'+deck.map((id,i)=>'<button class="mem" data-i="'+i+'" data-id="'+id+'" aria-label="קלף '+(i+1)+' סגור" aria-pressed="false"><div class="mem-in"><div class="mem-f"></div><div class="mem-b"><img src="'+cthumb(id)+'" alt=""></div></div></button>').join('')+'</div>'+
 '<p id="aFeedback" role="status" class="a-feedback">אפשר להתחיל מכל קלף.</p><div id="aFinish"></div>';
 let open=[],lock=false,moves=0,found=0,peeked=false;
 const later=(fn,ms)=>aLater(()=>{if(aEpoch===epoch)fn()},ms);
 $('#aPeek').onclick=()=>{if(lock||peeked||open.length)return;peeked=true;lock=true;$('#aPeek').disabled=true;const cards=$$('#board .mem:not(.done)');cards.forEach(c=>c.classList.add('flip'));aLive('מסתכלים וזוכרים…');later(()=>{cards.forEach(c=>c.classList.remove('flip'));lock=false;aLive('עכשיו תורכם למצוא את הזוגות.');},2400);};
 $('#gBody').onclick=e=>{
  const change=e.target.closest('[data-mem]');if(change){memory(+change.dataset.mem);return}
  const c=e.target.closest('.mem');if(!c||lock||c.classList.contains('flip')||c.disabled)return;
  const id=+c.dataset.id;c.classList.add('flip');c.setAttribute('aria-pressed','true');c.setAttribute('aria-label',titleOf(pageById(id)));open.push(c);
  $('#aPeek').disabled=peeked||open.length>0;
  if(open.length!==2)return;
  moves++;$('#mv').textContent=moves;lock=true;const same=open[0].dataset.id===open[1].dataset.id;
  aLive(same?'מצאתם זוג!':'עוד ניסיון — זוכרים איפה כל ציור?');
  later(()=>{
   if(same){open.forEach(x=>{x.classList.add('done');x.disabled=true});found++;$('#pr').textContent=found;
    if(found===pairs){aAward('memory',pairs*30+Math.max(0,pairs*12-(moves-pairs)*2));confetti(90);aLive('כל '+pairs+' הזוגות נמצאו!');$('#aFinish').innerHTML='<button class="btn btn-p" id="aAgain">משחק חדש</button> <button class="btn btn-s" data-close="gpanel">לבחירת המשחקים</button>';$('#aAgain').onclick=()=>memory(pairs);}}
   else open.forEach(x=>{x.classList.remove('flip');x.setAttribute('aria-pressed','false');x.setAttribute('aria-label','קלף '+(+x.dataset.i+1)+' סגור')});
   open=[];lock=false;$('#aPeek').disabled=peeked||found===pairs;
  },same?380:1100);
 };
};

// Crops are reviewed alongside final illustrations in a-final-clues.json.
let aClues=[];
const aCluesReady=fetch('clues.json').then(r=>{if(!r.ok)throw Error('clues');return r.json()}).then(v=>{aClues=v;return v}).catch(()=>[]);
matchGame=function(){
 aGameCleanup();aEpoch++;let epoch=aEpoch,raf=0,stopped=false;const level=aRoundLevel=aLevel,total=[6,8,10][level-1];
 let seconds=Number(store.get('mn_find_seconds',0));if(![0,15,30,45,60].includes(seconds))seconds=0;
 let deck=[],round=0,score=0,hits=0,streak=0,answer=null,locked=false,errors=0,hinted=false,remaining=seconds*1000,last=0;
 aGameCleanup=()=>{stopped=true;cancelAnimationFrame(raf);};
 const alive=()=>!stopped&&aEpoch===epoch&&$('#gpanel').classList.contains('on');
 $('#gTitle').textContent='בלשי החפצים';$('#gBody').onclick=null;
 $('#gBody').innerHTML='<p role="status">מכינים את החפצים לחיפוש…</p>';
 function finish(){
  cancelAnimationFrame(raf);aAward('match',score);confetti(100);
  $('#gBody').innerHTML='<div class="a-complete"><span aria-hidden="true">✦</span><h3>איזו עין חדה!</h3><p>מצאתם '+total+' חפצים.<br>'+hits+' נמצאו בניסיון הראשון.</p><p class="a-points">'+score+' נקודות</p><button class="btn btn-p" id="aAgain">מסע חיפוש חדש</button> <button class="btn btn-s" data-close="gpanel">לבחירת המשחקים</button></div>';$('#aAgain').onclick=()=>matchGame();
 }
 async function crop(wide=false){
  const current=answer,target=$('#aClue'),im=await loadImg(cimg(current.id));if(!alive()||answer!==current||target!==$('#aClue'))return;
  if(!im){aLive('התמונה לא נטענה. לחצו על ניסיון נוסף.');target.replaceWith(Object.assign(document.createElement('p'),{textContent:'התמונה לא נטענה'}));return}
  const ctx=target.getContext('2d'),r=current.box,factor=wide?1.75:[1.2,1,.8][level-1],w=Math.min(1,r[2]*factor),h=Math.min(1,r[3]*factor),x=Math.max(0,Math.min(1-w,r[0]+r[2]/2-w/2)),y=Math.max(0,Math.min(1-h,r[1]+r[3]/2-h/2));
  ctx.fillStyle='#fff';ctx.fillRect(0,0,360,360);const sw=w*im.width,sh=h*im.height,scale=Math.min(340/sw,340/sh);ctx.drawImage(im,x*im.width,y*im.height,sw,sh,(360-sw*scale)/2,(360-sh*scale)/2,sw*scale,sh*scale);
 }
 function clock(now){
  if(!alive()||locked||!seconds)return;
  if(!document.hidden&&last)remaining=Math.max(0,remaining-Math.min(now-last,200));last=document.hidden?0:now;
  const t=$('#aTime');if(t)t.textContent=Math.ceil(remaining/1000)+' שניות';
  if(remaining<=0){seconds=0;$('#aTimer').value='0';aLive('הזמן הסתיים. ממשיכים בנחת — עדיין אפשר למצוא!');if(t)t.textContent='ממשיכים בלי שעון';return}
  raf=requestAnimationFrame(clock);
 }
 function next(){
  if(!alive())return;cancelAnimationFrame(raf);if(round>=total){finish();return}
  answer=deck[round++];locked=false;errors=0;hinted=false;remaining=seconds*1000;last=0;
  const options=aShuffle([answer.id,...aUniquePages().filter(id=>id!==answer.id&&!dupOf(answer.id).includes(id)).slice(0,2)]);
  $('#gBody').innerHTML='<div class="a-game-status"><span>חפץ '+round+' מתוך '+total+'</span><span>'+score+' נקודות</span><label>זמן לחיפוש <select id="aTimer" aria-label="זמן לחיפוש">'+[[0,'בלי שעון'],[15,'15 שניות'],[30,'30 שניות'],[45,'45 שניות'],[60,'דקה']].map(([v,t])=>'<option value="'+v+'" '+(v===seconds?'selected':'')+'>'+t+'</option>').join('')+'</select></label></div>'+
  '<p class="howto">מסתכלים על החפץ.<br>באיזה משלושת הציורים הוא מסתתר?</p><div class="a-clue-wrap"><canvas id="aClue" width="360" height="360" role="img" aria-label="חפץ לחיפוש: '+aEsc(answer.name)+'"></canvas><p id="aTime">'+(seconds?seconds+' שניות':'בקצב שלכם')+'</p></div>'+
  '<div class="a-find-options">'+options.map((id,i)=>'<button class="mo" data-mid="'+id+'" aria-label="אפשרות '+(i+1)+': '+aEsc(pageById(id).p)+'"><img src="'+thumb(id)+'" alt=""><span>'+aEsc(titleOf(pageById(id)))+'</span></button>').join('')+'</div>'+
  '<p id="aFeedback" class="a-feedback" role="status">'+(streak>1?streak+' חפצים ברצף — ממשיכים!':'אפשר להיעזר ברמז.')+'</p><div class="a-game-actions"><button class="btn btn-s" id="aHint">רמז: קצת יותר מהציור</button><button class="btn btn-p" id="aNext" hidden>לחפץ הבא</button></div>';
  crop();
  $('#aTimer').onchange=e=>{seconds=+e.target.value;store.set('mn_find_seconds',seconds);cancelAnimationFrame(raf);remaining=seconds*1000;last=0;$('#aTime').textContent=seconds?seconds+' שניות':'בקצב שלכם';if(seconds)raf=requestAnimationFrame(clock);};
  $('#aHint').onclick=()=>{hinted=true;crop(true);$('#aHint').disabled=true;aLive('עכשיו רואים קצת יותר מסביב לחפץ.');};
  $('#aNext').onclick=next;
  $('#gBody').onclick=e=>{
   const b=e.target.closest('[data-mid]');if(!b||locked||b.disabled)return;
   if(+b.dataset.mid!==answer.id){errors++;streak=0;b.disabled=true;b.classList.add('wrong');aLive('החפץ לא כאן. מסתכלים שוב ומנסים ציור אחר.');return}
   locked=true;cancelAnimationFrame(raf);b.classList.add('right');b.setAttribute('aria-label',b.getAttribute('aria-label')+' — נכון');$$('[data-mid]').forEach(x=>x.disabled=true);
   if(!errors&&!hinted){hits++;streak++}else streak=0;score+=20+(!errors&&!hinted?10:0);aLive('מצאתם! זה הציור ״'+pageById(answer.id).p+'״.');$('#aHint').hidden=true;$('#aNext').hidden=false;$('#aNext').textContent=round===total?'לתוצאות':'לחפץ הבא';confetti(35);
  };
  if(seconds)raf=requestAnimationFrame(clock);
 }
 aCluesReady.then(()=>{if(!alive())return;deck=aShuffle(aClues.filter(c=>pageById(c.id)));if(deck.length<total){$('#gBody').innerHTML='<p>לא הצלחנו לטעון את החפצים לחיפוש.</p><button class="btn" id="aRetry">ניסיון נוסף</button>';$('#aRetry').onclick=()=>location.reload();return}next();});
};

// Stale image loads must never paint over a newly selected drawing.
const aStudioOriginal=openStudio;
openStudio=function(id){aStudioOriginal(id);$('#studio').scrollTop=0;};
// Controls and feedback use one persistent place, including at narrow phone widths.
document.querySelectorAll('.panel .x').forEach(b=>{b.style.width='auto';b.style.minWidth='90px';b.title='סגירה וחזרה';});
