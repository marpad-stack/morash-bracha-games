/* Activity state is scoped to an opening, so delayed actions cannot award another game. */
let bEpoch=0;
const bRetired=new Set(B_REVIEW.retiredActivities);
document.querySelectorAll('.gbtn').forEach(button=>{button.hidden=bRetired.has(button.dataset.g)});
bPaint=function(){
 const active=Object.keys(bRecords).filter(key=>!bRetired.has(key.split('-')[0]));
 document.getElementById('bookStars').textContent=active.length+' כוכבי משחק';
 document.querySelectorAll('.gbtn').forEach(button=>button.classList.toggle('b-earned',!!bRecords[button.dataset.g+'-'+bLevel]));
};
const bCloseBefore=bCloseActivity;
bCloseActivity=function(){bEpoch++;bCloseBefore()};
modal.onclick=event=>{if(event.target===modal)bCloseActivity()};
const bOpenBefore=openGame;
openGame=function(id){
 bEpoch++;
 if(bRetired.has(id)){PlayUI.toast('הפעילות הזאת הוסרה. אפשר לבחור פעילות אחרת מתוך הסיפור.');return}
 gb.classList.remove('b-table-board');bOpenBefore(id);
 if(id!=='draw'){
  const again=document.createElement('button');again.className='btn b-restart';again.textContent='משחק חדש';again.onclick=()=>openGame(id);gb.append(again);
 }
};
// Resume the saved page directly; no second bookmark action is needed.
if(Number.isInteger(savedPage)&&savedPage>=0&&savedPage<PAGES.length){p=savedPage;show()}
document.getElementById('bookBookmark').hidden=true;
bPaint();

const bScenes=[
 [7,'ברוכים הבאים לתינוק'],[9,'בונים בקוביות'],[12,'מתלבשים לבד'],
 [15,'רגע משפחתי'],[19,'מתכוננים לשבת'],[23,'לילה בבית'],
 [27,'חוגגים יחד'],[31,'אח גדול ותינוק'],[35,'קוראים ביחד']
];
function bCanDisplay(src){
 return new Promise(resolve=>{
  const image=new Image();let done=false;
  const finish=valid=>{if(done)return;done=true;clearTimeout(timer);image.onload=image.onerror=null;resolve(valid)};
  const timer=setTimeout(()=>finish(false),12000);
  image.onload=()=>finish(image.naturalWidth>=2&&image.naturalHeight>=2);image.onerror=()=>finish(false);image.src=src;
 });
}
START.memory=async(box,message)=>{
 const epoch=bEpoch,requested=[3,6,8][bRoundLevel-1];
 box.innerHTML='<p class="b-progress" role="status">טוענים את תמונות המשחק…</p>';
 const visible=await Promise.all(bScenes.map(async scene=>await bCanDisplay(PAGES[scene[0]])?scene:null));
 if(epoch!==bEpoch)return;
 const available=visible.filter(Boolean),count=Math.min(requested,available.length),chosen=PlayUI.shuffle(available).slice(0,count);
 if(count<2){box.innerHTML='<p class="b-progress" role="status">תמונות המשחק לא נטענו. אפשר לנסות שוב או לבחור פעילות אחרת.</p><button class="btn b-restart">ניסיון נוסף</button>';box.querySelector('button').onclick=()=>openGame('memory');return}
 const deck=PlayUI.shuffle([...chosen,...chosen]);let first=null,locked=false,found=0;
 box.innerHTML='<p class="b-progress" role="status">נמצאו <b id="bPairs">0</b> מתוך '+count+' זוגות</p><div class="mem b-story-memory">'+deck.map(([index,title],i)=>'<button type="button" class="card" data-scene="'+index+'" aria-label="קלף '+(i+1)+' סגור"><span class="b-card-back" aria-hidden="true">✦</span><img src="'+PAGES[index]+'" alt="" draggable="false"><span class="b-card-caption">'+title+'</span></button>').join('')+'</div><button class="btn" id="bPeek">הצצה לתמונות</button>';
 const cards=[...box.querySelectorAll('.card')],peek=box.querySelector('#bPeek');
 const again=document.createElement('button');again.className='btn b-restart';again.textContent='משחק חדש';again.onclick=()=>openGame('memory');box.append(again);
 const label=card=>{const title=bScenes.find(x=>String(x[0])===card.dataset.scene)[1];card.setAttribute('aria-label',card.classList.contains('up')?title:'קלף '+(cards.indexOf(card)+1)+' סגור')};
 cards.forEach(card=>card.onclick=()=>{
  if(locked||card.classList.contains('up')||epoch!==bEpoch)return;
  card.classList.add('up');label(card);
  if(!first){first=card;return}
  if(first.dataset.scene===card.dataset.scene){
   first.classList.add('matched');card.classList.add('matched');first.disabled=card.disabled=true;first=null;found++;
   box.querySelector('#bPairs').textContent=found;message.textContent='מצאתם רגע מהסיפור!';
   if(found===count){message.textContent='מצאתם את כל הזוגות!';peek.disabled=true;bAward('memory')}
  }else{
   locked=true;peek.disabled=true;const other=first;first=null;message.textContent='אפשר לנסות שוב, בקצב שלכם.';
   setTimeout(()=>{if(epoch!==bEpoch)return;[other,card].forEach(c=>{c.classList.remove('up');label(c)});locked=false;peek.disabled=false},850);
  }
 });
 peek.onclick=()=>{
  if(locked||found===count)return;locked=true;peek.disabled=true;
  const hidden=cards.filter(c=>!c.classList.contains('up'));hidden.forEach(c=>{c.classList.add('up');label(c)});
  setTimeout(()=>{if(epoch!==bEpoch)return;hidden.forEach(c=>{c.classList.remove('up');label(c)});locked=false;peek.disabled=false},2200);
 };
};

