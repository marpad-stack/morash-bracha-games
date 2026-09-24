/* File-based book art, with readable source text if an image cannot be displayed. */
(()=>{
 const book=document.getElementById('book'),picture=document.getElementById('pageImg'),stack=document.getElementById('stack');
 const notice=document.createElement('p');notice.className='review-tips b-media-status';notice.id='bMediaStatus';notice.setAttribute('role','status');book.before(notice);
 const fallback=document.createElement('div');fallback.id='bPageFallback';fallback.hidden=true;fallback.innerHTML='<span class="b-page-ornament" aria-hidden="true">✦</span><p class="b-page-copy"></p>';stack.append(fallback);
 let revision=0;
 function sync(){
  const token=++revision;book.dataset.mediaState='loading';book.setAttribute('aria-busy','true');picture.hidden=false;fallback.hidden=true;notice.hidden=false;notice.textContent='טוענים את עמוד '+(p+1)+'…';
  picture.alt='עמוד '+(p+1)+' מתוך '+PAGES.length;picture.width=640;picture.height=640;
  fallback.querySelector('.b-page-copy').textContent=BOOK_READING[p].n||'בעמוד הזה יש איור ללא טקסט. האיור אינו זמין כרגע; אפשר להמשיך לעמוד הבא.';
  async function finish(){
   if(!picture.complete)await picture.decode().catch(()=>{});
   if(token!==revision)return;
   const valid=picture.complete&&picture.naturalWidth>=2&&picture.naturalHeight>=2;
   book.dataset.mediaState=valid?'ready':'unavailable';book.setAttribute('aria-busy','false');picture.hidden=!valid;fallback.hidden=valid;notice.hidden=valid;
   notice.textContent='האיור אינו זמין כרגע. אפשר לקרוא כאן את הטקסט ולהמשיך בסיפור.';
  }
  if(picture.complete)finish();else picture.decode().then(finish,finish);
 }
 const originalShow=show;show=function(...args){originalShow(...args);sync()};sync();
 // The text reader remains usable even when an illustration is unavailable.
 const readerImage=document.getElementById('bookReaderImage');
 if(readerImage){const check=()=>{readerImage.hidden=readerImage.complete&&(readerImage.naturalWidth<2||readerImage.naturalHeight<2)};readerImage.addEventListener('load',check);readerImage.addEventListener('error',()=>{readerImage.hidden=true});new MutationObserver(()=>{readerImage.hidden=false}).observe(readerImage,{attributes:true,attributeFilter:['src']})}
 // A blocked thumbnail must not look like an empty activity or an empty gallery tile.
 const watched=new WeakSet();
 function watchThumbnails(){
  document.querySelectorAll('.b-game-picture img,#gwrap img').forEach(img=>{
   if(watched.has(img))return;watched.add(img);
   let marked=false;
   const check=()=>{
    if(marked||!img.complete)return;
    if(img.naturalWidth>=2&&img.naturalHeight>=2)return;
    marked=true;
    img.hidden=true;img.parentElement.classList.add('b-thumbnail-missing');
    const text=document.createElement('span');text.className='b-thumbnail-note';
    text.textContent=img.closest('.gbtn')?'אפשר לשחק — האיור לא נטען':'האיור לא נטען';
    img.after(text);
   };
   img.addEventListener('load',check,{once:true});img.addEventListener('error',check,{once:true});check();
  });
 }
 watchThumbnails();new MutationObserver(watchThumbnails).observe(document.getElementById('gwrap'),{childList:true,subtree:true});
})();
