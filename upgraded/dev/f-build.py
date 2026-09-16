s=original('shabbat-kitchen*html')
s=replace(s,'const TOTAL_TIME = 240;','let TOTAL_TIME = 240;')
s=replace(s,'function start(){','function start(){TOTAL_TIME=Number(document.getElementById("kitchenPace").value)||240;fCalm=document.getElementById("kitchenPace").value==="0";fClear();')
s=replace(s,'function loadScene(){','function loadScene(){fClear();fFinished=false;')
s=replace(s,'function onSceneDone(){','function onSceneDone(){if(fFinished||!gameActive)return;fFinished=true;')
s=replace(s,'  idx++;','  idx++;fSave();')
s=replace(s,'function finish(won){','function finish(won){fClear();fSave();PlayUI.celebrate();')
s=replace(s,'left--; paintClock();','if(document.hidden||fCalm)return;left--; paintClock();')
s=replace(s,"$('clock').textContent = fmt(Math.max(0,left));","$('clock').textContent = fCalm?'בקצב שלכם':fmt(Math.max(0,left));")
s=replace(s,'const iv=setInterval(()=>{','const iv=fEvery(()=>{',2)
s=s.replace('setTimeout(', 'fLater(')
s=replace(s,"if(gameActive){ loadScene(); }","if(gameActive){ $('stage-title').textContent=L(SCENES[idx].t);say(L(SCENES[idx].instr),false); }")
addon=r'''
let fCalm=false,fFinished=false,fTimers=[];const fSnapshot=PlayUI.read('morash-kitchen-v1',null);
function fLater(fn,ms){const id=setTimeout(fn,ms);fTimers.push(id);return id}function fEvery(fn,ms){const id=setInterval(fn,ms);fTimers.push(id);return id}function fClear(){fTimers.forEach(clearTimeout);fTimers.forEach(clearInterval);fTimers=[]}
const fBar=document.createElement('div');fBar.className='controlbar';fBar.innerHTML='<label>קצב המטבח <select id="kitchenPace" aria-label="קצב המטבח"><option value="0">בקצב שלכם · בלי שעון</option><option value="480">שפים צעירים · 8 דקות</option><option value="240">אתגר השפים · 4 דקות</option></select></label><span class="mini-medal">10 שלבים · חלה אחת משלכם</span>';document.getElementById('btn-start').before(fBar);
function fSave(){PlayUI.save('morash-kitchen-v1',{idx,left,timeUp,nikud:NIKUD,calm:fCalm,total:TOTAL_TIME})}
if(fSnapshot&&Number.isInteger(fSnapshot.idx)&&fSnapshot.idx>=0&&fSnapshot.idx<SCENES.length){const b=document.createElement('button');b.className='btn';b.textContent='ממשיכים משלב '+(fSnapshot.idx+1);b.onclick=()=>{idx=fSnapshot.idx;left=fSnapshot.left;timeUp=fSnapshot.timeUp;NIKUD=fSnapshot.nikud;fCalm=fSnapshot.calm;TOTAL_TIME=fSnapshot.total||240;gameActive=true;lastWon=null;buildDots();renderStaticText();paintClock();loadScene();show('screen-game');clearInterval(tick);tick=setInterval(()=>{if(document.hidden||fCalm)return;left--;paintClock();if(left<=0){timeUp=true;left=0;paintClock();clearInterval(tick)}},1000)};fBar.append(b)}
const fOriginalEnding=renderEnding;renderEnding=function(){fOriginalEnding();if(fCalm&&lastWon?.won)$('end-score').textContent='10 שלבים הושלמו · 500 נקודות שף'};
window.addEventListener('pagehide',()=>{if(gameActive)fSave()});
'''
css=r''':root{--ink:#f7eedd;color-scheme:dark}body{background:radial-gradient(100% 80% at 50% 0,#4a4536,transparent 75%),#292a25;color:#f7eedd}.panel,.opening{background:#393c32;border-color:#f2e4bc30;box-shadow:0 14px 36px #0002}.controlbar{background:#fff6df;color:#514531}.controlbar .btn,.controlbar select{color:#514531}.btn{background:linear-gradient(#edc15e,#d4953f);color:#392d1d;border:0}.btn.ghost{background:transparent;color:#f7eedd}.banner{color:#f2e4bc}#stage{background:linear-gradient(#2d3028,#343a2b)!important}.topbar{background:#ffffff07}.nikud-toggle{color:#edc675}.panel h3{color:#efcf82}.eyebrow{color:#efcf82}.controlbar{font-size:14px}.controlbar select{font-size:13px}.stage{border-radius:26px!important}.done-item{border-radius:18px!important}#clock{font-size:23px!important;white-space:nowrap}.counter,.timer{border-radius:18px!important}.btn{box-shadow:0 4px 0 #8e644214}.hero{display:block!important}#stage{background:radial-gradient(ellipse at bottom,#f5ddab50,transparent 70%)}
'''
exec((DEV/'f-access.py').read_text(encoding='utf-8'))
css+=' #stage [role=button]:focus-visible{outline:4px solid #ffd77f;outline-offset:5px} '
upgrade(s,'f-kitchen.html',addon,css)
