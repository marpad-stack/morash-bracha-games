const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'upgraded');
function read(f){return fs.readFileSync(f,'utf8').replace(/^\uFEFF/,'')}
function value(s,name){const m=new RegExp('(?:const|let|var)\\s+'+name+'\\s*=').exec(s);if(!m)throw Error('Missing '+name);const start=m.index+m[0].length;let pos=start;while((pos=s.indexOf(';',pos+1))>=0){const exp=s.slice(start,pos);try{const script=new vm.Script('JSON.stringify(('+exp+'))');return JSON.parse(script.runInNewContext({}, {timeout:500}))}catch(e){}}throw Error('Cannot extract '+name)}
const plans=[
 ['a','א · מתחם הקטנטנים','source-review/index.html.txt','a-coloring/index.html',['PAGES','CATS','CATNAME']],
 ['b','ב · אור הגיע אלינו','../or-higia-eleinu חלק ב.html','b-story.html',['PAGES','GAMES']],
 ['c','ג · בית המצוות','source-review/beit-hamitzvot-shiyuch.html.txt','beit-hamitzvot.html',['OBJECTS','DECOYS']],
 ['d','ד · מסע המצוות','../masa-hamitzvot-v3 חלק ד.html','d-mitzvot.html',['UI','CHEERS','MITZVOT','SIT','QUIZ','CHAL','SURPRISE']],
 ['e','ה · מסע בזמן','../masa-bazman-v6 חלק ה.html','e-time.html',['EVENTS','MINI','STR']],
 ['f','ו · מטבח השבת','../shabbat-kitchen-challahחלק ו.html','f-kitchen.html',['G','SCENES']],
 ['g','ז · בלש המידות',null,'g-detective.html',['CONTENT']],
 ['h','ח · הכרטיס לאמא',null,'h-card-studio.html',['BLESSINGS']],
 ['i','ט · צעדים ראשונים','../indexחלק ט.html','i-first-steps/index.html',['HMO','DAYMSG','CATS','CHEERS']],
 ['j','י · מרווח','../חלק י.html','j-meravach.html',['CAT','CARDS','MOODS','QS','WEEKS']]
];
let results=[],checks=[];
for(const [id,title,src,dest,names]of plans){const source=src?read(path.join(out,src)):null,final=read(path.join(out,dest)),data={};for(const name of names){const v=value(final,name);data[name]=v;if(source){const original=value(source,name),a=JSON.stringify(original),b=JSON.stringify(v);if(a!==b)throw Error('CONTENT CHANGED: '+id+' '+name);checks.push({part:id,collection:name,identical:true,sha256:crypto.createHash('sha256').update(a).digest('hex')})}}results.push({id,title,file:dest,data})}
fs.writeFileSync(path.join(__dirname,'content-data.json'),JSON.stringify(results,null,2));fs.writeFileSync(path.join(__dirname,'content-checks.json'),JSON.stringify(checks,null,2));console.log('Content locked:',checks.length,'identical collections.');
