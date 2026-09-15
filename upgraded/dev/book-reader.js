/* The original forty image pages remain the source. This is an additional text view. */
(() => {
  const d=document.createElement('dialog');d.id='bookReaderDialog';d.setAttribute('aria-labelledby','bookReaderTitle');
  d.innerHTML='<div class="dialog-top"><h2 id="bookReaderTitle">אור הגיע אלינו</h2><button type="button" class="close" id="bookReaderClose" aria-label="סגירה">×</button></div><div class="book-reading-layout"><img id="bookReaderImage" alt="עמוד הספר המקורי"><div class="book-reading-text" id="bookReaderText"></div></div><div class="book-reading-nav"><button type="button" class="btn" id="bookReaderPrev">→ עמוד קודם</button><span id="bookReaderCount" dir="ltr"></span><button type="button" class="btn primary" id="bookReaderNext">עמוד הבא ←</button></div>';
  document.body.append(d);const launch=document.createElement('button');launch.className='btn';launch.id='bookRead';launch.textContent='אָ קוראים עם ניקוד';bBar.append(launch);
  function paint(){
    document.getElementById('bookReaderImage').src=PAGES[p];
    document.getElementById('bookReaderImage').alt='עמוד '+(p+1)+' בספר המקורי';
    document.getElementById('bookReaderCount').textContent=(p+1)+' / '+PAGES.length;
    const text=BOOK_READING[p].n;
    document.getElementById('bookReaderText').textContent=text||(PlayReading.enabled?'בָּעַמּוּד הַזֶּה יֵשׁ אִיּוּר. אֶפְשָׁר לְהִסְתַּכֵּל וּלְהַמְשִׁיךְ.':'בעמוד הזה יש איור. אפשר להסתכל ולהמשיך.');
    document.getElementById('bookReaderPrev').disabled=p===0;
    document.getElementById('bookReaderNext').disabled=p===PAGES.length-1;
    d.scrollTop=0;
  }
  launch.onclick=()=>{paint();d.showModal()};document.getElementById('bookReaderClose').onclick=()=>d.close();
  document.getElementById('bookReaderPrev').onclick=()=>{goPrev();paint()};document.getElementById('bookReaderNext').onclick=()=>{goNext();paint()};
  d.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea'))return;if(e.key==='ArrowLeft'&&p<PAGES.length-1){e.preventDefault();goNext();paint()}if(e.key==='ArrowRight'&&p>0){e.preventDefault();goPrev();paint()}e.stopPropagation()});
  window.addEventListener('morash-reading-change',()=>{if(d.open)paint()});
})();
