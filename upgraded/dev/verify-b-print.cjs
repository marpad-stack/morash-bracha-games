const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'review-evidence');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'}),results=[];
 for(const width of [390,1440]){
  const context=await b.newContext({viewport:{width,height:900},isMobile:width===390,hasTouch:width===390});
  await context.addInitScript(()=>{const open=window.open;window.open=function(...args){window.printHadUserActivation=navigator.userActivation.isActive;const w=open.apply(this,args);if(w)w.print=()=>{};return w}});
  const p=await context.newPage();await p.goto('http://127.0.0.1:8766/upgraded/b-story.html',{waitUntil:'domcontentloaded',timeout:60000});await p.evaluate(()=>{p=20;show()});
  const wait=p.waitForEvent('popup');if(width===390)await p.locator('#printBtn').tap();else await p.locator('#printBtn').click();const popup=await wait;assert(await p.evaluate(()=>printHadUserActivation));
  for(const [mode,count,images] of [['compact',21,40],['large',40,40],['current',1,1]]){
   if(mode!=='compact')await popup.locator('#layout').selectOption(mode);await popup.waitForFunction(()=>document.body.dataset.printReady==='true',{},{timeout:30000});assert.equal(await popup.locator('.sheet').count(),count);assert.equal(await popup.locator('img').count(),images);assert(await popup.evaluate(()=>[...document.images].every(i=>i.naturalWidth>=640)));assert.equal(await popup.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await popup.pdf({path:path.join(out,'b-print-'+mode+'-'+width+'.pdf'),preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});if(mode==='current')await popup.screenshot({path:path.join(out,'b-print-current-'+width+'.png')});results.push({width,mode,pages:count,images,userActivation:true,allImagesReady:true});console.log(width,mode,count,'pages');
  }await context.close();
 }fs.writeFileSync(path.join(out,'b-print-audit.json'),JSON.stringify({browser:'Edge; mobile viewport and touch emulation',results,physicalDevicesTested:false},null,2));await b.close();
})().catch(error=>{console.error(error);process.exit(1)});
