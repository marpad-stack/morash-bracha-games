const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const games=JSON.parse(fs.readFileSync(path.join(__dirname,'content-data.json'),'utf8'));
const out=path.join(__dirname,'review-evidence');fs.mkdirSync(out,{recursive:true});
const base=process.env.REVIEW_BASE||'http://127.0.0.1:8765/upgraded/';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),results=process.env.REVIEW_IDS?JSON.parse(fs.readFileSync(path.join(out,'landing-audit.json'),'utf8')).filter(r=>!process.env.REVIEW_IDS.split(',').includes(r.id)):[];
 for(const width of [390,1440,320]){
  const context=await browser.newContext({viewport:{width,height:width>700?1000:844},isMobile:width<700,hasTouch:width<700,deviceScaleFactor:1});
  for(const g of games){
   if(process.env.REVIEW_IDS&&!process.env.REVIEW_IDS.split(',').includes(g.id))continue;
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+g.file,{waitUntil:'load'});await page.waitForTimeout(500);
   const state=await page.evaluate(()=>{
    const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[inert]')};
    const controls=[...document.querySelectorAll('button,a,input,select,textarea,[role="button"]')].filter(visible).map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,id:e.id,text:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('placeholder')||'').trim().replace(/\s+/g,' ').slice(0,100),w:Math.round(r.width),h:Math.round(r.height)}});
    return {title:document.title,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>{if(!visible(e))return false;const r=e.getBoundingClientRect();return r.right>innerWidth+2||r.left< -2}).slice(0,15).map(e=>({tag:e.tagName,id:e.id,cls:String(e.className).slice(0,80)})),controls,text:document.body.innerText.slice(0,5500),brokenImages:[...document.images].filter(e=>visible(e)&&(!e.complete||!e.naturalWidth)).length};
   });
   if(width!==320)await page.screenshot({path:path.join(out,`${g.id}-${width}.png`),fullPage:true});
   results.push({id:g.id,width,errors,...state});await page.close();
  }await context.close();
 }
 fs.writeFileSync(path.join(out,'landing-audit.json'),JSON.stringify(results,null,2));
 console.log(JSON.stringify(results.map(({id,width,errors,scrollWidth,viewport,brokenImages,controls})=>({id,width,errors,overflow:scrollWidth>viewport,brokenImages,smallControls:controls.filter(c=>c.w<40||c.h<36).map(c=>c.id||c.text)})),null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
