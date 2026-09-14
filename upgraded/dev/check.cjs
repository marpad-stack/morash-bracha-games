const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const files=['a-coloring/index.html','b-story.html','beit-hamitzvot.html','d-mitzvot.html','e-time.html','f-kitchen.html','g-detective.html','h-card-studio.html','i-first-steps/index.html','j-meravach.html'];
let scripts=0,errors=[];
for(const f of files){const s=fs.readFileSync(path.join(root,f),'utf8');let n=0;for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc=/.test(m[1])||/application\/ld\+json/.test(m[1]))continue;try{new vm.Script(m[2],{filename:f+':script'+(++n)});scripts++}catch(e){errors.push(e.stack)}}}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}console.log(`Syntax OK: ${files.length} games, ${scripts} scripts.`);
