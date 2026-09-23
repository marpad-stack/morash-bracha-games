/* Operation and presentation fixes. Educational texts and game rules stay in their source. */
(()=>{
 'use strict';
 const part=document.body.dataset.morashPart,find=s=>document.querySelector(s);
 if(part==='a'){
  document.querySelectorAll('[data-reading-large]').forEach(b=>{b.textContent='הגדלת טקסט';b.setAttribute('aria-label','הגדלת טקסט');b.title='הגדלה והקטנה של טקסט ההוראות והכפתורים';});
  const label=document.createElement('label');label.textContent='צבעי התצוגה ';
  const select=document.createElement('select');select.id='artTheme';select.setAttribute('aria-label','צבעי התצוגה');
  select.innerHTML='<option value="bright">צבעים חיים</option><option value="calm">צבעים רגועים</option>';
  select.value=PlayUI.read('morash-art-theme','bright');label.append(select);find('.controlbar').append(label);
  const paint=()=>{document.body.dataset.artTheme=select.value;PlayUI.save('morash-art-theme',select.value)};select.onchange=paint;paint();
  const help=find('.review-help p');if(help)help.textContent=help.textContent.replace(/\. /g,'.\n');
 }
 if(part==='c'){
  const dialog=document.createElement('dialog');dialog.id='resetDialog';dialog.setAttribute('aria-labelledby','resetTitle');
  dialog.innerHTML='<h2 id="resetTitle">הרפתקה חדשה</h2><p>להתחיל הרפתקה חדשה ולאפס את האותיות והנקודות במשחק הזה?</p><div class="toolbar"><button class="btn" id="cancelReset">חוזרים למשחק</button><button class="btn coral" id="confirmReset">מתחילים מחדש</button></div>';
  document.body.append(dialog);find('#reset').onclick=()=>{dialog.showModal();find('#cancelReset').focus()};
  find('#cancelReset').onclick=()=>dialog.close();find('#confirmReset').onclick=()=>{clean();state.done=[];state.opened=false;save();render();dialog.close();PlayUI.toast('ההרפתקה החדשה מוכנה')};
  dialog.addEventListener('close',()=>find('#reset').focus());
 }
 if(part==='d'){
  ICONS.luchot='<rect x="8" y="7" width="11" height="28" fill="#dfe6f0" stroke="#647693"/><rect x="21" y="7" width="11" height="28" fill="#dfe6f0" stroke="#647693"/><path d="M11 14h5m-5 5h5m-5 5h5m9-10h5m-5 5h5m-5 5h5" stroke="#647693" stroke-width="1.6"/>';
  ICONS.candles='<path d="M12 12C6 9 13 3 13 3s6 7 2 9Z M26 12C20 9 27 3 27 3s6 7 2 9Z" fill="#ef9700"/><path d="M13 10v5m14-5v5" stroke="#382e24" stroke-width="2"/><rect x="9" y="14" width="8" height="14" fill="#fff4dc" stroke="#94703c"/><rect x="23" y="14" width="8" height="14" fill="#fff4dc" stroke="#94703c"/><path d="M7 29h12m2 0h12M13 29v5m14-5v5M7 36h12m2 0h12" stroke="#9e752e" stroke-width="3"/>';
 }
 if(part==='e'){
  const table='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80"><path d="M14 35v38m72-38v38" stroke="#66432a" stroke-width="10"/><rect x="5" y="22" width="90" height="17" rx="4" fill="#c18b55"/><path d="M8 25h84" stroke="#efc896" stroke-width="4"/></svg>';
  const miniBase=runMini;runMini=function(i){miniBase(i);find('#mini').querySelectorAll('*').forEach(el=>{if(el.children.length===0&&el.textContent.trim()==='🍚'){el.innerHTML=table;el.setAttribute('aria-label','שולחן');el.querySelector('svg').style.cssText='width:1.4em;height:1.2em;display:block;margin:auto';}})};
 }
 if(part==='f'){
  find('#kitchenPace').addEventListener('change',e=>{PlayReading.set(e.target.value!=='240')});
 }
 if(part==='h'){
  const editor=find('.sticker-editor'),choice=document.createElement('select');choice.id='stickerChoice';choice.setAttribute('aria-label','בחירת מדבקה לעריכה');
  const label=document.createElement('label');label.textContent='המדבקה לעריכה';label.append(choice);editor.before(label);
  const feedback=document.createElement('p');feedback.id='stickerFeedback';feedback.setAttribute('aria-live','polite');editor.after(feedback);
  const preview=document.createElement('canvas');preview.id='stickerMini';preview.width=200;preview.height=250;preview.setAttribute('aria-label','תצוגה חיה של המדבקה בכרטיס');feedback.after(preview);
  const baseRender=render;render=function(exporting=false){
   if(selected>=data.stickers.length)selected=-1;
   baseRender(exporting);if(exporting)return;
   const signature=data.stickers.map(s=>s.s).join('|');if(choice.dataset.signature!==signature){choice.dataset.signature=signature;choice.replaceChildren();data.stickers.forEach((s,i)=>{const o=document.createElement('option');o.value=i;o.textContent=(i+1)+'. '+s.s;choice.append(o)});}
   choice.value=String(selected);choice.disabled=!data.stickers.length;
   feedback.textContent=selected<0?(data.stickers.length?'בחרו מדבקה מהרשימה או בכרטיס כדי לשנות גודל וסיבוב.':'הוסיפו מדבקה כדי לערוך אותה.'):'מדבקה '+(selected+1)+' נבחרה · גודל '+Math.round(data.stickers[selected].size)+' · סיבוב '+Math.round(data.stickers[selected].r)+'°';
   find('#arrange').disabled=!data.stickers.length;
   preview.getContext('2d').drawImage(canvas,0,0,preview.width,preview.height);
  };
  choice.onchange=()=>{const index=Number(choice.value);setMode('move');selected=index;render()};
  const arrange=find('#arrange').onclick;find('#arrange').onclick=()=>{arrange();PlayUI.toast('המדבקות סודרו מחדש');};
  if(data.stickers.length)selected=0;render();
 }
 if(part==='i'){
  // The existing Enter handler adds a task. Restore focus to allow consecutive entries.
  find('#list')?.addEventListener('click',e=>{if(e.target.closest('#addBtn'))requestAnimationFrame(()=>find('#newTask')?.focus({preventScroll:true}))});
 }
})();
