const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'review-evidence');
(async()=>{
 const b=await chromium.launch({headless:true,channel:'msedge'}),p=await b.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),errors=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8766/upgraded/b-story.html',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.BStory);
 for(const character of ['mendy','chani']){
  await p.evaluate(c=>{BStory.selectCharacter(c);bSetView('read')},character);
  for(const width of [320,390,768,1440]){
   await p.setViewportSize({width,height:1100});
   for(let i=0;i<11;i++){
    await p.evaluate(i=>BStory.go(2+i*2),i);
    assert.equal(await p.locator('#bBookSpread .b-paper').count(),width>=900?2:1);
    assert.equal(await p.locator('#bBookSpread [data-pause]').count(),0);
    assert.equal(await p.locator('#bBookSpread .b-prose').textContent(),await p.evaluate(i=>(PlayReading.enabled?BStory.edition.scenes[i].n:BStory.edition.scenes[i].text).replace(/\n/g,''),i));
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    if(width>=900){const pages=await p.locator('#bBookSpread .b-paper').evaluateAll(xs=>xs.map(x=>({x:x.getBoundingClientRect().x,bg:getComputedStyle(x).backgroundColor})));assert(pages[0].x>pages[1].x);assert.equal(pages[0].bg,pages[1].bg);assert.equal(await p.locator('.b-paper-art img').evaluate(im=>getComputedStyle(im).objectFit),'contain')}
   }
   await p.evaluate(()=>BStory.go(15));await p.screenshot({path:path.join(out,`facing-${character}-${width}.png`)});
  }
  await p.setViewportSize({width:390,height:1100});await p.evaluate(()=>BStory.go(1));await p.locator('#next').click();assert.equal(await p.locator('.b-paper').getAttribute('data-book-page'),'2');await p.locator('#prev').click();assert.equal(await p.locator('.b-paper').getAttribute('data-book-page'),'1');
  await p.evaluate(()=>BStory.go(24));assert.equal(await p.locator('[data-book-fun]').count(),3);
  await p.locator('[data-book-fun=tower]').click();for(let i=0;i<8;i++)await p.locator('[data-add-block]').click();assert.equal(await p.locator('.b-fun-tower span').count(),8);assert(await p.locator('[data-add-block]').isDisabled());await p.locator('[data-reset-tower]').click();assert.equal(await p.locator('.b-fun-tower span').count(),0);await p.locator('#bBookFun .close').click();
  await p.locator('[data-book-fun=yawn]').click();await p.locator('[data-yawn]').click();assert.equal(await p.locator('.b-big-yawn').count(),1);await p.locator('[data-yawn]').click();assert.equal(await p.locator('.b-big-yawn').count(),0);await p.keyboard.press('Escape');
  await p.locator('[data-book-fun=find]').click();await p.waitForFunction(()=>document.querySelector('.b-fun-picture')?.naturalWidth>100);await p.keyboard.press('Escape');
  await p.setViewportSize({width:1440,height:1100});await p.evaluate(()=>BStory.go(24));await p.screenshot({path:path.join(out,`facing-${character}-activities.png`)});
  for(const width of [1440,390]){
   await p.setViewportSize({width,height:1100});const open=p.waitForEvent('popup');await p.locator('#printBtn').click();const print=await open;
   for(const layout of ['a4','booklet']){
    await print.emulateMedia({media:'screen'});await print.locator('#layout').selectOption(layout);await print.waitForFunction(()=>document.body.dataset.printReady==='true',null,{timeout:90000});await print.emulateMedia({media:'print'});
    assert.equal(await print.locator('.b-print-sheet').count(),layout==='a4'?28:14);assert.equal(await print.locator('img[data-branded=true]').count(),13);assert.equal(await print.locator('.b-print-question').count(),0);
    const cut=await print.locator('.b-paper').evaluateAll(xs=>xs.flatMap(x=>{const r=x.getBoundingClientRect();return [...x.querySelectorAll('.b-prose p,.b-end-card')].filter(c=>c.getBoundingClientRect().bottom>r.bottom-25).map(c=>x.dataset.bookPage)}));assert.deepEqual(cut,[],`${character} ${layout} clipping`);
    for(let i=0;i<11;i++)assert.equal(await print.locator(`[data-book-page="${2+i*2}"] .b-prose`).textContent(),await p.evaluate(i=>(PlayReading.enabled?BStory.edition.scenes[i].n:BStory.edition.scenes[i].text).replace(/\n/g,''),i));
    await print.pdf({path:path.join(out,`facing-${character}-${layout}-${width}.pdf`),preferCSSPageSize:true,printBackground:true});
   }await print.close();
  }
  checks.push(`${character}: complete illustrations on facing pages with matching backgrounds; full prose, no inline questions; three end activities; four viewports and four print cases`);console.log(checks.at(-1));
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'b-facing-book-audit.json'),JSON.stringify({checks,errors,printCases:8,pdfPages:168,physicalDevicesTested:false},null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
