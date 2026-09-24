/* A reading area and a play area: both visible on desktop, two clear tabs on phones. */
(()=>{
 const app=document.getElementById('app'),book=document.getElementById('book'),games=document.getElementById('games');
 const workspace=document.createElement('div');workspace.className='b-workspace';
 const column=document.createElement('section');column.className='b-book-column';column.setAttribute('aria-label','קריאת הספר');
 const tools=document.createElement('div');tools.className='b-reader-tools';
 tools.append(document.getElementById('bookRead'),document.getElementById('gridBtn'),document.getElementById('printBtn'));
 column.append(tools,book);workspace.append(column,games);app.append(workspace);
 const gamesTitle=games.querySelector('.lbl');gamesTitle.textContent='בוחרים רגע של משחק';
 const tips=games.querySelector('.review-tips');tips.textContent='שש פעילויות מתוך העולם של הסיפור. בוחרים רמה ומשחקים בקצב שלכם.';
 gamesTitle.after(bBar);bBar.after(tips);games.prepend(gamesTitle);
 document.getElementById('bookRead').textContent='קריאה בטקסט';
 const nav=document.createElement('nav');nav.className='b-mobile-tabs';nav.setAttribute('aria-label','בחירת אזור');nav.innerHTML='<button type="button" data-book-view="read" aria-pressed="true">קוראים בספר</button><button type="button" data-book-view="play" aria-pressed="false">משחקים יחד</button>';
 workspace.before(nav);document.body.dataset.bookView='read';
 window.bSetView=view=>{document.body.dataset.bookView=view;nav.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bookView===view)))};
 nav.onclick=event=>{const button=event.target.closest('[data-book-view]');if(button)bSetView(button.dataset.bookView)};
 const descriptions={memory:['מחפשים זוגות מהסיפור',7],dress:['מרכיבים לבוש לתינוק',12],table:['מכינים שולחן חגיגי',20],quiet:['פותרים חידת אורות',24],needs:['מגלים חפצים לתינוק',32],draw:['יוצרים ציור משלכם',37]};
 document.querySelectorAll('.gbtn').forEach(button=>{const detail=descriptions[button.dataset.g];if(!detail)return;const game=GAMES.find(g=>g.id===button.dataset.g);button.innerHTML='<span class="b-game-picture"><img src="'+bGameArt(detail[1])+'" alt="" draggable="false"></span><span class="b-game-name">'+game.t+'</span><span class="b-game-description">'+detail[0]+'</span>';button.setAttribute('aria-label',game.t+' — '+detail[0])});
 // Accessibility controls belong alongside the activity title, not in a separate tall row.
 const reading=document.querySelector('#sheet>.reading-controls');if(reading)document.querySelector('.b-activity-head').append(reading);
 document.getElementById('i-challah').innerHTML='<g stroke="#a16c2e" stroke-width="1.5"><path d="M10 22q22-18 44 0q3 8-4 11H14q-7-3-4-11z" fill="#dca558"/><path d="M6 41q25-20 51 0q3 10-5 13H12Q3 51 6 41z" fill="#edbd69"/><path d="M17 19l10 11m1-15 10 15m1-12 9 11M14 39l12 13m0-18 12 17m1-17 12 15" fill="none" stroke="#fff0b4" stroke-width="3"/></g>';
 const table=START.table;START.table=(box,message)=>{table(box,message);box.querySelectorAll('.drop').forEach(slot=>{const place=slot.onclick;slot.onclick=event=>{place(event);if(box.querySelectorAll('.filled').length===6&&!box.querySelector('.b-table-result')){const result=document.createElement('img');result.className='b-table-result';result.onload=result.onerror=()=>{if(result.naturalWidth<2){result.hidden=true;message.textContent='השולחן מוכן. שבת שלום! איור הסיום אינו זמין בחיבור הזה.'}};result.src=bGameArt(20);result.alt='שולחן שבת מסודר עם חלות, יין, גביע ללא רגל, שני פמוטים גדולים ושניים קטנים';const restart=box.querySelector('.b-restart');if(restart)restart.before(result);else box.append(result);box.classList.add('b-table-completed');result.scrollIntoView({behavior:'smooth',block:'nearest'})}}})};
 const open=openGame;openGame=function(id){gb.classList.remove('b-table-completed');open(id)};
 const needs=START.needs;START.needs=(box,message)=>{needs(box,message);const image=document.createElement('img');image.src=bGameArt(15);image.style.transformOrigin='70% 55%';image.alt='התינוק נח בעריסה';box.querySelector('.b-needs-picture').replaceChildren(image)};
 const draw=START.draw;START.draw=(box,message)=>{
  draw(box,message);const epoch=bEpoch;
  requestAnimationFrame(()=>{
   if(epoch!==bEpoch||!box.querySelector('#canvas'))return;
   const canvas=box.querySelector('#canvas'),context=canvas.getContext('2d'),pens=box.querySelector('.pens'),history=[];
   const undo=document.createElement('button'),eraser=document.createElement('button'),label=document.createElement('label'),size=document.createElement('input');
   undo.id='bDrawUndo';eraser.id='bDrawErase';undo.className=eraser.className='btn';undo.textContent='ביטול הקו האחרון';undo.disabled=true;eraser.textContent='מחק';eraser.setAttribute('aria-pressed','false');size.type='range';size.min=3;size.max=18;size.value=5;size.setAttribute('aria-label','עובי הקו');label.className='b-brush-size';label.append(document.createTextNode('עובי הקו'),size);pens.append(undo,eraser,label);
   const remember=()=>{history.push(context.getImageData(0,0,canvas.width,canvas.height));if(history.length>12)history.shift();undo.disabled=false};
   canvas.addEventListener('pointerdown',remember,{capture:true});
   undo.onclick=()=>{if(history.length)context.putImageData(history.pop(),0,0);undo.disabled=!history.length};
   eraser.onclick=()=>{const on=eraser.getAttribute('aria-pressed')!=='true';eraser.setAttribute('aria-pressed',String(on));context.globalCompositeOperation=on?'destination-out':'source-over';message.textContent=on?'המחק נבחר. עוברים על מה שרוצים למחוק.':'אפשר להמשיך לצייר.'};
   pens.querySelectorAll('.pen').forEach(pen=>pen.addEventListener('click',()=>{context.globalCompositeOperation='source-over';eraser.setAttribute('aria-pressed','false')}));
   size.oninput=()=>context.lineWidth=+size.value;
   const clear=box.querySelector('#clearC'),clearBefore=clear.onclick;clear.onclick=()=>{remember();clearBefore()};
  });
 };
})();
