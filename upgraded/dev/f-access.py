# Adapt input methods without changing the original stage content.
s=s.replace("this.classList.add('done');", "if(this.classList.contains('done'))return;this.setAttribute('aria-disabled','true');this.classList.add('done');")
s=replace(s,"  el.style.touchAction='none';",r'''  el.style.touchAction='none';
  el.tabIndex=0;el.setAttribute('role','button');
  el.setAttribute('aria-label',(el.parentElement.querySelector('.drag-label')?.textContent||'מעבירים פריט')+' · Enter');
  el.addEventListener('keydown',e=>{
    if(!['Enter',' '].includes(e.key)||locked)return;e.preventDefault();el.classList.remove('pulse-hint');
    const t=targets[0],tr=t.getBoundingClientRect(),er=el.getBoundingClientRect();
    curx+=tr.left+tr.width/2-er.left-er.width/2;cury+=tr.top+tr.height/2-er.top-er.height/2;
    el.style.transition='none';el.style.transform=`translate(${curx}px,${cury}px)`;active=true;void el.offsetWidth;release();
  });''')
s=replace(s,'      locked=true;','      locked=true;el.setAttribute("aria-disabled","true");el.tabIndex=-1;')
start=s.index("    dough.addEventListener('pointermove'")
end=s.index("    ['pointerup','pointercancel']",start)
s=s[:start]+r'''    function knead(amount){
      if(finished)return;total+=amount;dough.classList.remove('pulse-hint');
      const pct=clamp(total/need*100,0,100);setRing('kneadRing',pct);
      const scale=1+Math.sin(total/38)*0.08;dough.style.transform=`scale(${scale},${2-scale})`;
      if(pct>=100){finished=true;dough.setAttribute('aria-disabled','true');dough.style.transform='scale(1,1)';fLater(done,300)}
    }
    dough.tabIndex=0;dough.setAttribute('role','button');dough.setAttribute('aria-label','לשים את הבצק · מקש רווח');
    dough.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();knead(80)}});
    dough.addEventListener('pointermove',e=>{if(!down||finished)return;knead(Math.hypot(e.clientX-lx,e.clientY-ly));lx=e.clientX;ly=e.clientY});
''' + s[end:]
start=s.index("    ch.addEventListener('pointermove'");end=s.index("    ['pointerup','pointercancel']",start)
s=s[:start]+r'''    function brush(amount){
      if(washDone)return;total+=amount;ch.classList.remove('pulse-hint');
      const pct=clamp(total/need*100,0,100);wash.style.opacity=pct/100;$('washFill').style.width=pct+'%';
      if(pct>=100){washDone=true;$('stepHint2').textContent=L(sc.L.h2)}
    }
    ch.tabIndex=0;ch.setAttribute('role','button');ch.setAttribute('aria-label','מברישים ומפזרים שומשום · מקש רווח');
    ch.addEventListener('keydown',e=>{if(!['Enter',' '].includes(e.key))return;e.preventDefault();if(!washDone)brush(70);else{const r=ch.getBoundingClientRect();ch.dispatchEvent(new MouseEvent('click',{clientX:r.left+r.width/2,clientY:r.top+r.height/2}))}});
    ch.addEventListener('pointermove',e=>{if(!down||washDone)return;brush(Math.abs(e.clientX-lx));lx=e.clientX});
''' + s[end:]
s=replace(s,'function loadScene(){',r'''function loadScene(){
  requestAnimationFrame(()=>{
    document.querySelectorAll('#sifter,#handsIcon,#c1,#c2').forEach(el=>{
      el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',el.parentElement.querySelector('.drag-label')?.textContent||'ממשיכים בפעולה · Enter');
      el.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();el.click()}});
    });
  });''')
