const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'review-evidence');
const unpointed=s=>s.replace(/[\u0591-\u05bd\u05bf-\u05c2\u05c4-\u05c7]/g,'');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),p=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8766/upgraded/b-story.html',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.BStory);
 for(const character of ['mendy','chani']){
  await p.evaluate(c=>{BStory.selectCharacter(c);bSetView('read')},character);
  for(const width of [320,390,768,1440]){
   await p.setViewportSize({width,height:1100});
   for(let i=0;i<11;i++){
    await p.evaluate(i=>BStory.go(1+i*2),i);
    assert.equal(await p.locator('#bBookSpread h2').count(),0);
    assert.equal(await p.locator('.b-picture-spread').count(),1);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    assert.equal(await p.locator('.b-scene-copy .b-prose').textContent(),await p.evaluate(i=>(PlayReading.enabled?BStory.edition.scenes[i].n:BStory.edition.scenes[i].text).replace(/\n/g,''),i));
    const cut=await p.locator('.b-picture-spread').evaluate(x=>{const r=x.getBoundingClientRect();return [...x.querySelectorAll('.b-prose p,.b-pause-button')].some(p=>{const b=p.getBoundingClientRect();return b.left<r.left||b.right>r.right||b.bottom>r.bottom})});assert(!cut,`${character} ${width} ${i} clipping`);
   }
   await p.evaluate(()=>BStory.go(15));await p.locator('.b-scene-art img').evaluate(im=>im.decode());
   await p.screenshot({path:path.join(out,`picture-${character}-${width}.png`),fullPage:false});
  }
  // Page-turning advances whole scenes on touch screens too.
  await p.setViewportSize({width:390,height:1100});await p.evaluate(()=>BStory.go(1));await p.locator('#next').click();assert.equal(await p.locator('.b-picture-spread').getAttribute('data-scene'),'1');await p.locator('#prev').click();assert.equal(await p.locator('.b-picture-spread').getAttribute('data-scene'),'0');
  for(let i=0;i<11;i++){await p.evaluate(i=>BStory.openPause(i),i);assert.equal(unpointed(await p.locator('.b-moment-question').textContent()),await p.evaluate(i=>BStory.edition.scenes[i].pause,i));await p.locator('.b-moment-action').click();assert.equal(unpointed(await p.locator('.b-moment-do p').textContent()),await p.evaluate(i=>BStory.edition.scenes[i].moment.action,i));await p.keyboard.press('Escape')}
  for(const width of [1440,390]){
   await p.setViewportSize({width,height:1100});const opened=p.waitForEvent('popup');await p.locator('#printBtn').click();const print=await opened;
   for(const layout of ['a4','booklet']){
    await print.emulateMedia({media:'screen'});await print.locator('#layout').selectOption(layout);await print.waitForFunction(()=>document.body.dataset.printReady==='true',null,{timeout:90000});await print.emulateMedia({media:'print'});
    const values=await print.locator('[data-book-page]').evaluateAll(xs=>xs.map(x=>+x.dataset.bookPage));assert.deepEqual([...values].sort((a,b)=>a-b),Array.from({length:28},(_,i)=>i));if(layout==='booklet')assert.deepEqual(values.slice(0,4),[0,27,26,1]);
    const clips=await print.locator('.b-paper').evaluateAll(xs=>xs.flatMap(x=>{const r=x.getBoundingClientRect();return [...x.querySelectorAll('.b-prose p,.b-print-question')].filter(el=>el.getBoundingClientRect().bottom>r.bottom-28).map(el=>({page:x.dataset.bookPage,text:el.textContent.slice(0,35),bottom:el.getBoundingClientRect().bottom-r.bottom}))}));assert.deepEqual(clips,[],`${character} ${width} ${layout} copy clipping`);
    assert.equal(await print.locator('img[data-branded=true]').count(),24);
    for(let i=0;i<11;i++){const text=await print.locator(`[data-book-page="${1+i*2}"] .b-prose,[data-book-page="${2+i*2}"] .b-prose`).allTextContents();const expected=await p.evaluate(i=>(PlayReading.enabled?BStory.edition.scenes[i].n:BStory.edition.scenes[i].text).replace(/\n/g,''),i);if(layout==='a4')assert.equal(text.join(''),expected)}
    await print.pdf({path:path.join(out,`picture-${character}-${layout}-${width}.pdf`),preferCSSPageSize:true,printBackground:true});
   }await print.close();
  }
  checks.push(`${character}: eleven full scenes at four widths; no headings/overflow; navigation, activities, 84 PDF pages with no clipped prose`);console.log(checks.at(-1));
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'b-picture-story-audit.json'),JSON.stringify({checks,errors,printCases:8,pdfPages:168,physicalDevicesTested:false},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
