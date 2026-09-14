window.PlayUI={
 read(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}},
 save(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch{this.toast('השמירה במכשיר לא זמינה כרגע');return false}},
 shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},
 escape(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))},
 toast(s){document.querySelectorAll('.toast-msg').forEach(x=>x.remove());const n=document.createElement('div');n.className='toast-msg';n.role='status';n.textContent=s;document.body.append(n);setTimeout(()=>n.remove(),3200)},
 celebrate(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<45;i++){const n=document.createElement('i');n.className='play-confetti';n.style.cssText=`left:${Math.random()*100}%;background:${['#f17f70','#edbd51','#188f91','#baa2d8'][i%4]};--dx:${Math.random()*260-130}px;animation-delay:${Math.random()*.4}s`;document.body.append(n);setTimeout(()=>n.remove(),2300)}},
 download(name,blob){const a=document.createElement('a'),u=URL.createObjectURL(blob);a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),10000)},
 // Dialogs use native focus management and restore focus to their launch button.
 dialog(id){const d=document.getElementById(id);if(!d.open)d.showModal();return d}
};
