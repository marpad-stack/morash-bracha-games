const fs=require('fs'),path=require('path'),assert=require('assert');
const {pathToFileURL}=require('url');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const file=path.resolve(__dirname,'review-evidence/offline-edition/b-story.html'),b=await chromium.launch({headless:true,channel:'msedge'}),c=await b.newContext({offline:true,viewport:{width:390,height:844}}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(pathToFileURL(file).href,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.BStory);
 const assets=await p.evaluate(async()=>{const unique=[...new Set(Object.values(BStory.editions).flatMap(x=>Object.values(x.art)))];return Promise.all(unique.map(async src=>{const i=new Image();i.src=await MorashBrand.bookPage(src);await i.decode();return{src,width:i.naturalWidth}}))});assert.equal(assets.length,17);assert(assets.every(x=>x.width>=640));
 for(const name of ['mendy','chani']){
  await p.locator('[data-character='+name+']').click();await p.evaluate(()=>BStory.go(5));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const pending=p.waitForEvent('popup');await p.locator('#printBtn').click();const print=await pending;
  for(const layout of ['a4','booklet']){if(layout==='booklet')await print.locator('#layout').selectOption(layout);await print.waitForFunction(()=>document.body.dataset.printReady==='true',{},{timeout:90000});assert.equal(await print.locator('img[data-branded=true]').count(),13);assert.equal(await print.locator('.b-print-sheet').count(),layout==='a4'?28:14)}await print.close();
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'review-evidence/b-edition-offline-audit.json'),JSON.stringify({offline:true,variants:2,bookPagesPerVariant:28,illustrations:assets.length,printLayoutsPerVariant:2,errors},null,2));console.log('Offline ZIP: both books, 17 branded illustrations, both print layouts; no errors');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
