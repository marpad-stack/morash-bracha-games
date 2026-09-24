const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'review-evidence'),checks=[],base=process.env.B_URL||'http://127.0.0.1:8766/upgraded/b-story.html';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);
 const ok=s=>{checks.push(s);console.log(s)};
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForFunction(()=>window.BStory);
 assert.equal(await page.evaluate(()=>BStory.pages.length),28);
 const approved=JSON.parse(fs.readFileSync(path.join(__dirname,'story-edit-proposal.json')));
 assert.deepEqual(await page.evaluate(()=>BStory.edition.scenes.map(s=>s.text)),approved.scenes.map(s=>s.text));
 assert(await page.evaluate(()=>BStory.edition.scenes.every(s=>s.n.replace(/[\u0591-\u05bd\u05bf-\u05c2\u05c4-\u05c7]/g,'').replace(/[א-ת]+/g,w=>({'בידים':'בידיים','ועינים':'ועיניים','העינים':'העיניים','נתן':'ניתן','עיף':'עייף','עיפה':'עייפה'}[w]||w))===s.text)));
 const dims=await page.evaluate(async()=>Promise.all(Object.values(BStory.edition.art).map(src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve([i.naturalWidth,i.naturalHeight]);i.onerror=()=>resolve([0,0]);i.src=src}))));assert(dims.every(d=>d[0]>=640&&d[1]>=640));ok('Approved manuscript and nikud match exactly; all ten illustrations load');
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1100});await page.evaluate(()=>{bSetView('read');BStory.go(5)});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('#bBookSpread .b-paper').count(),width>=900?2:1);
  await page.screenshot({path:path.join(out,'edition-'+width+'.png')});
  await page.locator('#gridBtn').click();assert.equal(await page.locator('#bContents [data-page]').count(),15);await page.locator('#bContents [data-page="19"]').click();
  await page.locator('#bookRead').click();assert(await page.evaluate(()=>document.body.classList.contains('b-reading-focus')));await page.locator('#bookRead').click();
 }ok('320/390/768/1440 layouts, RTL spreads, contents and reading mode');
 await page.evaluate(()=>BStory.go(20));await page.locator('[data-reading-toggle]:visible').first().click();assert.equal(await page.locator('#bBookSpread .b-prose').textContent(),approved.scenes[9].text.replace(/\n/g,''));await page.locator('[data-reading-toggle]:visible').first().click();
 assert.equal(await page.locator('[data-pause]').count(),0);await page.evaluate(()=>BStory.go(24));assert.equal(await page.locator('[data-book-fun]').count(),3);ok('No inline questions; three end activities');
 await page.evaluate(()=>BStory.go(19));await page.reload({waitUntil:'domcontentloaded'});assert.equal(await page.evaluate(()=>p),19);ok('Edition bookmark persists');
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1100});await page.evaluate(()=>bSetView('read'));
  const pending=page.waitForEvent('popup');await page.locator('#printBtn').click();const pop=await pending;
  for(const layout of ['a4','booklet']){
   await pop.emulateMedia({media:'screen'});if(layout==='booklet')await pop.locator('#layout').selectOption(layout);
   await pop.waitForFunction(()=>document.body.dataset.printReady==='true',{},{timeout:90000});await pop.evaluate(()=>document.fonts.ready);await pop.emulateMedia({media:'print'});
   const values=await pop.locator('[data-book-page]').evaluateAll(xs=>xs.map(x=>+x.dataset.bookPage));assert.deepEqual([...values].sort((a,b)=>a-b),Array.from({length:28},(_,i)=>i));
   assert.equal(await pop.locator('.b-print-sheet').count(),layout==='a4'?28:14);assert.equal(await pop.locator('img[data-branded=true]').count(),13);
   const over=await pop.locator('.b-paper').evaluateAll(xs=>xs.filter(x=>x.scrollHeight>x.clientHeight+1).map(x=>x.dataset.bookPage));assert.deepEqual(over,[],layout+' overflowing pages');
   if(layout==='booklet')assert.deepEqual(values.slice(0,4),[0,27,26,1]);
   await pop.pdf({path:path.join(out,'edition-'+layout+'-'+width+'.pdf'),preferCSSPageSize:true,printBackground:true});
  }await pop.close();
 }ok('Four A4 print cases: 84 PDF pages, every logical page exactly once, RTL folded order, all 13 artwork instances branded, no clipped paper');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>bSetView('play'));assert.equal(await page.locator('.gbtn:visible').count(),6);
 // Run the existing completion journeys against the new book integration.
 const old=fs.readFileSync(path.join(__dirname,'verify-b-final.cjs'),'utf8');
 const block=old.slice(old.indexOf(' for(const level of [1,2,3])'),old.indexOf(' await page.evaluate(()=>{p=35;show()}'));
 await eval('(async()=>{'+block+'})()');
 assert.deepEqual(errors,[]);ok('No JavaScript errors');
 fs.writeFileSync(path.join(out,'b-edition-audit.json'),JSON.stringify({url:base,checks,errors,bookPages:28,scenes:11,artwork:10,physicalDevicesTested:false},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});


