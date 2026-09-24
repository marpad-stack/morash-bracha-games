const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=process.env.A_URL||'http://127.0.0.1:8766/upgraded/a-coloring/index.html';
const out=path.join(__dirname,'review-evidence'),checks=[],art=JSON.parse(fs.readFileSync(path.join(__dirname,'a-final-content.json')));
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,acceptDownloads:true,reducedMotion:'reduce'});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(60000);
 const ok=(name)=>{checks.push({name,passed:true});console.log(name)};
 await ctx.addInitScript(()=>{if(!localStorage.getItem('a-final-test-seeded')){localStorage.setItem('mn_picked','[9,15,2,2,16]');localStorage.setItem('a-final-test-seeded','1')}});
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof aClues!=='undefined'&&aClues.length===10);
 assert.equal(await page.evaluate(()=>PAGES.length),19);assert.deepEqual(await page.evaluate(()=>picked),[2,16]);assert.equal(await page.locator('#bkBody .bk').count(),2);ok('19 pages; rejected pages removed; saved booklet migrated and rendered');
 const images=await page.evaluate(async()=>{const errors=[];for(const p of PAGES){for(const url of [img(p.id),thumb(p.id),cimg(p.id),cthumb(p.id),mimg(p.id)]){const i=await loadImg(url);if(!i||i.width<200)errors.push(url)}}return errors});assert.deepEqual(images,[]);ok('All active full-size images, colors, thumbnails and masks load');
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:width===1440?1000:844});await page.evaluate(()=>go('gallery'));await page.locator('[data-cat="brit"]').click();assert.equal(await page.locator('#grid .card').count(),2);await page.locator('[data-cat="all"]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,`a-final-gallery-${width}.png`)});
  await page.evaluate(()=>go('games'));await page.locator('[data-game="match"]').click();await page.locator('[data-mid]').first().waitFor();assert.equal(await page.locator('[data-mid]').count(),3);assert.equal(await page.evaluate(()=>document.querySelector('#gpanel').scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,`a-final-find-${width}.png`)});await page.locator('[data-close="gpanel"]').first().click();assert.equal(await page.locator('#gpanel').isVisible(),false);
 }ok('Phone widths 320/390 and desktop 1440: gallery, category, 3 choices, closing, no horizontal overflow');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>go('games'));
 for(const pairs of [4,6,12]){
  await page.locator('[data-game="memory"]').click();await page.locator(`[data-mem="${pairs}"]`).click();assert.equal(await page.locator('#board .mem').count(),pairs*2);
  const ids=await page.evaluate(()=>[...new Set([...document.querySelectorAll('#board .mem')].map(x=>x.dataset.id))]);assert.equal(ids.length,pairs);assert(!ids.includes('9')&&!ids.includes('15'));assert(!(ids.includes('4')&&ids.includes('13')));assert(!(ids.includes('5')&&ids.includes('14')));
  for(const id of ids){const cards=page.locator(`#board .mem[data-id="${id}"]`);await cards.nth(0).click();await cards.nth(1).click();await page.waitForFunction(id=>[...document.querySelectorAll(`#board .mem[data-id="${id}"]`)].every(x=>x.disabled),id)}
  assert.equal(await page.locator('#pr').textContent(),String(pairs));await page.locator('#aAgain').waitFor();await page.locator('[data-close="gpanel"]').first().click();
 }ok('Memory: 4/6/12 pairs completed, unique illustrations, scores and closing');
 for(const level of [1,2,3]){
  await page.locator('#artLevel').selectOption(String(level));await page.locator('[data-game="match"]').click();await page.locator('#aTimer').waitFor();assert.equal(await page.locator('#aTimer').inputValue(),'0');
  for(let round=0;round<[6,8,10][level-1];round++){
   const name=(await page.locator('#aClue').getAttribute('aria-label')).replace('חפץ לחיפוש: ','');const id=await page.evaluate(name=>aClues.find(c=>c.name===name).id,name);
   if(round===0){await page.locator(`[data-mid]:not([data-mid="${id}"])`).first().click();await page.locator('#aHint').click();assert(await page.locator('#aHint').isDisabled())}
   await page.locator(`[data-mid="${id}"]`).click();await page.locator('#aNext').click();
  }assert((await page.locator('.a-complete').textContent()).replace(/[\u0591-\u05c7]/g,'').includes('איזו עין חדה'));await page.locator('[data-close="gpanel"]').first().click();
 }ok('Object finder: complete 6/8/10 rounds, wrong answers, hints, default untimed and finish');
 await page.bringToFront();await page.locator('[data-game="match"]').click();await page.locator('#aTimer').waitFor();await page.locator('#aTimer').selectOption('15');await page.waitForFunction(()=>document.querySelector('#aTimer')?.value==='0',{},{timeout:45000});assert.equal(await page.locator('#aTimer').inputValue(),'0');await page.locator('#aTimer').selectOption('0');await page.locator('[data-close="gpanel"]').first().click();ok('Optional timer expires gently without losing the round');
 await page.locator('[data-game="number"]').click();
 for(const id of [...art.editedIds,...art.addedPages.map(p=>p.id)]){
  await page.evaluate(id=>numberGame(id),id);await page.waitForFunction(()=>{const c=document.querySelector('#nArt');return c&&c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>50)});await page.waitForTimeout(120);
  const reg=await page.evaluate(id=>REGIONS[id].r[0],id);await page.locator(`[data-n="${reg.n}"]`).click();await page.locator('#nNum').scrollIntoViewIfNeeded();const b=await page.locator('#nNum').boundingBox();await page.mouse.click(b.x+b.width*reg.x,b.y+b.height*reg.y);await page.waitForFunction(()=>document.querySelector('#ndone').textContent==='1');
 }await page.locator('[data-close="gpanel"]').first().click();ok('All 10 edited/new drawings: actual color-by-number region fills');
 await page.evaluate(()=>{go('gallery');openStudio(16)});await page.waitForFunction(()=>artData&&maskData);const reg=await page.evaluate(()=>REGIONS[16].r[0]);await page.evaluate(r=>fillAt(Math.round(r.x*W),Math.round(r.y*H),[230,40,100]),reg);assert(await page.evaluate(()=>gF.getImageData(0,0,W,H).data.some((v,i)=>i%4===0&&v===230)));
 const download=page.waitForEvent('download');await page.locator('#stSave').click();await(await download).saveAs(path.join(out,'a-final-colored-export.png'));await page.locator('[data-close="studio"]').click();ok('Free coloring fill, PNG export and studio closing');
 await page.evaluate(()=>{picked=[2,10,16,21];updateBk();go('booklet')});assert.equal(await page.locator('.bk').count(),4);const sheets=await page.evaluate(async()=>{const a=[];for(const id of picked)a.push((await pageSheetURL(id)).length);return a});assert(sheets.every(n=>n>100000));await page.reload({waitUntil:'domcontentloaded'});assert.deepEqual(await page.evaluate(()=>picked),[2,10,16,21]);ok('Booklet survives reload; four full printable image pages generated');
 assert.deepEqual(errors,[]);ok('No JavaScript page errors');
 fs.writeFileSync(path.join(out,'a-final-audit.json'),JSON.stringify({url:base,checks,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);fs.writeFileSync(path.join(out,'a-final-audit-failure.json'),JSON.stringify({checks,error:e.stack},null,2));process.exit(1)});
