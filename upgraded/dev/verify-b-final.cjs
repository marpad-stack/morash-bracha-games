const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'review-evidence'),checks=[],base=process.env.B_URL||'http://127.0.0.1:8766/upgraded/b-story.html';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 await context.addInitScript(()=>{if(!localStorage.getItem('b-test-seeded')){localStorage.setItem('morash-book-page','12');localStorage.setItem('b-test-seeded','true')}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultNavigationTimeout(60000);page.setDefaultTimeout(15000);
 const ok=name=>{checks.push(name);console.log(name)};
 await page.goto(base,{waitUntil:'domcontentloaded'});
 assert.equal(await page.evaluate(()=>p),12);assert.equal(await page.locator('#bookBookmark').isVisible(),false);
 const originalText=JSON.parse(fs.readFileSync(path.join(__dirname,'book-reading.json'))).pages;
 assert.deepEqual(await page.evaluate(()=>BOOK_READING),originalText);assert.equal(await page.evaluate(()=>PAGES.length),40);
 const dims=await page.evaluate(async()=>Promise.all(PAGES.map(src=>new Promise(resolve=>{const im=new Image();im.onload=()=>resolve([im.naturalWidth,im.naturalHeight]);im.onerror=()=>resolve(null);im.src=src}))));assert(dims.every(d=>d&&d[0]>=640&&d[1]>=640));ok('40 pages load; story transcript unchanged; bookmark resumes on reload');
 for(const width of [320,390,1522]){
  await page.setViewportSize({width,height:width===1522?696:844});await page.evaluate(()=>{bSetView('read');p=0;show();document.getElementById('app').scrollTop=0});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const size=await page.locator('#pageImg').boundingBox();assert(size.width<=641);assert(Math.abs(size.width-size.height)<1);
  await page.evaluate(()=>bSetView('play'));assert.equal(await page.locator('.gbtn:visible').count(),6);await page.screenshot({path:path.join(out,'b-final-games-'+width+'.png')});await page.evaluate(()=>bSetView('read'));await page.screenshot({path:path.join(out,'b-final-'+width+'.png')});
  await page.locator('#gridBtn').click();assert.equal(await page.locator('#gwrap button').count(),40);await page.locator('#gwrap button').nth(20).click();assert.equal(await page.evaluate(()=>p),20);
  await page.locator('#bookRead').click();assert.equal(await page.locator('#bookReaderDialog').isVisible(),true);await page.locator('#bookReaderNext').click();assert.equal(await page.evaluate(()=>p),21);await page.locator('#bookReaderClose').click();
 }ok('320/390/1522 layouts: no stretching or horizontal overflow; gallery and reading view navigation');
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>bSetView('play'));
 for(const level of [1,2,3]){
  await page.locator('#bookLevel').selectOption(String(level));await page.locator('[data-g="memory"]').click();const count=[3,6,8][level-1];assert.equal(await page.locator('.b-story-memory .card').count(),count*2);
  const ids=await page.locator('.b-story-memory .card').evaluateAll(cards=>[...new Set(cards.map(c=>c.dataset.scene))]);assert.equal(ids.length,count);
  for(const id of ids){const pair=page.locator('.b-story-memory .card[data-scene="'+id+'"]');await pair.nth(0).click();await pair.nth(1).click();assert(await pair.nth(0).isDisabled())}
  assert.equal(await page.locator('#bPairs').textContent(),String(count));assert(await page.evaluate(level=>bRecords['memory-'+level],level));await page.locator('#close').click();
  await page.locator('[data-g="quiet"]').click();assert.equal(await page.locator('[data-light]').count(),[4,9,16][level-1]);
  for(let i=0;i<20&&!await page.locator('#bLightHint').isDisabled();i++){await page.locator('#bLightHint').click();await page.locator('.b-lights .hinted').click()}
  assert(await page.locator('#bLightHint').isDisabled());assert.equal(await page.locator('.b-lights .lit').count(),0);assert(await page.evaluate(level=>bRecords['quiet-'+level],level));await page.locator('#close').click();
  await page.locator('[data-g="dress"]').click();
  if(level>1){await page.locator('[data-clothing="shirt-shabbat"]').click();await page.locator('[data-dress-zone="body"]').click();assert.equal(await page.locator('#bOutfit').evaluate(el=>el.children.length),0)}
  for(const [id,zone] of [['hat-day','head'],['shirt-day','body'],['pants-day','legs'],['socks-day','feet']]){await page.locator('[data-clothing="'+id+'"]').click();await page.locator('[data-dress-zone="'+zone+'"]').click()}
  assert(await page.evaluate(level=>bRecords['dress-'+level],level));await page.screenshot({path:path.join(out,'b-dress-level-'+level+'.png')});await page.locator('#close').click();
 }ok('Memory 3/6/8 pairs, lights 2x2/3x3/4x4, and dressing completed at all levels; stars awarded');
 await page.locator('#bookLevel').selectOption('1');await page.locator('[data-g="dress"]').click();
 const item=await page.locator('[data-clothing="shirt-day"]').boundingBox(),target=await page.locator('[data-dress-zone="body"]').boundingBox();
 await page.mouse.move(item.x+item.width/2,item.y+item.height/2);await page.mouse.down();await page.mouse.move(target.x+target.width/2,target.y+target.height/2,{steps:12});await page.mouse.up();assert((await page.locator('#bOutfit').innerHTML()).length>50);assert.equal(await page.locator('.b-drag-preview').count(),0);await page.locator('#close').click();ok('Dressing supports real pointer drag and click placement');
 await page.locator('[data-g="table"]').click();for(const id of ['c','ch','k','w','s','p']){await page.locator('.chip[data-id="'+id+'"]').click();await page.locator('.drop[data-id="'+id+'"]').click()}assert.equal(await page.locator('.drop.filled').count(),6);await page.screenshot({path:path.join(out,'b-table-final.png')});await page.locator('#close').click();
 await page.locator('[data-g="needs"]').click();assert.equal(await page.locator('.b-table-board').count(),0);for(let i=0;i<3;i++)await page.locator('[data-need="'+i+'"]').click();assert(await page.evaluate(()=>bRecords['needs-1']));await page.locator('#close').click();ok('Table completed with wine and stemless cup; all baby items explored; no stale table style');
 await page.locator('[data-g="memory"]').click();await page.locator('#bPeek').click();await page.locator('#close').click();await page.locator('[data-g="needs"]').click();await page.waitForTimeout(2400);assert.equal(await page.locator('[data-need]').count(),3);await page.keyboard.press('Escape');assert.equal(await page.locator('#modal').isVisible(),false);
 await page.evaluate(()=>{openGame('draw');bCloseActivity()});await page.waitForTimeout(100);ok('Peek timer, Escape and rapid canvas closing do not leak into another activity');
 await page.evaluate(()=>{p=35;show()});await page.reload({waitUntil:'domcontentloaded'});assert.equal(await page.evaluate(()=>p),35);assert(await page.evaluate(()=>bRecords['dress-3']));assert.deepEqual(errors,[]);ok('Page and achievements persist; no JavaScript errors');
 fs.writeFileSync(path.join(out,'b-final-audit.json'),JSON.stringify({url:base,checks,errors,storyTextUnchanged:true},null,2));await browser.close();
})().catch(error=>{console.error(error);fs.writeFileSync(path.join(out,'b-final-failure.json'),JSON.stringify({checks,error:error.stack},null,2));process.exit(1)});
