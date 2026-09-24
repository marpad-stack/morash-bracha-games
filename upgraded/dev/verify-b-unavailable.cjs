const assert=require('assert'),fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try {
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await context.addInitScript(()=>{const open=window.open;window.open=function(...args){const w=open.apply(this,args);if(w){w.printCalls=0;w.print=()=>w.printCalls++}return w}});
  const page=await context.newPage();await page.goto('http://127.0.0.1:8766/upgraded/b-story.html',{waitUntil:'domcontentloaded',timeout:60000});
  await page.evaluate(()=>{PAGES[0]='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';p=0;show()});
  const notice=page.locator('.b-book-column .review-tips');await notice.waitFor({state:'visible'});
  let wait=page.waitForEvent('popup');await page.locator('#printBtn').tap();let popup=await wait;
  await popup.waitForFunction(()=>document.getElementById('status').textContent.includes('ההדפסה ממתינה'));
  assert(await popup.locator('#printNow').isDisabled());assert.equal(await popup.evaluate(()=>printCalls),0);assert.equal(await popup.locator('body').getAttribute('data-print-ready'),'false');await popup.close();
  await page.evaluate(()=>{p=20;show()});await notice.waitFor({state:'hidden'});
  wait=page.waitForEvent('popup');await page.locator('#printBtn').tap();popup=await wait;await popup.locator('#layout').selectOption('current');
  await popup.waitForFunction(()=>document.body.dataset.printReady==='true');assert(await popup.locator('#printNow').isEnabled());assert.equal(await popup.locator('.sheet').count(),1);assert(await popup.locator('img').evaluate(im=>im.naturalWidth>=640));
  const report={placeholderDetected:true,readingTextAlternative:true,blankPrintPrevented:true,validCurrentPageCanPrint:true};fs.writeFileSync(path.join(__dirname,'review-evidence/b-unavailable-audit.json'),JSON.stringify(report,null,2));console.log(report);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
