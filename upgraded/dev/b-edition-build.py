"""The user-approved manuscript replaces the visual forty-page source edition."""
import hashlib, shutil
approved=json.loads((DEV/'story-edit-proposal.json').read_text(encoding='utf-8'))
edition={key:approved[key] for key in ['title','readingNote','scenes','closingActivities']}
nikud=json.loads((DEV/'story-edition-nikud.json').read_text(encoding='utf-8'))
artdir=OUT/'b-story-art';artdir.mkdir(exist_ok=True)
art={}
for key in ['arrival','family','tower','shirt','yawn','shabbat','night','brit','bond','reading']:
    source=DEV/'assets/story-edition'/f'{key}.jpg'
    payload=source.read_bytes();filename=key+'-'+hashlib.sha256(payload).hexdigest()[:12]+'.jpg'
    (artdir/filename).write_bytes(payload);art[key]='b-story-art/'+filename
scene_art=['arrival','family','tower','shirt','yawn','shabbat','night','brit','bond','reading','tower']
for i,scene in enumerate(edition['scenes']):
    scene['art']=art[scene_art[i]]
    scene['n']=nikud[i]['text'];scene['titleN']=nikud[i]['title']
    assert strip(scene['n'])==scene['text'],('New manuscript spelling changed',i+1)
    assert strip(scene['titleN'])==scene['title'],('New heading spelling changed',i+1)
edition.update(version='approved-2026-09-24',status='הנוסח החדש שאושר לשילוב בספר',art=art)
edition.update(character='mendy',characterName='מענדי')
chani=json.loads((DEV/'story-chani.json').read_text(encoding='utf-8'))
chani_art=dict(art)
for key in ['tower','shirt','shabbat','night','brit','bond','reading']:
    source=DEV/'assets/story-edition/chani'/f'{key}.jpg'
    payload=source.read_bytes();filename='chani-'+key+'-'+hashlib.sha256(payload).hexdigest()[:12]+'.jpg'
    (artdir/filename).write_bytes(payload);chani_art[key]='b-story-art/'+filename
for i,scene in enumerate(chani['scenes']):
    scene['art']=chani_art[scene_art[i]]
    assert strip(scene['n'])==scene['text']
chani.update(version=edition['version'],art=chani_art)
editions={'mendy':edition,'chani':chani}
for previous in artdir.glob('*.jpg'):
    if re.fullmatch(r'(?:chani-)?[a-z]+-[a-f0-9]{12}\.jpg',previous.name) and 'b-story-art/'+previous.name not in set(art.values())|set(chani_art.values()):previous.unlink()
path=OUT/'b-story.html';s=path.read_text(encoding='utf-8')
s=s.replace('const goNext=()=>','let goNext=()=>').replace('const goPrev=()=>','let goPrev=()=>')
before,sep,after=s.rpartition('</body>');assert sep
style=(DEV/'b-edition.css').read_text(encoding='utf-8')
script='const B_EDITION_CSS='+json.dumps(style)+';\nconst B_EDITIONS='+json.dumps(editions,ensure_ascii=False)+';\n'+(DEV/'b-edition.js').read_text(encoding='utf-8')+'\n'+(DEV/'b-edition-print.js').read_text(encoding='utf-8')
path.write_text(before+'<style>'+style+'</style><script>'+script+'</script></body>'+after,encoding='utf-8')
(DEV/'story-edition-content.json').write_text(json.dumps(edition,ensure_ascii=False,indent=2),encoding='utf-8')
(DEV/'story-editions-content.json').write_text(json.dumps(editions,ensure_ascii=False,indent=2),encoding='utf-8')
