/* The existing vector logo is rendered into exports; no image content is covered. */
(()=>{
 const svg=__MORASH_LOGO_SVG__,source='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),logo=new Image();
 const ready=new Promise((resolve,reject)=>{logo.onload=resolve;logo.onerror=()=>reject(Error('Brand logo did not load'));logo.src=source});
 const cache=new Map();
 function draw(context,x,y,width){context.drawImage(logo,x,y,width,width*302/900)}
 function footer(input){
  const canvas=document.createElement('canvas'),height=Math.ceil(input.width*.07);
  canvas.width=input.width;canvas.height=input.height+height;const context=canvas.getContext('2d');
  context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(input,0,0);
  draw(context,input.width*.025,input.height+height*.16,input.width*.135);return canvas;
 }
 function bookPage(src){
  const url=new URL(src,document.baseURI).href;
  if(cache.has(url))return cache.get(url);
  const pending=(async()=>{
   await ready;const image=new Image();
   const offline=location.protocol==='file:'&&window.MORASH_OFFLINE_BOOK_DATA;
   image.src=offline?.[url.split('/').pop()]||url;await image.decode();
   if(image.naturalWidth<2||image.naturalHeight<2)throw Error('Book illustration is unavailable');
   const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
   const context=canvas.getContext('2d'),edge=canvas.width*.06;
   context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);
   const size=Math.min((canvas.height-edge)/image.naturalHeight,canvas.width/image.naturalWidth);
   context.drawImage(image,(canvas.width-image.naturalWidth*size)/2,0,image.naturalWidth*size,image.naturalHeight*size);
   draw(context,canvas.width*.025,canvas.height-edge+edge*.12,canvas.width*.135);
   return canvas.toDataURL('image/png');
  })();cache.set(url,pending);pending.catch(()=>cache.delete(url));return pending;
 }
 function printFooter(target){
  const table=document.createElement('table');table.className='morash-print-table';
  const body=table.createTBody(),cell=body.insertRow().insertCell(),foot=table.createTFoot().insertRow().insertCell();
  foot.innerHTML='<div class="morash-print-brand" aria-hidden="true">'+svg+'</div>';
  target.before(table);cell.append(target);
 }
 window.MorashBrand={svg,source,ready,draw,footer,bookPage,printFooter};
})();
