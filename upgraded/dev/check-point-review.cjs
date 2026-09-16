const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,acceptDownloads:true});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const base='http://127.0.0.1:8765/'+encodeURIComponent('מסירה-משחקי-הבאת-ברכה')+'/';
  await p.goto(base+'משחקים/f-kitchen.html',{waitUntil:'domcontentloaded'});assert.equal(await p.locator('#bracha-review-layer').count(),0);
  await p.goto(base+'משחקים/f-kitchen.html?review=1',{waitUntil:'domcontentloaded'});
  const layer=p.locator('#bracha-review-layer');
  await layer.locator('#pick').click();
  if(mobile)await p.locator('#btn-start').tap();else await p.locator('#btn-start').click();
  assert(await layer.locator('#editor').isVisible());assert.equal(await p.evaluate(()=>idx),0);
  await layer.locator('#name').fill('בודקת לדוגמה');await layer.locator('#comment').fill('הכפתור לא ברור <script>alert(1)</script>');await layer.locator('#save').click();
  assert(await p.locator('#btn-start').isVisible());assert.equal(await layer.locator('.pin').count(),1);
  await p.reload({waitUntil:'domcontentloaded'});assert.equal(await layer.locator('.pin').count(),1);
  await layer.locator('.pin').click();await layer.locator('#comment').fill('כפתור פתיחה — בדיקה');await layer.locator('#save').click();
  await p.locator('#btn-start').click();
  await layer.locator('#pick').click();await p.keyboard.press('Escape');assert.equal(await layer.locator('#pick').textContent(),'＋ הוספת הערה');
  const portal=await context.newPage();await portal.goto(base+'בדיקה-סופית.html',{waitUntil:'domcontentloaded'});
  assert((await portal.locator('#pointCount').textContent()).includes('1'));
  assert.equal(await portal.locator('#reviewerName').inputValue(),'בודקת לדוגמה');
  await portal.locator('#viewPointNotes').click();assert((await portal.locator('#bracha-review-layer .entries').textContent()).includes('כפתור פתיחה'));
  const dl=portal.waitForEvent('download');await portal.locator('#bracha-review-layer #download').click();
  const file=path.join(__dirname,'review-evidence','point-report-'+mobile+'.html');await(await dl).saveAs(file);assert(fs.readFileSync(file,'utf8').includes('כפתור פתיחה'));
  await portal.locator('#bracha-review-layer #close').click();
  assert.equal(await portal.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await portal.screenshot({path:path.join(__dirname,'review-evidence','point-portal-'+mobile+'.png')});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({mobile,passed:true}));await context.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
