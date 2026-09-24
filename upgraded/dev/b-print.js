/* The popup is opened during the click; printing starts only after every page decodes. */
document.getElementById('printBtn').onclick=()=>{
 const printWindow=window.open('','_blank');
 if(!printWindow){PlayUI.toast('אפשרו חלונות קופצים לאתר כדי לפתוח את ההדפסה.');return}
 const current=p;
 const css='@page{size:A4 portrait;margin:7mm}*{box-sizing:border-box}html,body{margin:0}body{background:#e8edeb;color:#284d50;font:16px/1.65 Arial,sans-serif}header{padding:16px;background:#fff;text-align:center;position:sticky;top:0;z-index:2;box-shadow:0 2px 8px #0002}header p{margin:6px}button,select{font:inherit;border-radius:12px;padding:10px 16px;margin:4px;min-height:44px;border:1px solid #b8cbc3}button{background:#236c70;color:white}button:disabled{opacity:.5}.sheet{max-width:760px;background:#fff;margin:18px auto;padding:20px;display:flex;flex-direction:column;align-items:center;gap:12px}.sheet figure{margin:0;text-align:center;max-width:100%}.sheet img{display:block;width:440px;max-width:100%;height:auto;object-fit:contain}.sheet figcaption{font-size:12px}.sheet.cover img,body[data-layout=large] .sheet img,body[data-layout=current] .sheet img{width:640px}@media(max-width:780px){.sheet{margin:12px 8px;padding:10px}header{position:static}}@media print{html,body{background:white}header{display:none!important}.sheet{width:196mm;height:282mm;max-width:none;margin:0;padding:0;gap:4mm;justify-content:center;break-inside:avoid;break-after:page;page-break-after:always}.sheet:last-child{break-after:auto;page-break-after:auto}.sheet figure{break-inside:avoid}.sheet img{width:128mm;height:128mm}.sheet figcaption{height:4mm;font-size:8pt}.sheet.cover img,body[data-layout=large] .sheet img,body[data-layout=current] .sheet img{width:190mm;height:190mm}}';
 printWindow.document.write('<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>אור הגיע אלינו — הדפסה</title><style>'+css+'</style></head><body data-layout="compact"><header><strong>אור הגיע אלינו — הדפסת הספר</strong><p>בוחרים סידור לדפי A4. אפשר להדפיס או לשמור כ־PDF.</p><label>סידור הדפים <select id="layout"><option value="compact">כל הספר · שני עמודי ספר בכל דף</option><option value="large">כל הספר · עמוד ספר גדול בכל דף</option><option value="current">רק העמוד שקראתי עכשיו</option></select></label><button id="printNow" disabled>הדפסה / שמירה כ־PDF</button><button id="back">חזרה לספר</button><p id="status" role="status">מכינים את הדפים…</p></header><main id="sheets"></main></body></html>');printWindow.document.close();
 const doc=printWindow.document,layout=doc.getElementById('layout'),button=doc.getElementById('printNow'),status=doc.getElementById('status');let revision=0;
 doc.getElementById('back').onclick=()=>printWindow.close();button.onclick=()=>{printWindow.focus();printWindow.print()};
 async function prepare(auto){
  const token=++revision;button.disabled=true;doc.body.dataset.printReady='false';status.textContent='טוענים את כל התמונות…';
  const mode=layout.value;doc.body.dataset.layout=mode;const groups=[];
  if(mode==='current')groups.push([current]);
  else if(mode==='large')PAGES.forEach((_,i)=>groups.push([i]));
  else{groups.push([0]);for(let i=1;i<PAGES.length;i+=2)groups.push(i+1<PAGES.length?[i,i+1]:[i])}
  doc.getElementById('sheets').replaceChildren();
  groups.forEach(indices=>{const sheet=doc.createElement('section');sheet.className='sheet'+(indices.length===1?' cover':'');indices.forEach(i=>{const figure=doc.createElement('figure'),image=doc.createElement('img'),caption=doc.createElement('figcaption');image.src=new URL(PAGES[i],document.baseURI).href;image.alt='עמוד '+(i+1);caption.textContent='עמוד '+(i+1)+' מתוך '+PAGES.length;figure.append(image,caption);sheet.append(figure)});doc.getElementById('sheets').append(sheet)});
  try{
   await Promise.all([...doc.images].map(image=>image.decode?image.decode():new Promise((resolve,reject)=>{if(image.complete&&image.naturalWidth)resolve();else{image.onload=resolve;image.onerror=reject}})));
   if(printWindow.closed||token!==revision)return;
   if([...doc.images].some(image=>image.naturalWidth<2||image.naturalHeight<2))throw new Error('Missing illustration');
   button.disabled=false;doc.body.dataset.printReady='true';status.textContent=groups.length+' דפי A4 מוכנים. אם חלון ההדפסה לא נפתח, לחצו על הכפתור. בטלפון אפשר לבחור הדפסה גם בתפריט השיתוף.';
   if(auto)printWindow.requestAnimationFrame(()=>printWindow.requestAnimationFrame(()=>{if(!printWindow.closed&&token===revision){printWindow.focus();printWindow.print()}}));
  }catch{if(!printWindow.closed&&token===revision)status.textContent='ההדפסה ממתינה: חלק מהאיורים חסרים. בדקו את החיבור או את סינון התמונות, חזרו לספר ונסו שוב. אפשר גם לבחור להדפיס רק עמוד שנטען במלואו.'}
 }
 layout.onchange=()=>prepare(false);prepare(true);
};
