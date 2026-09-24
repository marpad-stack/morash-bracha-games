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
  let body='';
  const image=(src,alt)=>'<figure class="b-edition-art"><img class="b-edition-image" src="'+esc(src)+'" alt="'+esc(alt)+'" draggable="false"><figcaption class="b-art-unavailable" hidden>האיור לא נטען כרגע. אפשר להמשיך לקרוא את הסיפור.</figcaption></figure>';
  const question=()=>interactive?'<button class="b-pause-button" data-pause="'+record.scene+'"><span aria-hidden="true">✦</span><span><b>רגע יחד</b><small>שאלה קטנה או משחקון, אם רוצים</small></span><span aria-hidden="true">←</span></button>':'<aside class="b-print-question"><b>רגע יחד, אם רוצים</b><p>'+esc(scene.pause)+'</p></aside>';
  if(record.type==='cover')body='<div class="b-cover-copy"><span class="b-paper-kicker">סיפור קטן · מקום לכל הרגשות</span><h1>אוֹר הִגִּיעַ אֵלֵינוּ</h1><p>קוראים, מגלים ומשחקים יחד</p></div>'+image(E.art.arrival,'אמא ואבא מגיעים הביתה עם התינוק')+'<p class="b-cover-bottom">עם מענדי והמשפחה</p>';
  else if(record.type==='art')body='<div class="b-paper-kicker">רגע '+(record.scene+1)+' מתוך '+E.scenes.length+'</div>'+image(scene.art,scene.title)+'<h2 class="b-art-title">'+esc(text(scene.title,scene.titleN))+'</h2><p class="b-art-invitation">מסתכלים בנחת. לכל רגע יש סיפור.</p>';
  else if(record.type==='text')body='<div class="b-paper-kicker">אוֹר הִגִּיעַ אֵלֵינוּ</div><h2>'+esc(text(scene.title,scene.titleN))+'</h2><div class="b-prose">'+text(scene.text,scene.n).split('\n').map(line=>'<p>'+esc(line)+'</p>').join('')+'</div>'+question();
  else if(record.type==='draw')body='<div class="b-paper-kicker">הסיפור ממשיך אצלנו</div><h2>מציירים רגע יחד</h2><p class="b-page-lead">'+esc(E.closingActivities[0].text)+'</p><div class="b-drawing-space"><span aria-hidden="true">✎</span><p>הרגע שלנו</p></div>'+(interactive?'<button class="btn primary b-page-game" data-story-game="draw">פותחים את דף הציור</button>':'');
  else if(record.type==='talk')body='<div class="b-paper-kicker">אין תשובה אחת נכונה</div><h2>מדברים, אם רוצים</h2><div class="b-conversation-cards">'+E.closingActivities[1].text.split('\n').map((line,i)=>'<div><span>'+['♡','✦','☀','✎'][i]+'</span><p>'+esc(line)+'</p></div>').join('')+'</div><p class="b-page-lead">אפשר גם רק להקשיב, או לדפדף הלאה.</p>';
  else if(record.type==='grownups')body='<div class="b-paper-kicker">למי שמקריאים</div><h2>רגע של קרבה</h2><div class="b-prose"><p>אפשר לקרוא את הסיפור ברצף. כפתורי ״רגע יחד״ מזמינים שיחה או משחק קטן, רק אם מתאים עכשיו.</p><p>תנו מקום לכל תשובה, וגם לשתיקה. אין צורך לבקש מהילד לספר על עצמו; אפשר לדבר על מענדי ועל מה שקורה בסיפור.</p><p>אפשר לשמוח וגם להתגעגע למה שהיה. הקשר עם התינוק יכול להיבנות לאט, וההורים ממשיכים להיות אחראים לטיפול בו.</p><p>אם עוצרים באמצע, אפשר לחזור לאותו עמוד בפעם הבאה.</p></div>';
  else if(record.type==='again')body='<div class="b-paper-kicker">לכל אחד יש מקום בסיפור</div><h2>עוד רגע ביחד?</h2>'+image(E.art.reading,'אמא ומענדי קוראים יחד בספר')+'<p class="b-page-lead">אפשר לחזור לרגע שאהבתם, לצייר משהו משלכם או לבחור משחק.</p>'+(interactive?'<div class="b-again-actions"><button class="btn" data-story-start>קוראים שוב</button><button class="btn primary" data-story-play>בוחרים משחק</button></div>':'');
  else body='<div class="b-back-cover"><span aria-hidden="true">✦</span><h2>אור הגיע אלינו</h2><p>מענדי נעשה אח גדול —<br>והוא עדיין מענדי.</p><p>סיפור לקריאה משותפת,<br>בקצב שלכם.</p>'+MorashBrand.svg+'</div>';
  if(E.character==='chani')body=body.replaceAll('עם מענדי והמשפחה','עם חני והמשפחה').replaceAll('אמא ומענדי קוראים','אמא וחני קוראות').replaceAll('מענדי נעשה אח גדול —<br>והוא עדיין מענדי.','חני נעשתה אחות גדולה —<br>והיא עדיין חני.').replaceAll('על מענדי','על חני').replaceAll('מהילד לספר על עצמו','מהילדה לספר על עצמה');
  return '<article class="b-paper b-paper-'+record.type+'" data-book-page="'+index+'" data-reading-skip><div class="b-paper-content">'+body+'</div>'+(!['art','cover','again','back'].includes(record.type)?mark:'')+'<span class="b-paper-number">'+(index+1)+'</span></article>';
 }
 function visiblePages(){if(!media.matches||p===0||p===pages.length-1)return[p];const start=p%2===0?p-1:p;return[start,start+1]}
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
 document.getElementById('bookRead').onclick=event=>{const active=document.body.classList.toggle('b-reading-focus');event.currentTarget.setAttribute('aria-pressed',String(active));event.currentTarget.textContent=active?'חזרה לתצוגה רגילה':'מצב הקראה'};
 const contents=document.createElement('dialog');contents.id='bContents';contents.setAttribute('aria-labelledby','bContentsTitle');contents.innerHTML='<div class="dialog-top"><h2 id="bContentsTitle">לאיזה רגע חוזרים?</h2><button class="close" aria-label="סגירת תוכן העניינים">×</button></div><div class="b-contents-list"><button data-page="0">הכריכה</button>'+E.scenes.map((scene,i)=>'<button data-page="'+(1+i*2)+'"><span>'+String(i+1).padStart(2,'0')+'</span>'+esc(scene.title)+'</button>').join('')+'<button data-page="23">מציירים רגע יחד</button><button data-page="24">מדברים, אם רוצים</button><button data-page="25">למי שמקריאים</button></div>';document.body.append(contents);contents.querySelector('.close').onclick=()=>contents.close();contents.onclick=e=>{const b=e.target.closest('[data-page]');if(b){go(+b.dataset.page);contents.close()}};document.getElementById('gridBtn').onclick=()=>contents.showModal();
 const moments=[
  {icon:'✦',title:'מגלים פרט קטן',action:'מצביעים באיור על משהו קטן ששמתם לב אליו. כל אחד יכול לגלות משהו אחר.',choices:['יד קטנטנה','שמיכה רכה','המבט של מענדי']},
  {icon:'♡',title:'מפנים מקום',action:'מזיזים קצת את המקום שבו יושבים ומזמינים זה את זה: ״יש כאן מקום לידיי״.',choices:['לבקש במילים','לגשת להורה','להצביע על המקום']},
  {icon:'▦',title:'בונים וממשיכים',action:'בונים בידיים מגדל דמיוני. עוצרים רגע, ואז ממשיכים יחד בדיוק מאיפה שהפסקנו.',choices:['רציתי שנמשיך','אפשר לשבת איתי?','אני צריך רגע']},
  {icon:'☀',title:'גם וגם',action:'מצביעים על כל מה שאולי מתאים למענדי. אפשר לבחור כמה דברים, או להמציא משהו אחר.',choices:['שמח על התינוק','רוצה תשומת לב','מרגיש כמה דברים יחד']},
  {icon:'◡',title:'פיהוק של אריה',action:'פותחים את הפה לפיהוק גדול ומצחיק. מי שרוצה מצטרף, ומי שרוצה רק מסתכל.',choices:['פיהוק קטנטן','פיהוק ענקי','רק מסתכלים']},
  {icon:'✦',title:'רגע של שבת',action:'בוחרים דבר קטן שאוהבים בשבת ומספרים עליו, או מזמזמים יחד מנגינה מוכרת.',choices:['ריח החלות','השירים יחד','לנוח ולשחק']},
  {icon:'☾',title:'מישהו לידי',action:'חושבים על משפט שמענדי יכול לומר לאבא. אפשר ללחוש אותו יחד או רק להקשיב.',choices:['תישאר עוד קצת?','תסדר לי את השמיכה?','אני צריך אותך']},
  {icon:'♪',title:'בקצב שלי',action:'מדמיינים חגיגה: מתקרבים קצת, ואחר כך עוברים לפינה שקטה. בוחרים את הקצב שנעים עכשיו.',choices:['להישאר ליד סבא','להתקרב לאבא','למצוא פינה שקטה']},
  {icon:'♡',title:'שלום קטן',action:'אומרים ״שלום, אח קטן״ בקול נעים. לא צריך לקבל חיוך בחזרה כדי שזה יהיה רגע משותף.',choices:['להגיד שלום','לשבת ליד אמא','להסתכל יחד']},
  {icon:'▤',title:'הרגע שלנו',action:'בוחרים ספר או סיפור שאוהבים לקרוא יחד. אפשר לספר רק על דמות אחת שאוהבים בו.',choices:['עוד עמוד יחד','לספר מה הרגשתי','פשוט להמשיך לקרוא']},
  {icon:'✦',title:'בוחרים רגע אהוב',action:'כל אחד בוחר רגע אחד מהסיפור שהיה רוצה לפגוש שוב. אין צורך לבחור באותו רגע.',choices:['המגדל','הסיפור עם אמא','רגע אחר משלי']}
 ];
 const pause=document.createElement('dialog');pause.id='bPauseDialog';pause.setAttribute('aria-labelledby','bPauseTitle');document.body.append(pause);
 function openPause(index){const s=E.scenes[index],m=JSON.parse(JSON.stringify(moments[index]));
  if(E.character==='chani'){
   m.action=m.action.replaceAll('שמענדי יכול','שחני יכולה').replaceAll('מענדי','חני');
   const choices={'המבט של מענדי':'המבט של חני','אני צריך רגע':'אני צריכה רגע','שמח על התינוק':'שמחה על התינוק','רוצה תשומת לב':'רוצה תשומת לב','מרגיש כמה דברים יחד':'מרגישה כמה דברים יחד','אני צריך אותך':'אני צריכה אותך'};
   m.choices=m.choices.map(c=>choices[c]||c);
  }pause.innerHTML='<div class="dialog-top"><span class="b-moment-icon" aria-hidden="true">'+m.icon+'</span><button class="close" aria-label="סגירת רגע יחד">×</button></div><span class="b-paper-kicker">עוצרים רק אם רוצים</span><h2 id="bPauseTitle">'+m.title+'</h2><p class="b-moment-question">'+esc(s.pause)+'</p><div class="b-moment-choices">'+m.choices.map(c=>'<button aria-pressed="false">'+esc(c)+'</button>').join('')+'</div><p class="b-moment-response" role="status">אפשר לבחור כמה רעיונות, לומר משהו אחר או רק להקשיב.</p><button class="btn b-moment-action">מנסים רגע קטן יחד</button><div class="b-moment-do" hidden><span aria-hidden="true">'+m.icon+'</span><p>'+esc(m.action)+'</p></div><button class="btn primary b-moment-continue">ממשיכים בסיפור ←</button>';
  pause.querySelector('.close').onclick=()=>pause.close();pause.querySelector('.b-moment-choices').onclick=e=>{const b=e.target.closest('button');if(!b)return;b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));pause.querySelector('.b-moment-response').textContent='אפשר לספר על הרעיון שבחרתם. גם רעיונות שונים יכולים להתאים.'};
  pause.querySelector('.b-moment-action').onclick=e=>{const panel=pause.querySelector('.b-moment-do');panel.hidden=!panel.hidden;e.currentTarget.setAttribute('aria-expanded',String(!panel.hidden));panel.scrollIntoView({block:'nearest',behavior:'smooth'})};pause.querySelector('.b-moment-continue').onclick=()=>{pause.close();go(Math.min(pages.length-1,3+index*2))};pause.showModal();
 }
 spread.onclick=e=>{const q=e.target.closest('[data-pause]');if(q)return openPause(+q.dataset.pause);const game=e.target.closest('[data-story-game]');if(game){bSetView('play');openGame(game.dataset.storyGame)}if(e.target.closest('[data-story-start]'))go(0);if(e.target.closest('[data-story-play]')){bSetView('play');document.getElementById('games').scrollIntoView({behavior:'smooth',block:'start'})}};
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
 window.BStory={pages,get edition(){return E},editions:B_EDITIONS,selectCharacter,esc,pageHTML,go,render,openPause,visiblePages,artForLegacyPage:index=>E.art[map[index]||'arrival']};
 selectCharacter(E.character);bPaint();
})();
