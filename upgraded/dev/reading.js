/* Presentation-only Hebrew reading modes. Source content is never mutated. */
(() => {
  'use strict';
  const cfg=window.PLAY_READING_DATA;if(!cfg)return;
  const strip=s=>s.replace(/[\u0591-\u05bd\u05bf-\u05c2\u05c4-\u05c7]/g,'');
  const plain=new Map(),pointed=new Map();
  for(const [p,n] of cfg.pairs){if(p&&n){plain.set(p,n);pointed.set(n,p)}}
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const pattern=map=>new RegExp([...map.keys()].sort((a,b)=>b.length-a.length).map(escape).join('|')||'(?!)','gu');
  const toN=pattern(plain),toP=pattern(pointed);
  let enabled=PlayUI.read('morash-reading-'+cfg.id,true),large=PlayUI.read('morash-reading-large',false);
  const original=new WeakMap(),roots=new Set();let frame=0;
  const ignored='script,style,textarea,input,canvas,[contenteditable],[data-reading-skip],.reading-controls';
  const safeSymbols=s=>s.replace(/🪔/gu,'🕯').replace(/🚩|🏁/gu,'✦');
  function text(value,on=enabled){
    let s=safeSymbols(String(value));
    if(on){
      return s.replace(toN,(m,offset,whole)=>{
        // Avoid applying a short word inside a longer Hebrew word.
        if(/[א-ת]/u.test(m[0])&&/[א-ת\u0591-\u05c7]/u.test(whole[offset-1]||''))return m;
        if(/[א-ת\u0591-\u05c7]/u.test(m.at(-1))&&/[א-ת\u0591-\u05c7]/u.test(whole[offset+m.length]||''))return m;
        return plain.get(m);
      });
    }
    return strip(s.replace(toP,m=>pointed.get(m)));
  }
  function node(n){
    if(!n.parentElement||n.parentElement.closest(ignored)||!/[א-ת🪔🚩🏁]/u.test(n.data))return;
    const old=original.get(n);const raw=old&&n.data===old.shown?old.raw:n.data;
    const shown=text(raw);if(n.data!==shown)n.data=shown;original.set(n,{raw,shown});
  }
  function walk(root){
    if(root.nodeType===3){node(root);return}
    if(root.nodeType!==1||root.matches(ignored))return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))node(n);
  }
  const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')roots.add(r.target);else r.addedNodes.forEach(n=>roots.add(n))}if(!frame)frame=requestAnimationFrame(flush)});
  function flush(){frame=0;observer.disconnect();for(const root of roots)if(root.isConnected)walk(root);roots.clear();mountDialogs();observer.observe(document.body,{subtree:true,childList:true,characterData:true})}
  function controls(compact=false){const el=document.createElement('div');el.className='reading-controls'+(compact?' compact-reading':'');el.setAttribute('aria-label','אפשרויות קריאה');el.innerHTML='<button type="button" data-reading-toggle aria-label="ניקוד אותיות">אָ <span>ניקוד</span></button><button type="button" data-reading-large aria-label="טקסט גדול">א<span>+</span></button>';return el}
  function mountDialogs(){document.querySelectorAll('dialog .dialog-top,#sheet,#gSheet,.ptop,#cardSheet,.mbox').forEach(el=>{if(el.querySelector('.reading-controls'))return;const c=controls(true);el.prepend(c);paint(c)})}
  function paint(root=document){root.querySelectorAll('[data-reading-toggle]').forEach(b=>{b.setAttribute('aria-pressed',String(enabled));b.title=enabled?'ללא ניקוד':'עם ניקוד'});root.querySelectorAll('[data-reading-large]').forEach(b=>b.setAttribute('aria-pressed',String(large)))}
  function set(on){enabled=!!on;PlayUI.save('morash-reading-'+cfg.id,enabled);document.body.classList.toggle('reading-pointed',enabled);window.dispatchEvent(new CustomEvent('morash-reading-change',{detail:enabled}));roots.add(document.body);paint();flush()}
  window.PlayReading={text,strip,set,get enabled(){return enabled}};
  const toolbar=controls();toolbar.id='readingToolbar';
  const host=document.querySelector(cfg.host)||document.body;host.prepend(toolbar);
  for(const selector of cfg.legacy||[]){document.querySelectorAll(selector).forEach(b=>{b.dataset.readingToggle='';b.dataset.readingSkip='';b.setAttribute('aria-label','ניקוד אותיות');b.textContent='אָ ניקוד';b.classList.add('legacy-reading')})}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-reading-toggle],[data-reading-large]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.hasAttribute('data-reading-large')){large=!large;PlayUI.save('morash-reading-large',large);document.body.classList.toggle('reading-large',large);paint()}else set(!enabled)},true);
  document.body.classList.toggle('reading-large',large);set(enabled);
})();
