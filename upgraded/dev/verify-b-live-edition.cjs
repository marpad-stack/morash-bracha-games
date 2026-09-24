const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const url=process.env.B_URL;assert(url&&url.startsWith('https://marpad-stack.github.io/'));
 const b=await chromium.launch({headless:true,channel:'msedge'}),p=await b.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await p.waitForFunction(()=>window.BStory,{},{timeout:60000});
 const report=await p.evaluate(async()=>{
  const paths=[...new Set(Object.values(BStory.editions).flatMap(x=>[...Object.values(x.art),...Object.values(x.spreads)]))];
  const images=await Promise.all(paths.map(src=>new Promise(resolve=>{const i=new Image(),timer=setTimeout(()=>resolve({src,timeout:true}),40000);i.onload=()=>{clearTimeout(timer);resolve({src,width:i.naturalWidth,height:i.naturalHeight})};i.onerror=()=>{clearTimeout(timer);resolve({src,error:true})};i.src=src})));
  return{url:location.href,variants:Object.keys(BStory.editions),bookPagesPerVariant:BStory.pages.length,images,unavailable:images.filter(i=>!(i.width>=640)),overflow:document.documentElement.scrollWidth>innerWidth};
 });
 await p.locator('[data-character=chani]').click();await p.evaluate(()=>BStory.go(6));assert.equal(await p.evaluate(()=>BStory.edition.character),'chani');assert((await p.locator('.b-prose').textContent()).includes('חַנִּי'));
 await p.evaluate(()=>BStory.go(24));await p.locator('[data-book-fun=yawn]').click();assert(await p.locator('#bBookFun').isVisible());await p.keyboard.press('Escape');
 report.errors=errors;assert.deepEqual(errors,[]);assert.equal(report.overflow,false);fs.writeFileSync(path.join(__dirname,'review-evidence/b-edition-live-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
