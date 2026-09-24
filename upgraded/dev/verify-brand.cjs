const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'review-evidence');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),checks=[];
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.addInitScript(()=>{window.print=()=>{};const open=window.open;window.open=function(...a){const w=open.apply(this,a);if(w)w.print=()=>{};return w}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8766/upgraded/b-story.html',{waitUntil:'domcontentloaded',timeout:60000});
  const result=await page.evaluate(async()=>{
   const urls=await Promise.all(PAGES.map(src=>MorashBrand.bookPage(src))),counts=[];
   for(const src of urls){const im=new Image();im.src=src;await im.decode();const cv=document.createElement('canvas');cv.width=im.width;cv.height=im.height;const c=cv.getContext('2d');c.drawImage(im,0,0);const footer=c.getImageData(0,Math.ceil(im.height*.94),im.width,Math.floor(im.height*.06)).data;let black=0,colored=0;for(let i=0;i<footer.length;i+=4){if(footer[i]<80&&footer[i+1]<80&&footer[i+2]<80)black++;if(Math.max(footer[i],footer[i+1],footer[i+2])-Math.min(footer[i],footer[i+1],footer[i+2])>2)colored++}counts.push({black,colored})}
   p=35;show();return {counts,selected:urls[35]};
  });assert.equal(result.counts.length,40);assert(result.counts.every(x=>x.black>100&&x.colored===0));
  fs.writeFileSync(path.join(out,'b-branded-page36.png'),Buffer.from(result.selected.split(',')[1],'base64'));
  await page.waitForFunction(()=>document.getElementById('pageImg').dataset.branded==='true');checks.push('40 book images contain a black rasterized logo in a reserved footer');
  await page.goto('http://127.0.0.1:8766/upgraded/h-card-studio.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.locator('#signature').fill('באהבה');const dl=page.waitForEvent('download');await page.locator('#download').click();await (await dl).saveAs(path.join(out,'h-branded-card.png'));
  const pending=page.waitForEvent('popup');await page.locator('#print').click();const popup=await pending;await popup.waitForFunction(()=>document.images[0]?.complete&&document.images[0].naturalWidth>100);await popup.pdf({path:path.join(out,'h-branded-print.pdf'),format:'A4',printBackground:true});await popup.close();checks.push('Card download and print include reserved black-logo footer');
  await page.goto('http://127.0.0.1:8766/upgraded/i-first-steps/index.html',{waitUntil:'domcontentloaded',timeout:60000});await page.locator('#fName').fill('בדיקה');await page.locator('#fBirth').fill('2026-09-01');await page.locator('#startBtn').click();await page.emulateMedia({media:'print'});assert(await page.locator('.morash-print-brand').isVisible());await page.pdf({path:path.join(out,'i-branded-map.pdf'),preferCSSPageSize:true,printBackground:true});checks.push('Personal map has a repeated black vector logo in print');
  await page.emulateMedia({media:'screen'});
  for(const filename of ['סיכום-הערות-הכותבות.html','הסיפור-נוסח-מוצע.html']){
   await page.goto('http://127.0.0.1:8766/upgraded/dev/review-evidence/'+filename,{waitUntil:'domcontentloaded'});await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,filename.startsWith('סיכום')?'owner-review-phone.png':'story-proposal-phone.png'),fullPage:false});
   if(filename.startsWith('סיכום')){assert.equal(await page.locator('article').count(),86);await page.locator('#game').selectOption('b');assert.equal(await page.locator('article:visible').count(),13)}
  }
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'brand-audit.json'),JSON.stringify({checks,bookPages:40,errors},null,2));console.log(checks);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
