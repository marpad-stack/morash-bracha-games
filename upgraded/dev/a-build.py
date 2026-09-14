with zipfile.ZipFile(next(ROOT.glob('מתחם*zip'))) as z:
    for n in z.namelist():
        if n.startswith('coloring-site/') and not n.endswith('/'):
            rel=Path(n.removeprefix('coloring-site/'))
            dest=(OUT/'a-coloring'/rel).resolve()
            assert dest.is_relative_to((OUT/'a-coloring').resolve())
            dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(z.read(n))
s=(OUT/'a-coloring/index.html').read_text(encoding='utf-8-sig')
s=replace(s,"if(kind==='memory') memory(6);","if(kind==='memory') memory([4,6,12][aLevel-1]);")
s=replace(s,"if(kind==='puzzle') puzzle('swap',2,rnd());","if(kind==='puzzle') puzzle('swap',[2,3,4][aLevel-1],rnd());")
s=replace(s,'[6,8,12].map(n=>','[4,6,8,12].map(n=>')
s=replace(s,"if(found===pairs){confetti(150);","if(found===pairs){aAward('memory',Math.max(20,pairs*20-moves*2));confetti(150);")
s=replace(s,"if(won){confetti(150);toast('הפאזל הושלם! 🎉')}","if(won){aAward('puzzle',Math.max(20,n*n*20-moves*2));confetti(150);toast('הפאזל הושלם! 🎉')}")
s=replace(s,'if(round>TOTAL){','if(round>TOTAL){aAward("match",score*20);')
addon=r'''
let aLevel=PlayUI.read('morash-art-level',1),aRecords=PlayUI.read('morash-art-records',{});
const aBar=document.createElement('div');aBar.className='controlbar';aBar.innerHTML='<label>רמת משחק <select id="artLevel" aria-label="רמת משחק"><option value="1">צעדים ראשונים · 4+</option><option value="2">מתקדמים · 7+</option><option value="3">אלופים · 10+</option></select></label><button class="btn" id="artAlbum">המדליות שלי</button><span class="mini-medal" id="artPoints"></span>';document.querySelector('.topbar').after(aBar);
document.getElementById('artLevel').value=aLevel;document.getElementById('artLevel').onchange=e=>{aLevel=+e.target.value;PlayUI.save('morash-art-level',aLevel)};
function aAward(game,score){const id=game+'-'+aLevel;if(!aRecords[id]||aRecords[id]<score){aRecords[id]=score;PlayUI.save('morash-art-records',aRecords);PlayUI.toast('שיא חדש! '+score+' נקודות ✦')}aPaint()}
function aPaint(){document.getElementById('artPoints').textContent=Object.values(aRecords).reduce((a,b)=>a+b,0)+' נקודות בשיאים'}
document.getElementById('artAlbum').onclick=()=>{let d=document.getElementById('artDialog');if(!d){d=document.createElement('dialog');d.id='artDialog';document.body.append(d)}d.innerHTML='<div class="dialog-top"><h2>המדליות שלי</h2><button class="close" id="artClose" aria-label="סגירה">×</button></div><p class="muted">כל שיא נשמר. משחקים שוב ומשפרים את מספר המהלכים!</p><div class="grid">'+['memory','puzzle','match'].map((g,i)=>'<div class="panel"><div style="font-size:40px">'+['🧠','🧩','🔎'][i]+'</div><h3>'+['זיכרון','פאזל','מצא את הציור'][i]+'</h3>'+[1,2,3].map(l=>'<p>רמה '+l+' · '+(aRecords[g+'-'+l]??'עדיין לא שיחקנו')+(aRecords[g+'-'+l]?' נקודות':'')+'</p>').join('')+'</div>').join('')+'</div>';d.showModal();document.getElementById('artClose').onclick=()=>d.close()};
// The puzzle already supports tapping; expose the same action to keyboard users.
const aObserver=new MutationObserver(()=>{document.querySelectorAll('.pz:not(.empty)').forEach(t=>{t.role='button';t.tabIndex=0;t.ariaLabel='חלק פאזל';t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click()}}});document.querySelectorAll('.mem').forEach((t,i)=>t.ariaLabel='קלף '+(i+1))});aObserver.observe(document.getElementById('gBody'),{childList:true,subtree:true});aPaint();
'''
css=r''':root{--brand:#197f80;--pink:#ef8878;--blue:#18898d;--gold:#e8b855}body{background:#fff9ed}.hero{display:block!important}.card,.game-card{border-radius:24px!important;box-shadow:0 8px 30px #2864570a}.btn-b,.btn-p{background:#177c7f!important;color:white!important}.mem-f{background:linear-gradient(135deg,#288d8e,#176b6d)!important}.mem-f:after{content:'✦';color:#f5d37c;font-size:38px}.gpanel{background:#fff9ed}.mem-board{max-width:620px;margin:auto}.pz-board{border:8px solid white;box-shadow:0 16px 45px #28584c15;border-radius:20px;overflow:hidden}.controlbar .btn{padding:8px 12px}.controlbar select{font-size:14px}@media(max-width:650px){.controlbar{margin:10px}.grid{grid-template-columns:1fr 1fr}}
'''
upgrade(s,'a-coloring/index.html',addon,css)
