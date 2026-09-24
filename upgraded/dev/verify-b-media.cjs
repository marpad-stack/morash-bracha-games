const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const target=process.env.B_URL||'http://127.0.0.1:8766/upgraded/b-story.html';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),checks=[];
 try {
  for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390,reducedMotion:'reduce'});
   await context.addInitScript(()=>{const open=window.open;window.open=function(...a){const w=open.apply(this,a);if(w)w.print=()=>{};return w}});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(target,{waitUntil:'domcontentloaded',timeout:60000});
   assert(await page.evaluate(()=>PAGES.length===40&&PAGES.every(s=>/^b-story-pages\/[0-9]{2}(?:-[a-f0-9]{12})?\.(webp|jpg|png)$/.test(s))));
   const unavailable=[];
   await page.evaluate(()=>{p=0;show()});
   for(let i=0;i<40;i++){
    await page.waitForFunction(()=>document.getElementById('book').getAttribute('aria-busy')==='false',{}, {timeout:30000});
    assert.equal(await page.evaluate(()=>p),i);
    if(await page.locator('#pageImg').isVisible())assert(await page.locator('#pageImg').evaluate(im=>im.naturalWidth>=640&&im.naturalHeight>=640));
    else{unavailable.push(i+1);assert(await page.locator('#bPageFallback').isVisible());assert((await page.locator('.b-page-copy').textContent()).trim().length>20)}
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if([0,13,20,28,39].includes(i))await page.screenshot({path:path.join(__dirname,'review-evidence',`b-media-${width}-page${i+1}.png`)});
    if(i<39)await page.locator('#next').click();
   }
   await page.locator('#gridBtn').click();assert.equal(await page.locator('#gwrap button').count(),40);await page.locator('#gwrap button').nth(28).click();
   await page.locator('#bookRead').click();await page.waitForFunction(()=>document.getElementById('bookReaderImage').complete);assert((await page.locator('#bookReaderText').textContent()).length>20);await page.locator('#bookReaderClose').click();
   const wait=page.waitForEvent('popup');await page.locator('#printBtn').click();const popup=await wait;
   if(!unavailable.length){await popup.waitForFunction(()=>document.body.dataset.printReady==='true',{}, {timeout:30000});assert.equal(await popup.locator('img').count(),40);assert(await popup.locator('img').evaluateAll(imgs=>imgs.every(i=>i.naturalWidth>=640)));assert.equal(await popup.locator('.sheet').count(),21)}
   else{await popup.waitForFunction(()=>document.getElementById('status').textContent.includes('ההדפסה ממתינה'));assert(await popup.locator('#printNow').isDisabled());await popup.locator('#printTextVersion').click();assert.equal(await popup.locator('.print-text-page').count(),unavailable.length);assert(await popup.locator('#printNow').isEnabled());await popup.emulateMedia({media:'print'});assert(await popup.locator('.print-text-page').evaluateAll(panels=>panels.every(panel=>panel.scrollHeight<=panel.clientHeight+1)));await popup.pdf({path:path.join(__dirname,'review-evidence',`b-public-text-print-${width}.pdf`),preferCSSPageSize:true,printBackground:true})}
   await popup.close();assert.deepEqual(errors,[]);checks.push({width,pages:40,unavailable,blankPages:0,printReady:unavailable.length===0,errors});await context.close();
  }
  const report={url:target,checks};fs.writeFileSync(path.join(__dirname,'review-evidence/b-media-'+(target.startsWith('http://127.')?'local':'live')+'-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  assert(checks.every(c=>!c.unavailable.length),'Not all public images could be displayed');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
