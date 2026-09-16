"""Review pass: navigation, compact mobile layouts and clear controls, 2026-09-16."""
css=(DEV/'review.css').read_text(encoding='utf-8')
js=(DEV/'review.js').read_text(encoding='utf-8')+'\n'+(DEV/'draft-backup.js').read_text(encoding='utf-8')+'\n'+(DEV/'point-review.js').read_text(encoding='utf-8')
for game in json.loads((DEV/'content-data.json').read_text(encoding='utf-8')):
    p=OUT/game['file'];s=p.read_text(encoding='utf-8')
    head,sep,tail=s.rpartition('</body>');assert sep
    p.write_text(head+'<style>'+css+'</style><script>'+js+'</script></body>'+tail,encoding='utf-8')
