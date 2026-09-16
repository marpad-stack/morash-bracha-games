const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out=path.join(__dirname,'review-evidence');
(async()=>{
const b=await chromium.launch({headless:true,channel:'msedge'}),c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,acceptDownloads:true,reducedMotion:'reduce'}),report=process.env.ONLY?JSON.parse(fs.readFileSync(path.join(out,'final-audit.json'),'utf8')):[];
async function check(name,url,fn){if(process.env.ONLY&&!process.env.ONLY.split(',').includes(name))return;const prev=report.findIndex(r=>r.name===name);if(prev>=0)report.splice(prev,1);const p=await c.newPage(),errors=[];p.setDefaultTimeout(12000);p.setDefaultNavigationTimeout(45000);p.on('pageerror',e=>errors.push(e.message));try{await p.goto(url,{waitUntil:'domcontentloaded'});await fn(p);assert.deepEqual(errors,[]);report.push({name,passed:true})}catch(e){report.push({name,passed:false,error:e.message,errors})}await p.close();console.log(JSON.stringify(report.at(-1)))}
await check('h-mobile-tools','http://127.0.0.1:8765/upgraded/h-card-studio.html',async p=>{
 for(let i=0;i<6;i++)await p.locator('[data-palette="'+i+'"]').click();
 for(let i=0;i<3;i++)await p.locator('[data-frame="'+i+'"]').click();
 await p.locator('[data-sticker="2"]').click();await p.screenshot({path:path.join(out,'h-phone-viewport.png')});
 await p.locator('#draw').click();const box=await p.locator('#card').boundingBox();console.log(JSON.stringify({canvasBox:box,state:await p.evaluate(()=>({mode,scrollY,point:document.elementFromPoint(180,100)?.id}))}));await p.screenshot({path:path.join(out,'h-draw-viewport.png')});await p.touchscreen.tap(box.x+box.width*.45,box.y+box.height*.4);
 assert(await p.evaluate(()=>data.paths.length>0));
});
await check('f-touch-drag','http://127.0.0.1:8765/upgraded/f-kitchen.html',async p=>{
 await p.locator('#btn-start').click();const session=await c.newCDPSession(p);
 for(const selector of ['#bagItem','#jarItem']){await p.locator(selector).scrollIntoViewIfNeeded();const from=await p.locator(selector).boundingBox(),to=await p.locator('#basketZone').boundingBox(),a={x:from.x+from.width/2,y:from.y+from.height/2},z={x:to.x+to.width/2,y:to.y+to.height/2};await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[a]});for(let i=1;i<=8;i++){await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(z.x-a.x)*i/8,y:a.y+(z.y-a.y)*i/8}]})}await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 await p.locator('#sifter').waitFor();assert.equal(await p.evaluate(()=>idx),1);
});
await check('d-mission-engines','http://127.0.0.1:8765/upgraded/d-mitzvot.html',async p=>{
 const engines=await p.evaluate(()=>[...new Set(MITZVOT.map(m=>m.eng))]);for(const eng of engines){await p.reload();await p.locator('#startGame').click();await p.evaluate(eng=>{busy=true;cardMitzva(cur(),MITZVOT.find(m=>m.eng===eng))},eng);await p.waitForTimeout(400);assert(await p.locator('#cardOv').isVisible());assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:path.join(out,'d-engine-'+eng+'.png')});}report.push({name:'d-engines-covered',engines});
});
const delivery='http://127.0.0.1:8765/'+encodeURIComponent('מסירה-משחקי-הבאת-ברכה')+'/';
await check('owner-review-notes',delivery+encodeURIComponent('בדיקה-סופית.html'),async p=>{
 assert.equal(await p.locator('.review-card').count(),10);await p.locator('#note-a').fill('בדיקת שמירה — הערה לדוגמה');await p.locator('#status-a').selectOption('notes');await p.reload();assert.equal(await p.locator('#note-a').inputValue(),'בדיקת שמירה — הערה לדוגמה');const dl=p.waitForEvent('download');await p.locator('#exportNotes').click();const file=path.join(out,'owner-notes-test.txt');await(await dl).saveAs(file);assert(fs.readFileSync(file,'utf8').includes('בדיקת שמירה'));assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:path.join(out,'review-portal-phone.png')});await p.setViewportSize({width:1440,height:1000});await p.screenshot({path:path.join(out,'review-portal-desktop.png')});
});
fs.writeFileSync(path.join(out,'final-audit.json'),JSON.stringify(report,null,2));await b.close();if(report.some(x=>x.passed===false))process.exitCode=1;
})();

