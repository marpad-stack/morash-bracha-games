raise SystemExit("קובצי המסירה הם המקור. אין להריץ בנייה ישנה.")  # 4.10.2026 – ר׳ decisions.md
"""Review pass: navigation, compact mobile layouts and clear controls, 2026-09-16."""
css=(DEV/'review.css').read_text(encoding='utf-8')
css+='\n'+(DEV/'technical-fixes.css').read_text(encoding='utf-8')
# Production builds carry no review layer: no draft backup, no point review, no external live-game.js (decision 1, 4.10.2026).
js=(DEV/'review.js').read_text(encoding='utf-8')
js+='\n'+(DEV/'technical-fixes.js').read_text(encoding='utf-8')
for game in json.loads((DEV/'content-data.json').read_text(encoding='utf-8')):
    p=OUT/game['file'];s=p.read_text(encoding='utf-8')
    head,sep,tail=s.rpartition('</body>');assert sep
    game_css=css+('\n'+(DEV/'b-final.css').read_text(encoding='utf-8') if game['id']=='b' else '')
    game_js=js+('\n'+(DEV/'b-polish.js').read_text(encoding='utf-8')+'\n'+(DEV/'b-book-media.js').read_text(encoding='utf-8') if game['id']=='b' else '')
    p.write_text(head+'<style>'+game_css+'</style><script>'+game_js+'</script></body>'+tail,encoding='utf-8')
