"""Consistent black brand in rendered book pages and all formatted print outputs."""
brand_svg=(DEV/'assets/morash-logo-black.svg').read_text(encoding='utf-8')
brand_js=(DEV/'brand.js').read_text(encoding='utf-8').replace('__MORASH_LOGO_SVG__',json.dumps(brand_svg))
for game in data:
    gid=game['id'];path=OUT/game['file'];s=path.read_text(encoding='utf-8')
    body_start=re.search(r'<body\b',s).start()
    s=s[:body_start]+'<script>'+brand_js+'</script>'+s[body_start:]
    extra=''
    if gid=='a':
        s=replace(s,'g.drawImage(l,34,c.height-h-16,w,h);g.globalAlpha=1;cb(c)', 'g.globalAlpha=1;MorashBrand.draw(g,34,c.height-h-16,w);cb(c)')
        # Composite already owns its footer; do not add a second mark to painted prints.
        s=replace(s,"stampFoot(sheetCanvas(c,'',''),logo).toDataURL('image/png')", "sheetCanvas(c,'','').toDataURL('image/png')")
        extra="stampFoot=function(c){const g=c.getContext('2d'),w=170;MorashBrand.draw(g,30,c.height-w*302/900-28,w);return c};"
    if gid=='b':
        s=replace(s,"bt.onclick=()=>{const cv=document.getElementById('canvas')", "bt.onclick=async()=>{await MorashBrand.ready;const cv=document.getElementById('canvas')")
        s=replace(s,"out.toBlob(blob=>", "MorashBrand.footer(out).toBlob(blob=>")
        extra=r'''(()=>{
         const working=new WeakMap();
         function decorate(img){
          const src=img.getAttribute('src')||'';
          if((!src.includes('b-story-pages/')&&!src.includes('b-story-art/'))||working.get(img)===src)return;
          working.set(img,src);MorashBrand.bookPage(src).then(url=>{if(img.getAttribute('src')===src){img.src=url;img.dataset.branded='true'}}).catch(()=>{});
         }
         document.addEventListener('load',event=>{if(event.target instanceof HTMLImageElement)decorate(event.target)},true);
         const scan=()=>document.querySelectorAll('img').forEach(decorate);scan();
         new MutationObserver(scan).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});
        })();'''
    if gid=='h':
        s=replace(s,"$('#download').onclick=()=>{render(true);canvas.toBlob", "$('#download').onclick=async()=>{await MorashBrand.ready;render(true);MorashBrand.footer(canvas).toBlob")
        s=replace(s,"const img=canvas.toDataURL('image/png');render();const w=window.open", "const img=MorashBrand.footer(canvas).toDataURL('image/png');render();const w=window.open")
    # The personal map prints multiple browser pages, each carrying a small black logo.
    if gid=='i':
        extra="MorashBrand.printFooter(document.querySelector('.wrap'));"
        s=replace(s,"'cardShare').addEventListener('click',function(){", "'cardShare').addEventListener('click',async function(){await MorashBrand.ready;")
        s=replace(s,'  c.toBlob(function(b){','  MorashBrand.footer(c).toBlob(function(b){')
        print_css=(DEV/'print-footer.css').read_text(encoding='utf-8')
        s=s.replace('</head>','<style>'+print_css+'@media print{@page{size:A4 portrait;margin:14mm 12mm}html,body{overflow:visible!important}}</style></head>',1)
    if extra:
        before,sep,after=s.rpartition('</body>');assert sep
        s=before+'<script>'+extra+'</script></body>'+after
    path.write_text(s,encoding='utf-8')
