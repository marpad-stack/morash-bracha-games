const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'review-evidence'),checks=[],base=process.env.B_URL||'http://127.0.0.1:8766/upgraded/b-story.html';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),context=await browser.newContext({viewport:{width:1440,height:1100},reducedMotion:'reduce'}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(20000);
 const ok=s=>{checks.push(s);console.log(s)};
 await p.goto(base,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForFunction(()=>window.BStory);
 await p.locator('[data-character=chani]').click();assert.equal(await p.evaluate(()=>BStory.edition.character),'chani');
 const expected=JSON.parse(fs.readFileSync(path.join(__dirname,'story-chani.json')));
 assert.deepEqual(await p.evaluate(()=>BStory.edition.scenes.map(s=>s.text)),expected.scenes.map(s=>s.text));
 assert.equal(await p.evaluate(()=>BStory.pages.map((_,i)=>BStory.pageHTML(i,false)).join('').includes('מענדי')),false);
 assert.equal(await p.evaluate(()=>BStory.edition.scenes.at(-1).text.includes('חני נעשתה אחות גדולה')),true);
 await p.evaluate(()=>BStory.go(5));await p.reload({waitUntil:'domcontentloaded'});assert.equal(await p.evaluate(()=>BStory.edition.character),'chani');assert.equal(await p.evaluate(()=>p),5);
 await p.locator('[data-character=mendy]').click();await p.evaluate(()=>BStory.go(9));await p.locator('[data-character=chani]').click();assert.equal(await p.evaluate(()=>p),5);
 for(const width of [320,390,768,1440]){
  await p.setViewportSize({width,height:1100});await p.evaluate(()=>BStory.go(5));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await p.locator('#bBookSpread .b-paper').count(),width<900?1:2);await p.screenshot({path:path.join(out,'chani-'+width+'.png')});
 }
 for(let i=0;i<11;i++){await p.evaluate(i=>BStory.openPause(i),i);assert.equal((await p.locator('#bPauseDialog').textContent()).includes('מענדי'),false);await p.locator('.b-moment-action').click();await p.keyboard.press('Escape')}
 ok('Chani manuscript, UI, all eleven questions, four widths, direct URL and separate bookmarks');
 const art=await p.evaluate(async()=>Promise.all([...new Set(Object.values(BStory.editions).flatMap(e=>Object.values(e.art)))].map(src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve({src,w:i.naturalWidth,h:i.naturalHeight});i.onerror=()=>resolve({src,w:0});i.src=src}))));assert.equal(art.length,17);assert(art.every(x=>x.w>=640));
 const brand=await p.evaluate(async()=>{const src=BStory.edition.art.tower,a=new Image(),b=new Image();a.src=src;b.src=await MorashBrand.bookPage(src);await Promise.all([a.decode(),b.decode()]);const c=document.createElement('canvas');c.width=a.naturalWidth;c.height=a.naturalHeight;const x=c.getContext('2d');x.drawImage(a,0,0);const raw=x.getImageData(0,0,c.width,c.height).data;x.clearRect(0,0,c.width,c.height);x.drawImage(b,0,0);const branded=x.getImageData(0,0,c.width,c.height).data;let outside=0,inside=0;for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++){const i=4*(y*c.width+xx);if(raw[i]!==branded[i]||raw[i+1]!==branded[i+1]||raw[i+2]!==branded[i+2]){if(xx<c.width*.13&&y>c.height*.93)inside++;else outside++}}return{outside,inside,sameSize:a.naturalWidth===b.naturalWidth&&a.naturalHeight===b.naturalHeight}});
 assert.equal(brand.outside,0);assert(brand.inside>20);assert(brand.sameSize);ok('All 17 illustrations load; logo changes only its small corner and keeps artwork dimensions');
 for(const width of [1440,390]){
  await p.setViewportSize({width,height:1100});await p.evaluate(()=>bSetView('read'));
  const opened=p.waitForEvent('popup');await p.locator('#printBtn').click();const print=await opened;
  for(const layout of ['a4','booklet']){
   await print.emulateMedia({media:'screen'});if(layout==='booklet')await print.locator('#layout').selectOption(layout);
   await print.waitForFunction(()=>document.body.dataset.printReady==='true',{},{timeout:90000});await print.evaluate(()=>document.fonts.ready);await print.emulateMedia({media:'print'});
   assert.equal(await print.locator('.b-print-sheet').count(),layout==='a4'?28:14);assert.equal(await print.locator('img[data-branded=true]').count(),13);
   assert.equal((await print.locator('#sheets').textContent()).includes('מענדי'),false);
   assert.deepEqual(await print.locator('.b-paper').evaluateAll(xs=>xs.filter(x=>x.scrollHeight>x.clientHeight+1).map(x=>x.dataset.bookPage)),[]);
   await print.pdf({path:path.join(out,'chani-'+layout+'-'+width+'.pdf'),preferCSSPageSize:true,printBackground:true});
  }
  // A print window remains the chosen edition even when the website changes.
  await p.evaluate(()=>BStory.selectCharacter('mendy'));await print.emulateMedia({media:'screen'});await print.locator('#layout').selectOption('a4');await print.waitForFunction(()=>document.body.dataset.printReady==='true');assert.equal((await print.locator('#sheets').textContent()).includes('מענדי'),false);await print.close();await p.evaluate(()=>BStory.selectCharacter('chani'));
 }ok('Chani four print cases: 84 PDF pages, no clipped paper, full A4 and folded A4; print edition remains stable');
 await p.evaluate(()=>{bSetView('play');bLevel=3});await p.locator('[data-g=memory]').click();await p.locator('.b-story-memory .card').first().waitFor();
 const scenes=await p.locator('.b-story-memory .card').evaluateAll(xs=>[...new Set(xs.map(x=>x.dataset.scene))]);assert.equal(scenes.length,8);
 const paths=await p.evaluate(()=>bScenes.map(s=>bGameArt(s[0])));assert.equal(new Set(paths).size,9);assert(paths.some(s=>s.includes('chani-')));
 for(const id of scenes){const pair=p.locator('.b-story-memory [data-scene="'+id+'"]');await pair.nth(0).click();await pair.nth(1).click()}
 await p.locator('#close').click();ok('Chani memory uses nine different scene pictures and completes eight pairs');
 assert.deepEqual(errors,[]);
 if(!base.startsWith('file:')){
  const blocked=await browser.newContext();await blocked.route('**/b-story-art/**',r=>r.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aH9sAAAAASUVORK5CYII=','base64')}));
  const q=await blocked.newPage();await q.goto(base,{waitUntil:'domcontentloaded'});await q.evaluate(()=>BStory.go(1));await q.locator('.b-art-unavailable:visible').waitFor();assert((await q.locator('.b-prose').textContent()).length>100);
  const open=q.waitForEvent('popup');await q.locator('#printBtn').click();const print=await open;await print.locator('#printTextVersion').waitFor({state:'visible'});assert(await print.locator('#printNow').isDisabled());await print.locator('#printTextVersion').click();assert.equal(await print.locator('#printNow').isDisabled(),false);await blocked.close();ok('Unavailable artwork leaves readable story and blocks blank printing until explicit text fallback');
 }
 fs.writeFileSync(path.join(out,base.startsWith('file:')?'b-edition-offline-audit.json':'b-variants-audit.json'),JSON.stringify({url:base,checks,art,brand,errors,physicalDevicesTested:false},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
