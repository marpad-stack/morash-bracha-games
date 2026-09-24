const assert=require('assert'),fs=require('fs'),path=require('path');
const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1440,height:1100}}),checks=[];await p.goto('http://127.0.0.1:8766/upgraded/b-story.html?story=chani',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.BStory);await p.evaluate(()=>bSetView('read'));
 for(const width of [390,1024,1280,1440]){
  await p.setViewportSize({width,height:1100});
  for(const mode of ['reading-large','b-reading-focus']){
   for(let i=0;i<11;i++){
    await p.evaluate(({mode,i})=>{document.body.classList.remove('reading-large','b-reading-focus');document.body.classList.add(mode);BStory.go(2+i*2)},{mode,i});
    const expected=await p.evaluate(i=>(PlayReading.enabled?BStory.edition.scenes[i].n:BStory.edition.scenes[i].text).replace(/\n/g,''),i);assert.equal(await p.locator('.b-paper-text .b-prose').textContent(),expected);
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const cut=await p.locator('.b-paper-text .b-prose').evaluate(x=>x.getBoundingClientRect().bottom>x.closest('article').getBoundingClientRect().bottom-20);assert(!cut,`${width} ${mode} ${i}`);
   }
   checks.push({width,mode,scenes:11});
  }
  await p.evaluate(()=>BStory.go(6));await p.waitForFunction(()=>[...document.querySelectorAll('#bBookSpread img')].every(x=>x.naturalWidth>100));await p.locator('#bBookSpread').screenshot({path:path.join(__dirname,'review-evidence',`painted-large-${width}.png`)});
 }
 await p.evaluate(()=>{document.body.classList.remove('reading-large','b-reading-focus');BStory.render()});await p.locator('#bookRead').click();assert.equal(await p.locator('#bookRead').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('.b-opening-line').count(),0);await p.locator('#bookRead').click();assert.equal(await p.locator('.b-opening-line').count(),1);
 fs.writeFileSync(path.join(__dirname,'review-evidence/b-painted-large-audit.json'),JSON.stringify({checks},null,2));console.log('Both enlarged reading modes: complete prose, no overflow or clipped text at four widths.');await b.close()
})().catch(e=>{console.error(e);process.exit(1)});
