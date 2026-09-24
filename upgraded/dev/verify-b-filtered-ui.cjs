const assert=require('assert'),fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const pixel=Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64');
  await context.route(/b-story-pages\/(?:14(?:-[a-f0-9]+)?\.jpg|24\.webp|25\.webp)$/,r=>r.fulfill({contentType:'image/gif',body:pixel}));
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8766/upgraded/b-story.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.evaluate(()=>bSetView('play'));
  await page.locator('[data-g="quiet"] .b-thumbnail-note').waitFor();
  assert(await page.locator('[data-g="quiet"] img').isHidden());
  await page.locator('#bookLevel').selectOption('3');await page.locator('[data-g="memory"]').click();
  await page.locator('.b-story-memory .card').first().waitFor();
  assert.equal(await page.locator('.b-story-memory .card').count(),16);
  assert.equal(await page.locator('.b-story-memory [data-scene="23"]').count(),0);
  assert.equal(await page.locator('#gb .b-restart').count(),1);
  for(const id of await page.locator('.b-story-memory .card').evaluateAll(cs=>[...new Set(cs.map(c=>c.dataset.scene))])){
   const pair=page.locator('.b-story-memory [data-scene="'+id+'"]');await pair.nth(0).click();await pair.nth(1).click();
  }
  assert.equal(await page.locator('#bPairs').textContent(),'8');await page.locator('#close').click();
  await page.evaluate(()=>{openGame('memory');bCloseActivity();openGame('needs')});
  await page.locator('[data-need]').first().waitFor();await page.waitForTimeout(500);
  assert.equal(await page.locator('.b-story-memory').count(),0);
  await page.locator('#close').click();await page.evaluate(()=>bSetView('read'));
  await page.locator('#gridBtn').click();await page.locator('#gwrap .b-thumbnail-note').first().waitFor();
  assert.equal(await page.locator('#gwrap .b-thumbnail-note').count(),3);
  await page.screenshot({path:path.join(__dirname,'review-evidence/b-filtered-gallery.png')});
  await page.locator('#gwrap button').nth(13).click();await page.locator('#bPageFallback').waitFor();
  assert((await page.locator('.b-page-copy').textContent()).length>20);assert.deepEqual(errors,[]);
  const report={onePixelPlaceholdersDetected:true,galleryLabels:3,activityLabelVisible:true,memoryUsesVisibleImagesOnly:true,pairsCompleted:8,noDuplicateRestart:true,lateMemoryLoadCannotReplaceNextGame:true,errors};
  fs.writeFileSync(path.join(__dirname,'review-evidence/b-filtered-ui-audit.json'),JSON.stringify(report,null,2));console.log(report);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
