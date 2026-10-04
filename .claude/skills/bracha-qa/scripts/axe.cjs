// axe.cjs — בודק נגישות (axe-core, WCAG 2A/2AA/best-practice) לכל חלק ב-390 ו-1440, ומודד משקל טעינה.
// דורש: npm i -D axe-core   |   פלט: qa/out/axe-results.json
const C = require('./_common.cjs');
const { fs, path, OUT, BASE, PARTS, ROOT } = C;
let axeSrc = null;
for (const p of [path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), path.join(__dirname, 'node_modules', 'axe-core', 'axe.min.js'), '/home/claude/qa/node_modules/axe-core/axe.min.js']) { if (fs.existsSync(p)) { axeSrc = fs.readFileSync(p, 'utf8'); break; } }
if (!axeSrc) { console.error('axe-core לא נמצא. הריצו: npm i -D axe-core'); process.exit(2); }
const sel = C.only(process.argv);
(async () => {
  const pw = C.loadPlaywright(); const b = await C.launch(pw); const out = [];
  for (const [id, name, u] of PARTS) {
    if (sel && !sel.includes(id)) continue;
    for (const w of [390, 1440]) {
      const ctx = await b.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, isMobile: w < 800, hasTouch: w < 800 });
      const p = await ctx.newPage(); let bytes = 0, reqs = 0;
      p.on('response', async r => { try { if (r.url().startsWith(BASE)) { const bl = await r.body().catch(() => null); if (bl) { bytes += bl.length; reqs++; } } } catch (e) {} });
      await p.goto(u.startsWith('http') ? u : BASE + u, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
      await p.waitForTimeout(800);
      await p.addScriptTag({ content: axeSrc });
      const res = await p.evaluate(async () => { const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'best-practice'] } }); return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, samples: v.nodes.slice(0, 3).map(n => (n.target || []).join(' ').slice(0, 80)), summary: (v.nodes[0] && v.nodes[0].failureSummary || '').slice(0, 200) })); }).catch(e => [{ id: 'axe-failed', impact: 'serious', help: String(e).slice(0, 100), nodes: 0, samples: [] }]);
      out.push({ id, name, width: w, bytesKB: Math.round(bytes / 1024), reqs, violations: res });
      console.log(id, w, 'KB=', Math.round(bytes / 1024), '| ', res.map(v => `${v.id}(${v.impact},${v.nodes})`).join(' ') || 'נקי');
      await ctx.close();
    }
  }
  fs.writeFileSync(path.join(OUT, 'axe-results.json'), JSON.stringify({ run: new Date().toISOString(), results: out }, null, 1));
  await b.close(); console.log('נשמר: qa/out/axe-results.json');
})();