// Illustrations extend the existing SVG vocabulary, with visible names beneath every item.
document.getElementById('i-cup').innerHTML='<path d="M17 14h30l-3 39H20z" fill="#d8dee4" stroke="#84939f" stroke-width="2"/><ellipse cx="32" cy="14" rx="15" ry="5" fill="#79838b"/><path d="M22 26h20m-19 5h18m-16 14h14" stroke="#ad975f" stroke-width="2"/>';
document.getElementById('i-candle').innerHTML='<g fill="#eee3c8" stroke="#9e845e"><path d="M9 23h8v25H9zm16 0h8v25h-8zm17 12h5v13h-5zm11 0h5v13h-5z"/><path d="M5 51h16m0 0h16m2 0h11m1 0h11" stroke-width="4"/></g><g fill="#e7a940"><path d="M13 10q-6 10 0 12q6-2 0-12m16 0q-6 10 0 12q6-2 0-12m15 15q-4 7 0 9q4-2 0-9m11 0q-4 7 0 9q4-2 0-9"/></g>';
const bWine=document.createElementNS('http://www.w3.org/2000/svg','g');bWine.id='i-wine';bWine.innerHTML='<path d="M26 7h12v17q9 5 9 12v22H17V36q0-7 9-12z" fill="#493244" stroke="#2f2434" stroke-width="2"/><path d="M25 6h14v10H25z" fill="#9a354c"/><rect x="20" y="35" width="24" height="16" rx="2" fill="#f5e4bb"/><text x="32" y="46" text-anchor="middle" font-size="10" fill="#493244">יין</text>';document.querySelector('svg defs').append(bWine);
document.getElementById('i-blanket').innerHTML='<path d="M11 10h36l7 8v35H11z" fill="#9dc7d7" stroke="#547e96" stroke-width="2"/><path d="M47 10v9h7M11 44h43" fill="#e2f0ee" stroke="#547e96" stroke-width="2"/><path d="M17 14v26m8-26v26m8-26v26m8-26v26M15 22h32M15 31h32" stroke="#e8f5f2" stroke-width="2"/><path d="M16 53v6m8-6v6m8-6v6m8-6v6m8-6v6" stroke="#547e96" stroke-width="2"/>';
function bNamedItems(box){box.querySelectorAll('.chip').forEach(item=>{const name=document.createElement('span');name.className='b-item-name';name.textContent=item.getAttribute('aria-label');item.append(name)})}
START.table=(box,message)=>{
 const items=[{id:'c',icon:'candle',cap:'נרות שבת'},{id:'ch',icon:'challah',cap:'חלות'},{id:'k',icon:'cup',cap:'גביע קידוש'},{id:'w',icon:'wine',cap:'יין'},{id:'s',icon:'siddur',cap:'סידור'},{id:'p',icon:'plate',cap:'צלחת'}];
 pickPlace(box,message,items,items,'השולחן מוכן. שבת שלום!');box.classList.add('b-table-board');bNamedItems(box);
 box.querySelectorAll('.drop').forEach(slot=>slot.setAttribute('aria-label','מקום ל'+items.find(i=>i.id===slot.dataset.id).cap));
};
START.needs=(box,message)=>{
 const options=[{icon:'bottle',name:'בקבוק',reply:'מביאים לאמא או לאבא את הבקבוק, והם עוזרים לתינוק לשתות.'},{icon:'blanket',name:'שמיכה',reply:'מביאים שמיכה רכה לאמא או לאבא, והם עוטפים את התינוק.'},{icon:'rattle',name:'רעשן',reply:'מראים לתינוק את הרעשן בעדינות. הוא מסתכל ומקשיב.'}];
 const tried=new Set();box.innerHTML='<div class="b-needs-picture">'+ic('baby')+'</div><p id="bNeedsCount" class="b-progress">מגלים שלושה חפצים לתינוק</p><div class="tray">'+options.map((o,i)=>'<button class="chip" data-need="'+i+'" aria-pressed="false" aria-label="'+o.name+'">'+ic(o.icon)+'<span class="b-item-name">'+o.name+'</span></button>').join('')+'</div>';
 box.querySelectorAll('[data-need]').forEach(button=>button.onclick=()=>{
  const index=+button.dataset.need;tried.add(index);box.querySelectorAll('[data-need]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  message.textContent=options[index].reply;box.querySelector('#bNeedsCount').textContent='גיליתם '+tried.size+' מתוך 3 חפצים';
  if(tried.size===3){bAward('needs');box.querySelector('#bNeedsCount').textContent='גיליתם את כל החפצים! אפשר להמשיך לבחור.'}
 });
};

START.quiet=(box,message)=>{
 const n=[2,3,4][bRoundLevel-1],cells=Array(n*n).fill(false),solution=new Set();let finished=false;
 function flip(i){for(const j of [i,i%n?i-1:-1,i%n<n-1?i+1:-1,i-n,i+n])if(j>=0&&j<cells.length)cells[j]=!cells[j];if(solution.has(i))solution.delete(i);else solution.add(i)}
 PlayUI.shuffle(cells.map((_,i)=>i)).slice(0,[1,4,7][bRoundLevel-1]).forEach(flip);if(!cells.some(Boolean))flip(0);
 box.innerHTML='<p class="b-progress" id="bLightsCount" role="status"></p><div class="b-lights" style="grid-template-columns:repeat('+n+',1fr)"></div><button class="btn" id="bLightHint">רמז לצעד הבא</button>';
 const board=box.querySelector('.b-lights');
 function paint(){board.innerHTML=cells.map((on,i)=>'<button data-light="'+i+'" aria-pressed="'+on+'" aria-label="שורה '+(Math.floor(i/n)+1)+', טור '+(i%n+1)+': '+(on?'דולק':'כבוי')+'" class="'+(on?'lit':'unlit')+'">'+(on?'☀':'☾')+'</button>').join('');box.querySelector('#bLightsCount').textContent='עוד '+cells.filter(Boolean).length+' אורות דולקים'}
 paint();board.onclick=event=>{const button=event.target.closest('[data-light]');if(!button||finished)return;const index=+button.dataset.light;flip(index);paint();board.querySelector('[data-light="'+index+'"]').focus({preventScroll:true});if(!cells.some(Boolean)){finished=true;message.textContent='כל האורות כבויים. לילה טוב!';box.querySelector('#bLightHint').disabled=true;bAward('quiet')}};
 box.querySelector('#bLightHint').onclick=()=>{if(finished)return;board.querySelectorAll('.hinted').forEach(b=>b.classList.remove('hinted'));const button=board.querySelector('[data-light="'+[...solution][0]+'"]');button.classList.add('hinted');button.focus({preventScroll:true});message.textContent='נסו את האור המסומן. כל לחיצה משנה גם את השכנים שלו.'};
};

const bClothes=[
 {id:'shirt-day',zone:'body',name:'חולצה ליום חול',holiday:false}, {id:'shirt-shabbat',zone:'body',name:'חולצה לשבת',holiday:true},
 {id:'pants-day',zone:'legs',name:'מכנסיים ליום חול',holiday:false},{id:'pants-shabbat',zone:'legs',name:'מכנסיים לשבת',holiday:true},
 {id:'hat-day',zone:'head',name:'כובע רך',holiday:false},{id:'hat-shabbat',zone:'head',name:'כובע חגיגי',holiday:true},
 {id:'socks-day',zone:'feet',name:'גרביים צבעוניים',holiday:false},{id:'socks-shabbat',zone:'feet',name:'גרביים לבנים',holiday:true}
];
function bClothing(item,color){
 const c=item.holiday?'#faf3df':color,edge='#71868a';
 if(item.zone==='head')return '<path d="M78 47q0-39 42-39t42 39Z" fill="'+c+'" stroke="'+edge+'" stroke-width="2"/><path d="M78 42h84v12H78z" fill="'+(item.holiday?'#bfa065':'#355b6f')+'"/><circle cx="120" cy="9" r="9" fill="'+c+'"/>';
 if(item.zone==='body')return '<path d="M91 113l-24 12-14 43 21 9 15-29-2 57h66l-2-57 15 29 21-9-14-43-24-12q-29 20-58 0z" fill="'+c+'" stroke="'+edge+'" stroke-width="2"/>'+(item.holiday?'<path d="M95 114l25 20 25-20-6 27-19-7-19 7z" fill="#fff" stroke="#bfa065"/><path d="M120 137v60" stroke="#bfa065"/><g fill="#bfa065"><circle cx="124" cy="151" r="2"/><circle cx="124" cy="165" r="2"/><circle cx="124" cy="179" r="2"/></g>':'<path d="M91 156h58m-59 14h60m-61 14h62" stroke="#fff9" stroke-width="5"/>');
 if(item.zone==='legs')return '<path d="M87 198h66l-5 64h-23l-5-38-5 38H92z" fill="'+(item.holiday?'#344b64':color)+'" stroke="'+edge+'" stroke-width="2"/><path d="M91 207h57" stroke="#fff7" stroke-width="3"/>';
 return '<path d="M92 252h23v27q-2 12-27 8v-12h4zm33 0h23v23h4v12q-25 4-27-8z" fill="'+c+'" stroke="'+edge+'" stroke-width="2"/><path d="M93 260h21m12 0h21" stroke="#bfa065" stroke-width="4"/>';
}
function bClothesIcon(item,color){const boxes={head:'70 0 100 62',body:'43 106 154 106',legs:'78 188 84 86',feet:'77 246 86 48'};return '<svg viewBox="'+boxes[item.zone]+'" aria-hidden="true">'+bClothing(item,color)+'</svg>'}
START.dress=(box,message)=>{
 let selected=null,color='#85b4c3',outfit={},mode='day',drag=null,suppress=0;
 const epoch=bEpoch,zones={head:[70,0,100,110],body:[45,110,150,93],legs:[79,203,82,48],feet:[76,251,88,44]};
 box.innerHTML='<div class="b-dress-options"><label>מתלבשים ל<select id="bDressMode"><option value="day">יום חול</option><option value="shabbat">שבת וחג</option></select></label><label>צבע הבגדים<select id="bDressColor"><option value="#85b4c3">תכלת</option><option value="#dca3b1">ורוד</option><option value="#91b497">ירוק</option></select></label></div><p class="b-progress" id="bDressed" role="status"></p><div class="b-dress-layout"><div class="b-baby-stage"><svg id="bBaby" viewBox="0 0 240 300" aria-label="תינוק שאפשר להלביש"><rect x="20" y="2" width="200" height="296" rx="35" fill="#fffdf6" stroke="#dbccb2" stroke-width="2"/><ellipse cx="120" cy="61" rx="77" ry="52" fill="#edf2e6" stroke="#d8dfcc"/><path d="M91 113l-24 12-14 43 21 9 15-29-2 57 5 62h23l5-43 5 43h23l5-62-2-57 15 29 21-9-14-43-24-12z" fill="#eee7d4" stroke="#bcb39c" stroke-width="2"/><circle cx="53" cy="172" r="10" fill="#f4d2b3"/><circle cx="187" cy="172" r="10" fill="#f4d2b3"/><path d="M91 260h24v22H87v-11zm34 0h24l4 11v11h-28z" fill="#eee7d4"/><circle cx="80" cy="72" r="10" fill="#f4d2b3"/><circle cx="160" cy="72" r="10" fill="#f4d2b3"/><circle cx="120" cy="67" r="42" fill="#f7dcc0" stroke="#dfbc9b" stroke-width="2"/><path d="M92 66q9 9 18 0m20 0q9 9 18 0" fill="none" stroke="#70553e" stroke-width="3" stroke-linecap="round"/><ellipse cx="120" cy="91" rx="5" ry="3" fill="#c98680"/><circle cx="92" cy="82" r="7" fill="#f0b3a7"/><circle cx="148" cy="82" r="7" fill="#f0b3a7"/><g id="bOutfit"></g><g id="bDressTargets"></g></svg></div><div class="b-wardrobe"></div></div>';
 const baby=box.querySelector('#bBaby'),wardrobe=box.querySelector('.b-wardrobe');
 function paint(){
  box.querySelector('#bOutfit').innerHTML=Object.values(outfit).map(item=>bClothing(item,color)).join('');
  box.querySelector('#bDressTargets').innerHTML=Object.entries(zones).map(([zone,[x,y,w,h]])=>'<rect data-dress-zone="'+zone+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12" class="b-dress-target '+(selected?.zone===zone?'selected':'')+'" role="button" tabindex="0" aria-label="'+({head:'ראש: מניחים כובע',body:'גוף: מניחים חולצה',legs:'רגליים: מניחים מכנסיים',feet:'כפות רגליים: מניחים גרביים'}[zone])+'"/>').join('');
  box.querySelector('#bDressed').textContent='לבשתם '+Object.keys(outfit).length+' מתוך 4 פריטים';
  wardrobe.innerHTML=bClothes.map(item=>'<button class="b-clothing" data-clothing="'+item.id+'" aria-pressed="'+(selected?.id===item.id)+'" aria-label="'+item.name+'">'+bClothesIcon(item,color)+'<span>'+item.name+'</span></button>').join('');
 }
 function select(item){selected=item;message.textContent='בחרתם '+item.name+'. מניחים על '+({head:'הראש',body:'הגוף',legs:'הרגליים',feet:'כפות הרגליים'}[item.zone])+'.';paint()}
 function place(zone){
  if(!selected){message.textContent='קודם בוחרים בגד מהארון.';return}
  if(zone!==selected.zone){message.textContent='נסו את המקום המסומן על התינוק.';return}
  if(bRoundLevel>1&&selected.holiday!==(mode==='shabbat')){message.textContent='הפעם מתלבשים ל'+(mode==='shabbat'?'שבת. בחרו בגד חגיגי.':'יום חול. בחרו בגד ליום חול.');return}
  outfit[zone]=selected;selected=null;paint();message.textContent='הבגד במקום!';
  if(Object.keys(outfit).length===4){message.textContent='התינוק לבוש ומוכן! אפשר לנסות שילוב אחר.';bAward('dress')}
 }
 paint();wardrobe.onclick=event=>{if(Date.now()<suppress)return;const button=event.target.closest('[data-clothing]');if(button)select(bClothes.find(i=>i.id===button.dataset.clothing))};
 baby.onclick=event=>{const target=event.target.closest('[data-dress-zone]');if(target)place(target.dataset.dressZone)};
 baby.onkeydown=event=>{if(['Enter',' '].includes(event.key)&&event.target.dataset.dressZone){event.preventDefault();place(event.target.dataset.dressZone)}};
 wardrobe.onpointerdown=event=>{const button=event.target.closest('[data-clothing]');if(!button)return;drag={item:bClothes.find(i=>i.id===button.dataset.clothing),x:event.clientX,y:event.clientY,ghost:null,pointer:event.pointerId};wardrobe.setPointerCapture(event.pointerId)};
 wardrobe.onpointermove=event=>{if(!drag||drag.pointer!==event.pointerId)return;if(!drag.ghost&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>9){drag.ghost=document.createElement('div');drag.ghost.className='b-drag-preview';drag.ghost.innerHTML=bClothesIcon(drag.item,color);box.append(drag.ghost);selected=drag.item}if(drag.ghost){event.preventDefault();drag.ghost.style.left=(event.clientX-40)+'px';drag.ghost.style.top=(event.clientY-40)+'px'}};
 function endDrag(event,cancel=false){if(!drag)return;const current=drag;drag=null;current.ghost?.remove();if(wardrobe.hasPointerCapture(current.pointer))wardrobe.releasePointerCapture(current.pointer);if(!current.ghost&&!cancel&&epoch===bEpoch){suppress=Date.now()+350;select(current.item)}if(current.ghost){suppress=Date.now()+350;if(!cancel&&epoch===bEpoch){selected=current.item;const bounds=baby.getBoundingClientRect(),x=(event.clientX-bounds.left)*240/bounds.width,y=(event.clientY-bounds.top)*300/bounds.height;const target=Object.entries(zones).find(([,r])=>x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3]);if(target)place(target[0]);else{paint();message.textContent='אפשר גם לבחור בגד ואז ללחוץ על המקום שלו.'}}}}
 wardrobe.onpointerup=event=>endDrag(event);wardrobe.onpointercancel=event=>endDrag(event,true);
 box.querySelector('#bDressMode').onchange=event=>{mode=event.target.value;outfit={};selected=null;paint();message.textContent='מרכיבים לבוש ל'+(mode==='shabbat'?'שבת וחג':'יום חול')+'.'};
 box.querySelector('#bDressColor').onchange=event=>{color=event.target.value;paint()};
};
