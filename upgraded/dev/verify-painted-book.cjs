const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'review-evidence');
(async()=>{
 const b=await chromium.launch({headless:true,channel:'msedge'}),p=await b.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),errors=[],checks=[],geometry=[];
 p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8766/upgraded/b-story.html',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.BStory);
 const art=await p.evaluate(async()=>Promise.all([...new Set(Object.values(BStory.editions).flatMap(x=>[...Object.values(x.art),...Object.values(x.spreads)]))].map(async src=>{const i=new Image();i.src=src;await i.decode();return{src,w:i.naturalWidth,h:i.naturalHeight}})));assert.equal(art.length,34);assert(art.every(x=>x.w>=640));
 for(const character of ['mendy','chani']){
  await p.evaluate(c=>{BStory.selectCharacter(c);bSetView('read')},character);
  for(const width of [320,390,768,1024,1440]){
   await p.setViewportSize({width,height:1100});
   for(let i=0;i<11;i++){
    const expected=await p.evaluate(i=>(PlayReading.enabled?BStory.edition.scenes[i].n:BStory.edition.scenes[i].text).replace(/\n/g,''),i);let actual='';
    for(const index of width>=900?[1+i*2]:[1+i*2,2+i*2]){
     await p.evaluate(index=>BStory.go(index),index);await p.waitForFunction(()=>[...document.querySelectorAll('#bBookSpread img')].every(x=>x.naturalWidth>100));
     actual+=await p.locator('#bBookSpread .b-prose').allTextContents().then(xs=>xs.join(''));
     assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
     assert.equal(await p.locator('#bBookSpread [data-pause]').count(),0);
     const bounds=await p.locator('#bBookSpread .b-prose').evaluateAll(xs=>xs.map(x=>{const a=x.closest('article').getBoundingClientRect(),r=x.getBoundingClientRect();return{page:x.closest('article').dataset.bookPage,top:(r.top-a.top)/a.height,bottom:(r.bottom-a.top)/a.height,left:(r.left-a.left)/a.width,right:(r.right-a.left)/a.width,font:getComputedStyle(x).fontSize,clip:r.bottom>a.bottom-20||r.left<a.left||r.right>a.right}}));assert(bounds.every(x=>!x.clip),JSON.stringify({character,width,i,bounds}));
     if(width===1440){geometry.push({character,i,bounds});await p.locator('#bBookSpread').screenshot({path:path.join(out,`painted-${character}-${i}.png`)})}
    }
    assert.equal(actual,expected,`${character} ${width} scene ${i}: every word once in RTL order`);
   }
   await p.evaluate(()=>BStory.go(16));await p.locator('#bBookSpread').screenshot({path:path.join(out,`painted-${character}-${width}.png`)});
  }
  await p.setViewportSize({width:390,height:1100});await p.evaluate(()=>{BStory.go(6);document.body.classList.add('reading-large')});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.evaluate(()=>document.body.classList.remove('reading-large'));
  await p.evaluate(()=>BStory.go(24));assert.equal(await p.locator('[data-book-fun]').count(),3);await p.locator('[data-book-fun=tower]').click();for(let i=0;i<8;i++)await p.locator('[data-add-block]').click();assert(await p.locator('[data-add-block]').isDisabled());await p.keyboard.press('Escape');
  for(const width of [1440,390]){
   await p.setViewportSize({width,height:1100});const open=p.waitForEvent('popup');await p.locator('#printBtn').click();const print=await open;
   for(const layout of ['a4','booklet']){
    await print.emulateMedia({media:'screen'});await print.locator('#layout').selectOption(layout);await print.waitForFunction(()=>document.body.dataset.printReady==='true',null,{timeout:90000});await print.emulateMedia({media:'print'});
    assert.equal(await print.locator('.b-print-sheet').count(),layout==='a4'?28:14);assert.equal(await print.locator('img[data-branded=true]').count(),24);
    const cut=await print.locator('.b-paper').evaluateAll(xs=>xs.flatMap(x=>{const r=x.getBoundingClientRect();return [...x.querySelectorAll('.b-prose p,.b-end-card')].filter(c=>c.getBoundingClientRect().bottom>r.bottom-20).map(c=>x.dataset.bookPage)}));assert.deepEqual(cut,[],`${character} ${layout} clipping`);
    for(let i=0;i<11;i++){const actual=(await print.locator(`[data-book-page="${1+i*2}"] .b-prose`).allTextContents()).join('')+(await print.locator(`[data-book-page="${2+i*2}"] .b-prose`).allTextContents()).join('');assert.equal(actual,await p.evaluate(i=>(PlayReading.enabled?BStory.edition.scenes[i].n:BStory.edition.scenes[i].text).replace(/\n/g,''),i))}
    await print.pdf({path:path.join(out,`painted-${character}-${layout}-${width}.pdf`),preferCSSPageSize:true,printBackground:true});
   }await print.close();
  }
  checks.push(`${character}: every word once on painted scene; all art loaded; five viewports; no clipped text; end play; four print cases`);console.log(checks.at(-1));
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'b-painted-book-audit.json'),JSON.stringify({checks,geometry,errors,illustrations:art,printCases:8,pdfPages:168,physicalDevicesTested:false},null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
