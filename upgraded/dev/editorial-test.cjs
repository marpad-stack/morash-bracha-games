const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const copy=JSON.parse(fs.readFileSync(path.join(__dirname,'editorial-feedback.json'),'utf8'));
const plain=text=>text.replace(/[\u0591-\u05bd\u05bf-\u05c2\u05c4-\u05c7]/g,'');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),report=[];
 for(const width of [320,390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},isMobile:width<600,hasTouch:width<600,reducedMotion:'reduce'}),p=await context.newPage(),errors=[];
  p.on('pageerror',error=>errors.push(error.message));p.setDefaultTimeout(12000);p.setDefaultNavigationTimeout(45000);
  const base='http://127.0.0.1:8766/upgraded/';const click=async locator=>width<600?locator.tap():locator.click();
  await p.goto(base+'a-coloring/index.html',{waitUntil:'domcontentloaded'});
  assert.equal(plain(await p.locator('.hero h1').textContent()),copy.a.title);assert.equal(plain(await p.locator('.hero p').textContent()),copy.a.description);assert.equal(plain(await p.locator('[data-go="games"] span').textContent()),'משחקים לשעות פנאי');
  await p.goto(base+'b-story.html',{waitUntil:'domcontentloaded'});
  assert.equal(plain(await p.locator('header h1').textContent()),copy.b.title);
  for(const level of ['1','2','3']){
   await p.locator('#bookLevel').selectOption(level);
   for(const id of ['memory','patience','dress','face','table','quiet','needs','draw']){
    await click(p.locator('[data-g="'+id+'"]'));
    if(copy.b.activities[id])assert.equal(plain(await p.locator('#gtitle').textContent()),copy.b.activities[id].t);
    await p.locator('#sheet').evaluate(el=>el.scrollTop=el.scrollHeight);
    const rect=await p.locator('#close').boundingBox();assert(rect.y>=0&&rect.y+rect.height<=900,'Close remains visible');
    await click(p.locator('#close'));assert.equal(await p.locator('#modal').evaluate(el=>el.classList.contains('on')),false);
   }
  }
  await p.evaluate(()=>openGame('patience'));const hold=p.locator('#hb'),box=await hold.boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.waitForTimeout(300);await p.mouse.up();const progress=await p.locator('#mi').evaluate(el=>parseFloat(el.style.width));await p.waitForTimeout(200);assert.equal(await p.locator('#mi').evaluate(el=>parseFloat(el.style.width)),progress);await p.mouse.down();await p.waitForTimeout(200);await p.mouse.up();assert(await p.locator('#mi').evaluate(el=>parseFloat(el.style.width))>progress);await click(p.locator('#close'));
  await p.goto(base+'beit-hamitzvot.html',{waitUntil:'domcontentloaded'});assert.equal(plain(await p.locator('.hero h1').textContent()),copy.c.title);
  for(const level of ['1','2','3']){
   await p.locator('#level').selectOption(level);await p.evaluate(()=>open(3));
   const tiles=p.locator('.sequence-tiles button'),positions=await tiles.evaluateAll(items=>items.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y})));
   assert(positions.every(r=>Math.abs(r.y-positions[0].y)<1));assert(positions.every((r,i)=>!i||r.x<positions[i-1].x));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   for(let i=0;i<positions.length;i++){const values=await tiles.evaluateAll(items=>items.map(el=>+el.dataset.value));if(values[i]===i+1)continue;const j=values.indexOf(i+1);await click(tiles.nth(i));await click(tiles.nth(j))}
   await p.locator('.riddle').waitFor();await click(p.locator('#close'));assert.equal(await p.locator('#game').evaluate(el=>el.open),false);
  }
  await p.evaluate(()=>open(3));await p.screenshot({path:path.join(__dirname,'review-evidence','editorial-sequence-'+width+'.png')});assert.deepEqual(errors,[]);report.push({width,bookActivitiesClosed:24,puzzleLevelsSolved:3,quietPauseResume:true,passed:true});await context.close();
 }
 await browser.close();fs.writeFileSync(path.join(__dirname,'review-evidence','editorial-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(error=>{console.error(error);process.exit(1)});
