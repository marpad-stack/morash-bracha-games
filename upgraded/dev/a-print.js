/* Open during the tap, then prepare images: mobile browsers keep user activation. */
function aPrintWindow(){
 const w=window.open('','_blank');
 if(!w){toast('הדפדפן חסם את חלון ההדפסה. אפשרו חלונות קופצים לאתר ונסו שוב.');return null}
 w.document.write('<!doctype html><html dir="rtl" lang="he"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>מכינים את הדפים להדפסה</title><body style="font:18px/1.7 Arial,sans-serif;text-align:center;padding:30px;color:#22474d"><p role="status">מכינים את הדפים להדפסה…</p></body></html>');w.document.close();return w;
}
function aPrintError(w){if(w&&!w.closed){w.document.body.innerHTML='<p>לא הצלחנו לטעון את כל התמונות. חזרו למשחק ונסו שוב כשיש חיבור לאינטרנט.</p><button onclick="window.close()" style="font:inherit;padding:12px">חזרה למשחק</button>'}toast('הדפים לא נטענו במלואם. נסו שוב.');}
pageSheetURL=async function(id){
 const [pic,logo]=await Promise.all([loadImg(img(id)),loadImg('images/logo.png')]);if(!pic)throw Error('Missing print image '+id);
 if(document.fonts)await Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,2500))]);
 return stampFoot(sheetCanvas(pic,titleOf(pageById(id)),kidName?'הדף של '+kidName:''),logo).toDataURL('image/png');
};
openPrintWin=async function(urls,w){
 w=w||aPrintWindow();if(!w||w.closed)return;
 const css='@page{size:A4 portrait;margin:7mm}*{box-sizing:border-box}html,body{margin:0;padding:0}body{background:#e8eef0;font:16px/1.6 Arial,sans-serif;color:#22474d}#pbar{padding:16px;text-align:center;background:white;position:sticky;top:0;box-shadow:0 2px 8px #0001}#pbar p{margin:6px}button{font:700 17px Arial,sans-serif;min-height:46px;padding:10px 22px;border:0;border-radius:12px;background:#176e74;color:white;margin:4px}button:disabled{opacity:.5}.paper{background:white;max-width:800px;margin:18px auto;padding:0;break-inside:avoid;page-break-inside:avoid}.pg{display:block;width:100%;height:auto;object-fit:contain}@media(max-width:820px){.paper{margin:12px 10px}}@media print{html,body{background:white}#pbar{display:none!important}.paper{margin:0;padding:0;max-width:none;width:196mm;height:282mm;display:flex;align-items:center;justify-content:center;break-after:page;page-break-after:always}.paper:last-child{break-after:auto;page-break-after:auto}.pg{width:auto;height:auto;max-width:196mm;max-height:282mm;break-inside:avoid;page-break-inside:avoid}}';
 w.document.open();w.document.write('<!doctype html><html dir="rtl" lang="he"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>דפי הצביעה שלי — הדפסה</title><style>'+css+'</style></head><body><header id="pbar"><strong>'+urls.length+' '+(urls.length===1?'דף מוכן':'דפים מוכנים')+' להדפסה</strong><p>כל ציור בעמוד A4 נפרד. בחלון ההדפסה אפשר לבחור מדפסת או שמירה כ־PDF.</p><button id="printNow" disabled>הדפסה / שמירה כ־PDF</button><button onclick="window.close()">חזרה למשחק</button><p id="printStatus" role="status">טוענים את התמונות…</p></header>'+urls.map((u,i)=>'<section class="paper"><img class="pg" src="'+u+'" alt="דף צביעה '+(i+1)+'"></section>').join('')+'</body></html>');w.document.close();
 try{
  await Promise.all([...w.document.images].map(im=>im.decode?im.decode():new Promise((resolve,reject)=>{if(im.complete&&im.naturalWidth)resolve();else{im.onload=resolve;im.onerror=reject}})));
  if(w.closed)return;w.document.body.dataset.printReady='true';const button=w.document.getElementById('printNow');button.disabled=false;button.onclick=()=>{w.focus();w.print()};w.document.getElementById('printStatus').textContent='אם חלון ההדפסה לא נפתח, לחצו על הכפתור. בטלפון אפשר גם לבחור ״הדפסה״ בתפריט השיתוף של הדפדפן.';
  w.requestAnimationFrame(()=>w.requestAnimationFrame(()=>{if(!w.closed){w.focus();w.print()}}));
 }catch{aPrintError(w)}
};
printPage=async function(id){const w=aPrintWindow();if(!w)return;try{await openPrintWin([await pageSheetURL(id)],w)}catch{aPrintError(w)}};
printBooklet=async function(ids){const pages=[...ids].filter(id=>pageById(id));if(!pages.length){toast('בחרו לפחות ציור אחד לחוברת.');return}const w=aPrintWindow();if(!w)return;try{const urls=[];for(const id of pages)urls.push(await pageSheetURL(id));await openPrintWin(urls,w)}catch{aPrintError(w)}};
$('#stPrint').onclick=()=>{const w=aPrintWindow();if(!w)return;composite(async c=>{try{const logo=await loadImg('images/logo.png');await openPrintWin([stampFoot(sheetCanvas(c,'',''),logo).toDataURL('image/png')],w)}catch{aPrintError(w)}})};
