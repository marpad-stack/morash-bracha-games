const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'review-evidence');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'}),results=[];
 for(const width of [390,1440]){
  const c=await b.newContext({viewport:{width,height:900},isMobile:width===390,hasTouch:width===390});
  await c.addInitScript(()=>{const original=window.open;window.open=function(...args){window.printHadUserActivation=navigator.userActivation.isActive;return original.apply(this,args)}});
  const p=await c.newPage();p.setDefaultNavigationTimeout(60000);const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8766/upgraded/a-coloring/index.html',{waitUntil:'domcontentloaded'});
  for(const type of ['single','booklet','painted']){
   let selector;
   if(type==='single'){await p.evaluate(()=>go('gallery'));selector='.card[data-id="16"] [data-act="print"]'}
   if(type==='booklet'){await p.evaluate(()=>{picked=[2,10,21];updateBk();go('booklet')});selector='#bkPrint'}
   if(type==='painted'){await p.evaluate(()=>openStudio(10));await p.waitForFunction(()=>artData&&maskData);selector='#stPrint'}
   const pending=p.waitForEvent('popup');if(width===390)await p.locator(selector).tap();else await p.locator(selector).click();const popup=await pending;assert(await p.evaluate(()=>printHadUserActivation));
   await popup.waitForFunction(()=>document.body.dataset.printReady==='true',{},{timeout:30000});assert.equal(await popup.locator('.paper').count(),type==='booklet'?3:1);assert.equal(await popup.evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>1000)),true);assert.equal(await popup.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await popup.screenshot({path:path.join(out,`a-print-${type}-${width}.png`)});await popup.pdf({path:path.join(out,`a-print-${type}-${width}.pdf`),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});await popup.close();if(type==='painted')await p.locator('[data-close="studio"]').click();results.push({width,type,userActivation:true,imagesReady:true,pages:type==='booklet'?3:1});console.log(width,type,'pass');
  }assert.deepEqual(errors,[]);await c.close();
 }fs.writeFileSync(path.join(out,'a-print-audit.json'),JSON.stringify({browser:'Edge headless, emulated touch/mobile viewport',results},null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
