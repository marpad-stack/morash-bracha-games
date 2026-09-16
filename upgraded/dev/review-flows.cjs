const fs=require('fs'),path=require('path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const games=JSON.parse(fs.readFileSync(path.join(__dirname,'content-data.json'),'utf8'));
const out=path.join(__dirname,'review-evidence');
for(const g of games){let s=fs.readFileSync(path.join(__dirname,'..',g.file),'utf8').replace(/data:image\/[^"'<>\s]+/g,'[image]');fs.mkdirSync(path.join(out,'source'),{recursive:true});fs.writeFileSync(path.join(out,'source',g.id+'.html'),s)}
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'}),results=[];
 for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:width>700?1000:844},isMobile:width<700,hasTouch:width<700,acceptDownloads:true});
 for(const g of games){
 const page=await context.newPage();page.setDefaultTimeout(5000);const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.dismiss());
 await page.goto('http://127.0.0.1:8765/upgraded/'+g.file);await page.waitForTimeout(200);
 async function capture(label){await page.waitForTimeout(250);const info=await page.evaluate(()=>({text:document.body.innerText.slice(-9500),controls:[...document.querySelectorAll('button,input,select,[role=button]')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height&&getComputedStyle(e).visibility!=='hidden').map(e=>({id:e.id,cls:String(e.className),text:(e.getAttribute('aria-label')||e.textContent).trim().replace(/\s+/g,' ').slice(0,90),onclick:e.getAttribute('onclick')})),overflow:document.documentElement.scrollWidth>innerWidth}));await page.screenshot({path:path.join(out,`${g.id}-${width}-${label}.png`),fullPage:true});results.push({id:g.id,width,label,errors:[...errors],...info})}
 try{
 if(g.id==='a'){await page.locator('[data-go="games"]').click();await capture('games');await page.locator('[data-game="memory"]').click();await capture('memory');}
 if(g.id==='b'){await page.locator('[data-g="memory"]').click();await capture('memory');}
 if(g.id==='c'){await page.locator('.hotspot').first().click();for(let i=0;i<8;i++)await page.locator('.target').first().click({force:true});await page.waitForTimeout(800);await capture('riddle');}
 if(g.id==='d'){await page.locator('#startGame').click();await capture('board');}
 if(g.id==='e'){await page.locator('#timeMode').selectOption('hands');await page.locator('#playBtn').click();await page.locator('#eAction').click();await capture('activity');for(let i=0;i<4;i++)await page.locator('#eTapAlternative').click();await page.waitForTimeout(1100);await capture('next');}
 if(g.id==='f'){await page.locator('#btn-start').click();await capture('stage');}
 if(g.id==='g'){await page.locator('[data-clue="0"]').click();await capture('testimony');}
 if(g.id==='h'){await page.locator('#signature').fill('באהבה, משפחת ישראלי');await page.locator('[data-sticker="0"]').click();await capture('editing');const download=page.waitForEvent('download');await page.locator('#download').click();await (await download).saveAs(path.join(out,`card-${width}.png`));await page.reload();await capture('restored');}
 if(g.id==='i'){await page.locator('#fName').fill('בדיקה');await page.locator('#fBirth').fill('2026-09-01');await page.locator('#startBtn').click();await capture('map');}
 if(g.id==='j'){await page.locator('.mood-btn').first().click();await capture('card');}
 }catch(e){results.push({id:g.id,width,error:e.message,errors});await capture('error')}
 await page.close();
 }await context.close();}
 fs.writeFileSync(path.join(out,'flow-audit.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(({id,width,label,error,errors,overflow})=>({id,width,label,error,errors,overflow})),null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
