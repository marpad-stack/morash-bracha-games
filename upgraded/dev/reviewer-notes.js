(()=>{
const KEY='morash-owner-review-2026-09-16',names=__NAMES__;let state={};
try{state=JSON.parse(localStorage.getItem(KEY))||{}}catch{}
const message=text=>document.getElementById('saveStatus').textContent=text;
function paint(){document.getElementById('progress').textContent=Object.keys(names).filter(id=>state[id]?.status==='approved').length+' מתוך 10 חלקים מוכנים מבחינתך'}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));message('הטיוטה נשמרה במכשיר. לחצי על שמירה ברשימה המשותפת כדי שכולן יראו אותה.')}catch{message('השמירה במכשיר חסומה. שמרי את ההערה ברשימה המשותפת לפני סגירת הדף.')}paint()}
for(const id of Object.keys(names)){const status=document.getElementById('status-'+id),note=document.getElementById('note-'+id);status.value=state[id]?.status||'todo';note.value=state[id]?.note||'';const update=()=>{state[id]={status:status.value,note:note.value};save()};status.onchange=update;note.oninput=update}
for(const id of ['reviewerName','reviewDevice','generalNotes']){const el=document.getElementById(id);el.value=state[id]||'';el.oninput=()=>{state[id]=el.value;save()}}
for(const button of document.querySelectorAll('.send-general'))button.onclick=()=>{const id=button.dataset.game,selector=id==='general'?'#generalNotes':'#note-'+id,field=document.querySelector(selector);if(!field.value.trim()){field.focus();message('כתבי הערה לפני השמירה.');return}document.dispatchEvent(new CustomEvent('bracha-general-note',{detail:{title:names[id]||'הערה כללית על האתר',selector,comment:field.value}}))};
document.addEventListener('bracha-note-saved',event=>{const selector=event.detail.selector;if(selector==='#generalNotes'){state.generalNotes='';document.querySelector(selector).value=''}else if(/^#note-[a-j]$/.test(selector)){const id=selector.slice(-1);state[id]={...(state[id]||{}),note:''};document.querySelector(selector).value=''}else return;try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}message('ההערה נשמרה ברשימה המשותפת. תוכלי לראות אותה בכל ההערות של כולן.')});
paint();
})();
