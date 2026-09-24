/* A real RTL picture book: approved prose, optional shared-reading moments. */
(()=>{
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const requested=new URLSearchParams(location.search).get('story')||PlayUI.read('morash-story-character','mendy');
 let E=B_EDITIONS[requested]||B_EDITIONS.mendy;
 const bookmark=()=>E.character==='mendy'?'morash-story-edition-page':'morash-story-edition-page-chani';
 const pages=[{type:'cover'}];
 E.scenes.forEach((scene,i)=>pages.push({type:'art',scene:i},{type:'text',scene:i}));
 pages.push({type:'draw'},{type:'talk'},{type:'grownups'},{type:'again'},{type:'back'});
 const column=document.querySelector('.b-book-column');
 const readingControls=document.getElementById('readingToolbar');
 readingControls.id='bEditionReading';
 document.getElementById('bookReaderDialog').remove();document.getElementById('grid').remove();document.getElementById('bMediaStatus')?.remove();
 column.innerHTML='<div class="b-edition-toolbar"><div class="b-edition-label"><span>הַסִּיפּוּר שֶׁלָּנוּ</span><b>אור הגיע אלינו</b></div><div class="b-edition-actions"><button class="btn" id="bookRead" aria-pressed="false">מצב הקראה</button><button class="btn" id="gridBtn">תוכן העניינים</button><button class="btn" id="printBtn">מדפיסים חוברת</button></div></div><div id="bBookSpread" class="b-spread" aria-label="עמודי הספר"></div><nav class="b-book-navigation" aria-label="דפדוף בספר"><button id="prev" class="btn" aria-label="לעמודים הקודמים">→ הקודם</button><div><span id="bPageCount" role="status" aria-live="polite"></span><div class="b-edition-progress"><i></i></div></div><button id="next" class="btn primary" aria-label="לעמודים הבאים">הבא ←</button></nav>';
 const media=matchMedia('(min-width:900px)'),spread=document.getElementById('bBookSpread');
 document.querySelector('.b-edition-actions').append(readingControls);
 p=Math.max(0,Math.min(pages.length-1,+PlayUI.read(bookmark(),0)||0));
 const chooser=document.createElement('div');chooser.className='b-story-choice';chooser.setAttribute('role','group');chooser.setAttribute('aria-label','בחירת גיבור או גיבורת הסיפור');chooser.innerHTML='<span>עם מי קוראים?</span><button data-character="mendy">הסיפור של מענדי</button><button data-character="chani">הסיפור של חני</button>';spread.before(chooser);
 const uiText=s=>window.PlayReading?PlayReading.text(s):s;
 const copy=(plain,pointed)=>PlayReading.enabled&&pointed?pointed:plain;
 const mark='<div class="b-paper-brand" aria-hidden="true">'+MorashBrand.svg+'</div>';
 function pageHTML(index,interactive=true,pointed=PlayReading.enabled){
  const record=pages[index],scene=E.scenes[record.scene],text=(plain,n)=>pointed&&n?n:plain;
  const comfortable=interactive&&(document.body.classList.contains('reading-large')||document.body.classList.contains('b-reading-focus'));
  const lines=scene?text(scene.text,scene.n).split('\n'):[],lead=scene?.spread&&!comfortable&&(!interactive||media.matches)?(scene.artKey==='tower'?2:scene.artKey==='night'?1:0):0;
  const prose=xs=>xs.map(line=>'<p>'+esc(line)+'</p>').join('');
  let body='';
  const image=(src,alt)=>'<figure class="b-edition-art"><img class="b-edition-image" src="'+esc(src)+'" alt="'+esc(alt)+'" draggable="false"><figcaption class="b-art-unavailable" hidden>האיור לא נטען כרגע. אפשר להמשיך לקרוא את הסיפור.</figcaption></figure>';
  if(record.type==='cover')body='<div class="b-cover-copy"><span class="b-paper-kicker">סיפור על אח קטן ומשפחה שגדלה</span><h1>אוֹר הִגִּיעַ אֵלֵינוּ</h1><p>קוראים, מגלים ומשחקים יחד</p></div>'+image(E.art.arrival,'אמא ואבא מגיעים הביתה עם התינוק')+'<p class="b-cover-bottom">עם מענדי והמשפחה</p>';
  else if(record.type==='art')body=image(scene.spread||scene.art,scene.title)+(lead?'<div class="b-prose b-opening-line">'+prose(lines.slice(0,lead))+'</div>':'');
  else if(record.type==='text')body=(scene.spread?image(scene.spread,''):'')+'<div class="b-prose">'+prose(lines.slice(lead))+'</div>';
  else if(record.type==='draw')body='<div class="b-paper-kicker">הסיפור ממשיך אצלנו</div><h2>מציירים רגע יחד</h2><p class="b-page-lead">'+esc(E.closingActivities[0].text)+'</p><div class="b-drawing-space"><span aria-hidden="true">✎</span><p>הרגע שלנו</p></div>'+(interactive?'<button class="btn primary b-page-game" data-story-game="draw">פותחים את דף הציור</button>':'');
  else if(record.type==='talk')body='<div class="b-paper-kicker">סיימנו לקרוא? בואו נשחק</div><h2>עוד קצת כיף!</h2><div class="b-end-activities">'+[
   ['tower','▦','מגדל עד השמיים','מוסיפים קובייה ועוד קובייה. כמה גבוה נגיע?','בנו מגדל מקוביות. כל אחד מוסיף קובייה בתורו.'],
   ['yawn','☾','אריה ישנוני','פיהוק קטנטן… ועכשיו פיהוק ענקי!','נסו פיהוק קטנטן, ואז פיהוק גדול ושקט של אריה.'],
   ['find','✦','מחפשים באיור','יש כאן משהו עגול, משהו כחול וחיוך.','בחרו איור וחפשו בו משהו עגול, משהו כחול ומישהו שמחייך.']
  ].map(([id,icon,title,description,printed])=>'<'+(interactive?'button type="button" data-book-fun="'+id+'"':'div')+' class="b-end-card"><span class="b-end-icon" aria-hidden="true">'+icon+'</span><span><b>'+title+'</b><small>'+(interactive?description:printed)+'</small></span>'+(interactive?'<span aria-hidden="true">←</span>':'')+'</'+(interactive?'button':'div')+'>').join('')+'</div><p class="b-end-invitation">בוחרים מה שמתחשק, ומשחקים יחד.</p>';
  else if(record.type==='grownups')body='<div class="b-paper-kicker">למי שמקריאים</div><h2>רגע של קרבה</h2><div class="b-prose"><p>קוראים את הסיפור ברצף, ועוצרים לשיחה אם היא עולה מעצמה. בסוף הספר מחכות פעילויות ומשחקים לבחירה.</p><p>תנו מקום לכל תשובה, וגם לשתיקה. אין צורך לבקש מהילד לספר על עצמו; אפשר לדבר על מענדי ועל מה שקורה בסיפור.</p><p>אפשר לשמוח וגם להתגעגע למה שהיה. הקשר עם התינוק יכול להיבנות לאט, וההורים ממשיכים להיות אחראים לטיפול בו.</p><p>אם עוצרים באמצע, אפשר לחזור לאותו עמוד בפעם הבאה.</p></div>';
  else if(record.type==='again')body='<div class="b-paper-kicker">לכל אחד יש מקום בסיפור</div><h2>עוד רגע ביחד?</h2>'+image(E.art.reading,'אמא ומענדי קוראים יחד בספר')+'<p class="b-page-lead">אפשר לחזור לרגע שאהבתם, לצייר משהו משלכם או לבחור משחק.</p>'+(interactive?'<div class="b-again-actions"><button class="btn" data-story-start>קוראים שוב</button><button class="btn primary" data-story-play>בוחרים משחק</button></div>':'');
  else body='<div class="b-back-cover"><span aria-hidden="true">✦</span><h2>אור הגיע אלינו</h2><p>אח קטן הגיע הביתה.<br>מענדי כבר מחכה לשחק איתו!</p><p>סיפור לקריאה משותפת,<br>בקצב שלכם.</p>'+MorashBrand.svg+'</div>';
  if(E.character==='chani')body=body.replaceAll('עם מענדי והמשפחה','עם חני והמשפחה').replaceAll('אמא ומענדי קוראים','אמא וחני קוראות').replaceAll('אח קטן הגיע הביתה.<br>מענדי כבר מחכה לשחק איתו!','אח קטן הגיע הביתה.<br>חני כבר מחכה לשחק איתו!').replaceAll('על מענדי','על חני').replaceAll('מהילד לספר על עצמו','מהילדה לספר על עצמה');
  const backgrounds=['#f4e5cc','#f3e8d4','#f4e6d1','#f4e9d7','#f5ead8','#f3dfc2','#e0e7ef','#f3e5cc','#f4e8d5','#f2e5d2','#f4e6d1'];
  return '<article style="--b-page-bg:'+ (scene?backgrounds[record.scene]:'#fffdf7')+'" class="b-paper b-paper-'+record.type+(scene?.spread?' b-painted-page':'')+'" data-scene="'+(scene?.artKey||'')+'" data-book-page="'+index+'" data-reading-skip><div class="b-paper-content">'+body+'</div>'+(!scene?.spread&&!['art','cover','again','back'].includes(record.type)?mark:'')+'<span class="b-paper-number">'+(index+1)+'</span></article>';
 }
 function visiblePages(){
  if(!media.matches||p===0||p===pages.length-1)return[p];
  const start=p%2===0?p-1:p;return[start,start+1];
 }
 function render(){
  const indices=visiblePages();if(media.matches)p=indices[0];
  spread.innerHTML=indices.map(i=>pageHTML(i)).join('');spread.classList.toggle('b-single-page',indices.length===1);
  document.getElementById('prev').disabled=p===0;document.getElementById('next').disabled=indices.at(-1)===pages.length-1;
  document.getElementById('bPageCount').innerHTML=indices.length===2?'עמודים <bdi dir="ltr">'+(indices[0]+1)+'–'+(indices[1]+1)+'</bdi> מתוך '+pages.length:'עמוד '+(p+1)+' מתוך '+pages.length;
  document.querySelector('.b-edition-progress i').style.width=((indices.at(-1)+1)/pages.length*100)+'%';
  PlayUI.save(bookmark(),p);chooser.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.character===E.character)));
  spread.querySelectorAll('img').forEach(im=>{const check=()=>{if(im.complete&&(im.naturalWidth<2||im.naturalHeight<2)){im.hidden=true;im.nextElementSibling.hidden=false}};im.addEventListener('load',check);im.addEventListener('error',check);check()});
 }
 function go(index){p=Math.max(0,Math.min(pages.length-1,index));render()}
 goNext=()=>{const visible=visiblePages();if(visible.at(-1)<pages.length-1)go(visible.at(-1)+1)};
 goPrev=()=>{if(p>0)go(Math.max(0,p-(media.matches&&p>1?2:1)))};
 show=render;document.getElementById('prev').onclick=goPrev;document.getElementById('next').onclick=goNext;
 media.addEventListener('change',render);window.addEventListener('morash-reading-change',render);
 document.getElementById('bookRead').onclick=event=>{const active=document.body.classList.toggle('b-reading-focus');event.currentTarget.setAttribute('aria-pressed',String(active));event.currentTarget.textContent=active?'חזרה לתצוגה רגילה':'מצב הקראה';render()};
 const contents=document.createElement('dialog');contents.id='bContents';contents.setAttribute('aria-labelledby','bContentsTitle');contents.innerHTML='<div class="dialog-top"><h2 id="bContentsTitle">לאיזה רגע חוזרים?</h2><button class="close" aria-label="סגירת תוכן העניינים">×</button></div><div class="b-contents-list"><button data-page="0">הכריכה</button>'+E.scenes.map((scene,i)=>'<button data-page="'+(1+i*2)+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(scene.title)+'</button>').join('')+'<button data-page="23">מציירים רגע יחד</button><button data-page="24">עוד קצת כיף!</button><button data-page="25">למי שמקריאים</button></div>';document.body.append(contents);contents.querySelector('.close').onclick=()=>contents.close();contents.onclick=e=>{const b=e.target.closest('[data-page]');if(b){go(+b.dataset.page);contents.close()}};document.getElementById('gridBtn').onclick=()=>contents.showModal();
 const fun=document.createElement('dialog');fun.id='bBookFun';fun.setAttribute('aria-labelledby','bBookFunTitle');document.body.append(fun);
 function openFun(id){
  const titles={tower:'מגדל עד השמיים',yawn:'אריה ישנוני',find:'מחפשים באיור'};
  const top='<div class="dialog-top"><h2 id="bBookFunTitle">'+titles[id]+'</h2><button class="close" aria-label="סגירת הפעילות">×</button></div>';
  if(id==='tower'){
   fun.innerHTML=top+'<p>לוחצים על הכפתור ומוסיפים קובייה למגדל.</p><div class="b-fun-tower" aria-hidden="true"></div><p class="b-fun-status" role="status">המגדל שלנו מתחיל כאן!</p><button class="btn primary" data-add-block>עוד קובייה!</button> <button class="btn" data-reset-tower>בונים מחדש</button><p class="b-fun-footnote">אפשר לבנות יחד גם מקוביות שיש בבית.</p>';
   let count=0;const status=fun.querySelector('.b-fun-status'),add=fun.querySelector('[data-add-block]'),tower=fun.querySelector('.b-fun-tower');
   add.onclick=()=>{count++;const block=document.createElement('span');block.style.setProperty('--block-color',['#79aaa6','#e0b76d','#bc8c77','#9ba87d'][count%4]);block.style.transform='translateX('+[0,8,-5,4][count%4]+'px)';tower.append(block);status.textContent=count===8?'איזה מגדל גבוה בנינו יחד!':'כבר יש לנו '+count+' קוביות!';if(count===8){add.disabled=true;tower.classList.add('b-tower-done')}};
   fun.querySelector('[data-reset-tower]').onclick=()=>{count=0;tower.replaceChildren();tower.classList.remove('b-tower-done');add.disabled=false;status.textContent='מוכנים למגדל חדש!'};
  }else if(id==='yawn'){
   fun.innerHTML=top+'<div class="b-sleepy-face" aria-hidden="true"><i></i><i></i><span></span></div><p class="b-fun-status" role="status">מתחילים בפיהוק קטנטן ושקט…</p><button class="btn primary" data-yawn>ועכשיו פיהוק של אריה!</button><p class="b-fun-footnote">כל אחד מצטרף כשמתחשק לו. אפשר גם להצחיק זה את זה בפיהוקים.</p>';
   fun.querySelector('[data-yawn]').onclick=e=>{const big=fun.querySelector('.b-sleepy-face').classList.toggle('b-big-yawn');fun.querySelector('.b-fun-status').textContent=big?'פותחים פה גדול־גדול… איזה אריה ישנוני!':'ועכשיו שוב פיהוק קטנטן…';e.currentTarget.textContent=big?'ועכשיו קטנטן':'ועכשיו פיהוק של אריה!'};
  }else{
   fun.innerHTML=top+'<p>מחפשים יחד: משהו עגול, משהו כחול ומישהו שמחייך.</p><img class="b-fun-picture" src="'+esc(E.art.tower)+'" alt="המשפחה בונה מגדל מקוביות"><p class="b-fun-footnote">כל אחד יכול למצוא משהו אחר. אפשר גם להמציא משהו חדש לחפש.</p>';
  }
  fun.querySelector('.close').onclick=()=>fun.close();fun.showModal();
 }
 spread.onclick=e=>{const f=e.target.closest('[data-book-fun]');if(f)return openFun(f.dataset.bookFun);const game=e.target.closest('[data-story-game]');if(game){bSetView('play');openGame(game.dataset.storyGame)}if(e.target.closest('[data-story-start]'))go(0);if(e.target.closest('[data-story-play]')){bSetView('play');document.getElementById('games').scrollIntoView({behavior:'smooth',block:'start'})}};
 // Clear, purpose-built game illustrations instead of tiny pages of printed text.
 const cards={memory:['שני קלפים, תגלית אחת','i-star','מגלים זוגות'],dress:['מה נלבש היום?','i-shirt','בוחרים ומתאימים'],table:['מכינים מקום לשבת','i-challah','מסדרים יחד'],quiet:['אור קטן, חידה גדולה','i-candle','חושבים ומגלים'],needs:['מה מסתתר בסל?','i-heart','מכירים חפצים'],draw:['כל רעיון מתחיל בקו','i-star','יוצרים בחופשיות']};
 document.querySelectorAll('.gbtn').forEach(button=>{if(!cards[button.dataset.g]){button.remove();return}const [caption,icon,tag]=cards[button.dataset.g],g=GAMES.find(g=>g.id===button.dataset.g);button.innerHTML='<span class="b-play-card-art" aria-hidden="true"><i></i><svg viewBox="0 0 64 64"><use href="#'+icon+'"></use></svg><em>✦</em></span><span class="b-play-tag">'+tag+'</span><span class="b-game-name">'+g.t+'</span><span class="b-game-description">'+caption+'</span><span class="b-play-enter">בואו נשחק <b aria-hidden="true">←</b></span>'});
 document.querySelector('#games .lbl').textContent='הסיפור ממשיך במשחק';document.querySelector('#games .review-tips').textContent='רגע של גילוי, יצירה וכיף. בוחרים מה מתחשק עכשיו.';
 const map={1:'arrival',3:'family',7:'arrival',9:'tower',11:'shirt',12:'shirt',15:'yawn',19:'shabbat',20:'shabbat',23:'night',24:'night',27:'brit',31:'bond',32:'bond',35:'reading',37:'reading'};
 function selectCharacter(key){
  if(!B_EDITIONS[key])return;
  E=B_EDITIONS[key];PlayUI.save('morash-story-character',key);
  const url=new URL(location.href);url.searchParams.set('story',key);history.replaceState(null,'',url.href);
  contents.querySelectorAll('[data-page]').forEach(b=>{const i=(+b.dataset.page-1)/2;if(Number.isInteger(i)&&E.scenes[i])b.innerHTML='<span>'+String(i+1).padStart(2,'0')+'</span>'+esc(E.scenes[i].title)});
  bScenes.find(s=>s[0]===31)[1]=key==='chani'?'אחות גדולה ותינוק':'אח גדול ותינוק';
  go(+PlayUI.read(bookmark(),0)||0);
 }
 chooser.onclick=e=>{const b=e.target.closest('[data-character]');if(b)selectCharacter(b.dataset.character)};
 window.BStory={pages,get edition(){return E},editions:B_EDITIONS,selectCharacter,esc,pageHTML,go,render,openFun,visiblePages,artForLegacyPage:index=>E.art[map[index]||'arrival']};
 selectCharacter(E.character);bPaint();
})();
