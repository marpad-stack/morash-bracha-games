(() => {
 'use strict';
 const part=document.body.dataset.morashPart;
 const find=s=>document.querySelector(s);
 function help(host,text){if(!host)return;const d=document.createElement('details');d.className='review-help';const summary=document.createElement('summary');summary.textContent='איך משחקים?';const p=document.createElement('p');p.textContent=text;d.append(summary,p);host.prepend(d);return d}
 function intro(host,title,text){const d=document.createElement('div');d.className='review-intro';const h=document.createElement('h1'),p=document.createElement('p');h.textContent=title;p.textContent=text;d.append(h,p);host.prepend(d)}
 function button(text,id,action){const b=document.createElement('button');b.type='button';b.className='btn review-exit';b.textContent=text;b.id=id;b.onclick=action;return b}
 // Custom overlays retain one set of controls and return keyboard focus on closing.
 const overlays={a:['#studio','#gpanel'],b:['#modal','#grid'],d:['#cardOv'],e:['#mini']}[part]||[];
 for(const selector of overlays){const el=find(selector);if(!el)continue;let previous=null,opened=false;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','חלון פעילות');el.tabIndex=-1;
 const active=()=>el.classList.contains('on');
 new MutationObserver(()=>{const on=active();if(on===opened)return;opened=on;if(on){previous=document.activeElement;requestAnimationFrame(()=>{const first=[...el.querySelectorAll('button,input,select,[tabindex="0"]')].find(b=>b.getBoundingClientRect().width&&!b.disabled);(first||el).focus({preventScroll:true})})}else if(previous?.isConnected)previous.focus({preventScroll:true})}).observe(el,{attributes:true,attributeFilter:['class']});
 el.addEventListener('keydown',e=>{if(e.key!=='Tab'||!active())return;const items=[...el.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')].filter(b=>!b.disabled&&b.getBoundingClientRect().width&&getComputedStyle(b).visibility!=='hidden');if(!items.length){e.preventDefault();el.focus();return}const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
 }
 if(part==='a'){
  help(find('#games')||find('[data-game="memory"]')?.parentElement,'בוחרים משחק ורמה. בזיכרון הופכים זוג קלפים; בפאזל נוגעים בשני חלקים כדי להחליף ביניהם, או בוחרים במצב הזזה. סימן × מחזיר לבחירת המשחקים.');
 }
 if(part==='b'){
  find('#bookRead').textContent='קריאה בטקסט · עם ניקוד';
  find('#bookBookmark').hidden=!(Number.isInteger(savedPage)&&savedPage>0);
  const tip=document.createElement('p');tip.className='review-tips';tip.textContent='מדפדפים בחצים או בהחלקה · מחליקים את שורת המשחקים לעוד פעילויות';find('#games').prepend(tip);
  const baseOpen=openGame;openGame=function(id){baseOpen(id);gb.querySelectorAll('.mem .card').forEach((b,i)=>b.setAttribute('aria-label','קלף '+(i+1)));};
 }
 if(part==='c'){
  find('.hero h1 br')?.replaceWith(document.createTextNode(' '));
  const list=find('#maplist'),details=document.createElement('details');details.className='review-map-list';const summary=document.createElement('summary');summary.textContent='מעדיפים לבחור מרשימה?';list.before(details);details.append(summary,list);
  // On a phone, the instruction precedes the illustrated choice area.
  const house=find('.house'),hero=find('.hero'),marker=find('.review-map-list'),phone=matchMedia('(max-width:700px)');const arrangeHouse=()=>{if(phone.matches)marker.before(house);else hero.append(house)};arrangeHouse();phone.addEventListener('change',arrangeHouse);
 }
 if(part==='d'){
  intro(find('#setup'),'מסע המצוות','בוחרים משתתפים וקצב. בכל תור אוספים מצוות, מתקדמים בלוח ובונים יחד עיר.');
  const workshop=[...find('.actionrow').querySelectorAll('button')].find(b=>b.id!=='rollBtn');workshop.classList.add('review-workshop');workshop.textContent='או בוחרים משימת בנייה';
  help(find('.actionrow'),'לחצו על ״צא לדרך״ ותפסו מצוות בלחיצה או בנגיעה. אחרי האיסוף מתקדמים בלוח ומבצעים את המשימה. אפשר גם לבחור משימת בנייה ישירות. העיר נשמרת במכשיר הזה.');
  for(const [id,label] of [['nightBtn','מצב לילה'],['cityBtn','העיר שבנינו'],['albumBtn','אלבום המצוות']])find('#'+id)?.setAttribute('aria-label',label);
  find('#game').append(button('שומרים וחוזרים לתפריט','cityMenu',()=>{if(busy){PlayUI.toast('מסיימים את הפעולה הנוכחית ואז חוזרים לתפריט');return}dSave();location.reload()}));
 }
 if(part==='e'){
  const controls=find('#readingToolbar').cloneNode(true);controls.removeAttribute('id');controls.classList.add('review-start-reading');find('#nikBtn').before(controls);
  // Keep cloned reading controls in sync with the same persisted setting.
  controls.querySelectorAll('[data-reading-toggle]').forEach(b=>b.setAttribute('aria-pressed',String(PlayReading.enabled)));
  help(find('.sbox'),'בחידות ואתגרים בוחרים את התשובה המתאימה לתחנה ואז משחקים. במסע של עשייה עוברים ישר לפעולה. בכל פעילות אפשר להשתמש גם בכפתור הלחיצות שמתחת למשחק.');
  const close=button('חוזרים לתחנה','timeCloseActivity',()=>{if(miniDone)return;miniDone=true;clearTimeout(skipTimer);find('#mini').classList.remove('on');if(eRunMode==='hands'||misses===0)scores[turn]=Math.max(0,scores[turn]-1);if(eRunMode!=='hands'&&misses===0)streak=Math.max(0,streak-1);busy=false;renderStep()});find('#mini .mbox').append(close);
 }
 if(part==='f'){
  help(find('.opening'),'בטלפון גוררים באצבע ונוגעים בפריטים; במחשב משתמשים בעכבר, או ב־Tab וב־Enter. ללישה ולהברשה אפשר ללחוץ כמה פעמים על רווח. אפשר לצאת לתפריט ולהמשיך מאותו שלב.');
  find('#screen-game').append(button('שומרים וחוזרים לתפריט','kitchenMenu',()=>{fSave();fClear();clearInterval(tick);gameActive=false;location.reload()}));
  const oldShow=show;show=function(id){oldShow(id);window.scrollTo({top:0,behavior:'instant'})};
  const oldDone=renderDoneList;renderDoneList=function(){oldDone();find('#empty').textContent='כאן יופיעו השלבים שסיימתם. מתחילים באזור המשחק.'};renderDoneList();
 }
 if(part==='g'){
  const baseRender=render;render=function(){baseRender();find('#count').innerHTML='<bdi>'+data.found.length+' / 4</bdi> עדויות'};render();
  find('#begin')?.addEventListener('click',()=>find('#scene').scrollIntoView({block:'center',behavior:'smooth'}));
  find('#body').addEventListener('click',e=>{if(e.target.id==='begin')find('#scene').scrollIntoView({block:'center',behavior:'smooth'})});
 }
 if(part==='h'){
  const b=button('מגדילים את התצוגה','cardPreview',()=>{const d=document.createElement('dialog');d.setAttribute('aria-label','תצוגה מוגדלת של הכרטיס');const close=button('חזרה לעריכה','closeCardPreview',()=>d.close());render(true);const img=new Image();img.src=canvas.toDataURL('image/png');render();img.alt='הכרטיס שיצרתם';img.style.cssText='display:block;max-width:100%;max-height:68dvh;margin:auto';d.append(close,img);document.body.append(d);d.addEventListener('close',()=>d.remove());d.showModal()});b.classList.add('review-preview-link');find('.canvas-footer').append(b);
  find('.preview-label').textContent='הכרטיס שלכם · מתעדכן בזמן העריכה';
  find('.tools').prepend(b);b.textContent='תצוגה מוגדלת של הכרטיס';
  for(const el of [find('#draw'),find('#move'),find('#stickers')])el.addEventListener('click',()=>{if(matchMedia('(max-width:700px)').matches)find('.canvas-wrap').scrollIntoView({block:'center',behavior:'instant'})});
 }
 if(part==='i'){
  const p=document.createElement('p');p.className='review-tips';p.textContent='אפשר לדלג על פרטים ולהשלים אותם בהמשך דרך ״עריכת פרטים״.';find('#fName').closest('.field')?.before(p);
  find('#startBtn').textContent='בואי נבנה את המפה שלי';
 }
 if(part==='j'){
  const next=find('#next'),wrapper=next.closest('.demo');find('#s-card').append(wrapper);next.textContent='לבחור כרטיס נוסף להיום';
 }
})();
